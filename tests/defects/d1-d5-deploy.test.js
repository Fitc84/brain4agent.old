'use strict';
/**
 * D1 + D5 — hai khiếm khuyết nằm trong `scripts/deploy_skills.ps1`, thuộc phạm vi **WP3**
 * (chưa thực thi tại thời điểm viết WP2b):
 *   D1 — deploy FAIL-OPEN: không đặt `$ErrorActionPreference='Stop'`, `Copy-Item` không có
 *        `-ErrorAction Stop` ⇒ copy hỏng vẫn chạy tiếp và vẫn in banner "THÀNH CÔNG", exit 0.
 *   D5 — file lệnh sinh bởi `powershell` 5.1 + `Set-Content -Encoding UTF8` mang BOM
 *        `EF BB BF` ⇒ Claude Code đọc lệch.
 *
 * Bộ test hộp đen đầy đủ (T-Y01..T-Y10, cần `pwsh` và 2 root tạm) là hợp đồng của
 * SPEC-P02 §1.5 và sẽ do WP3 viết cùng bản sửa. Ở đây chỉ giữ **cổng phân tích tĩnh**:
 * nó mô tả chính xác điều kiện nghiệm thu WP3 phải đạt, và được đánh dấu `todo` để không
 * làm đỏ `npm test` khi WP3 chưa tới — Node vẫn CHẠY thân test và in kết quả thật, nên
 * ngày WP3 xong thì bỏ cờ `todo` là có ngay cổng chặn.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT } = require('../helpers/repo.js');

const SCRIPT_REL = 'scripts/deploy_skills.ps1';
const readScript = () => fs.readFileSync(path.join(REPO_ROOT, SCRIPT_REL), 'utf8');

test('D1: deploy_skills.ps1 phải FAIL-CLOSED ($ErrorActionPreference Stop + Copy-Item -ErrorAction Stop)',
  { todo: 'WP3 (SPEC-P03) chưa thực thi — script vẫn là bản v1.5.4 fail-open' },
  () => {
    const src = readScript();
    assert.match(src, /\$ErrorActionPreference\s*=\s*['"]Stop['"]/,
      "D1: thiếu `$ErrorActionPreference = 'Stop'` ở đầu script");

    const copyLines = src.split('\n').filter((l) => /Copy-Item/.test(l) && !l.trim().startsWith('#'));
    assert.ok(copyLines.length > 0, 'script phải có ít nhất một Copy-Item');
    const unguarded = copyLines.filter((l) => !/-ErrorAction\s+Stop/.test(l));
    assert.deepEqual(unguarded.map((l) => l.trim()), [],
      'D1: mọi Copy-Item phải có -ErrorAction Stop — nếu không, copy hỏng vẫn in "THÀNH CÔNG"');
  });

test('D5: file lệnh do deploy sinh ra CẤM có BOM (không dùng Set-Content -Encoding UTF8 của 5.1)',
  { todo: 'WP3 (SPEC-P03) chưa thực thi — script còn ghi file lệnh bằng Set-Content' },
  () => {
    const src = readScript();
    const bad = src.split('\n')
      .map((l, i) => ({ text: l.trim(), no: i + 1 }))
      .filter((x) => !x.text.startsWith('#'))
      .filter((x) => /(Set-Content|Out-File|Add-Content)/.test(x.text));
    assert.deepEqual(bad.map((x) => `${x.no}: ${x.text}`), [],
      'D5: PowerShell 5.1 ghi UTF8 KÈM BOM — phải dùng [IO.File]::WriteAllBytes / WriteAllText với UTF8Encoding($false)');
  });

test('D5b: script deploy không hardcode đường dẫn máy user (phải nhận qua tham số)',
  { todo: 'WP3 (SPEC-P03) sẽ thêm -GeminiSkillsRoot / -ClaudeCommandsRoot' },
  () => {
    const src = readScript();
    assert.match(src, /param\s*\(/i, 'D1/A9: script phải có khối param() để test truyền root tạm vào');
    assert.match(src, /GeminiSkillsRoot/, 'thiếu tham số -GeminiSkillsRoot');
    assert.match(src, /ClaudeCommandsRoot/, 'thiếu tham số -ClaudeCommandsRoot');
  });

test('D1c: `npm run deploy` phải gọi pwsh 7 (5.1 bị chặn), giữ -NoProfile',
  { todo: 'WP3 (SPEC-P03) sẽ đổi script deploy trong package.json' },
  () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts && pkg.scripts.deploy, 'thiếu script deploy');
    assert.match(pkg.scripts.deploy, /\bpwsh\b/, 'D1/D5: phải chạy bằng pwsh 7, không phải powershell 5.1');
    assert.match(pkg.scripts.deploy, /-NoProfile/, 'CẤM nạp profile người dùng khi deploy');
  });
