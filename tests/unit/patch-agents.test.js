'use strict';
/**
 * patch-agents.test.js — T-U10..T-U15. Hàm THUẦN `patchAgentsMd`, không chạm đĩa.
 * Bảo vệ I5 (đủ 4 token luật), I6 (một phát biểu luật planning duy nhất), D3 (mẫu `$`).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { ENGINE_PATH } = require('../helpers/run.js');
const e = require(ENGINE_PATH);

const V = e.BRAIN_TEMPLATE_VERSION;
const TOKENS = ['xay-dung-nao-bo', 'Marker Phiên Bản Khung Não', 'Dual Entry-Point Invariant', 'SPEC PACKAGE'];

const HEAD_STANDARD = [
  '# AGENTS.md — du an mau',
  '',
  '---',
  '',
  '## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)',
  '',
  'Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:',
  '',
  '1. Đọc `brain4agent/memory-distill.txt`.',
  ''
].join('\n');

const OLD_PLANNING_BLOCK = [
  '## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (planning/)',
  '',
  '1. **Quy tắc đặt tên:** `planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/`.',
  '2. **Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First):**',
  '   ```text',
  '   planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan]/',
  '   ├── plan.md',
  '   └── 01-thiet-ke-chi-tiet.md',
  '   ```',
  ''
].join('\n');

const SECTION_G_H_J = [
  '## 🛡️ 5. CÁC BỘ LUẬT VẬN HÀNH',
  '',
  '### G. Quy tắc Kỷ Luật Root Clean 100%',
  '1. Root phải sạch tuyệt đối.',
  '',
  '### H. Quy tắc Giám Sát Tác Vụ Ngầm',
  '1. CẤM polling file log theo giây.',
  ''
].join('\n');

function countOf(text, token) {
  return text.split(token).length - 1;
}

test('T-U10 · I5/I10: AGENTS.md đủ 4 token ⇒ changed=false, content y NGUYÊN BYTE', () => {
  const standard = e.renderFullAgentsMd();
  const r = e.patchAgentsMd(standard, V);
  assert.equal(r.changed, false);
  assert.deepEqual(r.patches, []);
  assert.equal(r.content, standard, 'I10: vá lên bản chuẩn không được đổi một byte nào');
});

test('T-U11 · I5: thiếu Bước 0 ⇒ chèn đúng chỗ sau tiêu đề §1 (không phụ lục cuối file)', () => {
  const src = HEAD_STANDARD + '\n' + OLD_PLANNING_BLOCK + '\n' + SECTION_G_H_J;
  assert.ok(!src.includes('xay-dung-nao-bo'), 'tiền đề: đầu vào chưa có Bước 0');

  const r = e.patchAgentsMd(src, V);
  assert.ok(r.patches.includes('step0'));
  assert.ok(r.content.includes('xay-dung-nao-bo'));

  const iHeading = r.content.indexOf('## ⚡ 1. GIAO THỨC KHỞI ĐỘNG');
  const iStep0 = r.content.indexOf('**Bước 0 (Bắt buộc tiên quyết');
  const iSection2 = r.content.indexOf('## 📋 3.');
  assert.ok(iHeading >= 0 && iStep0 > iHeading && iStep0 < iSection2,
    'Bước 0 phải nằm TRONG §1, không rơi xuống cuối file');
});

test('T-U12 · D3: mẫu $` $& $\' $$ trong mục G/H được giữ NGUYÊN VĂN sau khi vá', () => {
  // Đây là bẫy `String.prototype.replace(pattern, chuỗi)`: `$&` trong CHUỖI THAY THẾ
  // được diễn giải thành "toàn bộ khớp", `$\`` thành tiền tố... ⇒ nội dung người dùng
  // bị nhân bản/xoá âm thầm. Bản sửa dùng replacement là HÀM `() => text`.
  const patterns = ['$`', '$&', "$'", '$$'];
  const src = [
    HEAD_STANDARD,
    OLD_PLANNING_BLOCK,
    '## 🛡️ 5. CÁC BỘ LUẬT VẬN HÀNH',
    '',
    '### G. Quy tắc Kỷ Luật Root Clean 100%',
    "1. Bảng mẫu thay thế: tiền tố $` , toàn khớp $& , hậu tố $' , dấu đô-la $$ .",
    '',
    '### H. Quy tắc Giám Sát Tác Vụ Ngầm',
    "1. Khi viết regex thay thế, các chuỗi $` và $& và $' và $$ phải được giữ NGUYÊN VĂN.",
    ''
  ].join('\n');

  const before = {};
  for (const p of patterns) before[p] = countOf(src, p);
  assert.deepEqual(before, { '$`': 2, '$&': 2, "$'": 2, '$$': 2 }, 'tiền đề fixture');

  const r = e.patchAgentsMd(src, V);
  assert.ok(r.patches.includes('marker-exception'), 'phải vá vào mục G (nhánh dùng replace)');
  assert.ok(r.patches.includes('law-j'), 'phải vá vào mục H (nhánh dùng replace)');

  for (const p of patterns) {
    assert.equal(countOf(r.content, p), before[p],
      `D3: mẫu ${JSON.stringify(p)} bị $-substitution làm sai số lần xuất hiện`);
  }
  // Nội dung gốc của 2 dòng vẫn phải nằm nguyên trong output.
  assert.ok(r.content.includes("1. Bảng mẫu thay thế: tiền tố $` , toàn khớp $& , hậu tố $' , dấu đô-la $$ ."));
  assert.ok(r.content.includes("1. Khi viết regex thay thế, các chuỗi $` và $& và $' và $$ phải được giữ NGUYÊN VĂN."));
  for (const t of TOKENS) assert.ok(r.content.includes(t), `sau khi vá phải đủ token: ${t}`);
});

test('T-U13 · I6: khối luật planning CŨ bị THAY, SPEC PACKAGE xuất hiện đúng 1 lần', () => {
  const src = HEAD_STANDARD + '\n' + OLD_PLANNING_BLOCK + '\n' + SECTION_G_H_J;
  const r = e.patchAgentsMd(src, V);
  assert.ok(r.patches.includes('spec-package'));
  assert.ok(!r.content.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'),
    'I6: khối cũ phải BIẾN MẤT, không được nằm cạnh khối mới');
  assert.equal(countOf(r.content, 'SPEC PACKAGE'), 1, 'I6: đúng MỘT phát biểu luật');
});

test('T-U14 · I6: có CẢ khối cũ lẫn SPEC PACKAGE ⇒ chỉ gỡ tàn dư (remove-legacy-planning)', () => {
  const headWithStep0 = HEAD_STANDARD + '1. **Bước 0:** chạy skill `.xay-dung-nao-bo`.\n';
  const withBoth = headWithStep0 + '\n'
    + OLD_PLANNING_BLOCK + '\n'
    + '2. **BẮT BUỘC DẠNG SPEC PACKAGE — CẤM PLAN PHẲNG/MỎNG.**\n\n'
    + SECTION_G_H_J
    + '\n### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)\n'
    + '1. Hai điểm nạp, một nguồn chân lý.\n'
    + '\n3. **NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não:** đúng một marker.\n';

  const r = e.patchAgentsMd(withBoth, V);
  assert.deepEqual(r.patches, ['remove-legacy-planning']);
  assert.ok(!r.content.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'));
  assert.equal(countOf(r.content, 'SPEC PACKAGE'), 1);

  // Hội tụ: vá lần 2 không đổi gì nữa.
  const again = e.patchAgentsMd(r.content, V);
  assert.equal(again.changed, false, 'I10: gỡ tàn dư phải hội tụ sau đúng 1 lần');
});

test('T-U15 · I5: AGENTS.md phi chuẩn (không có §1/§3/G/H) ⇒ 3 phụ lục cuối file, vẫn đủ token', () => {
  const src = '# Ghi chú riêng của dự án\n\nnội dung tự do, không theo khung.\n';
  const r = e.patchAgentsMd(src, V);
  assert.deepEqual(r.patches.sort(), ['law-j', 'marker-exception', 'spec-package', 'step0'].sort());
  assert.ok(r.content.startsWith('# Ghi chú riêng của dự án'), 'CẤM xoá nội dung người dùng');
  assert.ok(r.content.includes('[PHỤ LỤC TỰ ĐỘNG VÁ] Ngoại Lệ Root Clean'));
  assert.ok(r.content.includes('### J. Quy tắc Tương Thích Đa Agent'));
  assert.ok(r.content.includes('[PHỤ LỤC TỰ ĐỘNG VÁ] Quản Trị Kế Hoạch'));
  for (const t of TOKENS) assert.ok(r.content.includes(t), `thiếu token ${t}`);

  const again = e.patchAgentsMd(r.content, V);
  assert.equal(again.changed, false, 'I10: nhánh fallback cũng phải hội tụ');
});
