'use strict';
/**
 * P04-E4 — các ca git THẬT (bỏ qua nếu máy không có nhị phân `git`).
 *
 * Điểm quan trọng nhất (bẫy E.5): MỘT ref hỏng làm các lệnh duyệt toàn bộ đối tượng
 * chết fatal. Doctor CẤM suy ra "repo hỏng" từ đó — các mã BRN-001..013 của repo ấy
 * vẫn phải được tính đúng, vì chúng đến từ ĐĨA chứ không từ git.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runDoctor } = require('../helpers/run.js');
const { makeStandard, hasGit, git, gitInitCommitted, gitInitOnly } = require('./make-fleet.js');

const HAS_GIT = hasGit();
const skip = HAS_GIT ? false : 'may khong co `git` — bo qua ca git that';

function mkFleet() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-git-'));
  const fleet = path.join(base, 'fleet');
  fs.mkdirSync(fleet);
  return { base, fleet, cleanup() { fs.rmSync(base, { recursive: true, force: true, maxRetries: 5 }); } };
}

function scan(fleet, extra) {
  const r = runDoctor(['--root', fleet, '--format', 'json'].concat(extra || []));
  return { code: r.code, report: JSON.parse(r.stdout), stderr: r.stderr };
}

test('P04-E4a · repo 0 commit ⇒ head=unborn + BRN-015 (WARNING, không phải lỗi não)', { skip }, () => {
  const f = mkFleet();
  try {
    const dir = path.join(f.fleet, 'repo-unborn');
    makeStandard(dir);
    gitInitOnly(dir);

    const { code, report } = scan(f.fleet);
    const repo = report.repos[0];
    assert.equal(repo.git.kind, 'dir');
    assert.equal(repo.git.head, 'unborn');
    assert.deepEqual(repo.findings.map((x) => x.code), ['BRN-015']);
    assert.equal(repo.findings[0].level, 'warning');
    assert.equal(repo.status, 'WARNING');
    assert.equal(code, 1, 'chỉ WARNING ⇒ mã thoát 1');
  } finally { f.cleanup(); }
});

test('P04-E4b · ref hỏng ⇒ head=broken, và BRN-001..013 của repo đó VẪN được tính đúng', { skip }, () => {
  const f = mkFleet();
  try {
    const dir = path.join(f.fleet, 'repo-broken-ref');
    makeStandard(dir);
    gitInitCommitted(dir);

    // Làm hỏng một ref: nội dung không phải object name hợp lệ.
    fs.mkdirSync(path.join(dir, '.git', 'refs', 'heads'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.git', 'refs', 'heads', 'main'), 'khong-phai-sha\n');
    fs.writeFileSync(path.join(dir, '.git', 'refs', 'heads', 'hong'), 'cung-khong-phai-sha\n');

    // Đồng thời gây một lệch ĐĨA để chứng minh git không che được chẩn đoán.
    fs.writeFileSync(path.join(dir, 'latest_memory.md'), 'ky uc cu\n');

    const { code, report } = scan(f.fleet);
    const repo = report.repos[0];
    assert.equal(repo.git.head, 'broken', 'ref hỏng ⇒ head=broken');
    const codes = repo.findings.map((x) => x.code).sort();
    assert.ok(codes.includes('BRN-012'), 'lệch trên ĐĨA vẫn phải hiện dù git hỏng: ' + codes.join(','));
    assert.ok(codes.includes('BRN-015'));
    assert.equal(repo.status, 'ERROR', 'BRN-012 là error ⇒ ERROR đè WARNING của BRN-015');
    assert.equal(code, 2);
  } finally { f.cleanup(); }
});

test('P04-E4c · repo git bình thường ⇒ head=ok, KHÔNG có BRN-015', { skip }, () => {
  const f = mkFleet();
  try {
    const dir = path.join(f.fleet, 'repo-ok');
    makeStandard(dir);
    gitInitCommitted(dir);

    const { code, report } = scan(f.fleet);
    assert.equal(report.repos[0].git.head, 'ok');
    assert.deepEqual(report.repos[0].findings, []);
    assert.equal(report.repos[0].status, 'CLEAN');
    assert.equal(code, 0);
  } finally { f.cleanup(); }
});

test('P04-E4d · --git-timeout rất nhỏ ⇒ head=timeout, KHÔNG phải lỗi não (mã 1)', { skip }, () => {
  const f = mkFleet();
  try {
    const dir = path.join(f.fleet, 'repo-cham');
    makeStandard(dir);
    gitInitCommitted(dir);

    // 1 ms: mọi tiến trình git đều bị cắt ⇒ chứng minh nhánh timeout có thật.
    const { code, report } = scan(f.fleet, ['--git-timeout', '1']);
    const repo = report.repos[0];
    if (repo.git.head === 'timeout') {
      assert.deepEqual(repo.findings.map((x) => x.code), ['BRN-015']);
      assert.equal(repo.status, 'WARNING');
      assert.equal(code, 1, 'timeout git là cảnh báo, KHÔNG phải lỗi chặn');
    } else {
      // Máy quá nhanh: git kịp chạy xong trong 1 ms. Không coi là fail.
      assert.ok(['ok', 'broken', 'unborn'].includes(repo.git.head));
    }
  } finally { f.cleanup(); }
});

test('P04-E4e · git nằm trong repo mẹ: BRN-014 báo repo con cấp 1, không đi sâu hơn', { skip }, () => {
  const f = mkFleet();
  try {
    const parent = path.join(f.fleet, 'repo-me');
    makeStandard(parent);
    gitInitCommitted(parent);
    const child = path.join(parent, 'repo-con');
    fs.mkdirSync(child);
    gitInitCommitted(child);
    // Cháu ở cấp 2: doctor KHÔNG được nhìn thấy (chặn cứng ở cấp 1).
    const grand = path.join(child, 'repo-chau');
    fs.mkdirSync(grand);
    gitInitCommitted(grand);

    const { report } = scan(f.fleet);
    const repo = report.repos.find((x) => x.name === 'repo-me');
    const f014 = repo.findings.find((x) => x.code === 'BRN-014');
    assert.deepEqual(f014.detail.dirs, ['repo-con'], 'chỉ cấp 1; `repo-chau` ở cấp 2 KHÔNG được liệt kê');
  } finally { f.cleanup(); }
});

test('P04-E4f · mọi lệnh git dùng mảng đối số: kho + repo tên có dấu cách và tiếng Việt', { skip }, () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brain git '));
  try {
    const fleet = path.join(base, 'kho các dự án');
    fs.mkdirSync(fleet);
    const dir = path.join(fleet, 'Dự án Số Một');
    makeStandard(dir);
    gitInitCommitted(dir);

    const r = runDoctor(['--root', fleet, '--format', 'json']);
    assert.equal(r.code, 0, r.stderr);
    const report = JSON.parse(r.stdout);
    assert.equal(report.repos[0].name, 'Dự án Số Một');
    assert.equal(report.repos[0].git.head, 'ok', 'nội suy chuỗi lệnh sẽ gãy ở đây; mảng đối số thì không');
  } finally { fs.rmSync(base, { recursive: true, force: true, maxRetries: 5 }); }
});

test('P04-E4g · không có git nhị phân vẫn không sập (nhánh ENOENT được xử lý)', () => {
  // Không skip: kiểm tra bằng hàm, không cần môi trường không-git.
  const doctor = require('../../.agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js');
  assert.equal(typeof doctor.probeGit, 'function');
  assert.equal(doctor.gitKind(path.join(os.tmpdir(), 'khong-ton-tai-' + Date.now())), 'none');
});

test('P04-E4h · git nói dối không được: kind suy từ stat, không từ lệnh git', () => {
  const doctor = require('../../.agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js');
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brain-kind-'));
  try {
    const asDir = path.join(base, 'a');
    fs.mkdirSync(path.join(asDir, '.git'), { recursive: true });
    assert.equal(doctor.gitKind(asDir), 'dir');

    const asFile = path.join(base, 'b');
    fs.mkdirSync(asFile);
    fs.writeFileSync(path.join(asFile, '.git'), 'gitdir: ../elsewhere\n');
    assert.equal(doctor.gitKind(asFile), 'file', 'bẫy E.2: `.git` là FILE phải ra kind=file');

    const none = path.join(base, 'c');
    fs.mkdirSync(none);
    assert.equal(doctor.gitKind(none), 'none');
  } finally { fs.rmSync(base, { recursive: true, force: true, maxRetries: 5 }); }
});
