'use strict';
/**
 * D4 — `fs.readFileSync(p, 'utf8')` KHÔNG bỏ BOM ⇒ `JSON.parse` ném ⇒ catch nuốt lỗi ⇒
 * `state.json` không bao giờ được vá `brain_template_version`: engine in "thành công",
 * exit 0, mà repo vẫn kẹt phiên bản cũ MÃI MÃI (không hội tụ).
 *
 * Ca hộp đen T-C11 trên fixture F07-bom-state (state.json có BOM, version 1.2.0).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { mkTmpRoot } = require('../helpers/tmp.js');
const { snapshotTree } = require('../helpers/tree.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const engine = require(ENGINE_PATH);
const STATE_REL = ['brain4agent', 'memory', 'hot', 'state.json'];
const V = engine.BRAIN_TEMPLATE_VERSION;

test('D4: F07 — state.json có BOM vẫn được vá version, ghi lại KHÔNG BOM, giữ current_version', () => {
  const tmp = mkTmpRoot('F07-bom-state');
  try {
    const statePath = path.join(tmp.dir, ...STATE_REL);
    const rawBefore = fs.readFileSync(statePath);
    assert.deepEqual([rawBefore[0], rawBefore[1], rawBefore[2]], [0xef, 0xbb, 0xbf], 'tiền đề: fixture có BOM');
    const before = JSON.parse(rawBefore.toString('utf8').slice(1));
    assert.equal(before.brain_template_version, '1.2.0', 'tiền đề: version cũ');

    const r = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(r.code, 0, `D4: phải hội tụ, không được exit ${r.code} (stderr: ${r.stderr})`);
    assert.ok(r.stdout.includes('HOÀN TẤT THÀNH CÔNG'));

    const rawAfter = fs.readFileSync(statePath);
    assert.ok(!(rawAfter[0] === 0xef && rawAfter[1] === 0xbb && rawAfter[2] === 0xbf),
      'D4: engine CẤM ghi lại BOM');
    assert.equal(rawAfter[rawAfter.length - 1], 0x0a, 'I2: state.json phải kết thúc bằng 0x0A');
    assert.ok(!rawAfter.includes(0x0d), 'I2: state.json luôn LF');

    const after = JSON.parse(rawAfter.toString('utf8'));
    assert.equal(after.brain_template_version, V, 'D4/I3: version PHẢI được vá — đây là chỗ v1.5.4 hỏng');
    assert.equal(after.current_version, before.current_version, 'I3: CẤM đụng current_version');
    assert.equal(after.system_status, before.system_status);
    assert.equal(after.active_plans_completed, before.active_plans_completed);

    // Hội tụ thật: lần 2 phải là "NÃO ĐÃ OK" và cây không đổi (v1.5.4 lặp vô hạn ở đây).
    const afterTree = snapshotTree(tmp.dir);
    const r2 = runEngine(ENGINE_PATH, [tmp.dir]);
    assert.equal(r2.code, 0);
    assert.ok(r2.stdout.includes('NÃO ĐÃ OK'), 'D4/I10: lần 2 phải báo đã chuẩn');
    assert.deepEqual(snapshotTree(tmp.dir), afterTree, 'D4/I10: lần 2 không được ghi thêm');
  } finally {
    tmp.cleanup();
  }
});

test('D4b: readText bỏ BOM khi đọc và writeText KHÔNG bao giờ ghi BOM (01-CONTRACTS §1)', () => {
  const tmp = mkTmpRoot('F07-bom-state');
  try {
    const statePath = path.join(tmp.dir, ...STATE_REL);
    const tf = engine.readText(statePath);
    assert.equal(tf.hadBom, true);
    assert.equal(tf.encoding, 'utf8-bom');
    assert.equal(tf.text.charCodeAt(0), '{'.charCodeAt(0), 'D4: text trả về PHẢI đã sạch BOM');
    assert.doesNotThrow(() => JSON.parse(tf.text), 'D4: JSON.parse trên text phải chạy được');

    const out = path.join(tmp.dir, 'ghi-lai.json');
    engine.writeText(out, tf.text, 'lf');
    const buf = fs.readFileSync(out);
    assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), 'writeText CẤM ghi BOM');
  } finally {
    tmp.cleanup();
  }
});

test('D4c: CẤM `readFileSync(..., \'utf8\')` ngoài lớp readText (nguyên nhân gốc của D4)', () => {
  const src = fs.readFileSync(ENGINE_PATH, 'utf8');
  const offenders = src.split('\n')
    .map((line, i) => ({ line: line.trim(), no: i + 1 }))
    .filter((x) => /readFileSync\s*\([^)]*['"]utf-?8['"]/.test(x.line));
  assert.deepEqual(offenders, [],
    "D4: đọc văn bản bằng encoding 'utf8' bỏ qua BOM — phải đi qua readText()/Buffer");
});
