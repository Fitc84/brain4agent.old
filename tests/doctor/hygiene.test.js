'use strict';
/**
 * P04-E7 — vệ sinh mã nguồn của `brain_doctor.js`. Đo trên CHÍNH VĂN BẢN của file:
 * các bất biến ở đây là về CÁCH VIẾT, không phải về kết quả chạy, nên test hành vi
 * không bắt được chúng.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DOCTOR = path.join(__dirname, '..', '..', '.agents', 'skills', '.xay-dung-nao-bo', 'scripts', 'brain_doctor.js');
const SRC = fs.readFileSync(DOCTOR, 'utf8');

// Ghép từ mảnh để chính file test này không tự khớp phép đếm của nó.
const BANNED = [
  'write' + 'FileSync', 'mkdir' + 'Sync', 'unlink' + 'Sync', 'rename' + 'Sync',
  'rm' + 'Sync', 'copyFile' + 'Sync', 'appendFile' + 'Sync', 'rmdir' + 'Sync',
  'recur' + 'sive', 'rev-' + 'list', 'fs' + 'ck', "'gc'", 'applyPlan', 'computePlan'
];

test('P04-E7 · CHỈ ĐỌC: không một lời gọi ghi đĩa nào trong brain_doctor.js', () => {
  const hits = {};
  for (const needle of BANNED) {
    const n = SRC.split(needle).length - 1;
    if (n > 0) hits[needle] = n;
  }
  assert.deepEqual(hits, {},
    'brain_doctor.js phải CHỈ ĐỌC và CẤM quét đệ quy / lệnh git duyệt toàn bộ đối tượng');
});

test('P04-E7b · ngoại lệ ghi DUY NHẤT: đúng một lời gọi writeText cho --json', () => {
  const calls = SRC.split('writeText(').length - 1;
  assert.equal(calls, 1, 'chỉ được phép ĐÚNG MỘT lời gọi writeText — cho đích --json người dùng chỉ định');
  const idx = SRC.indexOf('writeText(');
  const around = SRC.slice(Math.max(0, idx - 600), idx);
  assert.match(around, /args\.jsonPath/, 'lời gọi ghi duy nhất phải nằm trong nhánh --json');
});

test('P04-E7c · CẤM chế độ sửa: không có cờ --fix/--apply/--write', () => {
  for (const flag of ['--fix', '--apply', '--write', '--repair']) {
    assert.ok(!SRC.includes("'" + flag + "'"), 'CẤM cờ sửa: ' + flag);
  }
});

test('P04-E7d · CẤM daemon/heartbeat (§5.H): không setInterval/watch/schedule', () => {
  for (const needle of ['setInterval', 'fs.watch', '--watch', 'setTimeout(']) {
    assert.ok(!SRC.includes(needle), 'CẤM vòng lặp nền: ' + needle);
  }
});

test('P04-E7e · mọi lệnh git đều có timeout, shell:false, windowsHide và LC_ALL=C', () => {
  const spawns = SRC.split('spawnSync(').length - 1;
  assert.equal(spawns, 1, 'chỉ nên có MỘT chỗ sinh tiến trình git (hàm runGit)');
  for (const needle of ['shell: false', 'windowsHide: true', "LC_ALL: 'C'", "GIT_TERMINAL_PROMPT: '0'", 'timeout,']) {
    assert.ok(SRC.includes(needle), 'thiếu tuỳ chọn bắt buộc cho lệnh git: ' + needle);
  }
  // `exec`/`execSync` nhận MỘT chuỗi lệnh ⇒ luôn phải qua shell ⇒ gãy với tên có dấu cách.
  assert.ok(!/spawnSync\(\s*`/.test(SRC) && !/\bexecSync\(/.test(SRC) && !/\bexecFileSync\(/.test(SRC)
    && !/child_process'\)\.exec\(/.test(SRC) && !/[^.\w]exec\(\s*[`'"]/.test(SRC),
  'CẤM nội suy chuỗi lệnh — tên thư mục có dấu cách/tiếng Việt sẽ gãy');
});

test('P04-E7f · 0 dependency: chỉ require lõi Node + engine đi kèm', () => {
  const reqs = Array.from(SRC.matchAll(/require\('([^']+)'\)/g)).map((m) => m[1]).sort();
  assert.deepEqual(reqs, ['./init_brain.js', 'child_process', 'fs', 'path']);
});

test('P04-E7g · MỘT nguồn chân lý: doctor không tự định nghĩa lại BRN-001..013', () => {
  // Doctor chỉ được khai báo meta cho hai mã của riêng nó.
  const doctor = require(DOCTOR);
  assert.deepEqual(Object.keys(doctor.DOCTOR_BRN).sort(), ['BRN-014', 'BRN-015']);
  assert.ok(SRC.includes('diagnose(snap'), 'phải dùng diagnose() của engine');
  for (let i = 1; i <= 13; i++) {
    const code = 'BRN-0' + String(i).padStart(2, '0');
    assert.ok(!SRC.includes("'" + code + "': {"), 'doctor CẤM định nghĩa lại meta của ' + code);
  }
});

test('P04-E7h · nguồn: UTF-8 không BOM, LF thuần, kết thúc bằng đúng một newline', () => {
  const raw = fs.readFileSync(DOCTOR);
  assert.ok(!(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf), 'CẤM BOM');
  assert.ok(!raw.includes(0x0d), 'CẤM CRLF');
  assert.equal(raw[raw.length - 1], 0x0a, 'phải kết thúc bằng newline');
  assert.notEqual(raw[raw.length - 2], 0x0a, 'chỉ đúng MỘT newline cuối');
});

test('P04-E7i · package.json: có script doctor, và version KHÔNG bị WP4 đụng vào', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
  assert.ok(pkg.scripts.doctor, 'thiếu npm script `doctor`');
  assert.match(pkg.scripts.doctor, /brain_doctor\.js$/);
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
});
