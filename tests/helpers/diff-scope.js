'use strict';
/**
 * diff-scope.js — bộ đo A2/A3 của 01-CONTRACTS §10 (SPEC-P05 §4).
 *
 *   diffScope(before, after, ids?) → { deletedOutside: string[], addedOutside: string[] }
 *
 * A2 "không phá": mọi dòng bị XOÁ phải thuộc một đoạn `legacy` đã khớp trong `before`
 * hoặc nằm trong một khối marker hợp lệ của `before` (ca `sync`).
 * A3 "bao hàm": mọi dòng THÊM phải là dòng mốc, hoặc nằm giữa một cặp mốc của `after`,
 * hoặc thuộc phụ lục MỚI nối ở cuối (tiêu đề + 1-2 dòng ngăn cách ngay trước nó).
 */
const { ENGINE_PATH } = require('./run.js');
const e = require(ENGINE_PATH);

/** LCS theo dòng → cờ "dòng này có mặt ở cả hai bên" cho từng phía. */
function lcsKeep(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ka = new Array(n).fill(false), kb = new Array(m).fill(false);
  for (let i = 0, j = 0; i < n && j < m;) {
    if (a[i] === b[j]) { ka[i] = true; kb[j] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { ka, kb };
}

const blocksOf = (lines, ids) => ids
  .map((id) => ({ id, f: e.findBlock(lines, id) }))
  .filter((x) => x.f && x.f !== 'malformed')
  .map((x) => [x.f.open, x.f.close]);

const covered = (ranges, i) => ranges.some(([s, t]) => i >= s && i <= t);

/** Vùng dòng của các đoạn `legacy` khớp trong `text` (dùng cho A2). */
function legacyRanges(text, ids) {
  const out = [];
  for (const id of ids) {
    const blk = e.RULE_BLOCKS.find((b) => b.id === id);
    const hit = blk && blk.legacy.length ? e.findLegacy(text, blk.legacy) : null;
    if (!hit) continue;
    const head = text.slice(0, hit.start).split('\n').length - 1;
    out.push([head, head + text.slice(hit.start, hit.end).split('\n').length - 1]);
  }
  return out;
}

function diffScope(before, after, ids) {
  const list = ids || e.RULE_BLOCKS.map((b) => b.id);
  const A = e.normalizeEol(before).split('\n');
  const B = e.normalizeEol(after).split('\n');
  const { ka, kb } = lcsKeep(A, B);

  const okDel = blocksOf(A, list).concat(legacyRanges(e.normalizeEol(before), list));
  const deletedOutside = A.filter((l, i) => !ka[i] && !covered(okDel, i));

  const head = e.APPENDIX_HEADING;
  const at = B.indexOf(head);
  const appendix = at !== -1 && A.indexOf(head) === -1 ? [[Math.max(0, at - 2), B.length - 1]] : [];
  const okAdd = blocksOf(B, list).concat(appendix);
  const marker = new Set(list.flatMap((id) => [e.OPEN(id), e.CLOSE(id)]));
  const addedOutside = B.filter((l, i) => !kb[i] && !marker.has(l) && !covered(okAdd, i));

  return { deletedOutside, addedOutside };
}

module.exports = { diffScope };
