'use strict';
/**
 * D3 — `String.prototype.replace(pattern, CHUỖI)` diễn giải `$&`, `` $` ``, `$'`, `$$`
 * trong văn bản THAY THẾ. AGENTS.md của một dự án thật hoàn toàn có thể chứa các mẫu đó
 * (tài liệu về regex, bảng ký tự...) ⇒ engine v1.5.4 âm thầm nhân bản / cắt xén nội dung
 * người dùng khi vá luật. Bản sửa: replacement luôn là HÀM `() => text`.
 *
 * Ca hộp đen T-C12 trên fixture F08-dollar-agents.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { mkTmpRoot } = require('../helpers/tmp.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const PATTERNS = ['$`', '$&', "$'", '$$'];
const TOKENS = ['xay-dung-nao-bo', 'Marker Phiên Bản Khung Não', 'Dual Entry-Point Invariant', 'SPEC PACKAGE'];

const countOf = (text, token) => text.split(token).length - 1;

test('D3: F08 — 4 mẫu $ trong AGENTS.md giữ NGUYÊN VĂN sau khi engine vá (hộp đen)', () => {
  const tmp = mkTmpRoot('F08-dollar-agents');
  try {
    const agentsPath = path.join(tmp.dir, 'AGENTS.md');
    const before = fs.readFileSync(agentsPath, 'utf8');
    const beforeCounts = {};
    for (const p of PATTERNS) beforeCounts[p] = countOf(before, p);
    assert.deepEqual(beforeCounts, { '$`': 2, '$&': 2, "$'": 2, '$$': 2 }, 'tiền đề fixture F08');

    const r = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(r.code, 0, `phải hội tụ (stderr: ${r.stderr})`);
    assert.ok(r.stdout.includes('HOÀN TẤT THÀNH CÔNG'));

    const after = fs.readFileSync(agentsPath, 'utf8');
    for (const p of PATTERNS) {
      assert.equal(countOf(after, p), beforeCounts[p],
        `D3: mẫu ${JSON.stringify(p)} bị $-substitution (trước ${beforeCounts[p]}, sau ${countOf(after, p)})`);
    }
    // Hai dòng gốc phải còn nguyên văn, không bị chèn thêm tiền tố/hậu tố.
    assert.ok(after.includes("1. Bảng mẫu thay thế: tiền tố $` , toàn khớp $& , hậu tố $' , dấu đô-la $$ ."));
    assert.ok(after.includes("2. Khi viết regex thay thế, các chuỗi $` và $& và $' và $$ phải được giữ NGUYÊN VĂN."));

    for (const t of TOKENS) {
      assert.equal(countOf(after, t) >= 1, true, `sau khi vá phải có token ${t}`);
    }
    // Không được nhân bản luật (đúng 1 phát biểu mỗi token mốc).
    for (const t of ['Marker Phiên Bản Khung Não', 'Dual Entry-Point Invariant', 'SPEC PACKAGE']) {
      assert.equal(countOf(after, t), 1, `token ${t} phải xuất hiện đúng 1 lần`);
    }

    // Hội tụ: chạy lần 2 không đổi gì.
    const r2 = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(r2.code, 0);
    assert.ok(r2.stdout.includes('NÃO ĐÃ OK'));
    assert.equal(fs.readFileSync(agentsPath, 'utf8'), after, 'D3 + I10: lần 2 không được ghi lại');
  } finally {
    tmp.cleanup();
  }
});

test('D3b: engine KHÔNG còn `.replace(x, <chuỗi>)` — replacement luôn là hàm (A4/T-H07)', () => {
  const src = fs.readFileSync(ENGINE_PATH, 'utf8');
  const offenders = [];
  const NEEDLE = '.replace(';
  for (let at = src.indexOf(NEEDLE); at !== -1; at = src.indexOf(NEEDLE, at + 1)) {
    // Quét cân bằng ngoặc để lấy TRỌN danh sách đối số (có lời gọi trải nhiều dòng).
    let depth = 0;
    let end = -1;
    for (let i = at + NEEDLE.length - 1; i < src.length; i++) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')') { depth--; if (depth === 0) { end = i; break; } }
    }
    const args = src.slice(at + NEEDLE.length, end === -1 ? src.length : end);
    // Cho phép: replacement là arrow function `() =>`, hoặc chuỗi RỖNG '' (không chứa
    // mẫu `$` nên vô hại — ngoại lệ tường minh của 01-CONTRACTS §2.2).
    if (!args.includes(',')) continue; // `.replace()` nhắc trong comment — không phải lời gọi
    if (args.includes('() =>')) continue;
    if (/,\s*''\s*$/.test(args)) continue;
    offenders.push(src.slice(at, at + 90).split('\n')[0]);
  }
  assert.deepEqual(offenders, [], 'D3: mọi replacement phải là hàm hoặc chuỗi rỗng');
});
