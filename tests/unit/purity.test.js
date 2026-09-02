'use strict';
/**
 * purity.test.js — T-U34. Bất biến kiến trúc **A3**: lớp hàm THUẦN của engine
 * (01-CONTRACTS §2.2) KHÔNG được chạm `fs`, `Date`, `console`, `process`.
 *
 * Cách kiểm: bẻ gãy `fs` (mọi API ném) rồi gọi lại toàn bộ hàm thuần. Hàm nào lén
 * đọc/ghi đĩa sẽ ném ngay. Đây là điều kiện tiên quyết để engine test được (D2).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { mock } = require('node:test');

const { mkSnapshot, engine: e, NOW, V } = require('../helpers/snapshot.js');

const FS_APIS = [
  'readFileSync', 'writeFileSync', 'existsSync', 'mkdirSync', 'readdirSync',
  'renameSync', 'unlinkSync', 'statSync', 'rmSync', 'copyFileSync'
];

test('T-U34 · A3: 12+ hàm thuần vẫn chạy đúng khi MỌI API của fs đều ném', () => {
  const s = mkSnapshot();
  const agents = e.renderFullAgentsMd();

  for (const api of FS_APIS) {
    if (typeof fs[api] === 'function') {
      mock.method(fs, api, () => { throw new Error(`A3 VI PHẠM: hàm thuần đã gọi fs.${api}`); });
    }
  }
  try {
    // Lớp văn bản
    assert.equal(e.stripBom('abc'), 'abc');
    assert.equal(e.detectEol('a\r\nb'), 'crlf');
    assert.equal(e.normalizeEol('a\r\nb'), 'a\nb');
    assert.equal(e.restoreEol('a\nb', 'crlf'), 'a\r\nb');
    assert.equal(e.detectEncoding(Buffer.from('abc')), 'utf8');
    assert.equal(e.hasUtf8Bom(Buffer.from('abc')), false);

    // Lớp render
    assert.ok(e.renderFullAgentsMd().length > 0);
    assert.ok(e.renderClaudeShim().includes('@AGENTS.md'));
    assert.ok(e.renderMarker(V, NOW).length > 0);
    assert.ok(e.renderTodayMd(NOW).length > 0);
    assert.ok(JSON.parse(e.renderInitialState(V, NOW)).brain_template_version === V);
    assert.equal(Object.keys(e.renderTemplates(V, NOW)).length, 7);

    // Lớp vá
    assert.equal(e.patchAgentsMd(agents, V).changed, false);
    assert.equal(e.patchClaudeMd(e.renderClaudeShim()).changed, false);
    assert.equal(e.patchDistill('<agent_startup_protocol>\nxay-dung-nao-bo\n').changed, false);
    assert.equal(e.patchStateJson(e.renderInitialState(V, NOW), V).changed, false);

    // Lớp chẩn đoán / kế hoạch
    const d = e.diagnose(s, V);
    assert.deepEqual(d.findings, []);
    assert.equal(typeof e.formatFindings({ findings: [] }), 'string');
    const plan = e.computePlan(s, V, NOW);
    assert.deepEqual(plan.ops.filter((op) => op.op !== 'log'), []);
    assert.ok(e.renderDiff(plan, s).startsWith('=== DRY-RUN:'));
    assert.deepEqual(e.planMarkerOps([`brain4agent-v${V}.md`], V), { stale: [], create: false });
    assert.deepEqual(e.planCaseRenames(['DOCS']), [{ from: 'DOCS', to: 'docs', via: 'temp_docs' }]);
  } finally {
    mock.restoreAll();
  }
});

test('T-U34b · A3: computePlan không phụ thuộc đồng hồ máy — cùng `now` ⇒ cùng kết quả', () => {
  // Repo rỗng hoàn toàn ⇒ mọi file đều do render sinh (marker/state.json/today.md có `now`).
  const blankPresent = {};
  for (const k of ['AGENTS.md', 'CLAUDE.md', 'latest_memory.md', 'brain4agent/memory/hot/state.json', 'brain4agent/memory/hot/today.md']) blankPresent[k] = false;
  for (const f of e.REQUIRED_FILES) blankPresent['brain4agent/' + f] = false;
  const s = mkSnapshot({
    rootEntries: [],
    dirs: { brain: false, memory: false, hot: false, planning: false, agents: false, skills: false, docs: false },
    present: blankPresent,
    files: { agentsMd: null, claudeMd: null, stateJson: null, todayMd: null, legacyLatest: null, distill: null }
  });
  const a = e.computePlan(s, V, new Date('2026-01-15T03:04:05.000Z'));
  const b = e.computePlan(s, V, new Date('2026-01-15T03:04:05.000Z'));
  assert.deepEqual(JSON.stringify(a.ops), JSON.stringify(b.ops));

  // Và ngược lại: đổi `now` PHẢI đổi nội dung (chứng minh `now` thật sự được dùng,
  // không phải engine lén gọi new Date() bên trong).
  const c = e.computePlan(s, V, new Date('2027-06-30T10:11:12.000Z'));
  assert.notEqual(JSON.stringify(a.ops), JSON.stringify(c.ops));
});
