# 01-CONTRACTS — Hợp Đồng Bất Biến Của Đợt #10

Mọi SPEC-Pxx **tham chiếu** file này, không định nghĩa lại. Hợp đồng #09 (`planning/09_*/specs/01-CONTRACTS.md`) vẫn hiệu lực trừ các mục được ghi "THAY" dưới đây.

---

## §1. CÚ PHÁP MARKER (Đ1)

```text
<!-- brain:rule:<id> -->        ← mốc MỞ
…thân luật do engine quản lý…
<!-- /brain:rule:<id> -->       ← mốc ĐÓNG
```

```js
const OPEN  = (id) => '<!-- brain:rule:' + id + ' -->';
const CLOSE = (id) => '<!-- /brain:rule:' + id + ' -->';
const RULE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;   // kebab-case ASCII, dùng CHỈ để kiểm RULE_BLOCKS lúc test
```

**BẮT BUỘC:**
1. `id` khớp `RULE_ID_RE`; không dấu tiếng Việt, không khoảng trắng.
2. Mốc **chiếm trọn một dòng**: không thụt lề, không ký tự khác, không khoảng trắng đuôi. So khớp bằng `lines[i] === OPEN(id)` trên văn bản **đã `normalizeEol`** (LF). **CẤM** `indexOf`/regex trên toàn văn để tìm mốc (mốc trong khối ``` làm ví dụ sẽ bị bắt nhầm).
3. Khi ghi: `writeText(path, text, f.eol)` khôi phục EOL gốc — mốc theo EOL của file.
4. **CẤM** attribute trong mốc (C1). Mốc là định danh.
5. Người dùng **được phép** di chuyển trọn khối (cả hai mốc + ruột) tới vị trí khác trong file (M-7). Người dùng **KHÔNG được** sửa ruột khối — engine sẽ ghi đè ruột về `body` ở lần chạy sau (đây là hợp đồng "vùng máy quản lý", không phải sự cố).

## §2. LUẬT FAIL-CLOSED (Đ2) — BẤT BIẾN HÀNG ĐẦU

Với mỗi `id`, đếm số dòng `=== OPEN(id)` (`o`) và `=== CLOSE(id)` (`c`) trên toàn file:

| # | Trạng thái | Kết quả `findBlock` | Hành vi BẮT BUỘC |
| :-- | :--- | :--- | :--- |
| 0 | `o=0, c=0` | `null` | chưa có khối → nhánh migration (SPEC-P02) |
| 1 | `o=1, c=1, open < close` | `{open, close, inner}` | bình thường; `inner` có thể là `''` (mốc rỗng trong skeleton) |
| **H1** | `o=1, c=0` (thiếu mốc đóng) | `'malformed'` | **0 byte ghi cho khối này**; BRN-016 |
| **H2** | `o=0, c=1` (thiếu mốc mở) | `'malformed'` | như trên |
| **H3** | `o=1, c=1, close < open` (đóng trước mở) | `'malformed'` | như trên |
| **H4** | `o≥2` (≥2 mốc mở cùng id) | `'malformed'` | như trên |
| **H5** | `c≥2` (≥2 mốc đóng cùng id) | `'malformed'` | như trên |

**CẤM TUYỆT ĐỐI:** (a) diễn giải H1 là "khối kéo tới EOF"; (b) chọn "cặp đầu tiên" ở H4/H5; (c) tự sửa mốc; (d) để `malformed` của một `id` chặn việc xử lý các `id` khác. `findBlock` **không được có** bất kỳ nhánh nào trả về vùng khi `o !== 1 || c !== 1`.

Hệ quả cho caller: `patchAgentsMd` gom `id` hỏng vào `broken[]`, vẫn trả `content` đã vá cho các khối khác; `diagnose` phát BRN-016 `{malformed: [ids]}` (không fixable) ⇒ mã thoát 2 kể cả sau khi ghi thành công các khối khác.

## §3. KIỂU DỮ LIỆU

```ts
type Legacy = string | string[];
// string   : thân luật cũ, khớp NGUYÊN VĂN (indexOf).
// string[] : các ĐOẠN nguyên văn, ghép bằng đúng MỘT mẫu SemVer `\d+\.\d+\.\d+` giữa hai đoạn kề nhau
//            (thay cho "lỗ version"). KHÔNG ký tự sentinel (Đ7).

type RuleBlock = {
  id: string;        // kebab-case, duy nhất trong RULE_BLOCKS
  token: string;     // chuỗi mốc so hai hiến pháp (T-H02); BẮT BUỘC ⊂ body
  probe: string;     // chuỗi "có dấu vết luật này"; BẮT BUỘC ⊂ body; CHỈ để dò, KHÔNG định biên
  body: string;      // thân luật hiện hành, LF, KHÔNG có version, KHÔNG có newline đầu/cuối
  legacy: Legacy[];  // các thân luật cũ mà engine từng viết; rỗng với luật mới
};

type BlockState = 'ok' | 'stale' | 'legacy' | 'absent' | 'edited' | 'malformed';
type RuleState = {
  id: string;
  state: BlockState;
  extra: boolean;                                   // probe còn xuất hiện NGOÀI mọi khối hợp lệ (chỉ có nghĩa khi có khối)
  block?: { open: number; close: number; inner: string };   // khi state ∈ {ok, stale}
  span?:  { start: number; end: number };                   // chỉ số ký tự của đoạn legacy khớp, khi state = 'legacy'
};

type PatchResult = {
  content: string;                 // LF
  patches: string[];               // 'adopt:<id>' | 'sync:<id>' | 'add:<id>' — theo thứ tự RULE_BLOCKS
  broken: string[];                // id có state edited | malformed
  changed: boolean;                // patches.length > 0
};
```

Bảng trạng thái ⇄ điều kiện (định nghĩa DUY NHẤT, M-9):

| `state` | Điều kiện (đánh giá theo thứ tự) | BRN |
| :--- | :--- | :--- |
| `malformed` | `findBlock` = `'malformed'` | 016 |
| `ok` | có khối và `inner === body` | — (nếu `extra` ⇒ 003) |
| `stale` | có khối và `inner !== body` | 002 |
| `legacy` | không khối; `findLegacy(text, legacy)` khớp | 002 |
| `edited` | không khối; không legacy; `probe` xuất hiện trong `textOutsideBlocks` | 016 |
| `absent` | còn lại | 002 |

`textOutsideBlocks` = văn bản sau khi **cắt bỏ** mọi khối hợp lệ (từ dòng mở đến dòng đóng) của **mọi** `id` trong `RULE_BLOCKS`.

## §4. CHỮ KÝ HÀM THUẦN (không `fs`, `Date`, `console`, `process`)

```js
findBlock(lines: string[], id: string): null | 'malformed' | {open, close, inner}
findLegacy(text: string, legacy: Legacy[]): null | {start, end}     // khớp đầu tiên theo thứ tự legacy[]
escapeRe(s: string): string                                          // chỉ dùng trong findLegacy
classifyRuleBlocks(text: string): RuleState[]                        // đúng RULE_BLOCKS.length phần tử, cùng thứ tự
patchAgentsMd(content: string): PatchResult                          // THAY: bỏ tham số version (M-6)
renderFullAgentsMd(): string                                         // THAY: === patchAgentsMd(AGENTS_SKELETON).content
isArchiveName(name: string): boolean                                 // /^\d{4}-\d{2}-\d{2}\.md$/
```

Hằng số xuất khẩu thêm: `RULE_BLOCKS`, `AGENTS_SKELETON`, `APPENDIX_HEADING`, `OPEN`, `CLOSE`.

Ràng buộc chữ ký: `patchAgentsMd(content)` với `content` **đã LF**. Đầu ra LF. Caller (`computePlan`) truyền `f.text` và ghi bằng `f.eol` — không đổi so với #09.

Quy ước `String.replace`: giữ nguyên luật #09 (đối số 2 là hàm hoặc `''`). Trong lớp marker, ưu tiên `slice`/`concat` trên mảng dòng — không `replace`.

## §5. `RULE_BLOCKS` — 6 KHỐI (thứ tự cố định = thứ tự xử lý = thứ tự nối phụ lục)

| # | `id` | `token` (T-H02) | `probe` | Vị trí trong `AGENTS_SKELETON` | `legacy` |
| :-- | :--- | :--- | :--- | :--- | :--- |
| 1 | `boot` | `xay-dung-nao-bo` | `Bước 0 (Bắt buộc tiên quyết` | §1 mục 1 | `[BOOT_V130]` (dòng 315 engine v1.6.0, nguyên văn) |
| 2 | `cold-memory` | `Ký ức lạnh (Cold Memory)` | `` Ký ức lạnh (Cold Memory) — `memory/archive/` `` | §2, ngay SAU bảng, trước `---` | `[]` |
| 3 | `spec-package` | `SPEC PACKAGE` | `BẮT BUỘC DẠNG SPEC PACKAGE` | §3 mục 2 | `[SPEC_V130]` (dòng 350–367 engine v1.6.0) |
| 4 | `structural-extension` | `Structural Extension` | `Structural Extension` | §5.B sau khối bullet của mục 1, trước `### C.` | `[]` |
| 5 | `root-marker` | `Marker Phiên Bản Khung Não` | `NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não` | §5.G mục 3 | `[[RM_A, RM_B]]` — 2 đoạn quanh `brain4agent-v` **x.y.z** `.md` (dòng 440 / 524 engine v1.6.0) |
| 6 | `dual-entry` | `Dual Entry-Point Invariant` | `### J. Quy tắc Tương Thích Đa Agent` | §5.J (thân bắt đầu bằng chính dòng `### J.`) | `[DUAL_V130]` (dòng 446–453 engine v1.6.0) |

Nguyên văn `body` của cả 6 khối: SPEC-P03 §1. Bằng chứng `legacy` đủ phủ: lịch sử git engine (21 commit) chỉ có **1 biến thể** mỗi thân luật; fleet 65 repo 1.3.0: `spec-package` 64/65 nguyên văn, `dual-entry` 65/65, `root-marker` 65/65 (2 repo mang lỗ version `1.3.0`), `boot` 52/65 (SPEC-P02 §2).

**Ràng buộc trên bảng (test T-M19):** `id` duy nhất & khớp `RULE_ID_RE`; `token ⊂ body`; `probe ⊂ body`; `probe` **không** xuất hiện trong `AGENTS_SKELETON` ngoài các cặp mốc; `probe`/`token` **không** xuất hiện trong `APPENDIX_HEADING`; `body` không khớp `/\d+\.\d+\.\d+/`; `body` không bắt đầu/kết thúc bằng `\n`.

## §6. BẢNG MÃ `BRN` — thay đổi so với #09 §8

| Mã | Mức | Fixable | Điều kiện (theo `classifyRuleBlocks`) | `detail` | Ai kiểm |
| :-- | :-- | :-: | :--- | :--- | :-: |
| **BRN-002** (THAY) | error | ✔ | ∃ khối `state ∈ {absent, legacy, stale}` | `{absent: [id], adopt: [id], stale: [id]}` | E |
| **BRN-003** (THAY) | error | ✘ | ∃ khối `state ∈ {ok, stale}` và `extra === true`; **hoặc** văn bản chứa `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)` (khối planning cũ) | `{extra: [id], legacy_planning: boolean}` | E |
| **BRN-016** (MỚI, Đ6) | error | ✘ | ∃ khối `state ∈ {malformed, edited}` | `{malformed: [id], edited: [id]}` | E |
| **BRN-017** (MỚI, Đ6) | warning | ✘ | `brain4agent/memory/archive/` tồn tại và có mục **không** `isArchiveName` (bỏ qua `.gitkeep`) | `{files: [name]}` | E |

Thông điệp/`fix` bắt buộc (nguyên văn, để test so chuỗi):

- BRN-016 `title`: `AGENTS.md: khối marker hỏng hoặc vùng luật đã bị sửa tay`; `fix`: `Soi tay AGENTS.md: sửa cặp mốc (đúng 1 mở + 1 đóng, mỗi mốc trọn một dòng) hoặc xoá/bọc lại đoạn luật đã sửa, rồi chạy lại engine`.
- BRN-017 `title`: `memory/archive/ có file không theo mẫu YYYY-MM-DD.md`; `fix`: `Chuyển file lạ ra khỏi memory/archive/ hoặc đổi tên đúng mẫu`.

Không đổi: BRN-001, 004–013 (engine), 014–015 (doctor). Tổng **17 mã**; `Object.keys(BRN).length === 15` trong engine (013 + 016 + 017), `DOCTOR_BRN` 2 mã. **CẤM** thêm mã ngoài 016/017.

Hành vi caller theo mức (không đổi so với #09 §6): error/blocker fixable ⇒ đường ghi; error không fixable ⇒ exit **2** (cả `--check` lẫn sau ghi); warning không fixable ⇒ exit **1** ở `--check`, **0** ở đường ghi nếu mọi thứ khác hội tụ.

## §7. MÃ THOÁT — KHÔNG ĐỔI

`0` chuẩn/hội tụ · `1` lệch tự sửa được (`--check`/`--dry-run`) · `2` cần người (BRN-003/005/016 ở error; JSON hỏng; không hội tụ) · `3` script tự lỗi · `64` cờ sai. `--check` mặc định **KHÔNG** đổi ở CLI (TQ2).

Log AGENTS.md của `computePlan` (THAY bảng `AGENTS_PATCH_LOGS`): một dòng mỗi patch, định dạng cố định `🔄 AGENTS.md [<verb>:<id>]` với `verb ∈ {adopt, sync, add}`; khối `broken` không có dòng log riêng (đã có finding). Không đổi ⇒ `📄 Đã có sẵn: AGENTS.md (đầy đủ luật, giữ nguyên).`

## §8. PHIÊN BẢN — 3 TRỤC (không trộn)

| Trục | Trước | Sau | Nơi |
| :--- | :-- | :-- | :--- |
| Khung não | `1.3.0` | **`1.4.0`** | `BRAIN_TEMPLATE_VERSION`; `state.json.brain_template_version` (mọi repo); marker root `brain4agent-v1.4.0.md` |
| Engine | `1.6.0` | **`1.7.0`** | `ENGINE_VERSION`; `package.json.version`; `state.json.current_version` của hub |
| Dự án hub | `1.6.0` | **`1.7.0`** | trùng trục engine (hub là dự án của engine) |

`--version` in `brain-engine <trục dự án> template <trục khung não>`. Test `version-sync` giữ 3 nơi khớp. ✅ `README.md` đã sửa (lỗi lẫn hai trục version — README từng lấy version KHUNG NÃO làm version DỰ ÁN) và nay có test bánh cóc canh nó khớp `package.json`.

> **Luật viết cổng:** cổng hướng tới việc CHƯA làm thì **CẤM ghim số version cụ thể** — mỗi bản vá PATCH sẽ làm số đó rỗng nghĩa. Tham chiếu động tới `ENGINE_VERSION` của hub. (Đo thật 2026-09-04: hồ sơ này từng cùng lúc mang 3 số khác nhau — `1.7.0`, `1.7.1` — trong khi thực tế đã là `1.7.2`.)

## §9. `module.exports` — THAY ĐỔI

Thêm: `RULE_BLOCKS, AGENTS_SKELETON, APPENDIX_HEADING, OPEN, CLOSE, findBlock, findLegacy, classifyRuleBlocks, isArchiveName`. Bỏ: không (giữ `patchAgentsMd`, `renderFullAgentsMd`, đổi chữ ký như §4). `require()` vẫn không tác dụng phụ (A4).

## §10. BỐN TIÊU CHÍ NGHIỆM THU A1–A4 (Đ4) — định nghĩa đo được

| Mã | Phát biểu | Cách đo (máy kiểm) |
| :-- | :--- | :--- |
| **A1** idempotent | `P(P(T)) === P(T)` byte-identical; mã thoát lần 2 = 0 khi lần 1 = 0 | `sha256(AGENTS.md)` sau RUN2 = sau RUN3; áp cho mọi fixture, hub, mọi repo fleet sau ghi |
| **A2** không phá | số dòng bị XOÁ nằm **ngoài** vùng mốc = 0 | `tests/helpers/diff-scope.js` (SPEC-P05 §4): so `before`/`after` theo LCS dòng; mỗi dòng `-` phải thuộc một đoạn `legacy` đã `adopt` hoặc ruột khối `stale` |
| **A3** bao hàm (chính) | **mọi** dòng thay đổi là dòng mốc, hoặc nằm giữa một cặp mốc của `after`, hoặc thuộc phụ lục mới nối | cùng helper: mỗi dòng `+` phải ∈ {mốc, trong khối, sau `APPENDIX_HEADING` mới} |
| **A4** dry-run fleet | trước sóng ghi: tổng vi phạm A2/A3 trên toàn fleet = 0 và danh sách BRN-016 đã được người duyệt từng repo | `--dry-run` 100% repo, lưu output ở scratchpad; bảng đếm vào TESTING-ACCEPTANCE §5 |

## §11. VỆ SINH MÃ NGUỒN (Đ7)

- Engine + doctor: 0 byte trong `[0x00–0x08, 0x0B–0x1F, 0x7F]` (test T-M22). Lỗ version chỉ tồn tại dưới dạng `string[]` (§3).
- Lớp marker: 0 literal regex ngoài `SEMVER_HOLE = '\\d+\\.\\d+\\.\\d+'` dùng trong `findLegacy` (grep T-M21: trong đoạn từ `const OPEN` đến hết `patchAgentsMd`, số dấu `/…/` literal regex = 0).
