'use strict';
/**
 * exit-codes.test.js — bằng chứng P01-E1: MỖI mã thoát trong 01-CONTRACTS §6
 * (cột `init_brain.js`) có ít nhất một ca kích hoạt bằng tiến trình THẬT.
 *
 * Luật tuyệt đối được kiểm ở đây: mã `3` CHỈ đến từ catch bao ngoài cùng.
 * Lỗi phát hiện trong dự án đích (JSON hỏng, file UTF-16) là `2`, KHÔNG BAO GIỜ `3`.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mock } = require('node:test');

const { mkTmpRoot } = require('../helpers/tmp.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const engine = require(ENGINE_PATH);
const STATE_REL = 'brain4agent/memory/hot/state.json';

function withFixture(name, fn) {
  const tmp = mkTmpRoot(name);
  try { return fn(tmp.dir); } finally { tmp.cleanup(); }
}

test('exit 0 — --check trên kho đã chuẩn, stdout có NÃO ĐÃ OK', () => {
  withFixture('F02-standard-lf', (dir) => {
    const r = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.stdout.includes('NÃO ĐÃ OK'));
    assert.ok(!r.stdout.includes('CHẨN ĐOÁN: CẦN NÂNG CẤP'));
  });
});

test('exit 0 — chế độ ghi hội tụ, stdout có HOÀN TẤT THÀNH CÔNG', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const r = runEngine(ENGINE_PATH, [dir]);
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.stdout.includes('HOÀN TẤT THÀNH CÔNG'));
  });
});

test('exit 1 — --check và --dry-run khi có lệch engine tự sửa được', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 1, chk.stderr);
    assert.ok(chk.stdout.includes('CẦN NÂNG CẤP'));
    // CẤM in NÃO ĐÃ OK khi exit ≠ 0.
    assert.ok(!chk.stdout.includes('NÃO ĐÃ OK'));
    assert.ok(!chk.stdout.includes('HOÀN TẤT THÀNH CÔNG'));
    const codes = chk.stdout.split('\n').filter((l) => l.startsWith('BRN-')).map((l) => l.slice(0, 7)).sort();
    // P01-E3: tập mã kỳ vọng của F03 (BRN-002 vì AGENTS.md còn thiếu luật SPEC PACKAGE).
    assert.deepEqual(codes, ['BRN-002', 'BRN-006', 'BRN-010', 'BRN-011']);

    const dry = runEngine(ENGINE_PATH, ['--dry-run', dir]);
    assert.equal(dry.code, 1, dry.stderr);
    assert.ok(dry.stdout.includes('=== DRY-RUN:'));
    assert.ok(dry.stdout.includes('--- a/brain4agent/memory/hot/state.json'));
  });
});

test('exit 2 — state.json hỏng JSON: cần người, state.json KHÔNG bị ghi', () => {
  withFixture('F02-standard-lf', (dir) => {
    const statePath = path.join(dir, ...STATE_REL.split('/'));
    fs.writeFileSync(statePath, Buffer.from('{ "current_version": }\n', 'utf8'));
    const before = fs.readFileSync(statePath);

    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 2, chk.stderr);

    const wr = runEngine(ENGINE_PATH, [dir]);
    assert.equal(wr.code, 2, wr.stderr);
    assert.ok(!wr.stdout.includes('HOÀN TẤT THÀNH CÔNG'));
    assert.ok(!wr.stdout.includes('NÃO ĐÃ OK'));
    assert.deepEqual(fs.readFileSync(statePath), before, 'state.json hỏng KHÔNG được engine ghi đè');
  });
});

test('exit 2 — file dự án là UTF-16: báo lỗi ra stderr, không ghi gì', () => {
  withFixture('F02-standard-lf', (dir) => {
    const agents = path.join(dir, 'AGENTS.md');
    fs.writeFileSync(agents, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('# x\n', 'utf16le')]));
    const before = fs.readFileSync(agents);

    const r = runEngine(ENGINE_PATH, [dir]);
    assert.equal(r.code, 2, 'UTF-16 là lỗi DỰ ÁN ⇒ 2, không phải 3');
    assert.ok(r.stderr.includes('[brain-engine]'));
    assert.ok(!r.stdout.includes('HOÀN TẤT THÀNH CÔNG'));
    assert.deepEqual(fs.readFileSync(agents), before);
  });
});

test('exit 3 — CHỈ khi engine tự lỗi (mkdirSync ném EACCES)', () => {
  withFixture('F01-blank', (dir) => {
    const out = [];
    const err = [];
    mock.method(fs, 'mkdirSync', () => {
      throw Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' });
    });
    try {
      const code = engine.main([dir], { BRAIN_NOW: '2026-01-15T03:04:05.000Z' }, {
        stdout: (s) => out.push(s),
        stderr: (s) => err.push(s)
      });
      assert.equal(code, 3);
    } finally {
      mock.restoreAll();
    }
    const stdout = out.join('');
    assert.ok(!stdout.includes('HOÀN TẤT THÀNH CÔNG'));
    assert.ok(!stdout.includes('NÃO ĐÃ OK'));
    assert.ok(err.join('').includes('LỖI NỘI BỘ'));
  });
});

test('exit 64 — mọi dạng dùng sai, usage ra stderr', () => {
  withFixture('F02-standard-lf', (dir) => {
    const cases = [
      { args: ['--force', dir], why: 'cờ lạ' },
      { args: ['--check', '--dry-run', dir], why: '--check cùng --dry-run' },
      { args: [dir, dir], why: 'hai đối số vị trí' },
      { args: [path.join(dir, 'khong-ton-tai')], why: 'rootDir không tồn tại' }
    ];
    for (const c of cases) {
      const r = runEngine(ENGINE_PATH, c.args);
      assert.equal(r.code, 64, c.why + ' phải là 64 (stderr: ' + r.stderr + ')');
      assert.ok(r.stderr.includes('Cách dùng:'), c.why + ': usage phải ra stderr');
      assert.equal(r.stdout, '', c.why + ': stdout phải rỗng');
    }
    // BRAIN_NOW hỏng: spawn TRỰC TIẾP (không qua preload fake-date.js — chính nó
    // cũng ném khi BRAIN_NOW không parse được, che mất mã thoát của engine).
    const { spawnSync } = require('node:child_process');
    const bad = spawnSync(process.execPath, [ENGINE_PATH, dir], {
      encoding: 'utf8',
      env: Object.assign({}, process.env, { BRAIN_NOW: 'khong-phai-ngay' })
    });
    assert.equal(bad.status, 64);
    assert.ok(bad.stderr.includes('BRAIN_NOW'));
  });
});

test('--version: một dòng, không đọc đĩa, exit 0 kể cả rootDir không tồn tại', () => {
  const r = runEngine(ENGINE_PATH, ['--version']);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'brain-engine ' + engine.ENGINE_VERSION + ' template ' + engine.BRAIN_TEMPLATE_VERSION + '\n');
  assert.equal(r.stderr, '');
  assert.equal(engine.ENGINE_VERSION, '1.7.0');
  assert.equal(engine.BRAIN_TEMPLATE_VERSION, '1.4.0');

  const r2 = runEngine(ENGINE_PATH, [path.join(__dirname, 'khong-ton-tai-tuyet-doi'), '--version']);
  assert.equal(r2.code, 0);
  assert.equal(r2.stdout, r.stdout);
});

test('--help: usage ra stdout, exit 0, không banner', () => {
  const r = runEngine(ENGINE_PATH, ['--help']);
  assert.equal(r.code, 0);
  assert.ok(r.stdout.includes('Cách dùng:'));
  assert.ok(!r.stdout.includes('UNIVERSAL BRAIN GOVERNANCE ENGINE —'));
  assert.equal(r.stderr, '');
});

test('require() engine: không in gì, không ghi gì, không process.exit', () => {
  const probe = 'const e = require(process.argv[1]); if (typeof e.main !== "function") process.exitCode = 9;';
  const { spawnSync } = require('node:child_process');
  const s = spawnSync(process.execPath, ['-e', probe, ENGINE_PATH], { encoding: 'utf8' });
  assert.equal(s.status, 0);
  assert.equal(s.stdout, '');
  assert.equal(s.stderr, '');
});
