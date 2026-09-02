'use strict';
/**
 * diff.test.js — T-U29 (renderDiff), T-U31 (parseArgs), T-U33 (A8: render nguyên văn).
 * Hàm THUẦN, không chạm đĩa (trừ đọc golden manifest ở T-U33 — dữ liệu tham chiếu).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { mkSnapshot, engine: e, tf, NOW, V } = require('../helpers/snapshot.js');

const sha = (s) => crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex');

test('T-U29 · WP1: renderDiff in unified diff cho write, và [delete]/[mkdir]/[rename]', () => {
  const s = mkSnapshot({
    rootEntries: ['AGENTS.md', 'CLAUDE.md', 'brain4agent', 'brain4agent-v1.2.0.md'],
    dirs: { docs: false },
    files: { claudeMd: tf('# CLAUDE.md\n\nghi chú riêng\n') }
  });
  const plan = e.computePlan(s, V, NOW);
  const out = e.renderDiff(plan, s);

  assert.ok(out.startsWith('=== DRY-RUN: '));
  assert.ok(out.includes('[mkdir]  docs/'));
  assert.ok(out.includes('[delete] brain4agent-v1.2.0.md'), 'op delete phải hiện trong dry-run');
  assert.ok(out.includes(`[write]  brain4agent-v${V}.md  (mới,`), 'file MỚI chỉ in số dòng, không đổ nguyên nội dung');
  assert.ok(out.includes('--- a/CLAUDE.md'));
  assert.ok(out.includes('+++ b/CLAUDE.md'));
  assert.ok(/@@ -\d+,\d+ \+\d+,\d+ @@/.test(out), 'phải có hunk header hợp lệ');
  assert.ok(out.includes('+@AGENTS.md'), 'dòng thêm phải mang tiền tố +');
  // Không có thay đổi ⇒ không có op nào để in.
  assert.equal(e.renderDiff({ ops: [] }, s), '=== DRY-RUN: 0 thao tác sẽ thực hiện (không ghi) ===\n');
});

test('T-U31 · §3: parseArgs — 3 dạng dùng sai đều có errors, --version/--help ưu tiên', () => {
  assert.deepEqual(e.parseArgs(['--check', '--dry-run']).errors.length, 1);
  assert.equal(e.parseArgs(['--bogus']).errors.length, 1);
  assert.equal(e.parseArgs(['a', 'b']).errors.length, 1);

  assert.equal(e.parseArgs(['--version']).mode, 'version');
  assert.equal(e.parseArgs(['--help']).mode, 'help');
  assert.equal(e.parseArgs(['--help', '--version']).mode, 'help', '--help thắng --version');
  assert.equal(e.parseArgs(['--check']).mode, 'check');
  assert.equal(e.parseArgs(['--dry-run']).mode, 'dry-run');
  assert.equal(e.parseArgs([]).mode, 'write');
  assert.deepEqual(e.parseArgs([]).errors, []);

  // rootDir luôn được resolve về đường dẫn tuyệt đối (hợp đồng §3).
  assert.equal(path.isAbsolute(e.parseArgs(['.']).rootDir), true);
});

test('T-U33 · A8: 12 hàm render sinh NGUYÊN VĂN đúng nội dung đã chụp trong golden', () => {
  // Neo vào golden manifest thay vì hardcode 12 sha256 trong test: một nguồn chân lý,
  // và nếu ai sửa template thì cả golden lẫn test này cùng đỏ (không lệch nhau).
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'golden', 'manifest.json'), 'utf8'));
  const g = manifest.cases['F01-blank'].files;
  assert.ok(g, 'golden phải có ca F01-blank (repo rỗng ⇒ mọi file đều do render sinh ra)');

  assert.equal(sha(e.renderFullAgentsMd()), g['AGENTS.md'], 'renderFullAgentsMd lệch golden');
  assert.equal(sha(e.renderClaudeShim()), g['CLAUDE.md'], 'renderClaudeShim lệch golden');
  assert.equal(sha(e.renderMarker(V, NOW)), g[`brain4agent-v${V}.md`], 'renderMarker lệch golden');
  assert.equal(sha(e.renderInitialState(V, NOW)), g['brain4agent/memory/hot/state.json'], 'renderInitialState lệch golden');
  assert.equal(sha(e.renderTodayMd(NOW)), g['brain4agent/memory/hot/today.md'], 'renderTodayMd lệch golden');

  const templates = e.renderTemplates(V, NOW);
  assert.deepEqual(Object.keys(templates).sort(), e.REQUIRED_FILES.slice().sort(), 'phải đúng 7 phân vùng');
  for (const name of e.REQUIRED_FILES) {
    assert.equal(sha(templates[name]), g['brain4agent/' + name], `template ${name} lệch golden`);
  }
});

test('T-U33b · A8/I2: mọi văn bản do engine sinh đều LF và kết thúc bằng newline', () => {
  const produced = Object.assign(
    { 'AGENTS.md': e.renderFullAgentsMd(), 'CLAUDE.md': e.renderClaudeShim(), marker: e.renderMarker(V, NOW), 'state.json': e.renderInitialState(V, NOW), 'today.md': e.renderTodayMd(NOW) },
    e.renderTemplates(V, NOW)
  );
  for (const [name, text] of Object.entries(produced)) {
    assert.ok(!text.includes('\r'), `${name}: file MỚI do engine sinh CẤM chứa CR`);
    assert.ok(text.endsWith('\n'), `${name}: phải kết thúc bằng newline`);
    assert.ok(text.charCodeAt(0) !== 0xfeff, `${name}: CẤM BOM`);
  }
});
