'use strict';
/**
 * plan.test.js — T-U19..T-U21, T-U32. Hàm THUẦN lập kế hoạch, KHÔNG chạm đĩa.
 * Bảo vệ I1 (đúng MỘT marker), D7(b) (đếm chứ không hỏi có/không), §2.3 (thứ tự ops).
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { mkSnapshot, engine: e, tf, NOW, V } = require('../helpers/snapshot.js');

const realOps = (plan) => plan.ops.filter((op) => op.op !== 'log');

/**
 * Dựng một `AGENTS.md` ở trạng thái **S1** từ chính bảng `RULE_BLOCKS`: các thân luật
 * 1.3.0 nguyên văn (`legacy`), 0 mốc. Lỗ SemVer của `root-marker` điền `1.3.0`.
 * Đây là hình dạng thật của 49/65 repo vệ tinh (SPEC-P02 §2) và là hình dạng của F09.
 */
function legacyAgentsS1() {
  const bodies = e.RULE_BLOCKS
    .filter((b) => b.legacy.length > 0)
    .map((b) => (Array.isArray(b.legacy[0]) ? b.legacy[0].join('1.3.0') : b.legacy[0]));
  return '# AGENTS.md — dự án mẫu (khung não 1.3.0, chưa bọc mốc)\n\n' + bodies.join('\n\n') + '\n';
}

test('T-U19 · I1/D7(b): planMarkerOps ĐẾM marker — marker lỗi thời vào stale, không tạo thêm', () => {
  const r = e.planMarkerOps(['brain4agent-v1.2.0.md', `brain4agent-v${V}.md`, 'x.md'], V);
  assert.deepEqual(r.stale, ['brain4agent-v1.2.0.md']);
  assert.equal(r.create, false);

  // Hai marker CÙNG lỗi thời: cả hai phải bị gỡ, marker đúng phải được tạo.
  const r2 = e.planMarkerOps(['brain4agent-v1.1.0.md', 'brain4agent-v1.2.0.md'], V);
  assert.deepEqual(r2.stale, ['brain4agent-v1.1.0.md', 'brain4agent-v1.2.0.md']);
  assert.equal(r2.create, true);
});

test('T-U20 · I1: không có marker nào ⇒ stale rỗng, create=true', () => {
  const r = e.planMarkerOps(['README.md', 'package.json'], V);
  assert.deepEqual(r.stale, []);
  assert.equal(r.create, true);

  // Tên gần giống nhưng KHÔNG khớp regex thì không được coi là marker.
  const r2 = e.planMarkerOps(['brain4agent-v1.md', 'brain4agent-v1.2.0.md.bak', 'brain4agent-vx.y.z.md'], V);
  assert.deepEqual(r2.stale, []);
  assert.equal(r2.create, true);
});

test('T-U21: planCaseRenames đổi DOCS/Plan qua tên trung gian; đã có tên thường ⇒ 0 rename', () => {
  assert.deepEqual(e.planCaseRenames(['DOCS', 'Plan']), [
    { from: 'DOCS', to: 'docs', via: 'temp_docs' },
    { from: 'Plan', to: 'planning', via: 'temp_plan' }
  ]);
  // NTFS không phân biệt hoa/thường ⇒ BẮT BUỘC đi qua tên trung gian.
  assert.deepEqual(e.planCaseRenames(['DOCS', 'docs']), []);
  assert.deepEqual(e.planCaseRenames(['Plan', 'planning']), []);
  assert.deepEqual(e.planCaseRenames([]), []);
});

test('T-U32 · §2.3: computePlan giữ ĐÚNG thứ tự ops (rename → mkdir → migrate → … → CLAUDE)', () => {
  // Repo lệch mọi thứ cùng lúc: DOCS/Plan viết hoa, còn latest_memory.md, marker cũ,
  // state.json version cũ, AGENTS.md/CLAUDE.md thiếu luật.
  const s = mkSnapshot({
    rootEntries: ['AGENTS.md', 'CLAUDE.md', 'DOCS', 'Plan', 'brain4agent', 'brain4agent-v1.2.0.md', 'latest_memory.md'],
    dirs: { docs: false, planning: false, agents: false, skills: false },
    present: { 'latest_memory.md': true, 'brain4agent/memory/hot/today.md': false },
    files: {
      legacyLatest: tf('# Ký ức phiên cũ\n'),
      todayMd: null,
      stateJson: tf(JSON.stringify({ current_version: '9.9.9', brain_template_version: '1.2.0' }, null, 2) + '\n'),
      claudeMd: tf('# CLAUDE.md\n\nghi chú riêng\n'),
      // AGENTS.md ở trạng thái S1 (SPEC-P02 §3): thân luật 1.3.0 NGUYÊN VĂN, chưa mốc
      // nào ⇒ chắc chắn sinh op ghi ở bước 8. CẤM dựng input bằng cách cắt đôi văn bản
      // đã bọc mốc: cắt giữa cặp mốc là H1 (fail-closed) ⇒ engine đúng ra KHÔNG ghi gì.
      agentsMd: tf(legacyAgentsS1())
    }
  });

  const plan = e.computePlan(s, V, NOW);
  const ops = realOps(plan);
  const key = ops.map((op) => op.op + ':' + (op.rel || op.from));

  const idx = (k) => key.indexOf(k);
  assert.ok(idx('rename:DOCS') === 0, 'rename phải đứng ĐẦU (bước 1)');
  assert.ok(idx('rename:Plan') === 1);
  assert.ok(idx('mkdir:.agents') > idx('rename:Plan'), 'mkdir sau rename (bước 2)');
  assert.ok(idx('write:brain4agent/memory/hot/today.md') > idx('mkdir:.agents/skills'), 'di trú sau mkdir (bước 3)');
  assert.ok(idx('delete:latest_memory.md') > idx('write:brain4agent/memory/hot/today.md'), 'xoá legacy sau khi đã ghi today.md');
  assert.ok(idx('write:brain4agent/memory/hot/state.json') > idx('delete:latest_memory.md'), 'state.json (bước 5)');
  assert.ok(idx('delete:brain4agent-v1.2.0.md') > idx('write:brain4agent/memory/hot/state.json'), 'marker (bước 6)');
  assert.ok(idx(`write:brain4agent-v${V}.md`) > idx('delete:brain4agent-v1.2.0.md'), 'xoá marker cũ TRƯỚC khi tạo marker mới');
  assert.ok(idx('write:AGENTS.md') > idx(`write:brain4agent-v${V}.md`), 'AGENTS.md (bước 8)');
  assert.ok(idx('write:CLAUDE.md') > idx('write:AGENTS.md'), 'CLAUDE.md phải là bước CUỐI (bước 9)');

  // I8: today.md nhận nội dung của latest_memory.md, không phải template rỗng.
  const today = ops.find((op) => op.rel === 'brain4agent/memory/hot/today.md');
  assert.equal(today.text, '# Ký ức phiên cũ\n');
  assert.equal(today.create, true);
  // I2: state.json luôn ghi LF bất kể EOL gốc.
  assert.equal(ops.find((op) => op.rel === 'brain4agent/memory/hot/state.json').eol, 'lf');
});

test('T-U32b · I10: repo đã chuẩn ⇒ computePlan không sinh op ghi/xoá nào', () => {
  const plan = e.computePlan(mkSnapshot(), V, NOW);
  assert.deepEqual(realOps(plan), [], 'I10: repo chuẩn phải cho plan RỖNG (chỉ còn op log)');
  assert.equal(plan.stateJsonError, null);
});

test('T-U32c · I7: phân vùng đã có nội dung riêng KHÔNG bị template ghi đè', () => {
  const s = mkSnapshot({
    files: { brain: { 'roadmap.md': tf('# Roadmap riêng của dự án\n\n- việc A\n') } }
  });
  const ops = realOps(e.computePlan(s, V, NOW));
  assert.equal(ops.filter((op) => op.rel === 'brain4agent/roadmap.md').length, 0,
    'I7: file đã tồn tại thì engine CẤM ghi đè bằng template');
});
