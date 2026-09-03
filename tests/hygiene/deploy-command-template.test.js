'use strict';
// T-H07 · Bẫy #23: file lệnh Claude (`~/.claude/commands/xay-dung-nao-bo.md`) được sinh
// từ một template CỨNG nằm trong `scripts/deploy_skills.ps1` — nó KHÔNG thuộc Ma Trận
// Đồng Bộ 6 Điểm nên không luật nào bắt rà. Hệ quả đo thật ở #10: khung não lên v1.4.0
// (Bước 0 phải chạy `--check` trước, exit 2 = cần người) nhưng template vẫn dạy agent
// chạy thẳng chế độ GHI và chỉ biết 2 kết cục — tức file lệnh VI PHẠM chính luật mà
// engine vừa cài vào repo. Bước CI `deploy-dry` không thấy được vì dry-run không ghi
// file lệnh. Test này là nơi duy nhất canh template đó trong `npm test`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const PS1 = path.join(ROOT, 'scripts', 'deploy_skills.ps1');

// Mốc BẮT BUỘC có trong template file lệnh. Giữ ĐỒNG BỘ với $requiredCmdTokens
// trong chính `deploy_skills.ps1` (khối kiểm CMD-OK/CMD-BAD).
const REQUIRED = [
  { token: '--check', why: 'Bước 0 phải CHỈ ĐỌC trước, luật khung v1.4.0' },
  { token: 'BRN-016', why: 'phải có nhánh [cần người] — exit 2, KHÔNG tự sửa vùng luật' },
  { token: 'NÃO ĐÃ OK', why: 'mốc nhận biết não đạt chuẩn (deploy cũng kiểm mốc này)' },
  { token: 'init_brain.js', why: 'đường dẫn engine phải có trong lệnh' }
];

// Trả về template ĐÃ THAY placeholder — đúng thứ deploy ghi ra đĩa, để test này và
// khối kiểm CMD-OK trong script cùng soi MỘT đối tượng (nếu không, `init_brain.js`
// chỉ xuất hiện sau khi thay đường dẫn và hai danh sách mốc sẽ không so được).
const FAKE_ENGINE = 'X:/skills/.xay-dung-nao-bo/scripts/init_brain.js';

function readTemplate() {
  const src = fs.readFileSync(PS1, 'utf8').split('\r\n').join('\n');
  const m = src.match(/\$cmdTemplate = @'\n([\s\S]*?)\n'@/);
  assert.ok(m, 'không tìm thấy khối $cmdTemplate trong deploy_skills.ps1 — cấu trúc script đã đổi');
  assert.ok(m[1].includes('__ENGINE_PATH__'),
    'template phải giữ placeholder __ENGINE_PATH__ — CẤM hardcode đường dẫn máy vào repo PUBLIC');
  return m[1].split('__ENGINE_PATH__').join(FAKE_ENGINE);
}

test('T-H07 · template file lệnh Claude mang đủ mốc của luật khung hiện hành', () => {
  const tpl = readTemplate();
  const missing = REQUIRED.filter((r) => !tpl.includes(r.token));
  assert.deepEqual(missing.map((r) => r.token + ' (' + r.why + ')'), [],
    'template file lệnh thiếu mốc ⇒ agent sẽ làm sai luật Bước 0');
});

test('T-H07b · template KHÔNG được dạy chạy chế độ ghi trước khi chẩn đoán', () => {
  const tpl = readTemplate();
  const lines = tpl.split('\n');
  const runLines = lines
    .map((l, i) => ({ l: l.trim(), i }))
    .filter((x) => x.l.startsWith('node "') || x.l.startsWith('node __'));
  assert.ok(runLines.length >= 1, 'template phải có ít nhất một lệnh chạy engine');
  // Lệnh chạy ĐẦU TIÊN bắt buộc là chế độ chỉ đọc.
  assert.ok(runLines[0].l.includes('--check'),
    'lệnh chạy engine ĐẦU TIÊN trong template phải có --check (chỉ đọc), thực tế: ' + runLines[0].l);
});

test('T-H07c · bánh cóc: danh sách mốc trong test khớp $requiredCmdTokens của script', () => {
  const src = fs.readFileSync(PS1, 'utf8');
  const m = src.match(/\$requiredCmdTokens = @\(([^)]*)\)/);
  assert.ok(m, 'không tìm thấy $requiredCmdTokens trong deploy_skills.ps1');
  const inPs1 = (m[1].match(/'([^']+)'/g) || []).map((s) => s.slice(1, -1).replace(/\\\./g, '.'));
  const inTest = REQUIRED.map((r) => r.token).sort();
  assert.deepEqual(inPs1.slice().sort(), inTest,
    'hai danh sách mốc đã trôi lệch — sửa một nơi thì phải sửa cả hai (bài học allowlist abs-path ở #10)');
});
