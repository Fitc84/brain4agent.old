'use strict';
/**
 * patch-distill.test.js — T-U16, T-U17 (+ patchClaudeMd T-U18).
 * Bảo vệ I9 (kernel luôn có Bước 0), I4 (CLAUDE.md là shim trỏ @AGENTS.md).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { ENGINE_PATH } = require('../helpers/run.js');
const e = require(ENGINE_PATH);

test('T-U16 · I9: kernel có <agent_startup_protocol> ⇒ chèn Bước 0 NGAY SAU tag', () => {
  const src = '<kernel_instructions>\n<agent_startup_protocol>\n1. Đọc index.md\n</agent_startup_protocol>\n';
  const r = e.patchDistill(src);
  assert.deepEqual(r.patches, ['step0']);
  assert.equal(r.changed, true);

  const lines = r.content.split('\n');
  const iTag = lines.findIndex((l) => l.includes('<agent_startup_protocol>'));
  assert.ok(iTag >= 0);
  assert.ok(lines[iTag + 1].startsWith('0. [BẮT BUỘC TIÊN QUYẾT]'), 'Bước 0 phải là dòng ngay sau tag');
  assert.ok(r.content.includes('xay-dung-nao-bo'));
  assert.ok(r.content.includes('1. Đọc index.md'), 'CẤM xoá nội dung kernel cũ');
});

test('T-U17 · I9: kernel KHÔNG có tag ⇒ fallback chèn khối lên ĐẦU file (bug v1.2.2)', () => {
  // v1.2.2: regex trượt ⇒ engine ghi lại y nguyên file và vẫn log "đã vá" ⇒ không bao
  // giờ hội tụ. Nhánh fallback phải chèn thật.
  const src = '# Kernel markdown thuần\n\nkhông theo khuôn XML.\n';
  const r = e.patchDistill(src);
  assert.deepEqual(r.patches, ['step0-fallback']);
  assert.ok(r.content.startsWith('<agent_startup_protocol>\n0. [BẮT BUỘC TIÊN QUYẾT]'),
    'khối Bước 0 phải nằm ở ĐẦU file');
  assert.ok(r.content.includes('# Kernel markdown thuần'), 'CẤM xoá nội dung cũ');

  const again = e.patchDistill(r.content);
  assert.equal(again.changed, false, 'I9/I10: fallback phải hội tụ sau đúng 1 lần');
});

test('T-U16b · I10: kernel đã có Bước 0 ⇒ changed=false, y nguyên byte', () => {
  const src = '<agent_startup_protocol>\n0. Chạy skill `.xay-dung-nao-bo`.\n</agent_startup_protocol>\n';
  const r = e.patchDistill(src);
  assert.equal(r.changed, false);
  assert.deepEqual(r.patches, []);
  assert.equal(r.content, src);
});

test('T-U18 · I4: patchClaudeMd giữ nội dung người dùng, nối @AGENTS.md ở cuối', () => {
  const src = '# CLAUDE.md\n\nGhi chú riêng của tôi.\n';
  const r = e.patchClaudeMd(src);
  assert.deepEqual(r.patches, ['import']);
  assert.ok(r.content.startsWith('# CLAUDE.md\n\nGhi chú riêng của tôi.'), 'nội dung cũ là TIỀN TỐ');
  assert.ok(r.content.endsWith('\n\n@AGENTS.md\n'));
  // CẤM nhân bản luật: shim chỉ thêm ĐÚNG dòng import.
  assert.equal(r.content.split('@AGENTS.md').length - 1, 1);
});

test('T-U18b · I4/I10: CLAUDE.md đã trỏ @AGENTS.md ⇒ changed=false', () => {
  const shim = e.renderClaudeShim();
  const r = e.patchClaudeMd(shim);
  assert.equal(r.changed, false);
  assert.equal(r.content, shim);
  assert.ok(shim.replace(/\n+$/, () => '').split('\n').length <= 10, 'I4: shim mẫu phải ≤10 dòng');
});
