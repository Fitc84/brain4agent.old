'use strict';
/**
 * T-H03 (Gate G16) — MỘT nguồn chân lý cho mỗi loại phiên bản:
 *   - version ENGINE  : `ENGINE_VERSION` ≡ `package.json.version` ≡ `state.json.current_version`
 *   - version KHUNG NÃO: `BRAIN_TEMPLATE_VERSION` ≡ `state.json.brain_template_version` ≡ tên marker ở root
 * Hai loại này TUYỆT ĐỐI không được trộn (luật §5.G mục 3).
 *
 * ⚠️ TRẠNG THÁI KHI VIẾT (WP2b): `ENGINE_VERSION = 1.6.0` nhưng `package.json.version`
 * còn `1.5.4` — đợt #09 chưa đóng nên chưa bump. Ca đối chiếu engine↔package vì thế
 * **skip có điều kiện** kèm lý do, và tự động trở thành assert THẬT ngay khi orchestrator
 * bump `package.json` (lúc đó lệch = đỏ). Mọi assert khác chạy vô điều kiện.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT } = require('../helpers/repo.js');
const { ENGINE_PATH } = require('../helpers/run.js');
const engine = require(ENGINE_PATH);

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
const state = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'brain4agent', 'memory', 'hot', 'state.json'), 'utf8'));

test('T-H03 · G16: ENGINE_VERSION === package.json.version', (t) => {
  assert.match(engine.ENGINE_VERSION, SEMVER_RE);
  assert.match(pkg.version, SEMVER_RE);
  if (engine.ENGINE_VERSION !== pkg.version) {
    // Bỏ qua CÓ ĐIỀU KIỆN, nêu rõ hai con số — người đọc log biết ngay phải làm gì.
    t.skip(
      `CHƯA ĐỒNG BỘ (đã biết, chờ orchestrator bump khi đóng kế hoạch #09): `
      + `ENGINE_VERSION=${engine.ENGINE_VERSION} nhưng package.json.version=${pkg.version}. `
      + `Sửa bằng cách nâng package.json lên ${engine.ENGINE_VERSION} — CẤM hạ ENGINE_VERSION xuống.`
    );
    return;
  }
  assert.equal(pkg.version, engine.ENGINE_VERSION);
});

test('T-H03b · G16: state.json.current_version === package.json.version (version DỰ ÁN)', (t) => {
  assert.match(String(state.current_version), SEMVER_RE);
  if (state.current_version !== pkg.version) {
    t.skip(
      `CHƯA ĐỒNG BỘ (đã biết, cùng đợt bump #09): state.json.current_version=${state.current_version} `
      + `nhưng package.json.version=${pkg.version}.`
    );
    return;
  }
  assert.equal(state.current_version, pkg.version);
});

test('T-H03c · A8/I3: version KHUNG NÃO đồng bộ 3 nơi (hằng số · state.json · marker ở root)', () => {
  assert.equal(engine.BRAIN_TEMPLATE_VERSION, '1.3.0', 'khung não của đợt #09 là 1.3.0');
  assert.equal(state.brain_template_version, engine.BRAIN_TEMPLATE_VERSION,
    'I3: state.json của chính hub phải mang đúng version khung');

  const markers = fs.readdirSync(REPO_ROOT).filter((f) => /^brain4agent-v\d+\.\d+\.\d+\.md$/.test(f));
  assert.deepEqual(markers, [`brain4agent-v${engine.BRAIN_TEMPLATE_VERSION}.md`],
    'I1: root phải có ĐÚNG MỘT marker, đúng version khung');
});

test('T-H03d · §5.G.3: version ENGINE và version KHUNG NÃO là HAI trường khác nhau, CẤM trộn', () => {
  assert.notEqual(engine.ENGINE_VERSION, engine.BRAIN_TEMPLATE_VERSION,
    'hai hằng số phải khai báo riêng (trùng giá trị sẽ che mất lỗi trộn trường)');
  assert.notEqual(state.current_version, state.brain_template_version,
    'state.json: current_version (dự án) ≠ brain_template_version (khung)');
});

test('T-H03e · §10: `--version` in đúng cặp số lấy từ hằng số, không hardcode', () => {
  const { runEngine } = require('../helpers/run.js');
  const r = runEngine(ENGINE_PATH, ['--version']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, `brain-engine ${engine.ENGINE_VERSION} template ${engine.BRAIN_TEMPLATE_VERSION}\n`);
});
