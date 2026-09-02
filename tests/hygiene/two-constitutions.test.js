'use strict';
/**
 * T-H02 (NG8) — Hub có HAI bản hiến pháp cùng sống: `AGENTS.md` (luật áp cho chính hub)
 * và `CORE_GOVERNANCE_RULES.md` (bản gốc mà engine phát tán). Lệch nhau một câu luật là
 * hai nguồn chân lý — đúng cái bệnh mà toàn bộ đợt #09 đang chữa.
 *
 * Test này KHÔNG đòi hai file giống hệt (chúng khác vai trò), chỉ đòi chúng **cùng
 * chứa hoặc cùng thiếu** từng token luật mốc, VỚI CÙNG SỐ LẦN xuất hiện.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT } = require('../helpers/repo.js');
const { ENGINE_PATH } = require('../helpers/run.js');
const engine = require(ENGINE_PATH);

// Token mốc: mỗi cái đại diện cho MỘT bộ luật đã chốt — đọc từ RULE_BLOCKS của
// engine (Đ8.1: KHÔNG chép tay), trừ 'xay-dung-nao-bo' (token của khối `boot`)
// vì chuỗi này còn xuất hiện lặp lại ở nơi khác trong cả hai hiến pháp (vd luật
// Dual Entry-Point Invariant nhắc lại tên skill) nên không thể đòi hỏi ×1.
// 'OPERATIONS.md'/'TESTING-ACCEPTANCE' là 2 tên file nêu trong thân khối
// `spec-package` (không phải id riêng trong RULE_BLOCKS) — giữ tĩnh vì không
// có nguồn máy đọc nào khác biểu diễn chúng.
const LAW_TOKENS = engine.RULE_BLOCKS
  .map((blk) => blk.token)
  .filter((token) => token !== 'xay-dung-nao-bo')
  .concat(['OPERATIONS.md', 'TESTING-ACCEPTANCE']);

const read = (rel) => fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
const countOf = (text, token) => text.split(token).length - 1;

test('T-H02 · NG8: AGENTS.md và CORE_GOVERNANCE_RULES.md khớp nhau trên mọi token luật mốc', () => {
  const agents = read('AGENTS.md');
  const core = read('CORE_GOVERNANCE_RULES.md');

  const diffs = [];
  for (const token of LAW_TOKENS) {
    const a = countOf(agents, token);
    const c = countOf(core, token);
    if (a !== c) diffs.push(`${token}: AGENTS.md ×${a} ≠ CORE_GOVERNANCE_RULES.md ×${c}`);
    if (a === 0) diffs.push(`${token}: VẮNG ở cả hai bản hiến pháp`);
  }
  assert.deepEqual(diffs, [], 'NG8: hai bản hiến pháp lệch nhau ⇒ hai nguồn chân lý');
});

test('T-H02b · I6: mỗi token luật mốc xuất hiện ĐÚNG MỘT LẦN trong mỗi bản hiến pháp', () => {
  for (const rel of ['AGENTS.md', 'CORE_GOVERNANCE_RULES.md']) {
    const text = read(rel);
    for (const token of LAW_TOKENS) {
      assert.equal(countOf(text, token), 1, `${rel}: token "${token}" xuất hiện ${countOf(text, token)} lần (phải là 1)`);
    }
    assert.ok(!text.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'),
      `${rel}: I6 — khối luật planning CŨ phải đã bị gỡ`);
  }
});

test('T-H02c · J: CLAUDE.md của hub là shim ≤10 dòng, chỉ trỏ @AGENTS.md, KHÔNG chứa luật', () => {
  const claude = read('CLAUDE.md');
  const lines = claude.replace(/\n+$/, () => '').split('\n');
  assert.ok(lines.length <= 10, `Luật J: CLAUDE.md ${lines.length} dòng (> 10) — không còn là shim`);
  assert.ok(claude.includes('@AGENTS.md'));
  for (const token of LAW_TOKENS) {
    assert.equal(countOf(claude, token), 0, `Luật J: CẤM chép luật "${token}" sang CLAUDE.md`);
  }
});

test('T-H02d · A8: hub tự tuân luật — AGENTS.md của hub đủ 4 token engine bắt buộc', () => {
  const agents = read('AGENTS.md');
  for (const t of ['xay-dung-nao-bo', 'Marker Phiên Bản Khung Não', 'Dual Entry-Point Invariant', 'SPEC PACKAGE']) {
    assert.ok(agents.includes(t), `hub thiếu token ${t} — engine sẽ tự vá chính hub`);
  }
  // Và engine coi AGENTS.md của hub là đã chuẩn (không sinh patch nào).
  assert.equal(engine.patchAgentsMd(agents).changed, false,
    'engine còn muốn vá AGENTS.md của hub ⇒ hub chưa tuân chính luật mình phát tán');
});
