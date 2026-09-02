# SPEC-P01 — Lõi Marker: find / replace / validate theo dòng (WP1)

Hợp đồng: 01-CONTRACTS §1–§5, §9, §11. File đích: `.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js`, lớp "VÁ THUẦN" (thay toàn bộ dòng 459–613 hiện tại).

## (a) Thuật toán — pseudo-code là hợp đồng, không phải gợi ý

### a.1 `findBlock(lines, id)`

```
o = chỉ số các i có lines[i] === OPEN(id)
c = chỉ số các i có lines[i] === CLOSE(id)
if o.length === 0 && c.length === 0 → null
if o.length !== 1 || c.length !== 1 || c[0] < o[0] → 'malformed'
→ { open: o[0], close: c[0], inner: lines.slice(o[0]+1, c[0]).join('\n') }
```
Đúng 4 nhánh trả về. **Không** có nhánh thứ 5. Độ phức tạp O(dòng).

### a.2 `findLegacy(text, legacy)`

```
for item of legacy:
  if typeof item === 'string': i = text.indexOf(item); if i !== -1 → {start: i, end: i + item.length}
  else: re = new RegExp(item.map(escapeRe).join(SEMVER_HOLE)); m = re.exec(text); if m → {start: m.index, end: m.index + m[0].length}
→ null
```
`escapeRe` escape đủ `.*+?^${}()|[]\`. Mảng đoạn ≥ 2 phần tử; giữa hai đoạn khớp đúng một SemVer. Đây là regex **duy nhất** của lớp vá (C5).

### a.3 `classifyRuleBlocks(text)`

```
lines = text.split('\n')
blocks = {}                        // id → findBlock(lines, id)
for blk of RULE_BLOCKS: blocks[blk.id] = findBlock(lines, blk.id)
outside = lines với các đoạn [open..close] của mọi block hợp lệ bị cắt bỏ, join('\n')
for blk of RULE_BLOCKS (giữ thứ tự):
  b = blocks[blk.id]
  if b === 'malformed' → {id, state:'malformed', extra:false}
  if b: state = (b.inner === blk.body) ? 'ok' : 'stale'; extra = outside.includes(blk.probe) → {id, state, extra, block:b}
  span = findLegacy(text, blk.legacy)
  if span → {id, state:'legacy', extra:false, span}
  if outside.includes(blk.probe) → {id, state:'edited', extra:false}
  → {id, state:'absent', extra:false}
```
Lưu ý: `probe` cho nhánh `edited` cũng dò trên `outside` (không phải `text`) — để probe của luật A không bị "thấy" bên trong khối hợp lệ của luật B.

### a.4 `patchAgentsMd(content)`

```
text = content; patches = []; broken = []; added = []
for blk of RULE_BLOCKS:
  st = classifyRuleBlocks(text).find(s => s.id === blk.id)   // phân loại LẠI sau mỗi lần sửa text
  switch st.state:
    'ok'        → continue
    'stale'     → lines = text.split('\n'); text = lines[0..open] ++ blk.body.split('\n') ++ lines[close..]; patches.push('sync:'+id)
    'legacy'    → text = text[0..span.start] + OPEN(id)+'\n'+body+'\n'+CLOSE(id) + text[span.end..]; patches.push('adopt:'+id)
    'absent'    → added.push(OPEN(id)+'\n'+body+'\n'+CLOSE(id)); patches.push('add:'+id)
    'edited' | 'malformed' → broken.push(id)
if added.length:
  if text có dòng === APPENDIX_HEADING → text = rtrim(text) + '\n\n' + added.join('\n\n') + '\n'
  else                                 → text = rtrim(text) + '\n\n---\n\n' + APPENDIX_HEADING + '\n\n' + added.join('\n\n') + '\n'
→ { content: text, patches, broken, changed: patches.length > 0 }
```
- Phân loại lại sau mỗi sửa (hoặc tính lại `outside`) là **bắt buộc** — chỉ số dòng đổi sau `sync`/`adopt`.
- `rtrim` = bỏ khoảng trắng/newline cuối (giữ hành vi cũ của `.replace(/\s*$/, '')`, nhưng **không** dùng `replace` với regex trong lớp này: dùng vòng lặp `while` cắt ký tự cuối ∈ `{' ', '\t', '\n'}`).
- `APPENDIX_HEADING = '## 🔒 Luật khung do engine quản lý (tự sinh)'` — không chứa probe/token nào (T-M19).
- Khi `adopt` đoạn `legacy` là một dòng nằm giữa văn bản, mốc mở/đóng phải thành **dòng riêng**: `legacy` được định nghĩa để `start` là đầu dòng và `end` là cuối dòng (không gồm `\n`) — bằng chứng: 4 thân luật cũ đều bắt đầu ở cột 0 và kết thúc trước newline (kiểm T-M12 bằng oracle).

### a.5 `renderFullAgentsMd()` = đòn bẩy Đ5

```js
function renderFullAgentsMd() { return patchAgentsMd(AGENTS_SKELETON).content; }
```
`AGENTS_SKELETON` = template hiện tại (dòng 304–455) với 6 cặp mốc **rỗng** đặt đúng vị trí bảng §5 của 01-CONTRACTS, và 4 thân luật cũ **bị xoá** khỏi template (chỉ còn trong `RULE_BLOCKS`). Nội dung ngoài khối của skeleton: cập nhật §2 theo SPEC-P03 §2. **Khả thi:** đã đo nhánh `sync` với `inner === ''` trong nguyên mẫu R2 — nhưng phải có test riêng (T-M18).

Nếu trong thực thi phát hiện lý do khiến đòn bẩy **không** khả thi, phải ghi vào `plan.md` (nhật ký) **trước** khi giữ hai bản sao — không được im lặng.

## (b) Luật BẮT BUỘC / CẤM riêng của gói

- **BẮT BUỘC** thứ tự kiểm trong `classifyRuleBlocks`: `malformed` → khối → `legacy` → `probe` → `absent`. Đổi thứ tự = đổi hợp đồng.
- **BẮT BUỘC** `findBlock` so `===` trên dòng đã LF. Nếu dòng có `\r` cuối (file mixed chưa chuẩn hoá) thì **không khớp** — đúng ý: `readText` đã chuẩn hoá; lớp thuần không tự chuẩn hoá lại.
- **CẤM** giữ bất kỳ hàm/nhánh nào của cơ chế cũ: `AGENTS_PATCH_LOGS`, 4 nhánh `includes(token)`, regex `### G\.`/`### H\.`/`## 📋 3\.`, 3 fallback phụ lục, `remove-legacy-planning`, `RULE_ANCHORS`, vòng đếm mệnh đề (dòng 459–465, 508–613, 734–769 của v1.6.0). Grep sau WP1: 0 khớp `PHỤ LỤC TỰ ĐỘNG VÁ`, 0 khớp `RULE_ANCHORS`, 0 khớp `AGENTS_PATCH_LOGS`.
- **CẤM** `patchAgentsMd` nhận `version`. Thân luật không có version (M-6).
- **CẤM** log/giải thích nhúng trong `RULE_BLOCKS` (vd `log:` cho từng khối) — log sinh từ `verb:id` (01-CONTRACTS §7).
- **Vùng cấm:** (1) không thêm trường `supersedes` ở #10 (TQ5, đo 0/66); (2) không "tự sửa mốc" (vd xoá mốc thừa) — mọi dạng hỏng là việc của người; (3) không cache phân loại giữa các khối (đơn giản > nhanh; file ≤ vài trăm dòng); (4) không đổi `APPENDIX_HEADING` sau khi đã rollout (đổi = mọi repo có phụ lục sinh phụ lục thứ hai).

## (c) Bảng lỗi + hành vi caller

| Tình huống | `classifyRuleBlocks` | `patchAgentsMd` | `diagnose` | Mã thoát |
| :--- | :--- | :--- | :--- | :-: |
| H1–H5 (01-CONTRACTS §2) | `malformed` | `broken`, không đụng khối | BRN-016 `malformed` | 2 |
| Có dấu vết, không nguyên văn | `edited` | `broken`, không chèn | BRN-016 `edited` | 2 |
| Khối đúng nhưng còn bản thừa ngoài khối | `ok, extra` | không đổi | BRN-003 `extra` | 2 |
| Khối cũ (ruột ≠ body) | `stale` | `sync` | BRN-002 `stale` | ghi → 0 |
| Văn bản cũ nguyên văn | `legacy` | `adopt` | BRN-002 `adopt` | ghi → 0 |
| Vắng hẳn | `absent` | `add` (phụ lục) | BRN-002 `absent` | ghi → 0 |
| `content` không phải chuỗi / `RULE_BLOCKS` sai ràng buộc §5 | ném `TypeError` (không bắt) | — | — | 3 (vỏ bắt) |

## (d) Test bắt buộc của gói (chi tiết TESTING-ACCEPTANCE §1.1)

T-M01…T-M23. Đặc biệt: **T-M03–T-M07** = 5 dạng hỏng, mỗi test khẳng định *cả ba*: `findBlock === 'malformed'`, `patchAgentsMd(...).content === input` **cho phần thuộc khối đó** (khối khác vẫn được vá), và `broken` chứa `id`. **T-M24** = oracle viết tay: input S1 nhỏ (≈ 25 dòng, có 4 thân luật cũ + văn bản riêng + một bảng + một khối ``` chứa chuỗi giả mốc) và **expected output viết tay** trong file test; `assert.equal(patchAgentsMd(input).content, expected)`. Không dùng `renderFullAgentsMd` để sinh expected.

## (e) Số đo / bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng | Nguồn |
| :--- | :--- | :--- |
| Số dòng `OPEN..patchAgentsMd` (lõi marker, không tính `RULE_BLOCKS`/thân luật) | ≤ **70** | `wc` đoạn; nguyên mẫu R2 = 74 dòng kể cả nhánh `supersedes` |
| G1 sau (lõi vá theo định nghĩa TESTING-ACCEPTANCE §4) | ≤ **123** | đo tại P06 |
| Grep cơ chế cũ | 0 khớp ×3 chuỗi (mục b) | `grep -c` |
| Literal regex trong lớp vá | 0 | T-M21 |
| Byte điều khiển | 0 | T-M22 |
