'use strict';
/**
 * Bằng chứng CHỈ ĐỌC (SPEC-P04 §(b) BẮT BUỘC 1, và NG4 "CẤM chế độ sửa").
 * Đo bằng ảnh chụp sha256 + mtime toàn bộ kho giả trước/sau khi chạy doctor.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { runDoctor } = require('../helpers/run.js');
const { snapshotTree } = require('../helpers/tree.js');
const { buildFleet } = require('./make-fleet.js');

// snapshotTree bỏ qua `.git`; ở đây ta CẦN đo cả `.git` nên tự đi cây một lần nữa.
const crypto = require('node:crypto');
function fullTree(dir, base, out) {
  out = out || {};
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const abs = path.join(dir, ent.name);
    const rel = base ? base + '/' + ent.name : ent.name;
    if (ent.isDirectory()) fullTree(abs, rel, out);
    else if (ent.isFile()) {
      const buf = fs.readFileSync(abs);
      out[rel] = crypto.createHash('sha256').update(buf).digest('hex') + ':' + fs.statSync(abs).mtimeMs;
    }
  }
  return out;
}

test('CHỈ ĐỌC · hash + mtime toàn kho giả giống hệt trước và sau khi chạy doctor', () => {
  const f = buildFleet({ withGit: true });
  try {
    const before = fullTree(f.fleet, '');
    assert.ok(Object.keys(before).length > 100, 'kho giả phải đủ lớn để phép đo có ý nghĩa');

    // Chạy đủ mọi nhánh có thể đụng đĩa.
    runDoctor(['--root', f.fleet]);
    runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']);
    runDoctor(['--root', f.fleet, '--format', 'quiet', '--exclude', 'repo-alpha']);
    runDoctor(['--root', f.fleet, '--json', path.join(f.base, 'fleet-report.json')]);

    const after = fullTree(f.fleet, '');
    assert.deepEqual(after, before, 'doctor đã ĐỤNG vào kho được quét — vi phạm bất biến CHỈ ĐỌC');
  } finally { f.cleanup(); }
});

test('CHỈ ĐỌC · --json chỉ ghi ĐÚNG file người dùng chỉ định, không tạo gì khác', () => {
  const f = buildFleet({ withGit: false });
  try {
    const out = path.join(f.base, 'bao-cao.json');
    const beforeBase = fs.readdirSync(f.base).sort();
    runDoctor(['--root', f.fleet, '--no-git', '--json', out]);
    const afterBase = fs.readdirSync(f.base).sort();
    assert.deepEqual(afterBase, beforeBase.concat(['bao-cao.json']).sort(),
      'ngoài file báo cáo được chỉ định tường minh, doctor CẤM tạo thêm bất cứ gì');
  } finally { f.cleanup(); }
});

test('CHỈ ĐỌC · repo chỉ-đọc trên đĩa vẫn quét được (không thử ghi thử)', () => {
  const f = buildFleet({ withGit: false });
  try {
    // Gỡ quyền ghi của một file trong repo chuẩn; nếu doctor có ý định ghi, nó sẽ lộ ra.
    const target = path.join(f.fleet, 'repo-alpha', 'AGENTS.md');
    const mode = fs.statSync(target).mode;
    fs.chmodSync(target, 0o444);
    try {
      const r = runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']);
      const repo = JSON.parse(r.stdout).repos.find((x) => x.name === 'repo-alpha');
      assert.equal(repo.status, 'CLEAN');
    } finally { fs.chmodSync(target, mode); }
  } finally { f.cleanup(); }
});
