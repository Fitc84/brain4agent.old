'use strict';
// T-H06 · Bẫy #19: bước CI `doctor-fixture-run` trỏ vào `tests/fixtures/fleet` — một
// tài nguyên KHÔNG được test nào khác dùng (bộ test doctor dựng fleet trong thư mục
// tạm). Vì thế local từng xanh 192/192 trong khi CI đỏ vì fixture chưa tồn tại
// (đo thật: run 33608846259, 2026-09-02). Test này chốt fixture đó vào lưới local:
// xoá/đổi tên nó thì `npm test` phải đỏ TRƯỚC khi CI kịp đỏ.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const FLEET = path.join(ROOT, 'tests', 'fixtures', 'fleet');

test('T-H06 · tests/fixtures/fleet tồn tại đúng hình dạng SPEC-P05 bước 9', () => {
  assert.ok(fs.existsSync(FLEET), 'tests/fixtures/fleet phải tồn tại — bước CI doctor-fixture-run trỏ vào đây');

  // Một repo sạch, một repo có lỗi mức error (để doctor thoát ĐÚNG mã 2), một thư mục thường.
  const clean = path.join(FLEET, '00-chuan');
  const dup = path.join(FLEET, '01-nhan-doi-luat');
  const plain = path.join(FLEET, '02-thu-muc-thuong');
  for (const d of [clean, dup, plain]) {
    assert.ok(fs.statSync(d).isDirectory(), d + ' phải là thư mục');
  }
  assert.ok(fs.existsSync(path.join(clean, 'AGENTS.md')), '00-chuan phải là brain repo (có AGENTS.md)');
  assert.ok(fs.existsSync(path.join(dup, 'AGENTS.md')), '01-nhan-doi-luat phải là brain repo (có AGENTS.md)');
  assert.ok(!fs.existsSync(path.join(plain, 'AGENTS.md')), '02-thu-muc-thuong KHÔNG được là brain repo — doctor phải SKIP');

  // Repo lỗi phải thật sự mang "hai phát biểu luật planning cùng sống" — điều kiện
  // kích hoạt BRN-003 (mức error) trong diagnose(): mốc MỚI và tiêu đề khối CŨ cùng có mặt.
  const agents = fs.readFileSync(path.join(dup, 'AGENTS.md'), 'utf8');
  assert.ok(agents.includes('SPEC PACKAGE'),
    '01-nhan-doi-luat/AGENTS.md phải chứa mốc luật MỚI (SPEC PACKAGE)');
  assert.ok(agents.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'),
    '01-nhan-doi-luat/AGENTS.md phải còn tiêu đề khối luật CŨ — cùng mốc mới tạo BRN-003 = error, cho doctor thoát đúng mã 2');
});
