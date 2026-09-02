'use strict';
/**
 * diagnose.test.js — T-U22..T-U28, T-U30, T-U-D01..D04. Hàm THUẦN, snapshot dựng trong bộ nhớ.
 *
 * Đây là nơi phủ khiếm khuyết **D7**: `isFullyStandard` của v1.5.4 là chuỗi boolean
 * thủ công — (a) không đối chiếu `brain_template_version`, (b) không ĐẾM token,
 * (c) không kiểm `CLAUDE.md` ≤ 10 dòng. Ba nhánh đó được kiểm riêng ở dưới.
 *
 * Từ #10 (SPEC-P04): chẩn đoán AGENTS.md đi qua `classifyRuleBlocks` — BRN-002 (khối
 * thiếu/cũ, fixable), BRN-003 (bản thừa / khối planning cũ), BRN-016 (mốc hỏng / sửa tay),
 * BRN-017 (tên lạ trong `memory/archive/`). Đếm chuỗi `includes(token)` đã bị khai tử (M-9).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { mkSnapshot, engine: e, tf, codesOf, findingsOf, V } = require('../helpers/snapshot.js');

const dx = (overrides) => e.diagnose(mkSnapshot(overrides), V);

// ── Tiện ích dựng AGENTS.md VIẾT TAY (#10, SPEC-P04) ─────────────────────────
// `RULE_BLOCKS` là DỮ LIỆU hợp đồng (01-CONTRACTS §5) nên được phép đọc; CẤM dùng
// `patchAgentsMd()` / `renderFullAgentsMd()` để sinh kỳ vọng của chính chẩn đoán.
const BY_ID = {};
for (const blk of e.RULE_BLOCKS) BY_ID[blk.id] = blk;

const LF = String.fromCharCode(10);
const wrap = (id) => e.OPEN(id) + LF + BY_ID[id].body + LF + e.CLOSE(id);

/** Một thể hiện NGUYÊN VĂN của thân luật cũ (mảng đoạn ⇒ nhét SemVer thật vào lỗ). */
const legacyText = (id, version) => {
  const item = BY_ID[id].legacy[0];
  return typeof item === 'string' ? item : item.join(version || '1.3.0');
};

/** Thân luật cũ đã bị NGƯỜI DÙNG sửa: còn probe nhưng không còn nguyên văn ⇒ state `edited`. */
const editedText = (id) => {
  const old = legacyText(id);
  const cut = old.indexOf('để đảm bảo');
  if (cut === -1) throw new Error('editedText: thiếu neo cắt cho ' + id);
  return old.slice(0, cut) + 'ĐỂ BẢO ĐẢM (câu do người dùng viết lại).';
};

/** Tài liệu 6 khối `ok`, riêng các id trong `swap` được thay bằng đoạn cho sẵn. */
const docWith = (swap) => {
  const parts = ['# AGENTS.md của một repo — văn bản riêng của người dùng'];
  for (const blk of e.RULE_BLOCKS) {
    parts.push(Object.prototype.hasOwnProperty.call(swap, blk.id) ? swap[blk.id] : wrap(blk.id));
  }
  return parts.join(LF + LF) + LF;
};

/** Chẩn đoán một repo chuẩn nhưng AGENTS.md là văn bản cho trước. */
const dxAgents = (text) => dx({ files: { agentsMd: tf(text) } });

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

test('T-U27 · TQ4: bản luật J còn sống NGOÀI khối (×3) ⇒ BRN-003 extra, KHÔNG fixable', () => {
  // Điều kiện CŨ (#09) là "đếm mệnh đề luật ×n". #10 thay bằng: khối đã có mốc mà probe
  // vẫn xuất hiện ngoài mọi khối ⇒ hai phát biểu cùng sống. Đếm chuỗi đã bị khai tử (M-9).
  const RULE_J = BY_ID['dual-entry'].probe;
  const d = dxAgents(docWith({}) + LF + RULE_J + ' — Bản sao thừa 1.' + LF + LF + RULE_J + ' — Bản sao thừa 2.' + LF);
  const f = findingsOf(d, 'BRN-003');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.extra, ['dual-entry']);
  assert.equal(f[0].detail.legacy_planning, false);
  assert.equal(f[0].fixable, false, 'TQ4/Đ3: engine KHÔNG tự gỡ nội dung người dùng');
  assert.equal(f[0].level, 'error');
  assert.deepEqual(findingsOf(d, 'BRN-002'), [], 'khối vẫn đúng ⇒ không phải việc của BRN-002');
  assert.equal(d.isStandard, false, 'error ⇒ không chuẩn');
});

test('T-U27b · TQ5: còn khối luật planning CŨ ⇒ BRN-003 legacy_planning, KHÔNG fixable', () => {
  // #10 bỏ bước `supersedes`: engine KHÔNG tự gỡ khối cũ (đo thật: 0/66 repo còn khối này).
  const oldBlock = LF + '2. **Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First):**' + LF + '   ```text' + LF + '   plan.md' + LF + '   ```' + LF;
  const f = findingsOf(dxAgents(docWith({}) + oldBlock), 'BRN-003');
  assert.equal(f.length, 1);
  assert.equal(f[0].detail.legacy_planning, true);
  assert.deepEqual(f[0].detail.extra, []);
  assert.equal(f[0].fixable, false, 'TQ5: hai phát biểu cùng sống ⇒ cần người');
});

test('T-U28 · M-1 (ĐẢO kỳ vọng #09): token chỉ nằm trong code block ⇒ vẫn tính là thiếu luật', () => {
  // Hành vi CŨ: `includes()` toàn cục ⇒ token trong ``` được tính là "có luật" (âm tính giả).
  // Hành vi MỚI: khối chỉ được nhận qua MỐC TRỌN DÒNG; ví dụ trong code block là vô hình.
  const fake = '```text' + LF + 'ví dụ minh hoạ: ' + BY_ID['spec-package'].token + LF + '   ' + e.OPEN('spec-package') + LF + '```';
  const agents = docWith({ 'spec-package': fake });
  assert.ok(agents.includes('SPEC PACKAGE'), 'token vẫn có mặt trong văn bản');
  const f = findingsOf(dxAgents(agents), 'BRN-002');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.absent, ['spec-package']);
  assert.equal(f[0].fixable, true);
});

test('T-U23c · BRN-002: AGENTS.md không có luật nào ⇒ liệt kê đủ 6 khối absent', () => {
  const d = dxAgents('# Ghi chú tự do\n');
  const f = findingsOf(d, 'BRN-002');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail, { absent: e.RULE_BLOCKS.map((b) => b.id), adopt: [], stale: [] });
  assert.ok(f[0].message.startsWith('AGENTS.md thiếu/cũ khối luật: '));
  assert.equal(f[0].fixable, true, 'engine tự chèn được ⇒ đường ghi');
  assert.deepEqual(findingsOf(d, 'BRN-016'), [], 'không dấu vết luật nào ⇒ không phải BRN-016');
});

test('T-U-D00 · bánh cóc bảng BRN: engine giữ ĐÚNG 15 mã (13 cũ + 016/017), 014/015 là của doctor', () => {
  // Thêm mã mới ⇒ phải sửa 01-CONTRACTS §6 + SPEC trước, không lặng lẽ nhét vào bảng.
  const codes = Object.keys(e.BRN);
  assert.equal(codes.length, 15, 'CẤM thêm mã ngoài BRN-016/BRN-017 (01-CONTRACTS §6)');
  assert.ok(codes.includes('BRN-016') && codes.includes('BRN-017'));
  assert.ok(!codes.includes('BRN-014') && !codes.includes('BRN-015'), 'hai mã này là việc của doctor');
  assert.equal(e.BRN['BRN-016'].level, 'error');
  assert.equal(e.BRN['BRN-016'].title, 'AGENTS.md: khối marker hỏng hoặc vùng luật đã bị sửa tay');
  assert.equal(e.BRN['BRN-017'].level, 'warning');
  assert.equal(e.BRN['BRN-017'].title, 'memory/archive/ có file không theo mẫu YYYY-MM-DD.md');
  assert.equal(e.BRN['BRN-017'].fix, 'Chuyển file lạ ra khỏi memory/archive/ hoặc đổi tên đúng mẫu');
});

// ── T-U-D01..D04 · bốn mã của WP3 (SPEC-P04 §5) ──────────────────────────────

test('T-U-D01 · BRN-002: repo S1 (thân luật cũ nguyên văn, chưa có mốc) ⇒ 4 adopt + 2 absent', () => {
  const agents = '# AGENTS.md của repo đời 1.3.0' + LF + LF + 'Đoạn văn riêng của repo.' + LF + LF
    + [legacyText('boot'), legacyText('spec-package'), legacyText('root-marker', '1.3.0'), legacyText('dual-entry')].join(LF + LF)
    + LF;
  const d = dxAgents(agents);
  const f = findingsOf(d, 'BRN-002');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.adopt, ['boot', 'spec-package', 'root-marker', 'dual-entry']);
  assert.deepEqual(f[0].detail.absent, ['cold-memory', 'structural-extension']);
  assert.deepEqual(f[0].detail.stale, []);
  assert.equal(f[0].fixable, true);
  assert.equal(f[0].level, 'error');
  assert.deepEqual(findingsOf(d, 'BRN-016'), [], 'thân luật cũ NGUYÊN VĂN ⇒ máy vẫn nhận diện được');
  assert.deepEqual(findingsOf(d, 'BRN-003'), []);
  assert.equal(d.isStandard, false);
});

test('T-U-D01b · BRN-002: khối có mốc nhưng ruột lệch ⇒ stale (vẫn fixable)', () => {
  const f = findingsOf(dxAgents(docWith({ boot: e.OPEN('boot') + LF + 'ruột đời cũ' + LF + e.CLOSE('boot') })), 'BRN-002');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail, { absent: [], adopt: [], stale: ['boot'] });
  assert.equal(f[0].fixable, true);
});

test('T-U-D02 · BRN-003: khối đủ + bản thừa ngoài khối ⇒ extra, cần người', () => {
  const d = dxAgents(docWith({}) + LF + BY_ID['dual-entry'].probe + ' (bản chép thừa của người dùng)' + LF);
  const f = findingsOf(d, 'BRN-003');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail, { extra: ['dual-entry'], legacy_planning: false });
  assert.equal(f[0].fixable, false);
  assert.equal(f[0].fix, 'Soi tay AGENTS.md, gỡ bản thừa (engine KHÔNG tự sửa nội dung người dùng)');
  assert.equal(d.isStandard, false);
});

test('T-U-D03 · BRN-016: mốc hỏng (H1) + vùng luật bị sửa tay ⇒ cần người, không fixable', () => {
  const d = dxAgents(docWith({
    'spec-package': e.OPEN('spec-package') + LF + 'thân dở dang, thiếu mốc đóng',
    boot: editedText('boot')
  }));
  const f = findingsOf(d, 'BRN-016');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail, { malformed: ['spec-package'], edited: ['boot'] });
  assert.equal(f[0].fixable, false, 'Đ2/Đ3: 0 byte ghi cho khối hỏng, không ghi đè bản người dùng sửa');
  assert.equal(f[0].level, 'error');
  assert.equal(f[0].message, e.BRN['BRN-016'].title);
  assert.equal(d.isStandard, false);
  assert.deepEqual(findingsOf(d, 'BRN-002'), [], '4 khối còn lại vẫn ok ⇒ không có BRN-002');
});

test('T-U-D04 · BRN-017: memory/archive/ có tên lạ ⇒ warning; thư mục chưa có ⇒ im lặng', () => {
  const d = dx({ archiveEntries: ['2026-09-02.md', '.gitkeep', 'notes.txt', '2026-09.md'] });
  const f = findingsOf(d, 'BRN-017');
  assert.equal(f.length, 1);
  assert.deepEqual(f[0].detail.files, ['notes.txt', '2026-09.md'], 'mẫu CỐ ĐỊNH YYYY-MM-DD.md; .gitkeep được bỏ qua');
  assert.equal(f[0].level, 'warning');
  assert.equal(f[0].fixable, false);
  assert.equal(d.isStandard, true, 'warning không-fixable KHÔNG kéo engine vào đường ghi');

  // TQ6: engine không sinh `.gitkeep` ⇒ clone mới không có thư mục ⇒ CẤM báo (kể cả BRN-009).
  const dNull = dx({ archiveEntries: null, dirs: { archive: false } });
  assert.deepEqual(findingsOf(dNull, 'BRN-017'), []);
  assert.deepEqual(findingsOf(dNull, 'BRN-009'), []);
  assert.equal(dNull.isStandard, true);

  assert.deepEqual(findingsOf(dx({ archiveEntries: ['2026-01-15.md'] }), 'BRN-017'), [], 'tên đúng mẫu ⇒ im lặng');
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
