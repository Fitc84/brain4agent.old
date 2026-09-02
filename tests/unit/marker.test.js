'use strict';
/**
 * marker.test.js — T-M01..T-M24 (kế hoạch #10, SPEC-P01 / SPEC-P02).
 *
 * LUẬT CỦA FILE NÀY (Đ8.3):
 *   - Đầu vào 100% VIẾT TAY trong file này. CẤM fixture, CẤM golden.
 *   - CẤM dùng renderFullAgentsMd()/patchAgentsMd() để sinh kỳ vọng.
 *   - Được phép đọc BẢNG HỢP ĐỒNG `RULE_BLOCKS` (id/token/probe/body/legacy) — đó là DỮ LIỆU
 *     hợp đồng (01-CONTRACTS §5), không phải đầu ra của cơ chế đang kiểm.
 *
 * Bảo vệ: M-1..M-10 (00-ARCHITECTURE §4), luật fail-closed H1–H5 (01-CONTRACTS §2), A1.
 */
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const { ENGINE_PATH, DOCTOR_PATH } = require('../helpers/run.js');
const e = require(ENGINE_PATH);

// ── Tiện ích viết tay (không gọi lớp vá) ─────────────────────────────────────
const BY_ID = {};
for (const blk of e.RULE_BLOCKS) BY_ID[blk.id] = blk;

/** Bọc mốc quanh thân luật hiện hành — 3 dòng, viết tay theo cú pháp 01-CONTRACTS §1. */
const wrap = (id) => e.OPEN(id) + '\n' + BY_ID[id].body + '\n' + e.CLOSE(id);

/** Một thể hiện NGUYÊN VĂN của thân luật cũ (mảng đoạn ⇒ nhét SemVer thật vào lỗ). */
function legacyText(id, version) {
  const item = BY_ID[id].legacy[0];
  return typeof item === 'string' ? item : item.join(version || '1.3.0');
}

/** Bản thân luật cũ đã bị NGƯỜI DÙNG sửa: còn dấu vết (probe) nhưng KHÔNG còn nguyên văn. */
function editedText(id) {
  const old = legacyText(id);
  const cut = old.indexOf('để đảm bảo');
  if (cut === -1) throw new Error('editedText: thiếu neo cắt cho ' + id);
  return old.slice(0, cut) + 'ĐỂ BẢO ĐẢM (câu do người dùng viết lại).';
}

/** Tài liệu có đủ 6 khối ở trạng thái `ok`, riêng `id` được thay bằng `chunk`. */
function docWith(id, chunk) {
  const chunks = ['# Tài liệu thử — văn bản riêng của người dùng'];
  for (const blk of e.RULE_BLOCKS) chunks.push(blk.id === id ? chunk : wrap(blk.id));
  return chunks.join('\n\n') + '\n';
}

const BOOT = 'boot';
const OPEN_BOOT = e.OPEN(BOOT);
const CLOSE_BOOT = e.CLOSE(BOOT);

// ── T-M01..T-M08 · findBlock ─────────────────────────────────────────────────

test('T-M01 · §2 dòng 0: không có mốc nào ⇒ findBlock trả null', () => {
  const lines = ['# Tiêu đề', '', 'một đoạn văn', '| a | b |', 'kết'];
  assert.equal(e.findBlock(lines, BOOT), null);
});

test('T-M02 · §2 dòng 1 + M-5: khối bình thường và khối RUỘT RỖNG', () => {
  assert.deepEqual(e.findBlock([OPEN_BOOT, 'x', CLOSE_BOOT], BOOT), { open: 0, close: 2, inner: 'x' });
  const empty = e.findBlock([OPEN_BOOT, CLOSE_BOOT], BOOT);
  assert.equal(empty.inner, '', 'mốc rỗng liền nhau là hợp lệ (skeleton)');
  assert.deepEqual([empty.open, empty.close], [0, 1]);
  const multi = e.findBlock(['đầu', OPEN_BOOT, 'a', 'b', CLOSE_BOOT, 'cuối'], BOOT);
  assert.deepEqual(multi, { open: 1, close: 4, inner: 'a\nb' });
});

test('T-M03 · H1 thiếu mốc ĐÓNG ⇒ malformed, KHÔNG diễn giải "mở → EOF"', () => {
  assert.equal(e.findBlock([OPEN_BOOT, 'a', 'b'], BOOT), 'malformed');

  const chunk = OPEN_BOOT + '\na\nb';
  const src = docWith(BOOT, chunk);
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.broken, [BOOT]);
  assert.deepEqual(r.patches, [], 'khối khác đã ok ⇒ không có patch nào');
  assert.equal(r.content, src, '0 byte ghi cho khối hỏng — và không nuốt đuôi file');
  assert.ok(r.content.includes('\na\nb\n'), 'ruột dở dang giữ nguyên');
});

test('T-M04 · H2 thiếu mốc MỞ ⇒ malformed', () => {
  assert.equal(e.findBlock(['a', CLOSE_BOOT], BOOT), 'malformed');
  const src = docWith(BOOT, 'a\n' + CLOSE_BOOT);
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.broken, [BOOT]);
  assert.equal(r.content, src);
});

test('T-M05 · H3 mốc ĐÓNG trước mốc MỞ ⇒ malformed (CẤM swap)', () => {
  assert.equal(e.findBlock([CLOSE_BOOT, 'a', OPEN_BOOT], BOOT), 'malformed');
  const src = docWith(BOOT, CLOSE_BOOT + '\na\n' + OPEN_BOOT);
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.broken, [BOOT]);
  assert.equal(r.content, src);
});

test('T-M06 · H4 hai mốc MỞ cùng id ⇒ malformed (CẤM chọn cặp đầu)', () => {
  assert.equal(e.findBlock([OPEN_BOOT, 'a', CLOSE_BOOT, OPEN_BOOT, 'b', CLOSE_BOOT], BOOT), 'malformed');
  const src = docWith(BOOT, [OPEN_BOOT, 'a', CLOSE_BOOT, OPEN_BOOT, 'b', CLOSE_BOOT].join('\n'));
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.broken, [BOOT]);
  assert.equal(r.content, src);
});

test('T-M07 · H5 hai mốc ĐÓNG cùng id ⇒ malformed (CẤM lấy mốc đóng đầu)', () => {
  assert.equal(e.findBlock([OPEN_BOOT, 'a', CLOSE_BOOT, CLOSE_BOOT], BOOT), 'malformed');
  const src = docWith(BOOT, [OPEN_BOOT, 'a', CLOSE_BOOT, CLOSE_BOOT].join('\n'));
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.broken, [BOOT]);
  assert.equal(r.content, src);
});

test('T-M08 · M-1: mốc phải CHIẾM TRỌN một dòng (thụt lề / trong ``` / có đuôi ⇒ vô hình)', () => {
  assert.equal(e.findBlock(['  ' + OPEN_BOOT, 'a', '  ' + CLOSE_BOOT], BOOT), null);
  assert.equal(e.findBlock(['```text', OPEN_BOOT + ' ', '```'], BOOT), null);
  assert.equal(e.findBlock([OPEN_BOOT + ' ', 'a', CLOSE_BOOT + ' '], BOOT), null);
  assert.equal(e.findBlock(['văn ' + OPEN_BOOT + ' xuôi'], BOOT), null);
  // Dòng còn \r (file CRLF chưa chuẩn hoá) KHÔNG khớp — lớp thuần không tự chuẩn hoá lại.
  assert.equal(e.findBlock([OPEN_BOOT + '\r', 'a', CLOSE_BOOT + '\r'], BOOT), null);
});

// ── T-M09..T-M10 · findLegacy ────────────────────────────────────────────────

test('T-M09 · M-3: findLegacy khớp NGUYÊN VĂN chuỗi, đúng biên đầu/cuối dòng', () => {
  const old = legacyText(BOOT);
  const text = 'trước\n' + old + '\nsau\n';
  const span = e.findLegacy(text, [old]);
  assert.equal(text.slice(span.start, span.end), old);
  assert.equal(text[span.start - 1], '\n', 'start phải là đầu dòng');
  assert.equal(text[span.end], '\n', 'end phải là cuối dòng (không gồm \\n)');
  assert.equal(e.findLegacy('không có gì', [old]), null);
});

test('T-M10 · Đ7/C5: findLegacy mảng đoạn ghép bằng ĐÚNG MỘT lỗ SemVer', () => {
  const segs = ['ab v', ' cd'];
  assert.deepEqual(e.findLegacy('ab v1.2.0 cd', [segs]), { start: 0, end: 12 });
  assert.deepEqual(e.findLegacy('ab v1.3.0 cd', [segs]), { start: 0, end: 12 });
  assert.equal(e.findLegacy('ab vX cd', [segs]), null);
  // Ký tự đặc biệt regex trong đoạn phải được escape (không được coi là mẫu).
  assert.equal(e.findLegacy('a.c v1.0.0 (x)', [['a+c v', ' (x)']]), null);
  assert.ok(e.findLegacy('a+c v1.0.0 (x)', [['a+c v', ' (x)']]));
  // Thứ tự legacy[] quyết định: khớp đầu tiên thắng.
  assert.deepEqual(e.findLegacy('xxAyyB', ['B', 'A']), { start: 5, end: 6 });
});

// ── T-M11 · classifyRuleBlocks ───────────────────────────────────────────────

test('T-M11 · M-9: 6 trạng thái + cờ extra (một định nghĩa DUY NHẤT)', () => {
  const stateOf = (text, id) => e.classifyRuleBlocks(text).filter((s) => s.id === id)[0];

  assert.equal(stateOf(docWith(BOOT, wrap(BOOT)), BOOT).state, 'ok');
  assert.equal(stateOf(docWith(BOOT, OPEN_BOOT + '\nruột cũ\n' + CLOSE_BOOT), BOOT).state, 'stale');
  assert.equal(stateOf(docWith(BOOT, legacyText(BOOT)), BOOT).state, 'legacy');
  assert.equal(stateOf(docWith(BOOT, 'một đoạn văn trung tính'), BOOT).state, 'absent');
  assert.equal(stateOf(docWith(BOOT, editedText(BOOT)), BOOT).state, 'edited');
  assert.equal(stateOf(docWith(BOOT, OPEN_BOOT + '\ndở dang'), BOOT).state, 'malformed');

  for (const s of e.classifyRuleBlocks(docWith(BOOT, wrap(BOOT)))) {
    assert.equal(s.extra, false, 'không có bản thừa ⇒ extra=false ở mọi khối');
  }
  const withExtra = stateOf(docWith(BOOT, wrap(BOOT) + '\n\n' + BY_ID[BOOT].probe + ' (bản thừa)'), BOOT);
  assert.equal(withExtra.state, 'ok');
  assert.equal(withExtra.extra, true, 'probe còn ngoài khối ⇒ extra=true (BRN-003)');

  assert.equal(e.classifyRuleBlocks('văn bản trắng\n').length, e.RULE_BLOCKS.length);
  assert.deepEqual(
    e.classifyRuleBlocks('văn bản trắng\n').map((s) => s.id),
    e.RULE_BLOCKS.map((b) => b.id),
    'đúng thứ tự RULE_BLOCKS'
  );
});

// ── T-M12..T-M16 · patchAgentsMd ─────────────────────────────────────────────

test('T-M12 · M-3/A3: adopt bọc mốc ĐÚNG đoạn cũ, phần ngoài byte-identical', () => {
  const old = legacyText(BOOT);
  const before = '# Tiêu đề riêng\n\nĐoạn văn của người dùng.\n\n';
  const after = '\n\nĐoạn văn phía sau.\n';
  const src = before + old + after + e.RULE_BLOCKS.slice(1).map((b) => wrap(b.id)).join('\n\n') + '\n';

  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.patches, ['adopt:' + BOOT]);
  assert.deepEqual(r.broken, []);
  assert.equal(r.changed, true);
  const expected = before + wrap(BOOT) + after + e.RULE_BLOCKS.slice(1).map((b) => wrap(b.id)).join('\n\n') + '\n';
  assert.equal(r.content, expected);
  assert.ok(r.content.startsWith(before), 'phần trước đoạn cũ byte-identical');
  assert.ok(r.content.endsWith('\n'), 'giữ newline cuối');
});

test('T-M13 · M-7: sync độc lập vị trí (khối ở ĐẦU / CUỐI / giữa văn bản khác)', () => {
  const stale = e.OPEN('dual-entry') + '\nruột đời cũ\n' + e.CLOSE('dual-entry');
  const others = e.RULE_BLOCKS.filter((b) => b.id !== 'dual-entry').map((b) => wrap(b.id)).join('\n\n');
  const fixed = wrap('dual-entry');

  const atTop = stale + '\n\n' + others + '\n';
  const rTop = e.patchAgentsMd(atTop);
  assert.deepEqual(rTop.patches, ['sync:dual-entry']);
  assert.equal(rTop.content, fixed + '\n\n' + others + '\n');

  const atEnd = others + '\n\n' + stale + '\n';
  const rEnd = e.patchAgentsMd(atEnd);
  assert.deepEqual(rEnd.patches, ['sync:dual-entry']);
  assert.equal(rEnd.content, others + '\n\n' + fixed + '\n');

  const middle = '| Cột A | Cột B |\n| :--- | :--- |\n| x | y |\n\n' + stale + '\n\n' + others + '\n';
  const rMid = e.patchAgentsMd(middle);
  assert.equal(rMid.content, '| Cột A | Cột B |\n| :--- | :--- |\n| x | y |\n\n' + fixed + '\n\n' + others + '\n');
});

test('T-M14 · SPEC-P01 a.4: add nối phụ lục, tiêu đề CHỈ MỘT dù chạy nhiều đợt', () => {
  const kept = e.RULE_BLOCKS.filter((b) => b.id !== 'cold-memory' && b.id !== 'structural-extension');
  const src = '# Doc\n\n' + kept.map((b) => wrap(b.id)).join('\n\n') + '\n';

  const r1 = e.patchAgentsMd(src);
  assert.deepEqual(r1.patches, ['add:cold-memory', 'add:structural-extension']);
  const expected1 = '# Doc\n\n' + kept.map((b) => wrap(b.id)).join('\n\n')
    + '\n\n---\n\n' + e.APPENDIX_HEADING + '\n\n'
    + wrap('cold-memory') + '\n\n' + wrap('structural-extension') + '\n';
  assert.equal(r1.content, expected1);

  // Đợt 2: gỡ hẳn khối dual-entry khỏi output đợt 1 ⇒ absent ⇒ add vào phụ lục ĐÃ CÓ.
  const round2 = r1.content.replace(wrap('dual-entry') + '\n\n', '');
  const r2 = e.patchAgentsMd(round2);
  assert.deepEqual(r2.patches, ['add:dual-entry']);
  assert.equal(r2.content.split('\n').filter((l) => l === e.APPENDIX_HEADING).length, 1,
    'CẤM sinh tiêu đề phụ lục thứ hai');
  assert.ok(r2.content.endsWith(wrap('dual-entry') + '\n'));
});

test('T-M15 · M-4/Đ3: có dấu vết nhưng KHÔNG nguyên văn ⇒ không ghi, không chèn', () => {
  const edited = editedText(BOOT);
  const src = docWith(BOOT, edited);
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.patches, []);
  assert.deepEqual(r.broken, [BOOT]);
  assert.equal(r.changed, false);
  assert.equal(r.content, src, 'CẤM ghi đè, CẤM chèn bản thứ hai (tái diễn sự cố #07)');
  assert.equal(r.content.split(BY_ID[BOOT].probe).length - 1, 1, 'chỉ còn ĐÚNG MỘT phát biểu');
});

test('T-M16 · M-2: một khối hỏng KHÔNG chặn việc vá khối khác', () => {
  const chunks = ['# Doc'];
  for (const blk of e.RULE_BLOCKS) {
    if (blk.id === 'dual-entry') chunks.push(e.OPEN('dual-entry') + '\nruột dở dang');
    else if (blk.id === BOOT) chunks.push(legacyText(BOOT));
    else chunks.push(wrap(blk.id));
  }
  const src = chunks.join('\n\n') + '\n';
  const r = e.patchAgentsMd(src);
  assert.deepEqual(r.patches, ['adopt:' + BOOT]);
  assert.deepEqual(r.broken, ['dual-entry']);
  assert.ok(r.content.includes(e.OPEN('dual-entry') + '\nruột dở dang'), 'vùng hỏng byte-identical');
  assert.equal(r.content.split(e.CLOSE('dual-entry')).length - 1, 0, 'CẤM tự thêm mốc đóng');
  assert.ok(r.content.includes(wrap(BOOT)));
});

// ── T-M17 · A1 idempotent ────────────────────────────────────────────────────

test('T-M17 · A1: P(P(x)) === P(x) byte-identical trên MỌI input viết tay', () => {
  const others = e.RULE_BLOCKS.slice(1).map((b) => wrap(b.id)).join('\n\n');
  const inputs = [
    '',
    '\n',
    '# Rỗng luật\n',
    docWith(BOOT, wrap(BOOT)),
    docWith(BOOT, legacyText(BOOT)),
    docWith(BOOT, editedText(BOOT)),
    docWith(BOOT, OPEN_BOOT + '\nruột cũ\n' + CLOSE_BOOT),
    docWith(BOOT, OPEN_BOOT + '\na\nb'),
    docWith(BOOT, 'a\n' + CLOSE_BOOT),
    docWith(BOOT, CLOSE_BOOT + '\na\n' + OPEN_BOOT),
    docWith(BOOT, [OPEN_BOOT, 'a', CLOSE_BOOT, OPEN_BOOT, 'b', CLOSE_BOOT].join('\n')),
    docWith(BOOT, [OPEN_BOOT, 'a', CLOSE_BOOT, CLOSE_BOOT].join('\n')),
    '# Doc\n\n' + others + '\n',
    ORACLE_INPUT,
    e.AGENTS_SKELETON
  ];
  for (const src of inputs) {
    const r1 = e.patchAgentsMd(src);
    const r2 = e.patchAgentsMd(r1.content);
    assert.equal(r2.content, r1.content, 'byte-identical ở lần chạy thứ hai');
    assert.deepEqual(r2.patches, [], 'lần hai KHÔNG còn patch nào');
    assert.deepEqual(r2.broken, r1.broken, 'tập broken không đổi');
    assert.equal(r2.changed, false);
  }
});

// ── T-M18..T-M20 · skeleton và bảng RULE_BLOCKS ──────────────────────────────

test('T-M18 · M-5: renderFullAgentsMd() === patchAgentsMd(AGENTS_SKELETON).content', () => {
  const skeleton = e.AGENTS_SKELETON;
  const sLines = skeleton.split('\n');
  let emptyPairs = 0;
  for (const blk of e.RULE_BLOCKS) {
    const b = e.findBlock(sLines, blk.id);
    assert.ok(b && b !== 'malformed', 'skeleton phải có cặp mốc của ' + blk.id);
    assert.equal(b.inner, '', 'cặp mốc trong skeleton phải RỖNG (' + blk.id + ')');
    assert.equal(b.close, b.open + 1, 'hai mốc phải liền nhau');
    emptyPairs++;
  }
  assert.equal(emptyPairs, 6);

  const full = e.renderFullAgentsMd();
  assert.equal(full, e.patchAgentsMd(skeleton).content);
  const fLines = full.split('\n');
  for (const blk of e.RULE_BLOCKS) {
    const b = e.findBlock(fLines, blk.id);
    assert.equal(b.inner, blk.body, 'khối ' + blk.id + ' phải mang đúng body');
  }
  const again = e.patchAgentsMd(full);
  assert.equal(again.changed, false, 'AGENTS.md do engine sinh phải đã hội tụ');
  assert.deepEqual(again.broken, []);
  assert.ok(again.patches.length === 0);
  for (const s of e.classifyRuleBlocks(full)) {
    assert.equal(s.state, 'ok');
    assert.equal(s.extra, false);
  }
  assert.ok(full.endsWith('\n'));
});

test('T-M19 · 01-CONTRACTS §5 + C6: ràng buộc bảng RULE_BLOCKS', () => {
  const RULE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  assert.equal(e.RULE_BLOCKS.length, 6);
  const ids = new Set();
  for (const blk of e.RULE_BLOCKS) {
    assert.ok(RULE_ID_RE.test(blk.id), 'id kebab-case ASCII: ' + blk.id);
    assert.ok(!ids.has(blk.id), 'id duy nhất: ' + blk.id);
    ids.add(blk.id);
    assert.ok(blk.body.includes(blk.token), 'token ⊂ body: ' + blk.id);
    assert.ok(blk.body.includes(blk.probe), 'probe ⊂ body: ' + blk.id);
    assert.ok(!blk.body.startsWith('\n') && !blk.body.endsWith('\n'), 'body không có newline biên: ' + blk.id);
    assert.ok(Array.isArray(blk.legacy));
    for (const item of blk.legacy) {
      if (typeof item !== 'string') assert.ok(item.length >= 2, 'mảng đoạn phải ≥ 2 phần tử');
    }
    assert.ok(!e.APPENDIX_HEADING.includes(blk.probe), 'probe ∉ APPENDIX_HEADING');
    assert.ok(!e.APPENDIX_HEADING.includes(blk.token), 'token ∉ APPENDIX_HEADING');
  }
  // probe KHÔNG được xuất hiện trong skeleton ngoài các cặp mốc (skeleton có ruột rỗng ⇒ ngoài hết).
  for (const blk of e.RULE_BLOCKS) {
    assert.ok(!e.AGENTS_SKELETON.includes(blk.probe), 'probe ∉ skeleton ngoài mốc: ' + blk.id);
  }
});

test('T-M20 · M-6: thân luật KHÔNG chứa version', () => {
  for (const blk of e.RULE_BLOCKS) {
    assert.equal(/\d+\.\d+\.\d+/.test(blk.body), false, 'body có version: ' + blk.id);
  }
});

// ── T-M21..T-M23 · vệ sinh mã nguồn và EOL ───────────────────────────────────

test('T-M21 · C5: lớp vá có 0 literal regex, đúng 1 new RegExp', () => {
  const src = fs.readFileSync(ENGINE_PATH, 'utf8');
  const from = src.indexOf('const OPEN');
  assert.ok(from > 0, 'không tìm thấy đầu lớp marker');
  const fnAt = src.indexOf('function patchAgentsMd', from);
  assert.ok(fnAt > from);
  const to = src.indexOf('\n}\n', fnAt);
  assert.ok(to > fnAt);
  const layer = src.slice(from, to + 3);

  const stripped = layer.split('\n').map((line) => {
    let l = line.replace(/'(\\.|[^'\\])*'/g, "''").replace(/`(\\.|[^`\\])*`/g, '``');
    const c = l.indexOf('//');
    return c === -1 ? l : l.slice(0, c);
  }).join('\n');
  assert.equal((stripped.match(/\//g) || []).length, 0, 'còn dấu / ngoài chuỗi ⇒ nghi có regex literal');
  assert.equal((layer.match(/new RegExp/g) || []).length, 1, 'đúng 1 new RegExp (trong findLegacy)');
});

test('T-M22 · M-10/Đ7: engine và doctor KHÔNG có byte điều khiển', () => {
  for (const p of [ENGINE_PATH, DOCTOR_PATH]) {
    const buf = fs.readFileSync(p);
    const bad = [];
    for (const b of buf) {
      if ((b <= 0x08) || (b >= 0x0b && b <= 0x1f) || b === 0x7f) bad.push(b);
    }
    assert.deepEqual(bad, [], 'byte điều khiển trong ' + p);
  }
});

test('T-M23 · R5: vá trên CRLF — chuẩn hoá vào, khôi phục ra, 0 LF trần', () => {
  const lf = docWith(BOOT, legacyText(BOOT));
  const crlf = lf.split('\n').join('\r\n');
  const norm = e.normalizeEol(e.stripBom(crlf));
  assert.equal(norm, lf, 'normalizeEol phải đưa về đúng bản LF');
  const patched = e.patchAgentsMd(norm);
  assert.deepEqual(patched.patches, ['adopt:' + BOOT]);
  const out = e.restoreEol(patched.content, 'crlf');
  const strayLf = out.split('').filter((ch, i) => ch === '\n' && out[i - 1] !== '\r').length;
  assert.equal(strayLf, 0, '100% CRLF sau khi ghi');
  assert.ok(out.includes('\r\n' + OPEN_BOOT + '\r\n'), 'mốc là dòng CRLF trọn vẹn');
  assert.equal(e.normalizeEol(out), patched.content, 'quay lại LF phải khớp byte');
});

// ── T-M24 · oracle viết tay ──────────────────────────────────────────────────
//
// Đầu vào S1 mô phỏng một AGENTS.md 1.3.0 thật thu nhỏ: văn bản riêng, một bảng GFM, một khối
// ``` chứa DÒNG GIẢ MỐC (thụt lề — phải vô hình, M-1) và 4 thân luật cũ nguyên văn.
// Kỳ vọng dựng THỦ CÔNG theo hợp đồng (mốc + body + phụ lục), KHÔNG gọi renderFullAgentsMd().

const ORACLE_HEAD = [
  '# AGENTS.md — bản thu nhỏ để kiểm chứng',
  '',
  'Văn bản riêng của người dùng — engine KHÔNG được đụng dòng này.',
  '',
  '## 1. GIAO THỨC KHỞI ĐỘNG',
  ''
].join('\n');

const ORACLE_MID1 = [
  '',
  '2. **Bước 1:** đọc kernel hiện trạng.',
  '',
  '| Cột A | Cột B |',
  '| :--- | :--- |',
  '| x | y |',
  '',
  '```text',
  '   <!-- brain:rule:boot -->',
  '```',
  '',
  '## 3. QUY CHUẨN KẾ HOẠCH',
  ''
].join('\n');

const ORACLE_MID2 = ['', '', '### G. Root Clean', ''].join('\n');
const ORACLE_MID3 = ['', ''].join('\n');
const ORACLE_TAIL = '\n';

function oracleParts(bootChunk, specChunk, rootChunk, dualChunk) {
  return ORACLE_HEAD + bootChunk + ORACLE_MID1 + specChunk + ORACLE_MID2
    + rootChunk + ORACLE_MID3 + dualChunk + ORACLE_TAIL;
}

const ORACLE_INPUT = oracleParts(
  legacyText('boot'),
  legacyText('spec-package'),
  legacyText('root-marker', '1.3.0'),
  legacyText('dual-entry')
);

test('T-M24 · Đ8.3: oracle viết tay — adopt tại chỗ + phụ lục, phần ngoài byte-identical', () => {
  const EXPECTED = oracleParts(wrap('boot'), wrap('spec-package'), wrap('root-marker'), wrap('dual-entry'))
    .replace(/\s*$/, '')
    + '\n\n---\n\n' + e.APPENDIX_HEADING + '\n\n'
    + wrap('cold-memory') + '\n\n' + wrap('structural-extension') + '\n';

  const r = e.patchAgentsMd(ORACLE_INPUT);
  assert.deepEqual(r.patches, [
    'adopt:boot', 'add:cold-memory', 'adopt:spec-package',
    'add:structural-extension', 'adopt:root-marker', 'adopt:dual-entry'
  ], 'thứ tự patch = thứ tự RULE_BLOCKS');
  assert.deepEqual(r.broken, []);
  assert.equal(r.content, EXPECTED);

  // M-1: dòng giả mốc thụt lề trong khối ``` vẫn còn nguyên và KHÔNG bị coi là mốc.
  assert.ok(r.content.includes('```text\n   <!-- brain:rule:boot -->\n```'));
  assert.equal(r.content.split('\n').filter((l) => l === OPEN_BOOT).length, 1);
  // A2: mọi dòng văn bản riêng vẫn còn.
  for (const line of ORACLE_HEAD.split('\n').concat(ORACLE_MID1.split('\n'))) {
    if (line !== '') assert.ok(r.content.includes(line), 'mất dòng người dùng: ' + line);
  }
});
