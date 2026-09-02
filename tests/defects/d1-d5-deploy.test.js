'use strict';
/**
 * D1 + D5 — hai khiếm khuyết nằm trong `scripts/deploy_skills.ps1`, thuộc phạm vi **WP3**
 * (chưa thực thi tại thời điểm viết WP2b):
 *   D1 — deploy FAIL-OPEN: không đặt `$ErrorActionPreference='Stop'`, `Copy-Item` không có
 *        `-ErrorAction Stop` ⇒ copy hỏng vẫn chạy tiếp và vẫn in banner "THÀNH CÔNG", exit 0.
 *   D5 — file lệnh sinh bởi `powershell` 5.1 + `Set-Content -Encoding UTF8` mang BOM
 *        `EF BB BF` ⇒ Claude Code đọc lệch.
 *
 * TRẠNG THÁI: WP3 (SPEC-P03) ĐÃ THỰC THI — script đã fail-closed, ghi UTF-8 không BOM
 * bằng `[IO.File]::WriteAllText`, có `-GeminiSkillsRoot`/`-ClaudeCommandsRoot`, và
 * `npm run deploy` gọi `pwsh`. Cờ `todo` đã được gỡ: 4 ca dưới đây là **cổng chặn cứng**
 * (phân tích tĩnh). Bộ test hộp đen đầy đủ (T-Y01..T-Y10, cần `pwsh` + 2 root tạm) vẫn
 * là hợp đồng của SPEC-P02 §1.5.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT } = require('../helpers/repo.js');

const SCRIPT_REL = 'scripts/deploy_skills.ps1';
const readScript = () => fs.readFileSync(path.join(REPO_ROOT, SCRIPT_REL), 'utf8');

test('D1: deploy_skills.ps1 phải FAIL-CLOSED ($ErrorActionPreference Stop + Copy-Item -ErrorAction Stop)',
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
  () => {
    const src = readScript();
    assert.match(src, /param\s*\(/i, 'D1/A9: script phải có khối param() để test truyền root tạm vào');
    assert.match(src, /GeminiSkillsRoot/, 'thiếu tham số -GeminiSkillsRoot');
    assert.match(src, /ClaudeCommandsRoot/, 'thiếu tham số -ClaudeCommandsRoot');
  });

test('D1c: `npm run deploy` phải gọi pwsh 7 (5.1 bị chặn), giữ -NoProfile',
  () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    assert.ok(pkg.scripts && pkg.scripts.deploy, 'thiếu script deploy');
    assert.match(pkg.scripts.deploy, /\bpwsh\b/, 'D1/D5: phải chạy bằng pwsh 7, không phải powershell 5.1');
    assert.match(pkg.scripts.deploy, /-NoProfile/, 'CẤM nạp profile người dùng khi deploy');
  });
