'use strict';
/**
 * marker-migration.test.js — T-C30..T-C37 (TESTING-ACCEPTANCE §1.3): hành vi HỘP ĐEN
 * của đợt #10 trên máy trạng thái S0..S5 (SPEC-P02 §3).
 *
 * Mỗi kỳ vọng dưới đây gắn với một điều khoản: A1 idempotent · A2/A3 phạm vi diff ·
 * Đ2 fail-closed · Đ3 không ghi đè văn bản người dùng · Đ11 mã thoát `--check`.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { mkTmpRoot } = require('../helpers/tmp.js');
const { snapshotTree } = require('../helpers/tree.js');
const { diffScope } = require('../helpers/diff-scope.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const engine = require(ENGINE_PATH);
const V = engine.BRAIN_TEMPLATE_VERSION;
const MARKER_RE = /^brain4agent-v(\d+\.\d+\.\d+)\.md$/;
const ARCHIVE_REL = ['brain4agent', 'memory', 'archive'];

const abs = (dir, rel) => path.join(dir, ...rel.split('/'));
const readAgents = (dir) => fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const patchLog = (stdout) => stdout.split('\n')
  .filter((l) => l.startsWith('🔄 AGENTS.md ['))
  .map((l) => l.slice(l.indexOf('[') + 1, l.indexOf(']')));

function withFixture(name, fn) {
  const tmp = mkTmpRoot(name);
  try { return fn(tmp.dir); } finally { tmp.cleanup(); }
}

test('T-C30 · F09 (S1 v1.3.0 chưa mốc): migration một chiều, A1/A2/A3 đều sạch', () => {
  withFixture('F09-legacy-v130', (dir) => {
    const before = readAgents(dir);
    // "chưa mốc" = không dòng NÀO là mốc trọn dòng (dòng thụt lề trong ``` không tính).
    assert.equal(engine.normalizeEol(before).split(String.fromCharCode(10))
      .filter((l) => l === engine.OPEN('boot') || l === engine.CLOSE('boot')).length, 0,
      'tiền đề: F09 CHƯA có mốc nào');

    const run1 = runEngine(ENGINE_PATH, [dir]);
    assert.equal(run1.code, 0, run1.stderr);
    // SPEC-P02 §7: đúng thứ tự RULE_BLOCKS, 4 adopt + 2 add.
    assert.deepEqual(patchLog(run1.stdout), [
      'adopt:boot', 'add:cold-memory', 'adopt:spec-package',
      'add:structural-extension', 'adopt:root-marker', 'adopt:dual-entry'
    ]);

    const after = readAgents(dir);
    // A2 + A3: 0 dòng xoá ngoài vùng luật, 0 dòng thêm ngoài mốc/khối/phụ lục.
    const scope = diffScope(before, after);
    assert.deepEqual(scope.deletedOutside, [], 'A2: engine xoá dòng NGOÀI vùng luật');
    assert.deepEqual(scope.addedOutside, [], 'A3: engine thêm dòng NGOÀI vùng mốc');
    // Nội dung riêng của người dùng còn nguyên (3 đoạn + 1 bảng + 1 khối ```).
    for (const own of ['Đoạn riêng #1', 'Đoạn riêng #2', 'Đoạn riêng #3', '| `feat/*` | tác giả | xoá sau khi merge |']) {
      assert.ok(after.includes(own), 'A2: mất nội dung riêng: ' + own);
    }
    // M-1: mốc THỤT LỀ trong khối ``` không được engine coi là mốc thật.
    assert.equal(after.split('   ' + engine.OPEN('boot')).length - 1, 1);

    // TQ6: thư mục ký ức lạnh được tạo ở đường ghi.
    assert.ok(fs.existsSync(path.join(dir, ...ARCHIVE_REL)), 'TQ6: thiếu memory/archive/');
    // I1: đúng một marker, đúng phiên bản khung hiện hành.
    assert.deepEqual(fs.readdirSync(dir).filter((f) => MARKER_RE.test(f)), [`brain4agent-v${V}.md`]);

    // A1: RUN2 ≡ RUN3, byte-identical, exit 0.
    const run2sha = sha(after);
    const run2 = runEngine(ENGINE_PATH, [dir]);
    assert.equal(run2.code, 0);
    assert.ok(run2.stdout.includes('NÃO ĐÃ OK'));
    assert.equal(sha(readAgents(dir)), run2sha, 'A1: lần chạy 3 vẫn phải byte-identical');
  });
});

test('T-C31 · F10 (S4 sửa tay): BRN-016, engine KHÔNG ghi đè vùng người dùng', () => {
  withFixture('F10-user-edited', (dir) => {
    const before = snapshotTree(dir);
    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 2, 'Đ3: `edited` là lỗi cần người ⇒ 2');
    assert.ok(chk.stdout.includes('BRN-016'));
    assert.deepEqual(snapshotTree(dir), before, '--check CẤM ghi');

    const wr = runEngine(ENGINE_PATH, [dir]);
    assert.equal(wr.code, 2, 'ghi xong vẫn 2 vì khối `dual-entry` không hội tụ được');
    const after = readAgents(dir);
    // M-4: câu người dùng sửa còn nguyên văn, KHÔNG bị chèn bản thứ hai.
    assert.equal(after.split('(ghi chú riêng)').length - 1, 1);
    assert.ok(!after.includes(engine.OPEN('dual-entry')), 'Đ3: CẤM bọc mốc quanh vùng đã sửa tay');
    // Các khối khác vẫn được vá bình thường (fail-closed cục bộ, không lan).
    assert.deepEqual(patchLog(wr.stdout), [
      'adopt:boot', 'add:cold-memory', 'adopt:spec-package',
      'add:structural-extension', 'adopt:root-marker'
    ]);
  });
});

test('T-C32 · F02 (S2 đã có mốc, thân đúng): --check exit 0, NÃO ĐÃ OK', () => {
  withFixture('F02-standard-lf', (dir) => {
    const r = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(r.code, 0, r.stdout + r.stderr);
    assert.ok(r.stdout.includes('NÃO ĐÃ OK'));
  });
});

test('T-C33 · F04: khối planning CŨ ⇒ BRN-003 không fixable, engine vẫn vá khối fixable', () => {
  withFixture('F04-old-planning-block', (dir) => {
    const wr = runEngine(ENGINE_PATH, [dir]);
    assert.equal(wr.code, 2, 'TQ5: engine KHÔNG gỡ khối cũ ⇒ không hội tụ');
    assert.ok(patchLog(wr.stdout).includes('add:spec-package'));

    const after = readAgents(dir);
    assert.ok(after.includes(engine.OPEN('spec-package')), 'khối fixable vẫn phải được ghi');
    assert.ok(after.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'),
      'TQ5: engine CẤM tự gỡ văn bản người dùng');

    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 2);
    assert.ok(chk.stdout.includes('BRN-003'));
  });
});

test('T-C34 · F05 (CRLF): sau khi ghi vẫn 100% CRLF, 12 dòng mốc, idempotent', () => {
  withFixture('F05-crlf-agents', (dir) => {
    const r = runEngine(ENGINE_PATH, [dir]);
    assert.equal(r.code, 0, r.stderr);

    const buf = fs.readFileSync(path.join(dir, 'AGENTS.md'));
    let lone = 0;
    for (let i = 0; i < buf.length; i++) if (buf[i] === 0x0a && buf[i - 1] !== 0x0d) lone++;
    assert.equal(lone, 0, 'R5: engine ghi lẫn LF vào file CRLF');

    const text = buf.toString('utf8');
    const markers = engine.RULE_BLOCKS.flatMap((b) => [engine.OPEN(b.id), engine.CLOSE(b.id)]);
    assert.equal(markers.filter((m) => text.includes(m + '\r\n')).length, 12,
      '6 khối × 2 mốc, mỗi mốc là một dòng CRLF trọn vẹn');

    const before = sha(text);
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    assert.equal(sha(readAgents(dir)), before, 'A1: lần 2 CẤM ghi lại');
  });
});

test('T-C35 · F03 (marker 1.2.0): `adopt` xuyên qua lỗ version, ruột sạch số cũ', () => {
  withFixture('F03-legacy-v120', (dir) => {
    assert.ok(readAgents(dir).includes('brain4agent-v1.2.0.md'), 'tiền đề: thân luật cũ mang 1.2.0');

    const r = runEngine(ENGINE_PATH, [dir]);
    assert.equal(r.code, 0, r.stderr);
    assert.ok(patchLog(r.stdout).includes('adopt:root-marker'));

    const lines = engine.normalizeEol(readAgents(dir)).split('\n');
    const blk = engine.findBlock(lines, 'root-marker');
    assert.notEqual(blk, 'malformed');
    assert.equal(blk.inner, engine.RULE_BLOCKS.find((b) => b.id === 'root-marker').body);
    assert.ok(!/\d+\.\d+\.\d+/.test(blk.inner), 'TQ3: thân luật CẤM mang số phiên bản');
  });
});

test('T-C36 · F01: đường ghi tạo memory/archive/ RỖNG, không sinh .gitkeep', () => {
  withFixture('F01-blank', (dir) => {
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    const archive = path.join(dir, ...ARCHIVE_REL);
    assert.ok(fs.statSync(archive).isDirectory(), 'TQ6: thiếu brain4agent/memory/archive/');
    assert.deepEqual(fs.readdirSync(archive), [], 'C13: CẤM engine sinh .gitkeep');
  });
});

test('T-C37 · BRN-017: file lạ trong memory/archive/ — warning không fixable (Đ11)', () => {
  withFixture('F02-standard-lf', (dir) => {
    const archive = path.join(dir, ...ARCHIVE_REL);
    fs.mkdirSync(archive, { recursive: true });
    fs.writeFileSync(path.join(archive, 'x.txt'), 'ghi chú lạ\n');
    fs.writeFileSync(path.join(archive, '2026-09-02.md'), '# phiên cũ\n');

    // Đ11: `--check` trả lời "engine có muốn GHI gì không". Warning không fixable
    // KHÔNG kéo engine vào đường ghi ⇒ mã thoát 0 (01-CONTRACTS §7 thắng SPEC-P04 §3).
    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 0, 'Đ11: warning không fixable ⇒ --check vẫn 0');
    assert.ok(chk.stdout.includes('BRN-017'), 'finding vẫn PHẢI hiện ra dù mã thoát 0');
    assert.ok(chk.stdout.includes('memory/archive/ có file không theo mẫu YYYY-MM-DD.md'));
    fs.rmSync(path.join(archive, 'x.txt'));
    const clean = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(clean.code, 0);
    assert.ok(!clean.stdout.includes('BRN-017'), 'tên đúng mẫu YYYY-MM-DD.md thì im lặng');
    fs.writeFileSync(path.join(archive, 'x.txt'), 'ghi chú lạ\n');

    const wr = runEngine(ENGINE_PATH, [dir]);
    assert.equal(wr.code, 0);
    assert.equal(fs.readFileSync(path.join(archive, 'x.txt'), 'utf8'), 'ghi chú lạ\n',
      'engine CẤM đụng file người dùng bỏ vào archive');
  });
});

test('T-M25 · A2/A3: bộ đo diff-scope bắt được dòng xoá/thêm ngoài vùng mốc', () => {
  // Test "có răng": bộ đo phải ĐỎ khi có thay đổi ngoài phạm vi cho phép.
  const before = ['# tiêu đề', '', 'đoạn riêng của người dùng', '', 'đoạn thứ hai'].join('\n');
  assert.deepEqual(diffScope(before, before), { deletedOutside: [], addedOutside: [] });

  const deleted = before.split('\n').filter((l) => l !== 'đoạn thứ hai').join('\n');
  assert.deepEqual(diffScope(before, deleted).deletedOutside, ['đoạn thứ hai']);

  const added = before + '\ndòng lạ do engine chèn';
  assert.deepEqual(diffScope(before, added).addedOutside, ['dòng lạ do engine chèn']);
});
