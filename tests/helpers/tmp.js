'use strict';
// Sao chép fixture (chỉ-đọc) ra một thư mục tạm dùng-một-lần cho test hộp đen.
// CẤM mọi test ghi trực tiếp vào tests/fixtures/.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { ENGINE_PATH } = require('./run.js');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

// ── THẺ CHỖ đường dẫn global (A9 ⇄ khối marker) ──────────────────────────────
// Từ #10, fixture "đã chuẩn" (S2) và "chuẩn 1.3.0 chưa mốc" (S1) BẮT BUỘC mang thân
// luật `boot` NGUYÊN VĂN — mà thân luật đó chứa đúng một đường dẫn tuyệt đối tới bản
// skill global trên máy người dùng (nội dung template, đã được allowlist ở engine).
// Nhưng T-H05c cấm TUYỆT ĐỐI mọi đường dẫn tuyệt đối trong `tests/fixtures/**` (repo
// PUBLIC ⇒ lộ tên tài khoản OS). Hai luật đó không thể cùng đúng nếu fixture lưu
// đường dẫn thật, nên fixture lưu THẺ CHỖ và bản sao ra thư mục tạm khôi phục lại.
//
// Chuỗi khôi phục đọc TỪ ENGINE (không hardcode) ⇒ 0 file tracked nào chứa đường dẫn.
// Phạm vi ghép nối rất hẹp — đúng MỘT chuỗi đường dẫn — nên tính "oracle" của F09
// (sinh từ engine v1.6.0) không bị ảnh hưởng: mọi byte còn lại là dữ liệu viết tay.
const GLOBAL_SCRIPT_TOKEN = '{{BRAIN_GLOBAL_SCRIPT}}';
let cachedGlobalScript = null;

function globalScriptPath() {
  if (cachedGlobalScript === null) {
    const boot = require(ENGINE_PATH).RULE_BLOCKS.find((b) => b.id === 'boot');
    const m = /`node ([^`]+init_brain\.js)/.exec(boot.body);
    if (!m) throw new Error('[tmp] Khong tim thay duong dan script global trong than luat `boot`');
    cachedGlobalScript = m[1];
  }
  return cachedGlobalScript;
}

// Gốc thư mục tạm: mặc định os.tmpdir(); đặt BRAIN_TEST_TMP=1 để dùng tests/.tmp/
// (tiện soi khi debug, đã nằm trong .gitignore của repo).
function tmpBase() {
  if (process.env.BRAIN_TEST_TMP) {
    const local = path.join(__dirname, '..', '.tmp');
    fs.mkdirSync(local, { recursive: true });
    return local;
  }
  return os.tmpdir();
}

function copyRecursive(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src).sort()) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest); // copy nguyên byte: CRLF/BOM/UTF-16 giữ nguyên
  }
}

// Hai quy ước lưu trữ fixture (git không cho commit thư mục rỗng và coi `.git`
// lồng nhau là gitlink), gỡ ngay sau khi copy ra tmp:
//   - `dot-git`      (thư mục HOẶC file) → đổi tên thành `.git`
//   - `.gitkeep`     → xoá (chỉ để giữ thư mục rỗng trong git)
//   - `{{BRAIN_GLOBAL_SCRIPT}}` → đường dẫn skill global thật (xem ghi chú ở đầu file)
function materialize(dir) {
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (name === '.gitkeep') { fs.rmSync(p); continue; }
    const st = fs.lstatSync(p);
    if (name === 'dot-git') { fs.renameSync(p, path.join(dir, '.git')); continue; }
    if (st.isDirectory()) { materialize(p); continue; }
    expandTokens(p);
  }
}

// Chỉ đụng file THẬT SỰ chứa thẻ chỗ ⇒ fixture BOM/UTF-16/CRLF khác không bị ghi lại.
function expandTokens(file) {
  const buf = fs.readFileSync(file);
  if (!buf.includes(GLOBAL_SCRIPT_TOKEN)) return;
  const out = buf.toString('utf8').split(GLOBAL_SCRIPT_TOKEN).join(globalScriptPath());
  fs.writeFileSync(file, Buffer.from(out, 'utf8'));
}

/**
 * mkTmpRoot(fixtureName) → { dir, cleanup() }
 * fixtureName = tên thư mục con trong tests/fixtures/ (vd 'F01-blank', 'fleet/repo-alpha').
 */
function mkTmpRoot(fixtureName) {
  const src = path.join(FIXTURES_DIR, ...String(fixtureName).split('/'));
  if (!fs.existsSync(src)) throw new Error(`[tmp] Khong tim thay fixture: ${fixtureName}`);
  const dir = fs.mkdtempSync(path.join(tmpBase(), 'brain-t-'));
  copyRecursive(src, dir);
  materialize(dir);
  return {
    dir,
    cleanup() { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); }
  };
}

/** Danh sách tên fixture cấp 1 (bỏ qua thư mục kho giả `fleet`). */
function listFixtures() {
  return fs.readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'fleet')
    .map(d => d.name)
    .sort();
}

// Fixture CỐ Ý **không hội tụ được**: đường ghi kết thúc mã thoát 2 vì lỗi thuộc loại
// "cần NGƯỜI" (01-CONTRACTS §6, không fixable). Đây là DỮ LIỆU của lưới test — thêm
// fixture mới thì phải khai báo ở đây, không được sửa vòng lặp test cho im.
const NON_CONVERGING = {
  'F04-old-planning-block': 'BRN-003 legacy_planning — TQ5: engine KHÔNG tự gỡ khối luật cũ',
  'F06-duplicate-law': 'BRN-003 extra — bản chép thừa luật J nằm ngoài mọi khối',
  'F10-user-edited': 'BRN-016 edited — Đ3: vùng luật bị sửa tay, engine CẤM ghi đè'
};

/** Fixture mà engine PHẢI đưa về chuẩn (ghi ⇒ exit 0, lần 2 ⇒ NÃO ĐÃ OK). */
const convergingFixtures = () => listFixtures().filter((n) => !(n in NON_CONVERGING));

module.exports = {
  mkTmpRoot, listFixtures, convergingFixtures, NON_CONVERGING,
  FIXTURES_DIR, GLOBAL_SCRIPT_TOKEN, globalScriptPath
};
