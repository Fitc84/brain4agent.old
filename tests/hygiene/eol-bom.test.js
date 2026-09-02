'use strict';
/**
 * T-H06 / T-H10 — khiếm khuyết **D6**: repo không có `.gitattributes`, cây làm việc lẫn
 * lộn CRLF/mixed/BOM. Hệ quả: mọi regex `\r?\n` trong engine hoạt động khác nhau tuỳ
 * máy checkout, và diff git nhiễu toàn file.
 *
 * Luật: MỌI file tracked là LF thuần, không BOM — NGOẠI TRỪ `tests/fixtures/**` (CRLF /
 * BOM / UTF-16 ở đó là DỮ LIỆU THỬ NGHIỆM, phải giữ nguyên byte).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT, git, trackedFiles } = require('../helpers/repo.js');

const FIXTURES_PREFIX = 'tests/fixtures/';
const BINARY_RE = /\.(png|jpg|jpeg|gif|ico|pdf|zip|woff2?|ttf)$/i;

test('T-H06 · D6: `git ls-files --eol` — 0 file CRLF/mixed/-text ngoài tests/fixtures/', () => {
  const r = git(['ls-files', '--eol']);
  assert.equal(r.code, 0, `không chạy được git ls-files --eol: ${r.stderr}`);

  const bad = [];
  for (const line of r.stdout.split('\n').filter(Boolean)) {
    // Dạng: "i/lf    w/lf    attr/text eol=lf   \tđường/dẫn"
    const tab = line.indexOf('\t');
    const rel = line.slice(tab + 1).replace(/\\/g, '/');
    const info = line.slice(0, tab);
    if (rel.startsWith(FIXTURES_PREFIX)) continue;
    if (BINARY_RE.test(rel)) continue;
    if (/w\/crlf|w\/mixed|i\/crlf|i\/mixed/.test(info)) bad.push(`${rel} → ${info.trim()}`);
    if (/attr\/-text/.test(info)) bad.push(`${rel} → bị đánh dấu -text ngoài fixtures`);
  }
  assert.deepEqual(bad, [], 'D6: file tracked phải là LF thuần cả trong index lẫn cây làm việc');
});

test('T-H06b · D6: 0 file tracked có BOM UTF-8 hoặc UTF-16 ngoài tests/fixtures/', () => {
  const withBom = [];
  const utf16 = [];
  for (const rel of trackedFiles()) {
    if (rel.startsWith(FIXTURES_PREFIX) || BINARY_RE.test(rel)) continue;
    let buf;
    try { buf = fs.readFileSync(path.join(REPO_ROOT, rel)); } catch (e) { continue; }
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) withBom.push(rel);
    if (buf.length >= 2 && ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff))) utf16.push(rel);
  }
  assert.deepEqual(withBom, [], 'D6: BOM UTF-8 làm JSON.parse ném và làm bẩn diff');
  assert.deepEqual(utf16, [], 'D6: UTF-16 khiến engine exit 2 (BRN-013)');
});

test('T-H10 · D6: .gitattributes ghim eol=lf toàn repo và miễn trừ tests/fixtures/**', () => {
  const ga = fs.readFileSync(path.join(REPO_ROOT, '.gitattributes'), 'utf8');
  assert.ok(/^\*\s+text=auto\s+eol=lf\s*$/m.test(ga),
    'D6: thiếu dòng `* text=auto eol=lf` (đè core.autocrlf của máy Windows)');
  assert.ok(/^tests\/fixtures\/\*\*\s+-text\s*$/m.test(ga),
    'D6: thiếu `tests/fixtures/** -text` — fixture sẽ bị git chuẩn hoá và mất giá trị thử nghiệm');
  assert.ok(!ga.includes('\r'), '.gitattributes tự nó cũng phải LF');
});

test('T-H06c · D6: fixture CỐ Ý lệch chuẩn vẫn còn nguyên byte (bằng chứng -text có hiệu lực)', () => {
  // Nếu một ngày git "chuẩn hoá" fixture thì F05/F07 mất sạch giá trị và các test D3/D4
  // sẽ xanh giả. Chốt lại tại đây.
  const crlf = fs.readFileSync(path.join(REPO_ROOT, 'tests', 'fixtures', 'F05-crlf-agents', 'AGENTS.md'));
  assert.ok(crlf.includes(Buffer.from('\r\n')), 'F05 phải còn CRLF thật trên đĩa');

  const bom = fs.readFileSync(path.join(REPO_ROOT, 'tests', 'fixtures', 'F07-bom-state', 'brain4agent', 'memory', 'hot', 'state.json'));
  assert.deepEqual([bom[0], bom[1], bom[2]], [0xef, 0xbb, 0xbf], 'F07 phải còn BOM thật trên đĩa');
});

test('T-H06d · D6: mọi file .js/.json/.md tracked kết thúc bằng newline (sạch git diff)', () => {
  const noEol = [];
  for (const rel of trackedFiles()) {
    if (rel.startsWith(FIXTURES_PREFIX) || !/\.(js|json|md|txt|yml|ps1)$/.test(rel)) continue;
    const buf = fs.readFileSync(path.join(REPO_ROOT, rel));
    if (buf.length > 0 && buf[buf.length - 1] !== 0x0a) noEol.push(rel);
  }
  assert.deepEqual(noEol, [], 'thiếu newline cuối file');
});
