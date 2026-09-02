'use strict';
// Chụp ảnh cây thư mục theo sha256 từng file. KHÔNG đệ quy vào `.git`.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SKIP_DIRS = new Set(['.git', 'node_modules']);

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// EOL đo trên BYTE (không decode) để không hỏng với UTF-16 / UTF-8 lỗi.
function detectEolBytes(buf) {
  let crlf = 0, lf = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0a) {
      if (i > 0 && buf[i - 1] === 0x0d) crlf++; else lf++;
    }
  }
  if (crlf && lf) return 'mixed';
  if (crlf) return 'crlf';
  if (lf) return 'lf';
  return 'none';
}

function hasBom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function walk(dir, base, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const abs = path.join(dir, ent.name);
    const rel = base ? `${base}/${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(abs, rel, out);
    } else if (ent.isFile()) {
      const buf = fs.readFileSync(abs);
      const st = fs.statSync(abs);
      out[rel] = {
        sha256: sha256(buf),
        bytes: buf.length,
        eol: detectEolBytes(buf),
        bom: hasBom(buf),
        mtimeMs: st.mtimeMs
      };
    }
  }
}

/** snapshotTree(dir) → { [relPosix]: { sha256, bytes, eol, bom, mtimeMs } } — key đã sort. */
function snapshotTree(dir) {
  const out = {};
  walk(dir, '', out);
  const sorted = {};
  for (const k of Object.keys(out).sort()) sorted[k] = out[k];
  return sorted;
}

/** Bản rút gọn chỉ { rel: sha256 } — dạng lưu trong golden manifest. */
function hashesOnly(tree) {
  const out = {};
  for (const k of Object.keys(tree).sort()) out[k] = tree[k].sha256;
  return out;
}

module.exports = { snapshotTree, hashesOnly, sha256, detectEolBytes, hasBom };
