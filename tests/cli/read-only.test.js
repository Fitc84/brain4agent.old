'use strict';
/**
 * read-only.test.js — bằng chứng P01-E4 / P01-E9.
 *
 * `--check` và `--dry-run` phải KHÔNG chạm đĩa: so sánh sha256 + mtime TỪNG file
 * của cả cây trước/sau (mtime bắt được cả trường hợp ghi lại y hệt nội dung).
 * Kèm kiểm idempotent: chạy ghi lần 2 ⇒ exit 0, NÃO ĐÃ OK, cây không đổi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { mkTmpRoot, listFixtures } = require('../helpers/tmp.js');
const { snapshotTree } = require('../helpers/tree.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const READ_ONLY_MODES = ['--check', '--dry-run'];

test('P01-E4: --check/--dry-run không ghi bất cứ thứ gì (sha256 + mtime bằng nhau)', async (t) => {
  for (const name of listFixtures()) {
    for (const flag of READ_ONLY_MODES) {
      await t.test(`${name} ${flag}`, () => {
        const tmp = mkTmpRoot(name);
        try {
          const before = snapshotTree(tmp.dir);
          const r = runEngine(ENGINE_PATH, [flag, tmp.dir]);
          assert.ok([0, 1, 2].includes(r.code), `${name}${flag}: mã thoát lạ ${r.code} (${r.stderr})`);
          const after = snapshotTree(tmp.dir);
          assert.deepEqual(after, before, `${name} ${flag}: cây bị thay đổi — chế độ chỉ đọc bị vi phạm`);
        } finally {
          tmp.cleanup();
        }
      });
    }
  }
});

test('P01-E9: idempotent — chạy ghi lần 2 exit 0, NÃO ĐÃ OK, cây không đổi', async (t) => {
  for (const name of listFixtures()) {
    await t.test(name, () => {
      const tmp = mkTmpRoot(name);
      try {
        const first = runEngine(ENGINE_PATH, [tmp.dir]);
        assert.equal(first.code, 0, `${name}: lần ghi 1 phải hội tụ (stderr: ${first.stderr})`);
        const afterFirst = snapshotTree(tmp.dir);

        const second = runEngine(ENGINE_PATH, [tmp.dir]);
        assert.equal(second.code, 0, `${name}: lần 2 phải exit 0`);
        assert.ok(second.stdout.includes('NÃO ĐÃ OK'), `${name}: lần 2 phải in NÃO ĐÃ OK`);
        assert.deepEqual(snapshotTree(tmp.dir), afterFirst, `${name}: lần 2 vẫn ghi — không idempotent`);

        const check = runEngine(ENGINE_PATH, ['--check', tmp.dir]);
        assert.equal(check.code, 0, `${name}: --check sau khi ghi phải exit 0`);
      } finally {
        tmp.cleanup();
      }
    });
  }
});

test('P01-E5: F07-bom-state — sau khi ghi: không BOM, đúng version, giữ current_version, kết \\n', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const tmp = mkTmpRoot('F07-bom-state');
  try {
    const rel = ['brain4agent', 'memory', 'hot', 'state.json'];
    const before = JSON.parse(fs.readFileSync(path.join(tmp.dir, ...rel), 'utf8').replace(/^﻿/, () => ''));
    const r = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(r.code, 0, r.stderr);
    const buf = fs.readFileSync(path.join(tmp.dir, ...rel));
    assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), 'state.json vẫn còn BOM');
    assert.equal(buf[buf.length - 1], 0x0a, 'state.json phải kết thúc bằng 0x0A');
    const after = JSON.parse(buf.toString('utf8'));
    assert.equal(after.brain_template_version, '1.3.0');
    assert.equal(after.current_version, before.current_version, 'CẤM đụng current_version');
  } finally {
    tmp.cleanup();
  }
});
