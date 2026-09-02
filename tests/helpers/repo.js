'use strict';
// Tiện ích chung cho test vệ sinh (tests/hygiene/): định vị root repo và hỏi `git`.
// Không mock git — vệ sinh phải đo trên INDEX THẬT của repo.
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');

/** git(args) → { code, stdout } ; trả code≠0 nếu máy không có git (bên gọi tự quyết). */
function git(args) {
  const r = spawnSync('git', ['-C', REPO_ROOT, ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  if (r.error) return { code: 127, stdout: '', stderr: String(r.error.message) };
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/** Danh sách file được git THEO DÕI (đường dẫn POSIX, tương đối root repo). */
function trackedFiles() {
  const r = git(['ls-files', '-z']);
  if (r.code !== 0) throw new Error('[hygiene] Khong chay duoc `git ls-files`: ' + r.stderr);
  return r.stdout.split('\0').filter(Boolean);
}

const hasGit = () => git(['rev-parse', '--git-dir']).code === 0;

module.exports = { REPO_ROOT, git, trackedFiles, hasGit };
