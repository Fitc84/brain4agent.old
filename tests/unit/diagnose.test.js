'use strict';
/**
 * diagnose.test.js — T-U22..T-U28, T-U30. Hàm THUẦN, snapshot dựng trong bộ nhớ.
 *
 * Đây là nơi phủ khiếm khuyết **D7**: `isFullyStandard` của v1.5.4 là chuỗi boolean
 * thủ công — (a) không đối chiếu `brain_template_version`, (b) không ĐẾM token,
 * (c) không kiểm `CLAUDE.md` ≤ 10 dòng. Ba nhánh đó được kiểm riêng ở dưới.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { mkSnapshot, engine: e, tf, codesOf, findingsOf, V } = require('../helpers/snapshot.js');

const dx = (overrides) => e.diagnose(mkSnapshot(overrides), V);

test('T-U22 · I10: repo chuẩn ⇒ findings rỗng, isStandard=true, isBrandNew=false', () => {
  const d = dx();
  assert.deepEqual(d.findings, []);
  assert.equal(d.isStandard, true);
  assert.equal(d.isBrandNew, false);
});

test('T-U22b: repo mới tinh (không có brain4agent/) ⇒ isBrandNew=true + BRN-008', () => {
  const d = dx({ dirs: { brain: false } });
  assert.equal(d.isBrandNew, true);
  assert.equal(d.isStandard, false);
  assert.ok(codesOf(d).includes('BRN-008'));
});

test('T-U23 · I11: thiếu docs/ ⇒ BRN-009 detail.missing chứa docs/ (v1.5.4 KHÔNG kiểm)', () => {
  const d = dx({ dirs: { docs: false } });
  const f = findingsOf(d, 'BRN-009');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.missing, ['docs/']);
  assert.equal(f[0].fixable, true, 'I11: engine tự tạo được docs/');
  assert.equal(d.isStandard, false);
});

test('T-U23b · I11: thiếu planning/ và .agents/skills/ ⇒ gộp vào MỘT finding BRN-009', () => {
  const d = dx({ dirs: { planning: false, skills: false } });
  const f = findingsOf(d, 'BRN-009');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.missing, ['planning/', '.agents/skills/']);
});

test('T-U24 · D7(a)/I1↔I3: marker 1.3.0 nhưng state.json 1.2.0 ⇒ BRN-007 + BRN-010', () => {
  // v1.5.4 chỉ nhìn TÊN marker ⇒ báo "NÃO ĐÃ OK" dù state.json còn kẹt version cũ.
  const d = dx({
    files: { stateJson: tf(JSON.stringify({ current_version: '1.0.0', brain_template_version: '1.2.0' }, null, 2) + '\n') }
  });
  const codes = codesOf(d);
  assert.ok(codes.includes('BRN-010'), 'D7(a): phải phát hiện brain_template_version sai');
  assert.ok(codes.includes('BRN-007'), 'I1↔I3: phải đối chiếu marker với state.json');
  const f7 = findingsOf(d, 'BRN-007')[0];
  assert.deepEqual(f7.detail, { marker: V, state: '1.2.0' });
  assert.equal(d.isStandard, false);
});

test('T-U24b · D7(a): state.json THIẾU hẳn field brain_template_version ⇒ BRN-010', () => {
  const d = dx({ files: { stateJson: tf(JSON.stringify({ current_version: '1.0.0' }, null, 2) + '\n') } });
  const f = findingsOf(d, 'BRN-010');
  assert.equal(f.length, 1);
  assert.equal(f[0].detail.actual, null);
  assert.equal(f[0].detail.expected, V);
  assert.equal(f[0].fixable, true);
});

test('T-U25 · D7(c)/I4: CLAUDE.md 11 dòng (CRLF, không newline cuối) ⇒ BRN-005 warning, KHÔNG fixable', () => {
  // Bẫy E.4: đếm dòng phải bỏ qua newline cuối, và văn bản đã được chuẩn hoá về LF
  // trước khi đếm — nếu đếm trên chuỗi thô CRLF thì con số vẫn đúng nhưng nếu quên
  // strip newline cuối thì 10 dòng bị đếm thành 11.
  const eleven = Array.from({ length: 11 }, (_, i) => `dòng ${i + 1} @AGENTS.md`).join('\n');
  const d = dx({ files: { claudeMd: tf(eleven, { eol: 'crlf' }) } });
  const f = findingsOf(d, 'BRN-005');
  assert.equal(f.length, 1);
  assert.equal(f[0].detail.lines, 11);
  assert.equal(f[0].level, 'warning');
  assert.equal(f[0].fixable, false, 'D7(c): engine CẤM tự cắt nội dung người dùng');
  // Warning không-fixable KHÔNG được kéo engine vào đường ghi.
  assert.equal(d.isStandard, true, 'chỉ warning không-fixable ⇒ vẫn coi là chuẩn (không ghi)');
});

test('T-U26 · I4 (biên): CLAUDE.md đúng 10 dòng + newline cuối ⇒ KHÔNG có BRN-005', () => {
  const ten = Array.from({ length: 10 }, (_, i) => `dòng ${i + 1} @AGENTS.md`).join('\n') + '\n';
  const d = dx({ files: { claudeMd: tf(ten) } });
  assert.deepEqual(findingsOf(d, 'BRN-005'), []);
  // Biên trên: thêm đúng 1 dòng là phải báo.
  const d11 = dx({ files: { claudeMd: tf(ten + 'dòng 11\n') } });
  assert.equal(findingsOf(d11, 'BRN-005')[0].detail.lines, 11);
});

test('T-U26b · I4: CLAUDE.md thiếu @AGENTS.md ⇒ BRN-004 blocker (fixable)', () => {
  const d = dx({ files: { claudeMd: tf('# CLAUDE.md\n\nnội dung riêng\n') } });
  const f = findingsOf(d, 'BRN-004');
  assert.equal(f.length, 1);
  assert.equal(f[0].level, 'blocker');
  assert.equal(d.isStandard, false);
});

test('T-U27 · D7(b): token mốc xuất hiện ×3 ⇒ BRN-003 với detail.counts, KHÔNG fixable', () => {
  // v1.5.4 chỉ hỏi includes() ⇒ ba bản luật cùng sống vẫn ra "NÃO ĐÃ OK".
  // Nhân đôi NGUYÊN VĂN mệnh đề luật (đúng hình dạng của trùng lặp thật), không phải
  // token lẻ: token lẻ còn xuất hiện trong tiêu đề phụ lục do CHÍNH engine sinh ra
  // và trong văn xuôi tham chiếu — đếm token lẻ gây báo động giả (đo thật 2026-09-02).
  const RULE_J = '### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)';
  const agents = e.renderFullAgentsMd()
    + '\n\n' + RULE_J + '\n1. Bản sao thừa 1.\n'
    + '\n' + RULE_J + '\n1. Bản sao thừa 2.\n';
  const d = dx({ files: { agentsMd: tf(agents) } });
  const f = findingsOf(d, 'BRN-003');
  assert.equal(f.length, 1);
  assert.equal(f[0].detail.counts['Dual Entry-Point Invariant'], 3);
  assert.equal(f[0].fixable, false, 'D7(b): engine KHÔNG tự gỡ nội dung người dùng');
  assert.equal(f[0].level, 'error');
  assert.equal(d.isStandard, false, 'error ⇒ không chuẩn');
});

test('T-U27b · D7(b): SPEC PACKAGE cùng khối luật planning CŨ ⇒ BRN-003 (fixable)', () => {
  const agents = e.renderFullAgentsMd()
    + '\n2. **Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First):**\n   ```text\n   plan.md\n   ```\n';
  const d = dx({ files: { agentsMd: tf(agents) } });
  const f = findingsOf(d, 'BRN-003');
  assert.ok(f.length >= 1);
  assert.ok(f.some((x) => x.fixable === true), 'hai phát biểu cùng sống ⇒ engine gỡ được khối cũ');
});

test('T-U28 · I5 (ghi nhận GIỚI HẠN đã biết): diagnose dò token bằng includes() toàn cục', () => {
  // Token nằm trong code block ví dụ vẫn được tính là "có luật". Đây là hành vi CỐ Ý
  // giữ từ v1.5.4 (dòng 681). Test khẳng định hành vi để không ai "sửa cho tốt hơn"
  // một cách lặng lẽ — muốn đổi thì phải đổi cả 01-CONTRACTS §8 và golden.
  const agents = e.renderFullAgentsMd().replace(
    /### J\. Quy tắc Tương Thích Đa Agent[\s\S]*$/,
    () => '```text\nví dụ minh hoạ: Dual Entry-Point Invariant\n```\n'
  );
  assert.ok(agents.includes('Dual Entry-Point Invariant'));
  const d = dx({ files: { agentsMd: tf(agents) } });
  assert.deepEqual(findingsOf(d, 'BRN-002'), [], 'giới hạn đã biết: token trong code block vẫn tính là có');
});

test('T-U23c · I5: AGENTS.md thiếu cả 4 token ⇒ BRN-002 liệt kê đủ 4', () => {
  const d = dx({ files: { agentsMd: tf('# Ghi chú tự do\n') } });
  const f = findingsOf(d, 'BRN-002');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.missing,
    ['xay-dung-nao-bo', 'Marker Phiên Bản Khung Não', 'Dual Entry-Point Invariant', 'SPEC PACKAGE']);
});

test('T-U30 · formatFindings: nhóm [tự sửa] trước [cần người], trong nhóm sort theo mã', () => {
  const d = {
    findings: [
      { code: 'BRN-011', level: 'warning', fixable: true, message: 'm11', fix: 'f' },
      { code: 'BRN-003', level: 'error', fixable: false, message: 'm03', fix: 'f' },
      { code: 'BRN-002', level: 'error', fixable: true, message: 'm02', fix: 'f' },
      { code: 'BRN-005', level: 'warning', fixable: false, message: 'm05', fix: 'f' }
    ]
  };
  const lines = e.formatFindings(d).trim().split('\n');
  assert.ok(lines[0].includes('CẦN NÂNG CẤP (2 lệch engine tự sửa · 2 việc cần người)'));
  assert.deepEqual(lines.slice(1).map((l) => l.slice(0, 7)), ['BRN-002', 'BRN-011', 'BRN-003', 'BRN-005']);
  assert.ok(lines[1].includes('[tự sửa]'));
  assert.ok(lines[3].includes('[cần người]'));
});

test('T-U30b: diagnose không có finding ⇒ isStandard=true kể cả khi có warning không-fixable', () => {
  // Hợp đồng: isStandard ⇔ mọi finding đều KHÔNG fixable VÀ không blocker/error.
  const d = dx({ files: { claudeMd: tf(e.renderClaudeShim(), { hadBom: true }) } });
  assert.ok(codesOf(d).includes('BRN-013'));
  assert.equal(findingsOf(d, 'BRN-013')[0].fixable, false, 'BOM ở file KHÔNG phải state.json ⇒ cần người');
  assert.equal(d.isStandard, true);
});
