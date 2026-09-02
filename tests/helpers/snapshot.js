'use strict';
/**
 * snapshot.js — dựng đối tượng `Snapshot` (01-CONTRACTS §2.1) HOÀN TOÀN TRONG BỘ NHỚ.
 *
 * Lý do tồn tại: `diagnose()` / `computePlan()` là hàm THUẦN — hợp đồng nói rõ chúng
 * không được chạm `fs`. Muốn kiểm đúng tính thuần đó thì đầu vào cũng phải dựng bằng
 * tay, không đi qua `collectSnapshot()` (vốn đọc đĩa). Nhờ vậy các ca biên (marker lệch
 * state, CLAUDE.md 11 dòng, token lặp ×3...) không cần thêm fixture trên đĩa.
 *
 * CẤM dùng helper này cho test hộp đen — hộp đen phải chạy tiến trình thật.
 */
const { ENGINE_PATH } = require('./run.js');
const engine = require(ENGINE_PATH);

const V = engine.BRAIN_TEMPLATE_VERSION;
const NOW = new Date('2026-01-15T03:04:05.000Z');

/** tf(text, opts) → TextFile (01-CONTRACTS §1.2). */
function tf(text, opts) {
  const o = opts || {};
  return {
    text,
    eol: o.eol || 'lf',
    hadBom: !!o.hadBom,
    bytes: Buffer.byteLength(text, 'utf8'),
    encoding: o.hadBom ? 'utf8-bom' : 'utf8'
  };
}

/**
 * mkSnapshot(overrides) → Snapshot của một repo ĐÃ CHUẨN (không finding nào).
 * `overrides` được merge NÔNG theo từng nhánh (dirs / files / present / rootEntries)
 * để mỗi ca test chỉ phải nêu đúng cái nó làm lệch.
 */
function mkSnapshot(overrides) {
  const o = overrides || {};
  const templates = engine.renderTemplates(V, NOW);

  const brain = {};
  const present = {};
  for (const name of engine.REQUIRED_FILES) {
    brain[name] = tf(templates[name]);
    present['brain4agent/' + name] = true;
  }

  const files = {
    agentsMd: tf(engine.renderFullAgentsMd()),
    claudeMd: tf(engine.renderClaudeShim()),
    stateJson: tf(engine.renderInitialState(V, NOW)),
    todayMd: tf(engine.renderTodayMd(NOW)),
    legacyLatest: null,
    brain
  };
  files.distill = brain['memory-distill.txt'];

  present['AGENTS.md'] = true;
  present['CLAUDE.md'] = true;
  present['latest_memory.md'] = false;
  present['brain4agent/memory/hot/state.json'] = true;
  present['brain4agent/memory/hot/today.md'] = true;

  const snap = {
    rootLabel: 'du-an-mau',
    rootEntries: ['.agents', 'AGENTS.md', 'CLAUDE.md', 'brain4agent', `brain4agent-v${V}.md`, 'docs', 'planning'],
    dirs: { brain: true, memory: true, hot: true, archive: true, planning: true, agents: true, skills: true, docs: true },
    files,
    present,
    fileErrors: [],
    // Ký ức lạnh: repo chuẩn có thư mục archive/ rỗng. `null` = thư mục chưa tồn tại (TQ6: KHÔNG báo).
    archiveEntries: []
  };

  if (o.rootEntries) snap.rootEntries = o.rootEntries;
  if (o.rootLabel) snap.rootLabel = o.rootLabel;
  if (o.fileErrors) snap.fileErrors = o.fileErrors;
  if (o.archiveEntries !== undefined) snap.archiveEntries = o.archiveEntries;
  if (o.dirs) Object.assign(snap.dirs, o.dirs);
  if (o.present) Object.assign(snap.present, o.present);
  if (o.files) {
    if (o.files.brain) Object.assign(snap.files.brain, o.files.brain);
    for (const k of Object.keys(o.files)) if (k !== 'brain') snap.files[k] = o.files[k];
    // distill là ALIAS của brain['memory-distill.txt'] (engine dòng ~684) — giữ đồng bộ.
    if (!Object.prototype.hasOwnProperty.call(o.files, 'distill')) {
      snap.files.distill = snap.files.brain['memory-distill.txt'];
    }
  }
  return snap;
}

/** Tập mã finding (đã sort, loại trùng) — dạng so sánh gọn trong assert. */
function codesOf(diagnosis) {
  return Array.from(new Set(diagnosis.findings.map((f) => f.code))).sort();
}

/** Tất cả finding mang một mã. */
function findingsOf(diagnosis, code) {
  return diagnosis.findings.filter((f) => f.code === code);
}

module.exports = { engine, mkSnapshot, tf, codesOf, findingsOf, NOW, V };
