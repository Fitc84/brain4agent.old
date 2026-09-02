'use strict';
/**
 * golden.test.js — cổng A10 "byte-identical".
 *
 * Với mỗi ca trong tests/golden/manifest.json: copy fixture ra thư mục tạm, chạy
 * engine HIỆN TẠI, rồi so sha256 TỪNG file + exit_code với ảnh chuẩn đã chụp bằng
 * engine v1.5.4. File thừa hoặc thiếu đều FAIL.
 *
 * Golden đỏ ⇒ KHÔNG chạy `npm run golden:make` để làm xanh lại (SPEC-P02 §(c)).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { mkTmpRoot, FIXTURES_DIR } = require('./helpers/tmp.js');
const { snapshotTree, hashesOnly } = require('./helpers/tree.js');
const { runEngine, ENGINE_PATH } = require('./helpers/run.js');

const MANIFEST_PATH = path.join(__dirname, 'golden', 'manifest.json');

test('A10: cây output byte-identical với golden manifest', async (t) => {
  assert.ok(fs.existsSync(MANIFEST_PATH), 'Thiếu tests/golden/manifest.json — chạy `npm run golden:make`');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  assert.equal(manifest.schema_version, 1);
  assert.equal(manifest.brain_now, '2026-01-15T03:04:05.000Z');
  const caseNames = Object.keys(manifest.cases);
  assert.ok(caseNames.length > 0, 'Manifest không có ca nào');

  // Bất biến: fixture là dữ liệu CHỈ ĐỌC. Test nào ghi vào tests/fixtures/ là bug test.
  const fixturesBefore = hashesOnly(snapshotTree(FIXTURES_DIR));

  for (const name of caseNames) {
    await t.test(`golden ${name}`, () => {
      const expected = manifest.cases[name];
      const tmp = mkTmpRoot(name);
      try {
        const r = runEngine(ENGINE_PATH, [tmp.dir], {});
        assert.equal(r.code, expected.exit_code, `${name}: exit_code lệch (stderr: ${r.stderr})`);

        const actual = hashesOnly(snapshotTree(tmp.dir));
        const expFiles = Object.keys(expected.files).sort();
        const actFiles = Object.keys(actual).sort();

        const missing = expFiles.filter((f) => !(f in actual));
        const extra = actFiles.filter((f) => !(f in expected.files));
        assert.deepEqual(missing, [], `${name}: THIẾU file so với golden`);
        assert.deepEqual(extra, [], `${name}: THỪA file so với golden`);

        const mismatched = expFiles.filter((f) => actual[f] !== expected.files[f]);
        assert.deepEqual(
          mismatched,
          [],
          `${name}: sha256 lệch ở ${mismatched.length} file — ĐỌC DIFF, KHÔNG chụp lại golden`
        );
      } finally {
        tmp.cleanup();
      }
    });
  }

  const fixturesAfter = hashesOnly(snapshotTree(FIXTURES_DIR));
  assert.deepEqual(fixturesAfter, fixturesBefore, 'tests/fixtures/ bị test ghi bẩn — sửa test');
});
