'use strict';
// Chạy công cụ dưới dạng TIẾN TRÌNH THẬT (hộp đen). Luôn dùng process.execPath +
// mảng đối số (không shell:true) để không gãy với đường dẫn có dấu cách / tiếng Việt.
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const BRAIN_NOW = '2026-01-15T03:04:05.000Z';
const FAKE_DATE = path.join(__dirname, 'fake-date.js');
const DEFAULT_ENGINE_PATH = path.join(
  __dirname, '..', '..', '.agents', 'skills', '.xay-dung-nao-bo', 'scripts', 'init_brain.js'
);

// BRAIN_ENGINE: trỏ bộ test sang MỘT BẢN COPY khác của engine. Dùng để chứng minh test
// "có răng" — chạy nguyên bộ test lên bản engine đã hoàn tác bản sửa (đặt ở thư mục tạm)
// và xem nó ĐỎ. CẤM đặt biến này trong CI hay trong npm script.
const ENGINE_PATH = process.env.BRAIN_ENGINE
  ? path.resolve(process.env.BRAIN_ENGINE)
  : DEFAULT_ENGINE_PATH;
const DOCTOR_PATH = path.join(path.dirname(ENGINE_PATH), 'brain_doctor.js');

function baseEnv(extra) {
  return Object.assign({}, process.env, {
    BRAIN_NOW,
    // TZ cố định: engine dùng toLocaleDateString() cho today.md — không ghim TZ thì
    // golden sẽ lệch giữa các máy khác múi giờ.
    TZ: 'UTC',
    LANG: 'C.UTF-8'
  }, extra || {});
}

/** runEngine(enginePath, args, { cwd, env }) → { code, stdout, stderr } */
function runEngine(enginePath, args = [], opts = {}) {
  const r = spawnSync(
    process.execPath,
    ['-r', FAKE_DATE, enginePath, ...args],
    { cwd: opts.cwd, encoding: 'utf8', env: baseEnv(opts.env), maxBuffer: 32 * 1024 * 1024 }
  );
  if (r.error) throw r.error;
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/** runDoctor(args, opts) — như runEngine nhưng trỏ sẵn vào brain_doctor.js (WP4). */
function runDoctor(args = [], opts = {}) {
  return runEngine(DOCTOR_PATH, args, opts);
}

/** runPwsh(scriptArgs, opts) → như trên; trả null nếu máy không có `pwsh`. */
function runPwsh(scriptArgs = [], opts = {}) {
  const probe = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', '$PSVersionTable.PSVersion.Major'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) return null;
  const r = spawnSync(
    'pwsh',
    ['-NoProfile', '-NonInteractive', '-File', ...scriptArgs],
    { cwd: opts.cwd, encoding: 'utf8', env: baseEnv(opts.env), maxBuffer: 32 * 1024 * 1024 }
  );
  if (r.error) throw r.error;
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

module.exports = { runEngine, runDoctor, runPwsh, BRAIN_NOW, ENGINE_PATH, DEFAULT_ENGINE_PATH, DOCTOR_PATH, FAKE_DATE };
