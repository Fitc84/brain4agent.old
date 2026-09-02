'use strict';
/**
 * Dựng KHO GIẢ cho test của brain-doctor — hoàn toàn trong thư mục tạm.
 *
 * Vì sao sinh bằng mã thay vì commit vào `tests/fixtures/`:
 *   - Kho giả cần các biến thể mà git KHÔNG lưu được nguyên trạng: `.git` là thư mục
 *     thật, `.git` là FILE liên kết worktree, file UTF-16, file không có newline cuối.
 *   - Repo "chuẩn" phải chuẩn theo ĐÚNG engine đi kèm, nên nó được sinh bằng chính
 *     engine (chế độ ghi) — golden không bao giờ lệch khi engine đổi template.
 *
 * Mọi tên repo là tên chung chung (A9: CẤM nhắc tên kho vệ tinh thật).
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const engine = require('../../.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js');

const NOW = new Date('2026-01-15T03:04:05.000Z');
const VIET_NAME = 'Tên có dấu cách và tiếng Việt';

function hasGit() {
  const r = spawnSync('git', ['--version'], { encoding: 'utf8', windowsHide: true });
  return !r.error && r.status === 0;
}

function git(cwd, args) {
  const r = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true,
    env: Object.assign({}, process.env, {
      GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@e',
      GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@e',
      GIT_CONFIG_GLOBAL: path.join(os.tmpdir(), 'brain-doctor-no-such-gitconfig'),
      GIT_CONFIG_SYSTEM: path.join(os.tmpdir(), 'brain-doctor-no-such-gitconfig')
    })
  });
  if (r.error) throw r.error;
  return r;
}

/** Repo git thật, một commit rỗng => `.git` là THƯ MỤC, HEAD = ok. */
function gitInitCommitted(dir) {
  git(dir, ['init', '-q', '-b', 'main']);
  git(dir, ['commit', '-q', '--allow-empty', '-m', 'seed']);
}

/** Repo git thật nhưng CHƯA có commit nào => HEAD chưa sinh (unborn). */
function gitInitOnly(dir) {
  git(dir, ['init', '-q', '-b', 'main']);
}

/** Thư mục `.git` giả (không cần nhị phân git) — chỉ để doctor thấy kind='dir'. */
function fakeGitDir(dir) {
  fs.mkdirSync(path.join(dir, '.git'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.git', 'HEAD'), 'ref: refs/heads/main\n');
}

/** Não CHUẨN theo đúng engine đi kèm. */
function makeStandard(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const r = engine.runBrainEngine({ rootDir: dir, mode: 'write', now: NOW, logger: () => {}, errorLogger: () => {} });
  if (r.exitCode !== 0) throw new Error('[make-fleet] engine khong dung duoc repo chuan: exit ' + r.exitCode);
  return dir;
}

function writeUtf16le(file, text) {
  fs.writeFileSync(file, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')]));
}

function writeUtf8Bom(file, text) {
  fs.writeFileSync(file, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, 'utf8')]));
}

function readJson(file) {
  return JSON.parse(engine.readText(file).text);
}

/**
 * buildFleet({ withGit }) → { base, fleet, cleanup(), expected }
 * `expected` = map tên repo → { status, codes[] } dùng cho khẳng định của test.
 */
function buildFleet(opts) {
  const withGit = !!(opts && opts.withGit) && hasGit();
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-fleet-'));
  const fleet = path.join(base, 'fleet');
  fs.mkdirSync(fleet);
  const R = (name) => path.join(fleet, name);
  const seedGit = withGit ? gitInitCommitted : fakeGitDir;

  // 1. Thư mục ẩn (bẫy E.1) — vẫn phải được liệt kê.
  makeStandard(R('.hidden-repo'));
  seedGit(R('.hidden-repo'));

  // 2. Không phải repo — không .git, không AGENTS.md, không brain4agent/.
  fs.mkdirSync(R('not-a-repo'));
  fs.writeFileSync(path.join(R('not-a-repo'), 'README.md'), '# chi la thu muc\n');

  // 3. Repo chuẩn.
  makeStandard(R('repo-alpha'));
  seedGit(R('repo-alpha'));

  // 4. Kẹt phiên bản cũ: marker lệch + state lệch + thiếu 0x0A cuối.
  makeStandard(R('repo-bravo'));
  seedGit(R('repo-bravo'));
  fs.rmSync(path.join(R('repo-bravo'), 'brain4agent-v' + engine.BRAIN_TEMPLATE_VERSION + '.md'));
  fs.writeFileSync(path.join(R('repo-bravo'), 'brain4agent-v1.2.1.md'), '# marker cu\n');
  const bravoState = path.join(R('repo-bravo'), 'brain4agent', 'memory', 'hot', 'state.json');
  const bs = readJson(bravoState);
  bs.brain_template_version = '1.2.0';
  fs.writeFileSync(bravoState, JSON.stringify(bs, null, 2)); // CỐ Ý không newline cuối

  // 5. Chưa não hoá: thiếu tệp luật + còn ký ức cũ ở root.
  fs.mkdirSync(R('repo-charlie'));
  seedGit(R('repo-charlie'));
  fs.writeFileSync(path.join(R('repo-charlie'), 'brain4agent-v' + engine.BRAIN_TEMPLATE_VERSION + '.md'), '# marker\n');
  fs.writeFileSync(path.join(R('repo-charlie'), 'latest_memory.md'), 'ky uc cu\n');

  // 6. Repo lồng repo ở cấp 1.
  makeStandard(R('repo-delta'));
  seedGit(R('repo-delta'));
  fs.mkdirSync(path.join(R('repo-delta'), 'sub-module'));
  fakeGitDir(path.join(R('repo-delta'), 'sub-module'));

  // 7. `.git` là FILE (bẫy E.2) — liên kết gitdir kiểu worktree/submodule.
  makeStandard(R('repo-echo'));
  const echoGitDir = path.join(base, 'echo-gitdir');
  if (withGit) {
    gitInitCommitted(R('repo-echo'));
    fs.renameSync(path.join(R('repo-echo'), '.git'), echoGitDir);
  } else {
    fs.mkdirSync(echoGitDir, { recursive: true });
    fs.writeFileSync(path.join(echoGitDir, 'HEAD'), 'ref: refs/heads/main\n');
  }
  // Đường dẫn TƯƠNG ĐỐI so với thư mục chứa file `.git` (A9: không nhúng đường dẫn tuyệt đối).
  fs.writeFileSync(path.join(R('repo-echo'), '.git'), 'gitdir: ../../echo-gitdir\n');

  // 8. CLAUDE.md phình quá shim — CRLF và KHÔNG newline cuối (bẫy E.4).
  makeStandard(R('repo-foxtrot'));
  seedGit(R('repo-foxtrot'));
  const foxLines = ['# CLAUDE.md', '', '@AGENTS.md', ''];
  for (let i = 1; i <= 8; i++) foxLines.push('dong phu ' + i);
  fs.writeFileSync(path.join(R('repo-foxtrot'), 'CLAUDE.md'), foxLines.join('\r\n'));

  // 9. Mã hoá sai: state.json có BOM, today.md là UTF-16LE (bẫy E.3).
  makeStandard(R('repo-golf'));
  seedGit(R('repo-golf'));
  const golfHot = path.join(R('repo-golf'), 'brain4agent', 'memory', 'hot');
  writeUtf8Bom(path.join(golfHot, 'state.json'), JSON.stringify(readJson(path.join(golfHot, 'state.json')), null, 2) + '\n');
  writeUtf16le(path.join(golfHot, 'today.md'), '# nhat ky phien\n');

  // 10. Tên có dấu cách và tiếng Việt có dấu (bẫy E.6).
  makeStandard(R(VIET_NAME));
  seedGit(R(VIET_NAME));

  const expected = {
    '.hidden-repo': { status: 'CLEAN', codes: [] },
    'not-a-repo': { status: 'SKIPPED', codes: [] },
    'repo-alpha': { status: 'CLEAN', codes: [] },
    'repo-bravo': { status: 'ERROR', codes: ['BRN-006', 'BRN-007', 'BRN-010', 'BRN-011'] },
    'repo-charlie': { status: 'BLOCKER', codes: ['BRN-001', 'BRN-004', 'BRN-008', 'BRN-009', 'BRN-012'] },
    'repo-delta': { status: 'WARNING', codes: ['BRN-014'] },
    'repo-echo': { status: 'WARNING', codes: ['BRN-015'] },
    'repo-foxtrot': { status: 'WARNING', codes: ['BRN-005'] },
    'repo-golf': { status: 'WARNING', codes: ['BRN-013'] },
    [VIET_NAME]: { status: 'CLEAN', codes: [] }
  };

  return {
    base,
    fleet,
    withGit,
    expected,
    cleanup() { fs.rmSync(base, { recursive: true, force: true, maxRetries: 5 }); }
  };
}

/** Kho một repo duy nhất — dùng cho các ca mã thoát 0/1. */
function buildSingle(kind) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-one-'));
  const fleet = path.join(base, 'fleet');
  fs.mkdirSync(fleet);
  const dir = path.join(fleet, 'repo-solo');
  makeStandard(dir);
  fakeGitDir(dir);
  if (kind === 'warning') {
    fs.mkdirSync(path.join(dir, 'sub-module'));
    fakeGitDir(path.join(dir, 'sub-module'));
  }
  return { base, fleet, dir, cleanup() { fs.rmSync(base, { recursive: true, force: true, maxRetries: 5 }); } };
}

module.exports = {
  buildFleet, buildSingle, makeStandard, hasGit, git,
  gitInitCommitted, gitInitOnly, fakeGitDir, writeUtf16le, writeUtf8Bom, VIET_NAME, NOW
};
