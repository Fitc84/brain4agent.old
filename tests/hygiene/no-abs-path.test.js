'use strict';
/**
 * T-H05 — bất biến **A9**: repo này là repo CÔNG KHAI. File được git theo dõi KHÔNG được
 * chứa đường dẫn tuyệt đối của máy người dùng (lộ tên tài khoản OS), khoá API, hay tên
 * kho vệ tinh thật.
 *
 * Test là một **RATCHET**: ALLOWLIST ghi ĐÚNG hiện trạng đo được lúc viết (WP2b, #09).
 * Con số chỉ được phép GIẢM. Thêm một dòng đường dẫn tuyệt đối vào bất kỳ file nào ⇒ đỏ;
 * thêm file mới vào allowlist mà không kèm lý do ⇒ vi phạm luật của chính test này.
 *
 * Vì sao 16 file dưới đây được miễn (KHÔNG phải "bỏ qua cho xong"):
 *   1. Nhóm "Bước 0" — câu luật khởi động trỏ tới BẢN SKILL GLOBAL trên máy người dùng.
 *      Đây là nội dung TEMPLATE có sẵn từ trước đợt #09; engine ghi nguyên văn câu này
 *      vào mọi dự án đích, nên đổi nó là đổi golden + đổi hành vi ghi của engine:
 *        .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js · .../SKILL.md ·
 *        AGENTS.md · CORE_GOVERNANCE_RULES.md · brain4agent/memory-distill.txt
 *   2. Tài liệu hướng dẫn NGƯỜI dùng gọi bản global:
 *        README.md · docs/UNIVERSAL_AGENT_GUIDE.md · brain4agent/project-intro.md ·
 *        brain4agent/-data-architecture.md · brain4agent/-known-gotchas.md
 *   3. Hồ sơ kế hoạch ĐÃ ĐÓNG (Path Invariant — CẤM sửa lịch sử):
 *        planning/02_* · planning/03_* · planning/04_* · planning/06_*
 *   4. (ĐÃ DỌN 2026-09-02, WP3) scripts/deploy_skills.ps1 từng hardcode đích deploy global.
 *      SPEC-P03 đã tham số hoá (-GeminiSkillsRoot/-ClaudeCommandsRoot, mặc định từ $HOME)
 *      ⇒ 0 dòng khớp, đã GỠ khỏi allowlist đúng cơ chế bánh cóc của T-H05b.
 *   5. (ĐÃ DỌN 2026-09-02, orchestrator) brain4agent/memory/hot/state.json từng chứa một
 *      đường dẫn thư mục tạm tuyệt đối kèm mã phiên cũ — RÒ RỈ THẬT, không phải template.
 *      Đã rút về dạng tương đối và GỠ khỏi allowlist, đúng theo cơ chế bánh cóc của T-H05b.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { REPO_ROOT, trackedFiles } = require('../helpers/repo.js');

// Ghép từ mảnh để chính file test này không tự khớp regex của nó.
const ABS_PATH_RE = new RegExp(
  ['[A-Za-z]:[\\\\/]{1,2}' + 'Users' + '[\\\\/]', '/home/[a-z][a-z0-9_-]*/', '/' + 'Users' + '/[a-z][a-z0-9_-]*/'].join('|')
);
const SECRET_RE = /(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{20,}|Bearer\s+[A-Za-z0-9._-]{20,})/;

// Đọc allowlist từ file JSON — nguồn chân lý duy nhất (WP5 #10, SPEC-P06 §1).
const allowlistData = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tests/hygiene/abs-path-allowlist.json'), 'utf8'));
const ALLOWLIST = allowlistData.entries;

const SKIP_PREFIXES = ['archive/', 'tests/hygiene/no-abs-path.test.js'];

function isText(rel) {
  return !/\.(png|jpg|jpeg|gif|ico|pdf|zip|woff2?|ttf)$/i.test(rel);
}

function scan(matcher) {
  const hits = {};
  for (const rel of trackedFiles()) {
    if (SKIP_PREFIXES.some((p) => rel.startsWith(p))) continue;
    if (!isText(rel)) continue;
    let src;
    try { src = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8'); } catch (e) { continue; }
    const n = src.split('\n').filter((l) => matcher.test(l)).length;
    if (n > 0) hits[rel] = n;
  }
  return hits;
}

test('T-H05 · A9: không file tracked nào chứa đường dẫn tuyệt đối máy user (ngoài allowlist)', () => {
  const hits = scan(ABS_PATH_RE);
  const violations = [];
  for (const [rel, n] of Object.entries(hits)) {
    const allowed = ALLOWLIST[rel];
    if (allowed === undefined) violations.push(`${rel}: ${n} dòng (KHÔNG có trong allowlist)`);
    else if (n > allowed) violations.push(`${rel}: ${n} dòng > ${allowed} được phép`);
  }
  assert.deepEqual(violations, [], 'A9: repo PUBLIC — đường dẫn tuyệt đối làm lộ tên tài khoản OS');
});

test('T-H05b · A9: allowlist không được để mục CHẾT (đã sạch thì phải gỡ khỏi allowlist)', () => {
  const hits = scan(ABS_PATH_RE);
  const stale = Object.keys(ALLOWLIST).filter((rel) => !(rel in hits));
  assert.deepEqual(stale, [],
    'A9: file đã hết đường dẫn tuyệt đối — gỡ khỏi ALLOWLIST để bất biến siết lại');
});

test('T-H05c · A9: fixture test hoàn toàn sạch đường dẫn tuyệt đối và tên kho thật', () => {
  const dirty = Object.keys(scan(ABS_PATH_RE)).filter((rel) => rel.startsWith('tests/fixtures/'));
  assert.deepEqual(dirty, [], 'A9: fixture phải dùng tên chung chung (`du-an-mau`, `repo-alpha`...)');
});

test('T-H05d · A9: không chuỗi trông như khoá bí mật trong file tracked', () => {
  const hits = scan(SECRET_RE);
  assert.deepEqual(hits, {}, 'A9: phát hiện chuỗi giống API key / token');
});

test('T-H05e · A9: .gitignore chặn báo cáo doctor (chứa tên kho vệ tinh thật)', () => {
  const gi = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8');
  assert.ok(/^fleet-report\*\.json$/m.test(gi), 'A9: thiếu dòng `fleet-report*.json` trong .gitignore');
  const tracked = trackedFiles().filter((f) => /fleet-report.*\.json$/.test(f));
  assert.deepEqual(tracked, [], 'A9: fleet-report*.json CẤM được commit');
});
