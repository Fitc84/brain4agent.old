# SPEC-P05 — Lưới test: viết lại, chụp lại fixture, golden sau cùng, chống ba "xanh giả" (WP4)

Hợp đồng: 01-CONTRACTS §10; Đ8. Baseline: **193 test xanh** (`npm test`, node v24.15.0, 2026-09-02). Mọi thay đổi expectation dưới đây có lý do ghi tại chỗ — **CẤM** sửa test "cho tiện".

## §1. Thứ tự BẮT BUỘC trong WP4 (và WP1) — Đ8.3

```
1. (WP1) Xoá tests/unit/patch-agents.test.js (T-U10..T-U15). Chạy npm test ⇒ ghi lại số đỏ (bằng chứng cơ chế cũ thật sự bị gỡ — Đ8.2, R1 rủi ro #2).
2. (WP1) Viết tests/unit/marker.test.js T-M01..T-M24 với INPUT VIẾT TAY (chuỗi trong file test). Xanh.
3. (WP2, WP3) Nội dung + diagnose. Test đơn vị diagnose xanh.
4. (WP4) Chụp lại fixture BẰNG TAY (§2). Viết lại test CLI (§3). Xanh.
5. (WP4) CHỈ SAU 1–4: chụp golden từng case (§5), đọc diff bằng mắt, ghi engine_commit.
6. Orchestrator dựng bộ so sánh độc lập (không dùng fixture/golden của agent) trước khi duyệt P04.
```

## §2. Fixture — chụp lại có chủ đích (`tests/fixtures/** -text`: sửa **bằng tay**, giữ byte; CẤM chạy engine ghi lên fixture)

| Fixture | Hiện trạng (đo) | Trạng thái mới | Việc làm | Lý do |
| :--- | :--- | :-- | :--- | :--- |
| `F02-standard-lf` | 39 dòng tổng hợp, **chỉ token**, không thân luật nguyên văn | **S2** | `AGENTS.md` = `renderFullAgentsMd()` v1.7.0 **cộng** một đoạn văn riêng (giữ tính "repo có nội dung riêng"); đổi tên marker `v1.4.0.md`; `state.json` `1.4.0` | Dưới thuật toán mới, bản cũ = 4 × BRN-016 ⇒ mất ý nghĩa "đã chuẩn" |
| `F03-legacy-v120` | AGENTS 38 dòng, marker `1.2.0` | giữ, **thêm** dòng root-marker nguyên văn cũ với `v1.2.0` | kiểm `adopt` qua lỗ version | T-C35 |
| `F04-old-planning-block` | khối planning cũ, không `SPEC PACKAGE` | giữ nguyên văn bản | golden mới: `add:spec-package` + BRN-003 `legacy_planning` ⇒ **exit 2** | TQ5: engine không gỡ; hành vi mới là đúng theo Đ3 |
| `F05-crlf-agents` | CRLF thật | giữ CRLF; thêm 4 thân luật nguyên văn v1.3.0 (CRLF) | T-C34: 100% CRLF sau ghi, 12 dòng mốc, idempotent | R2 R5 |
| `F06-duplicate-law` | token ×3 | **S2 + bản thừa**: khối `dual-entry` đúng + một bản chép `### J. Quy tắc Tương Thích Đa Agent…` ngoài khối | BRN-003 `extra=['dual-entry']`, exit 2 | TQ4 |
| `F07-bom-state` | BOM | không đổi AGENTS; test literal `1.3.0` → `1.4.0` (`read-only.test.js:73`) | | R1 §4 #4 |
| `F08-dollar-agents` | thiếu marker + J, có mẫu `$` | giữ mẫu `$`; nay là S1 với 2 khối vắng | T-C12 giữ: 4 mẫu `$` nguyên văn sau ghi | D3 vẫn được bảo vệ (lớp marker không `replace`) |
| **`F09-legacy-v130`** (MỚI) | — | **S1** | `AGENTS.md` = `git show dd7967e:…init_brain.js` → `renderFullAgentsMd()` v1.6.0 (không mốc) + 3 đoạn văn riêng + 1 bảng riêng + 1 khối ``` chứa dòng giả `<!-- brain:rule:boot -->` thụt lề; marker `1.3.0`; `state.json` `1.3.0` | **oracle migration** — sinh từ engine CŨ, không phải engine đang sửa |
| **`F10-user-edited`** (MỚI) | — | **S4** | như F09 nhưng câu 1 của luật J thêm `(ghi chú riêng)` | BRN-016 `edited` |
| `fleet/00-chuan` | như F02 | S2 | như F02 | doctor CLEAN |
| `fleet/01-nhan-doi-luat` | token cũ + khối cũ | S2 + khối planning cũ | BRN-003 `legacy_planning` ⇒ ERROR | giữ mục đích "doctor exit 2" |
| **`fleet/03-moc-hong`** (MỚI) | — | S5 (H1) | S2 rồi xoá dòng `<!-- /brain:rule:dual-entry -->` | BRN-016 `malformed` |

Ràng buộc chung: đổi tên marker + `state.json` **cùng lúc** (I1); `tests/hygiene/ci-fixture-exists.test.js` cập nhật kỳ vọng `01-nhan-doi-luat` (chuỗi khối cũ vẫn phải có); `-known-gotchas` cũ về F05 giữ nguyên.

## §3. Test đổi/thêm — bảng đầy đủ (ID trong TESTING-ACCEPTANCE §1)

| File | Việc | Lý do |
| :--- | :--- | :--- |
| `tests/unit/patch-agents.test.js` | **XOÁ** (T-U10–T-U15 khẳng định hành vi bị khai tử) | Đ8.2 |
| `tests/unit/marker.test.js` | **MỚI** T-M01–T-M24 | SPEC-P01 (d) |
| `tests/unit/plan.test.js` T-U32 | premise "cắt file tại `### J.`" → dùng F09 rút gọn (S1) để ép sinh op AGENTS | dò chuỗi con không còn là cách phát hiện thiếu luật |
| `tests/unit/diagnose.test.js` | T-U22 dùng snapshot F02 mới; thêm T-U-D01..D04 (002 absent/adopt/stale, 003 extra, 016 malformed/edited, 017); T-U27 (token ×3) → viết lại thành BRN-003 `extra`; T-U28 (`SPEC PACKAGE` trong code block) → **đảo kỳ vọng**: nay mốc trong ``` **không** được nhận (M-1) | ghi nhận hành vi mới thay hành vi cũ đã "khẳng định để không ai sửa lặng lẽ" |
| `tests/cli/exit-codes.test.js:148`, `tests/hygiene/version-sync.test.js:54` (+message "đợt #10"), `tests/cli/read-only.test.js:73` | literal `1.3.0` → `1.4.0` | R1 §1 |
| comment lạc hậu: `d7-standard-check.test.js:33`, `diagnose.test.js:46`, `fleet.test.js:218` | sửa chữ | không đỏ, nhưng sai sự thật |
| `tests/cli/*.test.js` | thêm T-C30–T-C37 | SPEC-P02 §7, SPEC-P04 §5 |
| `tests/hygiene/two-constitutions.test.js` | `LAW_TOKENS = engine.RULE_BLOCKS.map(b => b.token)`; T-H02d: với mỗi khối, `findBlock(hubLines, id).inner === body` và `patchAgentsMd(hub).changed === false`; **T-H02e** (bánh cóc): `RULE_BLOCKS.length === 6` với thông điệp "thêm luật ⇒ cập nhật CORE + số này" | Đ8.1 |
| `tests/hygiene/no-abs-path.test.js` | đọc `tests/hygiene/abs-path-allowlist.json` (SPEC-P06) | Đ9 |
| `tests/hygiene/eol-bom.test.js` | thêm **T-M22** (0 byte điều khiển trong engine + doctor) | Đ7 |
| `tests/doctor/fleet.test.js` | T-R20 (`03-moc-hong` ⇒ BRN-016), T-R21 (JSON có 016/017) | SPEC-P04 §2 |
| `tests/golden.test.js` | không đổi mã; manifest chụp lại | §5 |

## §4. Bộ so sánh A2/A3 — `tests/helpers/diff-scope.js` (MỚI, ≤ 60 dòng, 0 dependency)

```js
// diffScope(before: string, after: string, ids: string[]) → { deletedOutside: string[], addedOutside: string[] }
```
- Tính LCS theo dòng (O(n·m), n,m ≤ 600 — đủ cho AGENTS.md).
- Dòng `-` hợp lệ ⇔ thuộc một đoạn `legacy` khớp trong `before` (dùng `engine.findLegacy`) hoặc nằm trong khối hợp lệ của `before` (S3).
- Dòng `+` hợp lệ ⇔ là mốc, hoặc nằm giữa cặp mốc trong `after`, hoặc đứng sau dòng `APPENDIX_HEADING` **mới** (không có trong `before`), hoặc là dòng `---`/trống ngay trước tiêu đề đó.
- Dùng bởi T-M25 (F09), T-C30, và kịch bản `--dry-run` fleet (OPERATIONS §5 — chạy trên bản sao trong scratchpad, không ghi repo).

## §5. Golden — quy trình chụp lại (KHÔNG tin agent tự khai)

1. Điều kiện: bước §1.1–§1.4 xong; `npm test` xanh **trừ** `golden.test.js`.
2. `git diff --stat` engine rỗng so với HEAD (chụp từ bản đã commit, không từ cây bẩn).
3. `npm run golden:make -- --case <tên>` **từng case**: F01, F02, F03, F04, F06, **F09**, **F10** (7 case; F05/F07/F08 vẫn ngoài golden như #09).
4. Sau mỗi case: `git diff tests/golden/manifest.json` — đọc: (a) `exit_code` khớp bảng SPEC-P02 §3 (F04 = 2, F10 = 2, còn lại 0); (b) file `brain4agent-v1.4.0.md` xuất hiện, `v1.3.0.md` biến mất; (c) `AGENTS.md` sha đổi ở mọi case (mốc).
5. `engine_commit`/`engine_sha256` = HEAD thật (`git rev-parse HEAD`, sha256 file) — kiểm tay.
6. Orchestrator: `git show <engine_commit>:…` sinh lại F01 output độc lập, so sha với manifest.

**CẤM** `npm run golden:make` không tham số `--case`. **CẤM** chụp lại lần hai để "sửa" — lệch nghĩa là hành vi đổi, quay lại §1.

## §6. Ba rủi ro xanh giả — luật chốt (Đ8)

| Rủi ro | Luật | Test canh |
| :--- | :--- | :--- |
| `LAW_TOKENS` tĩnh | token đọc từ engine; bánh cóc `RULE_BLOCKS.length === 6`; T-H02d so `inner === body` 6/6 | T-H02, T-H02d, T-H02e |
| Dual-path | grep engine: 0 `PHỤ LỤC TỰ ĐỘNG VÁ`, 0 `RULE_ANCHORS`, 0 `AGENTS_PATCH_LOGS`, 0 `### G\\.`; `patch-agents.test.js` không tồn tại | T-H07 mở rộng |
| Golden hợp thức hoá bug | F09 sinh từ engine **cũ**; T-M24 oracle viết tay; golden chụp sau cùng, từng case | T-M24, T-G02 (`engine_commit` = HEAD) |

## §7. Bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng |
| :--- | :--- |
| Lượt chạy sau bước §1.1 | ≥ 7 test đỏ (6 T-U10–15 + T-H02d) — ghi số thật vào `plan.md` |
| `npm test` cuối WP4 | 0 fail, 0 skip, tổng ≥ **215** (193 − 6 + ≥ 28 mới) |
| Golden | 7 case × ≥ 12 file; `exit_code` đúng bảng |
| Fixture byte | F05 vẫn CRLF thật (T-H06c); F07 vẫn BOM |
| `diff-scope` trên F09 | `deletedOutside = []`, `addedOutside = []` |
