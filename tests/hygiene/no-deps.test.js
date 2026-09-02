'use strict';
/**
 * T-H04 — bất biến kiến trúc **A1: 0 DEPENDENCY**.
 * Bộ test chỉ được dùng thư viện chuẩn của Node (`node:test`, `node:assert/strict`,
 * `node:fs|path|os|child_process|crypto`). Không Jest/Vitest/Mocha/Chai/Sinon (NG3).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT, trackedFiles } = require('../helpers/repo.js');

const ALLOWED_MODULES = new Set([
  'node:test', 'node:assert', 'node:assert/strict', 'node:fs', 'node:path', 'node:os',
  'node:child_process', 'node:crypto', 'node:util', 'node:url',
  // Engine/doctor là mã sản phẩm (CommonJS đời cũ) — được require không tiền tố `node:`.
  'fs', 'path', 'os', 'child_process', 'crypto'
]);

test('T-H04 · A1: package.json KHÔNG có dependencies / devDependencies / peerDependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'bundledDependencies']) {
    assert.equal(pkg[field], undefined, `A1: package.json CẤM có trường "${field}"`);
  }
  assert.equal(fs.existsSync(path.join(REPO_ROOT, 'node_modules')), false,
    'A1: node_modules/ không được tồn tại — bộ test chạy bằng Node trần');
  assert.equal(fs.existsSync(path.join(REPO_ROOT, 'package-lock.json')), false,
    'A1: không có dependency thì cũng không có lockfile');
});

test('T-H04b · NG3: mọi file test chỉ require module chuẩn hoặc file trong repo', () => {
  const offenders = [];
  const re = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const rel of trackedFiles().filter((f) => f.startsWith('tests/') && f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    let m;
    while ((m = re.exec(src)) !== null) {
      const id = m[1];
      if (id.startsWith('.') || id.startsWith('/')) continue; // đường dẫn tương đối trong repo
      if (ALLOWED_MODULES.has(id)) continue;
      offenders.push(`${rel}: require('${id}')`);
    }
  }
  assert.deepEqual(offenders, [], 'A1/NG3: test CẤM phụ thuộc thư viện ngoài');
});

test('T-H04c · NG3: không dấu vết framework test bên thứ ba trong repo', () => {
  const BANNED = ['jest', 'vitest', 'mocha', 'chai', 'sinon'];
  const pkg = fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8');
  for (const b of BANNED) {
    assert.ok(!new RegExp('"' + b + '"').test(pkg), `NG3: package.json nhắc tới ${b}`);
  }
  const configs = trackedFiles().filter((f) => /^(jest|vitest|mocha|karma)\.config\./.test(path.basename(f)));
  assert.deepEqual(configs, [], 'NG3: không được có file cấu hình framework test ngoài');
});
