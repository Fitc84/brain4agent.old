'use strict';
/**
 * P04-E1 / P04-E3 / P04-E9 — hành vi hộp đen của `brain_doctor.js` trên KHO GIẢ.
 *
 * Kho giả (tests/doctor/make-fleet.js) chứa đủ các biến thể đã đo được là bẫy:
 * thư mục ẩn · `.git` là file · nội dung UTF-16 · CRLF không newline cuối ·
 * repo 0 commit · tên có dấu cách và tiếng Việt có dấu · thư mục không phải repo.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { runDoctor } = require('../helpers/run.js');
const { mkTmpRoot } = require('../helpers/tmp.js');
const { buildFleet, buildSingle, VIET_NAME } = require('./make-fleet.js');

// Đường dẫn tuyệt đối của MÁY (A9). Ghép từ mảnh để file test không tự khớp.
const ABS_RE = new RegExp(['[A-Za-z]:[\\\\/]{1,2}' + 'Users' + '[\\\\/]', '/home/[a-z]', '/' + 'Users' + '/[a-z]'].join('|'));

function codesOf(repo) {
  return repo.findings.map((f) => f.code).sort();
}

test('P04-E1 · kho giả: đúng tập mã của từng repo, exit=2', () => {
  const f = buildFleet({ withGit: true });
  try {
    const r = runDoctor(['--root', f.fleet, '--format', 'json']);
    assert.equal(r.code, 2, 'kho có BLOCKER+ERROR ⇒ mã thoát 2');
    const report = JSON.parse(r.stdout);

    assert.equal(report.repos.length, 10, 'phải liệt kê đủ 10 ứng viên, không bỏ sót thầm lặng');
    for (const [name, exp] of Object.entries(f.expected)) {
      const repo = report.repos.find((x) => x.name === name);
      assert.ok(repo, 'thiếu repo trong báo cáo: ' + name);
      assert.equal(repo.status, exp.status, name + ': trạng thái sai');
      assert.deepEqual(codesOf(repo), exp.codes.slice().sort(), name + ': tập mã sai');
    }

    assert.deepEqual(report.summary, {
      candidates: 10, clean: 3, warning: 4, error: 1, blocker: 1,
      scan_error: 0, skipped: 1, duration_ms: report.summary.duration_ms
    });
  } finally { f.cleanup(); }
});

test('P04-E1b · bẫy E.1/E.2/E.6: thư mục ẩn được quét, `.git` file nhận đúng kind, tên tiếng Việt không gãy', () => {
  const f = buildFleet({ withGit: true });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--format', 'json']).stdout);
    const byName = Object.fromEntries(report.repos.map((r) => [r.name, r]));

    assert.equal(byName['.hidden-repo'].status, 'CLEAN', 'E.1: thư mục ẩn KHÔNG được bỏ sót');
    assert.equal(byName['repo-echo'].git.kind, 'file', 'E.2: `.git` là FILE, không phải thư mục');
    assert.equal(byName['repo-alpha'].git.kind, 'dir');
    assert.equal(byName[VIET_NAME].status, 'CLEAN', 'E.6: tên có dấu cách + tiếng Việt vẫn quét được');
    assert.equal(byName['not-a-repo'].skip_reason, 'not-a-repo');
  } finally { f.cleanup(); }
});

test('P04-E1c · bẫy E.3/E.4: UTF-16 nhận ra trước khi decode; đếm dòng CRLF không lệch', () => {
  const f = buildFleet({ withGit: true });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--format', 'json']).stdout);
    const byName = Object.fromEntries(report.repos.map((r) => [r.name, r]));

    const bom = byName['repo-golf'].findings.find((x) => x.code === 'BRN-013');
    const rels = bom.detail.files.map((x) => x.rel).sort();
    assert.deepEqual(rels, ['brain4agent/memory/hot/state.json', 'brain4agent/memory/hot/today.md']);
    assert.ok(bom.detail.files.some((x) => x.encoding === 'UTF16'), 'E.3: phải nhận UTF-16 qua byte đầu');
    assert.ok(bom.detail.files.some((x) => x.encoding === 'utf8-bom'), 'E.3: phải nhận BOM UTF-8');

    const long = byName['repo-foxtrot'].findings.find((x) => x.code === 'BRN-005');
    assert.equal(long.detail.lines, 12, 'E.4: CRLF + không newline cuối vẫn phải đếm ra đúng 12 dòng');
  } finally { f.cleanup(); }
});

test('P04-E3 · mã thoát 0: mọi repo CLEAN', () => {
  const one = buildSingle('clean');
  try {
    const r = runDoctor(['--root', one.fleet, '--no-git']);
    assert.equal(r.code, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /clean=1 /);
  } finally { one.cleanup(); }
});

test('P04-E3 · mã thoát 1: chỉ có WARNING', () => {
  const one = buildSingle('warning');
  try {
    const r = runDoctor(['--root', one.fleet, '--no-git']);
    assert.equal(r.code, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /warning=1 /);
  } finally { one.cleanup(); }
});

test('P04-E3 · mã thoát 2: có BLOCKER/ERROR', () => {
  const f = buildFleet({ withGit: false });
  try {
    assert.equal(runDoctor(['--root', f.fleet, '--no-git']).code, 2);
  } finally { f.cleanup(); }
});

test('P04-E3 · mã thoát 64: dùng sai cờ (thiếu --root, cờ lạ, giá trị sai kiểu)', () => {
  const cases = [[], ['--khong-co-co-nay'], ['--root'], ['--git-timeout', 'abc', '--root', os.tmpdir()],
    ['--format', 'csv', '--root', os.tmpdir()], ['--expect-template', 'v1', '--root', os.tmpdir()]];
  for (const argv of cases) {
    const r = runDoctor(argv);
    assert.equal(r.code, 64, 'phải là 64 cho: ' + JSON.stringify(argv));
    assert.match(r.stderr, /\[brain-doctor\]/);
    assert.equal(r.stdout, '', 'dùng sai ⇒ KHÔNG in bảng ra stdout');
  }
});

test('P04-E3 · mã thoát 3 ≠ 2: doctor tự lỗi (root không tồn tại · không ghi được --json)', () => {
  // (a) root không tồn tại — KHÔNG phải lỗi của repo nào ⇒ 3, không phải 2.
  const ghost = path.join(os.tmpdir(), 'brain-khong-ton-tai-' + Date.now());
  const r1 = runDoctor(['--root', ghost]);
  assert.equal(r1.code, 3);
  assert.match(r1.stderr, /root không tồn tại/);

  // (b) kho CÓ lỗi (đủ điều kiện exit 2) nhưng đích --json không ghi được ⇒ 3 đè lên 2.
  const f = buildFleet({ withGit: false });
  try {
    const badOut = path.join(f.base, 'thu-muc-khong-ton-tai', 'fleet-report.json');
    const r2 = runDoctor(['--root', f.fleet, '--no-git', '--json', badOut]);
    assert.equal(r2.code, 3, '3 phải đè 2 — và chỉ đến từ catch ngoài cùng');
    assert.notEqual(r2.code, 2);
    assert.match(r2.stderr, /không ghi được báo cáo/);
    assert.match(r2.stdout, /SUMMARY /, 'bảng vẫn phải được in trước khi ghi hỏng');
  } finally { f.cleanup(); }
});

test('P04-E3b · SCAN_ERROR của MỘT repo không dừng vòng quét và không thành mã 3', () => {
  const f = buildFleet({ withGit: false });
  try {
    // Biến một repo thành thứ collectSnapshot không đọc nổi: `brain4agent` là FILE.
    const victim = path.join(f.fleet, 'repo-scan-error');
    fs.mkdirSync(victim);
    fs.writeFileSync(path.join(victim, 'AGENTS.md'), '# stub\n');
    fs.writeFileSync(path.join(victim, 'brain4agent'), 'khong phai thu muc\n');
    fs.mkdirSync(path.join(victim, 'brain4agent-con'), { recursive: true });

    const r = runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']);
    assert.notEqual(r.code, 3, 'lỗi trong MỘT repo tuyệt đối không được thành mã 3');
    assert.equal(r.code, 2);
    const report = JSON.parse(r.stdout);
    assert.equal(report.repos.length, 11, 'các repo còn lại vẫn phải được quét tiếp');
    assert.ok(report.repos.find((x) => x.name === 'repo-alpha').status === 'CLEAN');
  } finally { f.cleanup(); }
});

test('P04-E3c · --exclude ⇒ SKIPPED(excluded), không quét', () => {
  const f = buildFleet({ withGit: false });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--no-git', '--format', 'json',
      '--exclude', 'repo-charlie', '--exclude', 'repo-bravo']).stdout);
    for (const name of ['repo-charlie', 'repo-bravo']) {
      const repo = report.repos.find((x) => x.name === name);
      assert.equal(repo.status, 'SKIPPED');
      assert.equal(repo.skip_reason, 'excluded');
      assert.deepEqual(repo.findings, []);
    }
    assert.equal(report.summary.skipped, 3);
  } finally { f.cleanup(); }
});

test('P04-E3d · --repo quét đúng một thư mục; --format quiet chỉ in dòng tổng kết', () => {
  const one = buildSingle('clean');
  try {
    const r = runDoctor(['--repo', one.dir, '--no-git', '--format', 'quiet']);
    assert.equal(r.code, 0);
    assert.equal(r.stdout.trim().split('\n').length, 1, 'quiet = ĐÚNG một dòng');
    assert.match(r.stdout, /^SUMMARY candidates=1 clean=1 /);
  } finally { one.cleanup(); }
});

test('P04-E9 · A9: stdout và fleet-report.json không chứa đường dẫn tuyệt đối', () => {
  const f = buildFleet({ withGit: true });
  try {
    const out = path.join(f.base, 'fleet-report.json');
    const r = runDoctor(['--root', f.fleet, '--json', out]);
    for (const line of r.stdout.split('\n')) {
      assert.ok(!ABS_RE.test(line), 'A9: stdout lộ đường dẫn tuyệt đối: ' + line);
    }
    const raw = fs.readFileSync(out, 'utf8');
    for (const line of raw.split('\n')) {
      assert.ok(!ABS_RE.test(line), 'A9: báo cáo lộ đường dẫn tuyệt đối: ' + line);
    }
    const report = JSON.parse(raw);
    assert.deepEqual(report.roots, [{ index: 0, label: 'fleet', kind: 'root' }], 'label = basename, KHÔNG phải đường dẫn');
  } finally { f.cleanup(); }
});

test('P04 · --no-git: BRN-015 = skipped, BRN-014 vẫn kiểm', () => {
  const f = buildFleet({ withGit: true });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']).stdout);
    assert.equal(report.tool.git_enabled, false);
    for (const repo of report.repos) {
      if (repo.status === 'SKIPPED') continue;
      assert.equal(repo.git.head, 'skipped', repo.name + ': --no-git ⇒ head=skipped');
      assert.ok(!repo.findings.some((x) => x.code === 'BRN-015'), repo.name + ': --no-git ⇒ không có BRN-015');
    }
    const delta = report.repos.find((x) => x.name === 'repo-delta');
    assert.deepEqual(delta.findings.map((x) => x.code), ['BRN-014'], 'BRN-014 chỉ cần stat ⇒ vẫn kiểm khi --no-git');
  } finally { f.cleanup(); }
});

test('P04 · --expect-template đổi chuẩn kỳ vọng (chuẩn đến từ CỜ, không suy ra từ đa số)', () => {
  const f = buildFleet({ withGit: false });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--no-git', '--format', 'json',
      '--expect-template', '1.2.0']).stdout);
    assert.equal(report.expected_template_version, '1.2.0');
    const bravo = report.repos.find((x) => x.name === 'repo-bravo');
    assert.ok(!bravo.findings.some((x) => x.code === 'BRN-010'), 'kỳ vọng 1.2.0 ⇒ state 1.2.0 hết lệch');
    const alpha = report.repos.find((x) => x.name === 'repo-alpha');
    assert.ok(alpha.findings.some((x) => x.code === 'BRN-018'), 'repo 1.3.0 cao hơn kỳ vọng 1.2.0 ⇒ BRN-018');
  } finally { f.cleanup(); }
});

// ── T-R20 / T-R21 · #10: doctor nhận 2 mã mới QUA BẢNG ENGINE (0 dòng logic riêng) ──
// Quét trên `tests/fixtures/fleet` — chính tài nguyên mà bước CI `doctor-fixture-run`
// trỏ vào; chạy trên BẢN SAO tạm để doctor không bao giờ đụng thư mục fixture.
function withFleetFixture(fn) {
  const tmp = mkTmpRoot('fleet');
  try { return fn(tmp.dir); } finally { tmp.cleanup(); }
}

test('T-R20 · fleet fixture: 00-chuan CLEAN, 01 = BRN-003, 03-moc-hong = BRN-016, exit 2', () => {
  withFleetFixture((root) => {
    const r = runDoctor(['--root', root, '--no-git', '--format', 'json']);
    assert.equal(r.code, 2, 'có ERROR ⇒ mã thoát 2 (bước doctor-fixture-check của CI)');
    const by = Object.fromEntries(JSON.parse(r.stdout).repos.map((x) => [x.name, x]));

    assert.equal(by['00-chuan'].status, 'CLEAN', 'S2 (6 khối mốc, thân đúng) ⇒ sạch');
    assert.deepEqual(by['00-chuan'].findings, []);
    assert.equal(by['01-nhan-doi-luat'].status, 'ERROR');
    assert.deepEqual(codesOf(by['01-nhan-doi-luat']), ['BRN-003']);
    assert.equal(by['03-moc-hong'].status, 'ERROR');
    assert.deepEqual(codesOf(by['03-moc-hong']), ['BRN-016']);
    assert.equal(by['02-thu-muc-thuong'].status, 'SKIPPED');
  });
});

test('T-R21 · fleet fixture: detail của BRN-016/003 đi nguyên vẹn ra --format json', () => {
  withFleetFixture((root) => {
    const by = Object.fromEntries(
      JSON.parse(runDoctor(['--root', root, '--no-git', '--format', 'json']).stdout).repos.map((x) => [x.name, x])
    );
    const moc = by['03-moc-hong'].findings.find((f) => f.code === 'BRN-016');
    assert.equal(moc.level, 'error');
    assert.equal(moc.message, 'AGENTS.md: khối marker hỏng hoặc vùng luật đã bị sửa tay');
    assert.deepEqual(moc.detail, { malformed: ['dual-entry'], edited: [] });

    const dup = by['01-nhan-doi-luat'].findings.find((f) => f.code === 'BRN-003');
    assert.deepEqual(dup.detail, { extra: [], legacy_planning: true });

    // Bảng terminal in mã mới như mọi mã engine khác (labelOf không có nhánh riêng).
    const table = runDoctor(['--root', root, '--no-git']).stdout;
    assert.ok(table.includes('BRN-016'));
    assert.ok(table.includes('BRN-003'));
  });
});

test('T-R22 · --expect-template thấp hơn repo ⇒ BLOCKER BRN-018', () => {
  const tmp = mkTmpRoot('F02-standard-lf');
  try {
    const r = runDoctor(['--repo', tmp.dir, '--expect-template', '1.3.0', '--format', 'json']);
    assert.equal(r.code, 2, r.stderr);
    const repo = JSON.parse(r.stdout).repos[0];
    assert.equal(repo.status, 'BLOCKER');
    const finding = repo.findings.find((f) => f.code === 'BRN-018');
    assert.equal(finding.detail.actual, '1.4.0');
  } finally { tmp.cleanup(); }
});

test('P04 · --version / --help: mã thoát 0, không đọc kho nào', () => {
  const v = runDoctor(['--version']);
  assert.equal(v.code, 0);
  assert.match(v.stdout, /^brain-doctor \d+\.\d+\.\d+ template \d+\.\d+\.\d+\n$/);
  const h = runDoctor(['--help']);
  assert.equal(h.code, 0);
  assert.match(h.stdout, /CHỈ ĐỌC/);
});
