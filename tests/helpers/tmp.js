'use strict';
// Sao chép fixture (chỉ-đọc) ra một thư mục tạm dùng-một-lần cho test hộp đen.
// CẤM mọi test ghi trực tiếp vào tests/fixtures/.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

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
function materialize(dir) {
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (name === '.gitkeep') { fs.rmSync(p); continue; }
    const st = fs.lstatSync(p);
    if (name === 'dot-git') { fs.renameSync(p, path.join(dir, '.git')); continue; }
    if (st.isDirectory()) materialize(p);
  }
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

module.exports = { mkTmpRoot, listFixtures, FIXTURES_DIR };
