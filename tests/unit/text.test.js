'use strict';
/**
 * text.test.js — lớp văn bản (01-CONTRACTS §1). Hàm THUẦN, gọi trực tiếp, KHÔNG chạm đĩa.
 * Ma trận: T-U01..T-U06 (TESTING-ACCEPTANCE §1.1). Bảo vệ A7, D4, BRN-013.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { ENGINE_PATH } = require('../helpers/run.js');
const e = require(ENGINE_PATH);

const BOM = '﻿';

test('T-U01 · D4/A7: stripBom bỏ ĐÚNG MỘT BOM ở đầu chuỗi', () => {
  assert.equal(e.stripBom(BOM + BOM + 'abc'), BOM + 'abc');
  assert.equal(e.stripBom(BOM + 'abc'), 'abc');
  assert.equal(e.stripBom('abc'), 'abc', 'không có BOM ⇒ trả nguyên');
  assert.equal(e.stripBom(''), '', 'chuỗi rỗng không được ném');
  assert.equal(e.stripBom(BOM), '');
});

test('T-U02 · A7: stripBom KHÔNG đụng BOM nằm giữa file', () => {
  assert.equal(e.stripBom('a' + BOM + 'b'), 'a' + BOM + 'b');
  // U+FEFF giữa file là ZERO WIDTH NO-BREAK SPACE — nội dung thật của người dùng.
  assert.equal(e.stripBom('a' + BOM), 'a' + BOM);
});

test('T-U03 · A7: detectEol phân đủ 4 lớp lf/crlf/mixed/none', () => {
  assert.equal(e.detectEol('a\nb'), 'lf');
  assert.equal(e.detectEol('a\r\nb'), 'crlf');
  assert.equal(e.detectEol('a\r\nb\nc'), 'mixed');
  assert.equal(e.detectEol('abc'), 'none');
  assert.equal(e.detectEol(''), 'none', 'chuỗi rỗng ⇒ none');
  assert.equal(e.detectEol('\n'), 'lf', 'LF ở vị trí 0 vẫn là LF, không phải CRLF');
});

test('T-U04 · A7 §1.1: CR đơn độc KHÔNG phải EOL — giữ nguyên byte qua cả 3 hàm', () => {
  const raw = 'a\rb\n';
  assert.equal(e.detectEol(raw), 'lf', 'CR đơn độc không được tính là EOL');
  assert.equal(e.normalizeEol(raw), 'a\rb\n', 'normalizeEol phải giữ CR đơn độc');
  assert.equal(e.restoreEol(e.normalizeEol(raw), 'lf'), raw, 'khứ hồi lf phải bảo toàn byte');
  // Ca thật của hub: `-known-gotchas.md` có 1 CR đơn độc — đổi nó là đổi nội dung.
  assert.equal(e.normalizeEol('x\ry\r\nz'), 'x\ry\nz');
});

test("T-U05 · A7: restoreEol('crlf') KHÔNG được sinh \\r\\r\\n khi đầu vào lỡ còn \\r\\n", () => {
  // SPEC-P02 §a.4 liệt kê ca này là BẮT BUỘC. Đây là phòng thủ: nếu một caller tương lai
  // quên normalizeEol trước khi ghi thì restoreEol không được nhân đôi CR.
  //
  // ⚠️ ĐANG ĐỎ CÓ CHỦ Ý (WP2b, chưa sửa engine — WP2b bị CẤM sửa init_brain.js):
  // `restoreEol` hiện làm `lf.replace(/\n/g, () => '\r\n')` nên với đầu vào còn `\r\n`
  // nó sinh `\r\r\n`. Hôm nay chưa vỡ ngoài đời vì writeText luôn nhận văn bản đã
  // normalizeEol, nhưng SPEC-P02 §a.4 vẫn đòi hàm phải phòng thủ.
  // Cách sửa đề xuất (do orchestrator quyết): chuẩn hoá trước khi khôi phục —
  //   eol === 'crlf' ? lf.replace(/\r\n/g, () => '\n').replace(/\n/g, () => '\r\n') : lf
  assert.equal(e.restoreEol('a\r\nb\n', 'crlf'), 'a\r\nb\r\n',
    "restoreEol('crlf') nhân đôi CR khi đầu vào lỡ còn \\r\\n — xem ghi chú trong test");
});

test("T-U05b · A7: restoreEol trên văn bản LF chuẩn (đường chính, hợp đồng §1.2)", () => {
  assert.equal(e.restoreEol('a\nb\n', 'crlf'), 'a\r\nb\r\n');
  assert.equal(e.restoreEol('a\nb\n', 'lf'), 'a\nb\n');
  assert.equal(e.restoreEol('a\nb\n', 'mixed'), 'a\nb\n', "'mixed' ghi như lf");
  assert.equal(e.restoreEol('abc', 'none'), 'abc', "'none' ghi như lf");
});

test('T-U06 · BRN-013: detectEncoding nhận đúng 5 lớp mã hoá', () => {
  assert.equal(e.detectEncoding(Buffer.from([0xff, 0xfe, 0x61, 0x00])), 'utf16le');
  assert.equal(e.detectEncoding(Buffer.from([0xfe, 0xff, 0x00, 0x61])), 'utf16be');
  assert.equal(e.detectEncoding(Buffer.from([0xef, 0xbb, 0xbf, 0x61])), 'utf8-bom');
  assert.equal(e.detectEncoding(Buffer.from([0xc3, 0x28])), 'invalid-utf8', 'byte nối sai ⇒ invalid-utf8');
  assert.equal(e.detectEncoding(Buffer.from('nội dung tiếng Việt\n', 'utf8')), 'utf8');
  assert.equal(e.detectEncoding(Buffer.alloc(0)), 'utf8', 'file rỗng là UTF-8 hợp lệ');
  // Thứ tự dò quan trọng: BOM UTF-8 phải được nhận TRƯỚC khi thử decode.
  assert.equal(e.hasUtf8Bom(Buffer.from([0xef, 0xbb, 0xbf])), true);
  assert.equal(e.hasUtf8Bom(Buffer.from([0xef, 0xbb])), false, 'buffer ngắn hơn 3 byte không được ném');
});
