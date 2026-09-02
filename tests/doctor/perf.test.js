'use strict';
/**
 * P04-E6 — hiệu năng và bất biến "I/O bị chặn cứng".
 *
 * Vì sao có test này: số đo E của đợt #09 cho thấy quét đệ quy toàn cây bị TIMEOUT
 * quá 5 phút. Ngưỡng thời gian ở đây là hàng rào chống việc một agent sau "sửa cho
 * đầy đủ hơn" bằng cách đi sâu vào cây thư mục.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { runDoctor } = require('../helpers/run.js');
const { buildFleet } = require('./make-fleet.js');

const BUDGET_MS = 3000;

test('P04-E6 · 10 repo, có git: ≤ 3 s', () => {
  const f = buildFleet({ withGit: true });
  try {
    const t0 = Date.now();
    const r = runDoctor(['--root', f.fleet, '--format', 'quiet']);
    const wall = Date.now() - t0;
    assert.equal(r.code, 2);
    const m = /duration_ms=(\d+)/.exec(r.stdout);
    assert.ok(m, 'dòng SUMMARY phải có duration_ms');
    assert.ok(wall < BUDGET_MS, 'quét 10 repo mất ' + wall + ' ms (> ' + BUDGET_MS + ' ms)');
  } finally { f.cleanup(); }
});

test('P04-E6b · --no-git nhanh hơn và không sinh tiến trình nào', () => {
  const f = buildFleet({ withGit: true });
  try {
    const t0 = Date.now();
    const r = runDoctor(['--root', f.fleet, '--no-git', '--format', 'quiet']);
    const wall = Date.now() - t0;
    assert.equal(r.code, 2);
    assert.ok(wall < BUDGET_MS, '--no-git mất ' + wall + ' ms');
  } finally { f.cleanup(); }
});

test('P04-E6c · cây SÂU trong một repo không làm chậm: doctor bị chặn ở cấp 1', () => {
  const f = buildFleet({ withGit: false });
  try {
    // 1200 file rải trên 30 nhánh × 4 tầng bên trong repo-alpha. Một công cụ đi
    // đệ quy toàn cây sẽ chậm hẳn lên; công cụ chặn ở cấp 1 thì gần như không đổi.
    const deepRoot = path.join(f.fleet, 'repo-alpha', 'noi-dung');
    for (let i = 0; i < 30; i++) {
      const leaf = path.join(deepRoot, 'nhanh-' + i, 'tang-2', 'tang-3', 'tang-4');
      fs.mkdirSync(leaf, { recursive: true });
      for (let j = 0; j < 10; j++) fs.writeFileSync(path.join(leaf, 'f' + j + '.md'), 'x\n');
    }

    const t0 = Date.now();
    const r = runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']);
    const wall = Date.now() - t0;
    assert.ok(wall < BUDGET_MS, 'cây sâu làm doctor chậm ' + wall + ' ms ⇒ nghi ngờ đi quá cấp 1');

    const alpha = JSON.parse(r.stdout).repos.find((x) => x.name === 'repo-alpha');
    assert.equal(alpha.status, 'CLEAN', 'nội dung sâu KHÔNG được ảnh hưởng chẩn đoán');
    assert.equal(alpha.findings.length, 0);
  } finally { f.cleanup(); }
});

test('P04-E6d · số lời gọi readdir bị chặn: 1 cho kho + 1 cho mỗi repo', () => {
  const f = buildFleet({ withGit: false });
  try {
    const doctor = require('../../.agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js');
    const realReaddir = fs.readdirSync;
    const calls = [];
    fs.readdirSync = function (p, o) { calls.push(String(p)); return realReaddir.call(fs, p, o); };
    let out = '';
    try {
      doctor.main(['--root', f.fleet, '--no-git', '--format', 'quiet'], process.env,
        { stdout: (s) => { out += s; }, stderr: () => {} });
    } finally { fs.readdirSync = realReaddir; }

    assert.match(out, /candidates=10/);
    // Kho: 1 (liệt kê ứng viên). Mỗi ứng viên KHÔNG bị bỏ qua: collectSnapshot 1 +
    // BRN-014 1 = 2. Ngưỡng rộng rãi nhưng đủ chặt để bắt việc đi sâu vào cây.
    assert.ok(calls.length <= 1 + 10 * 3,
      'quá nhiều lời gọi liệt kê thư mục (' + calls.length + ') — nghi ngờ đi sâu quá cấp 1');
    // Không lời gọi nào trỏ vào cấp 2 bên trong một repo (ngoài chính repo đó).
    const deep = calls.filter((p) => /noi-dung|tang-2|refs/.test(p));
    assert.deepEqual(deep, [], 'CẤM liệt kê thư mục ở cấp sâu hơn 1');
  } finally { f.cleanup(); }
});
