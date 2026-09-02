#!/usr/bin/env node
'use strict';
/**
 * make-golden.js — chụp "ảnh chuẩn" (golden manifest) cho engine.
 *
 *   node tests/helpers/make-golden.js --engine <path> --out tests/golden/manifest.json [--case <name>]...
 *
 * Với mỗi ca golden: copy fixture ra thư mục tạm → chạy engine (mốc thời gian cố
 * định BRAIN_NOW, TZ=UTC) → ghi sha256 của TOÀN BỘ file trong cây + exit_code.
 *
 * ⚠️ CẤM chạy lại script này chỉ để "làm xanh" golden.test.js. Golden lệch nghĩa là
 * hành vi ghi của engine đã đổi — phải đọc diff và ra quyết định trong plan.md trước.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const { mkTmpRoot } = require('./tmp.js');
const { snapshotTree, hashesOnly } = require('./tree.js');
const { runEngine, BRAIN_NOW } = require('./run.js');

// Ca đưa vào golden. F05/F07/F08 CỐ Ý đứng ngoài: chúng là fixture khiếm khuyết
// (CRLF / BOM / mẫu `$`) mà engine hiện tại xử lý SAI — chụp ảnh cái sai rồi so lại
// chính nó là tự đóng băng bug (xem SPEC-P02 §a.3 cột "Golden?").
const GOLDEN_CASES = [
  'F01-blank',
  'F02-standard-lf',
  'F03-legacy-v120',
  'F04-old-planning-block',
  'F06-duplicate-law'
];

function parseArgs(argv) {
  const out = { engine: null, out: null, cases: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--engine') out.engine = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--case') out.cases.push(argv[++i]);
    else throw new Error(`[make-golden] Doi so khong hop le: ${a}`);
  }
  if (!out.engine) throw new Error('[make-golden] Thieu --engine <path>');
  if (!out.out) throw new Error('[make-golden] Thieu --out <file>');
  if (out.cases.length === 0) out.cases = GOLDEN_CASES.slice();
  return out;
}

function gitHeadSha(repoRoot) {
  try {
    return execFileSync('git', ['-C', repoRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (e) {
    return 'unknown';
  }
}

function main(argv) {
  const args = parseArgs(argv);
  const argvHadCase = argv.indexOf('--case') !== -1;
  const enginePath = path.resolve(args.engine);
  const outPath = path.resolve(args.out);
  const repoRoot = path.join(__dirname, '..', '..');

  const manifest = {
    schema_version: 1,
    engine_commit: gitHeadSha(repoRoot),
    engine_sha256: crypto.createHash('sha256').update(fs.readFileSync(enginePath)).digest('hex'),
    brain_now: BRAIN_NOW,
    node: process.version,
    cases: {}
  };

  // Chụp lại MỘT ca (--case) phải GIỮ NGUYÊN các ca khác: đọc manifest cũ và chỉ
  // ghi đè đúng ca được nêu. Chụp lại toàn bộ là hành vi duy nhất khi KHÔNG có --case.
  const partial = argvHadCase;
  if (partial && fs.existsSync(outPath)) {
    const old = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    // Giữ nguyên thứ tự key ⇒ git diff của manifest chỉ đụng đúng ca được chụp lại.
    manifest.cases = Object.assign({}, old.cases);
  }

  for (const name of args.cases) {
    const t = mkTmpRoot(name);
    try {
      const r = runEngine(enginePath, [t.dir], { cwd: os.tmpdir() });
      manifest.cases[name] = {
        exit_code: r.code,
        files: hashesOnly(snapshotTree(t.dir))
      };
      const n = Object.keys(manifest.cases[name].files).length;
      process.stdout.write(`[golden] ${name}: exit=${r.code}, files=${n}\n`);
    } finally {
      t.cleanup();
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  process.stdout.write(`[golden] Da ghi ${path.relative(repoRoot, outPath).replace(/\\/g, '/')}\n`);
  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { GOLDEN_CASES, parseArgs };
