'use strict';
/**
 * D2 — engine v1.5.4 KHÔNG test được: 0 `module.exports`, và `process.exit(0)` chạy ngay
 * khi file được nạp ⇒ `require()` engine sẽ THI HÀNH nó lên cwd của tiến trình test.
 * Bản sửa: toàn bộ hàm được export, `process.exit` chỉ còn trong vỏ `require.main`.
 *
 * Ca T-H08 (A4) + kiểm danh sách export bắt buộc của 01-CONTRACTS §2.5.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const { snapshotTree } = require('../helpers/tree.js');
const { ENGINE_PATH } = require('../helpers/run.js');

const engine = require(ENGINE_PATH);

// 01-CONTRACTS §2.5 — danh sách export BẮT BUỘC.
const REQUIRED_EXPORTS = [
  'BRAIN_TEMPLATE_VERSION', 'ENGINE_VERSION', 'REQUIRED_FILES',
  'stripBom', 'detectEol', 'normalizeEol', 'restoreEol', 'detectEncoding', 'readText', 'writeText',
  'collectSnapshot', 'diagnose', 'computePlan', 'applyPlan', 'runBrainEngine',
  'patchAgentsMd', 'patchDistill', 'patchClaudeMd', 'patchStateJson',
  'renderTemplates', 'renderInitialState', 'renderMarker', 'renderTodayMd', 'renderClaudeShim', 'renderFullAgentsMd',
  'planMarkerOps', 'planCaseRenames', 'renderDiff', 'formatFindings', 'parseArgs', 'main', 'BRN'
];

test('D2 · A4: require(engine) KHÔNG in gì, KHÔNG ghi gì, KHÔNG process.exit', () => {
  // cwd = thư mục tạm có sẵn file: nếu engine tự chạy khi được nạp (bug v1.5.4) thì nó
  // sẽ dựng cả bộ não vào đây và cây sẽ đổi.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-t-'));
  try {
    fs.writeFileSync(path.join(dir, 'README.md'), '# repo giả\n');
    const before = snapshotTree(dir);

    const probe = 'const e = require(process.argv[1]); if (typeof e.diagnose !== "function") process.exitCode = 9;';
    const s = spawnSync(process.execPath, ['-e', probe, ENGINE_PATH], { cwd: dir, encoding: 'utf8' });

    assert.equal(s.status, 0, 'require() phải kết thúc 0');
    assert.equal(s.stdout, '', 'D2: nạp module CẤM in ra stdout');
    assert.equal(s.stderr, '', 'D2: nạp module CẤM in ra stderr');
    assert.deepEqual(snapshotTree(dir), before, 'D2: nạp module CẤM ghi lên cwd');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  }
});

test('D2b · §2.5: engine export ĐỦ danh sách hợp đồng (điều kiện tồn tại của unit test)', () => {
  const missing = REQUIRED_EXPORTS.filter((k) => !(k in engine));
  assert.deepEqual(missing, [], 'thiếu export ⇒ hàm đó không thể unit-test được');
  const notFn = REQUIRED_EXPORTS.filter(
    (k) => !['BRAIN_TEMPLATE_VERSION', 'ENGINE_VERSION', 'REQUIRED_FILES', 'BRN'].includes(k)
      && typeof engine[k] !== 'function'
  );
  assert.deepEqual(notFn, []);
  assert.deepEqual(engine.REQUIRED_FILES, [
    'memory-distill.txt', 'index.md', 'project-intro.md', 'roadmap.md',
    'changelog.md', '-known-gotchas.md', '-data-architecture.md'
  ], 'thứ tự 7 phân vùng là BẤT BIẾN');
});

test('D2c · A5: `process.exit` chỉ nằm trong vỏ CLI, KHÔNG trong thân logic', () => {
  const src = fs.readFileSync(ENGINE_PATH, 'utf8');
  const lines = src.split('\n');
  const hits = lines
    .map((l, i) => ({ text: l, no: i + 1 }))
    .filter((x) => /process\.exit\s*\(/.test(x.text) && !x.text.trim().startsWith('//'));
  assert.deepEqual(hits, [], 'A5: CẤM `process.exit(...)` — vỏ phải gán `process.exitCode`');

  const shellAt = src.indexOf('if (require.main === module)');
  assert.ok(shellAt > 0, 'phải có vỏ `require.main === module`');
  assert.ok(src.indexOf('process.exitCode') > shellAt, 'mã thoát chỉ được đặt trong vỏ');
});

test('D2d · A2: engine chạy đúng từ MỘT BẢN COPY ở thư mục bất kỳ (không phụ thuộc vị trí)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-t-'));
  try {
    const copy = path.join(dir, 'init_brain.js');
    fs.copyFileSync(ENGINE_PATH, copy);
    const s = spawnSync(process.execPath, [copy, '--version'], { encoding: 'utf8', cwd: os.tmpdir() });
    assert.equal(s.status, 0);
    assert.equal(s.stdout, `brain-engine ${engine.ENGINE_VERSION} template ${engine.BRAIN_TEMPLATE_VERSION}\n`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  }
});
