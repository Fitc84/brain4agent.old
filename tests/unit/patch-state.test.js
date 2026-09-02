'use strict';
/**
 * patch-state.test.js — T-U07..T-U09. Bảo vệ I2 (state.json luôn kết thúc \n, luôn LF),
 * I3 (brain_template_version được vá), BRN-010/BRN-011.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { ENGINE_PATH } = require('../helpers/run.js');
const e = require(ENGINE_PATH);

const V = e.BRAIN_TEMPLATE_VERSION;

test('T-U07 · I3: vá brain_template_version, CẤM đụng field khác, kết thúc \\n', () => {
  const src = JSON.stringify({
    current_version: '9.9.9',
    brain_template_version: '1.2.0',
    system_status: 'ok',
    active_plans_completed: 7
  }, null, 2) + '\n';

  const r = e.patchStateJson(src, V);
  assert.equal(r.changed, true);
  assert.deepEqual(r.patches, ['version']);

  const after = JSON.parse(r.content);
  assert.equal(after.brain_template_version, V);
  assert.equal(after.current_version, '9.9.9', 'I3: CẤM ghi đè version DỰ ÁN');
  assert.equal(after.system_status, 'ok');
  assert.equal(after.active_plans_completed, 7);
  assert.ok(r.content.endsWith('\n'), 'I2: state.json luôn kết thúc bằng newline');
  assert.ok(!r.content.includes('\r'), 'I2: state.json luôn LF, không bao giờ CRLF');
});

test('T-U08 · I2/BRN-011: JSON đúng version nhưng thiếu newline cuối ⇒ chỉ thêm newline', () => {
  const body = JSON.stringify({ current_version: '2.0.0', brain_template_version: V }, null, 2);
  const r = e.patchStateJson(body, V);
  assert.equal(r.changed, true);
  // Engine đặt tên patch là 'trailing-newline' (TESTING-ACCEPTANCE viết tắt 'newline').
  assert.deepEqual(r.patches, ['trailing-newline']);
  assert.equal(r.content, body + '\n', 'nội dung JSON không được đổi, chỉ thêm 0x0A');
});

test('T-U08b · I10: state.json đã chuẩn ⇒ changed=false, content y nguyên', () => {
  const src = JSON.stringify({ current_version: '2.0.0', brain_template_version: V }, null, 2) + '\n';
  const r = e.patchStateJson(src, V);
  assert.equal(r.changed, false);
  assert.deepEqual(r.patches, []);
  assert.equal(r.content, src);
});

test('T-U09 · BRN-010: JSON hỏng ⇒ ném StateJsonError (KHÔNG nuốt lỗi, KHÔNG ghi bừa)', () => {
  assert.throws(
    () => e.patchStateJson('{"a":', V),
    (err) => err.name === 'StateJsonError' && err.code === 'STATE_JSON'
  );
  assert.throws(() => e.patchStateJson('', V), (err) => err.name === 'StateJsonError');
});

test('T-U09b · I3: state.json là mảng/không có field ⇒ vẫn vá được version', () => {
  // JSON.parse('null') hợp lệ nhưng gán field sẽ ném — hợp đồng không nêu; kiểm hành vi
  // thực tế để lần refactor sau không đổi lặng lẽ.
  const r = e.patchStateJson('{}\n', V);
  assert.equal(r.changed, true);
  assert.equal(JSON.parse(r.content).brain_template_version, V);
});
