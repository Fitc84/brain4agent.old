'use strict';
/**
 * D7 — `isFullyStandard` của v1.5.4 là một chuỗi boolean thủ công, bỏ sót 3 việc:
 *   (a) không đối chiếu `state.json.brain_template_version` ⇒ repo kẹt version cũ vẫn "OK";
 *   (b) không ĐẾM token luật ⇒ hai/ba phát biểu luật cùng sống vẫn "OK";
 *   (c) không kiểm `CLAUDE.md` ≤ 10 dòng ⇒ shim phình thành hiến pháp thứ hai vẫn "OK".
 *
 * Ba nhánh được kiểm hộp đen ở đây; các ca đơn vị tương ứng nằm ở
 * tests/unit/diagnose.test.js (T-U24, T-U25, T-U26, T-U27).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { mkTmpRoot } = require('../helpers/tmp.js');
const { snapshotTree } = require('../helpers/tree.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const STATE_REL = ['brain4agent', 'memory', 'hot', 'state.json'];

function codesIn(stdout) {
  return Array.from(new Set(
    stdout.split('\n').filter((l) => /^BRN-\d{3}/.test(l)).map((l) => l.slice(0, 7))
  )).sort();
}

test('D7(a): state.json kẹt version cũ (marker đã đúng) ⇒ --check KHÔNG được báo NÃO ĐÃ OK', () => {
  const tmp = mkTmpRoot('F02-standard-lf');
  try {
    const statePath = path.join(tmp.dir, ...STATE_REL);
    const st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    st.brain_template_version = '1.2.0'; // marker ở root vẫn là 1.3.0
    fs.writeFileSync(statePath, JSON.stringify(st, null, 2) + '\n');

    const r = runEngine(ENGINE_PATH, ['--check', tmp.dir]);
    assert.equal(r.code, 1, 'D7(a): phải phát hiện lệch');
    assert.ok(!r.stdout.includes('NÃO ĐÃ OK'), 'D7(a): v1.5.4 báo "NÃO ĐÃ OK" ở đúng ca này');
    const codes = codesIn(r.stdout);
    assert.ok(codes.includes('BRN-010'), `phải có BRN-010, có: ${codes.join(',')}`);
    assert.ok(codes.includes('BRN-007'), 'phải đối chiếu marker ↔ state.json');
  } finally {
    tmp.cleanup();
  }
});

test('D7(b): token luật lặp ×3 trong AGENTS.md ⇒ exit 2 (cần người), engine CẤM tự sửa', () => {
  const tmp = mkTmpRoot('F02-standard-lf');
  try {
    const agentsPath = path.join(tmp.dir, 'AGENTS.md');
    const orig = fs.readFileSync(agentsPath, 'utf8');
    fs.writeFileSync(agentsPath, orig
      + '\n## Bản sao thừa 1 — Dual Entry-Point Invariant\n'
      + '\n## Bản sao thừa 2 — Dual Entry-Point Invariant\n');
    const before = snapshotTree(tmp.dir);

    const chk = runEngine(ENGINE_PATH, ['--check', tmp.dir]);
    assert.equal(chk.code, 2, 'D7(b): lỗi không tự sửa được ⇒ 2, không phải 0/1');
    assert.ok(codesIn(chk.stdout).includes('BRN-003'));
    assert.ok(!chk.stdout.includes('NÃO ĐÃ OK'));
    assert.deepEqual(snapshotTree(tmp.dir), before, '--check CẤM ghi');

    const wr = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(wr.code, 2, 'chế độ ghi cũng phải kết thúc 2 (không hội tụ được)');
    assert.ok(!wr.stdout.includes('HOÀN TẤT THÀNH CÔNG'));
    // Engine CẤM tự gỡ nội dung người dùng: 3 lần xuất hiện vẫn còn nguyên.
    assert.equal(fs.readFileSync(agentsPath, 'utf8').split('Dual Entry-Point Invariant').length - 1, 3);
  } finally {
    tmp.cleanup();
  }
});

test('D7(c): CLAUDE.md 12 dòng ⇒ BRN-005 warning; engine CẤM cắt nội dung người dùng', () => {
  const tmp = mkTmpRoot('F02-standard-lf');
  try {
    const claudePath = path.join(tmp.dir, 'CLAUDE.md');
    const twelve = Array.from({ length: 12 }, (_, i) => `dòng ${i + 1}`).join('\n') + '\n@AGENTS.md\n';
    fs.writeFileSync(claudePath, twelve);
    const before = snapshotTree(tmp.dir);

    const r = runEngine(ENGINE_PATH, ['--check', tmp.dir]);
    // Warning KHÔNG fixable ⇒ isStandard vẫn true ⇒ exit 0, nhưng finding PHẢI hiện ra.
    assert.equal(r.code, 0, 'warning không-fixable không kéo engine vào đường ghi');
    assert.ok(r.stdout.includes('BRN-005'), 'D7(c): v1.5.4 KHÔNG hề kiểm số dòng CLAUDE.md');
    assert.ok(/BRN-005.*13 dòng/.test(r.stdout), `phải in đúng số dòng, stdout: ${r.stdout}`);

    const wr = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(wr.code, 0);
    assert.deepEqual(snapshotTree(tmp.dir), before, 'D7(c): CẤM engine tự cắt CLAUDE.md');
  } finally {
    tmp.cleanup();
  }
});
