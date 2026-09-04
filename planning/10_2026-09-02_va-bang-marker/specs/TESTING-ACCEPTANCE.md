# TESTING-ACCEPTANCE — Ma Trận Test, 5 Dạng Hỏng, A1–A4, G1–G3, Exit Gates (#10)

Quy ước: `BRAIN_NOW=2026-01-15T03:04:05.000Z`. Tên test trong code **bắt buộc** bắt đầu bằng ID (vd `'T-M03 · H1: …'`) để grep độ phủ. Cột **Bảo vệ** trỏ tới bất biến M-x (00-ARCHITECTURE §4), luật §2 của 01-CONTRACTS (H1–H5), tiêu chí A1–A4, mã BRN.

---

## §1. MA TRẬN TEST

### 1.1 `tests/unit/marker.test.js` — hàm thuần, **input viết tay** (không fixture, không golden)

| ID | Tên | Đầu vào | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-M01 | `findBlock` chưa có | 5 dòng không mốc | `null` | §2 dòng 0 |
| T-M02 | `findBlock` bình thường + ruột rỗng | `OPEN`,`x`,`CLOSE` / `OPEN`,`CLOSE` liền nhau | `{open:0,close:2,inner:'x'}` / `inner === ''` | §2 dòng 1, M-5 |
| **T-M03** | **H1** thiếu đóng | `OPEN`, `a`, `b` | `'malformed'`; `patchAgentsMd` giữ nguyên 3 dòng đó; `broken=[id]`; khối khác trong cùng input vẫn được vá | **M-2, C3** |
| **T-M04** | **H2** thiếu mở | `a`, `CLOSE` | như trên | M-2 |
| **T-M05** | **H3** đóng trước mở | `CLOSE`, `a`, `OPEN` | như trên | M-2 |
| **T-M06** | **H4** 2 mở | `OPEN`,`a`,`CLOSE`,`OPEN`,`b`,`CLOSE` | `'malformed'` — **không** chọn cặp đầu | M-2, C3 |
| **T-M07** | **H5** 2 đóng | `OPEN`,`a`,`CLOSE`,`CLOSE` | như trên | M-2 |
| T-M08 | mốc phải trọn dòng | `'  ' + OPEN` (thụt lề); OPEN nằm trong ```` ``` ```` block; `OPEN + ' '` | cả ba → `null` (không thấy) | **M-1** |
| T-M09 | `findLegacy` chuỗi | text chứa body cũ ở giữa | `{start,end}` đúng cột 0 và cuối dòng | M-3 |
| T-M10 | `findLegacy` mảng đoạn (lỗ SemVer) | `['ab v', ' cd']` trên `'ab v1.2.0 cd'` / `'ab v1.3.0 cd'` / `'ab vX cd'` | khớp / khớp / `null` | Đ7, C5 |
| T-M11 | `classifyRuleBlocks` 6 trạng thái | 6 input tối thiểu (ok, stale, legacy, absent, edited, malformed) + 1 input `ok` với probe ngoài khối | `state` đúng; `extra=true` chỉ ở ca cuối | M-9, TQ4 |
| T-M12 | `adopt` tại chỗ | văn bản riêng + thân cũ nguyên văn + văn bản riêng | mốc bọc đúng đoạn; phần ngoài **byte-identical**; `patches=['adopt:<id>']` | M-3, A3 |
| T-M13 | `sync` độc lập vị trí | khối `stale` đặt ở đầu file / cuối file / giữa bảng-không-phải-của-khối | ruột = body; phần ngoài không đổi | **M-7** |
| T-M14 | `add` phụ lục | absent ×2; lần 2 thêm absent ×1 nữa vào output lần 1 | 1 tiêu đề `APPENDIX_HEADING` duy nhất; thứ tự khối = thứ tự `RULE_BLOCKS` | SPEC-P01 a.4 |
| T-M15 | `edited` không chèn | thân cũ sửa 1 chữ | `content === input`, `broken=[id]`, `patches=[]` | **M-4, Đ3** |
| T-M16 | hỏng một khối, vá khối khác | H1 ở `dual-entry` + `legacy` ở `boot` | `patches=['adopt:boot']`, `broken=['dual-entry']`; vùng `dual-entry` byte-identical | M-2 |
| T-M17 | idempotent | mọi input của T-M12–T-M16 + F02/F03/F04/F05/F06/F08/F09/F10/fleet/00/fleet/01/hub | `P(P(x)) ≡ P(x)` byte; `patches` lần 2 = `[]`; `broken` không đổi | **A1** |
| T-M18 | skeleton = template | — | `AGENTS_SKELETON` có đúng 6 cặp `OPEN`,`CLOSE` liền nhau; `renderFullAgentsMd()` có 0 cặp rỗng, 6 khối `ok`, `patchAgentsMd(render).changed === false` | **M-5** |
| T-M19 | ràng buộc `RULE_BLOCKS` | — | `length===6`; id duy nhất & `RULE_ID_RE`; `token ⊂ body`; `probe ⊂ body`; probe ∉ skeleton-ngoài-mốc; probe/token ∉ `APPENDIX_HEADING`; body không `^\n`/`\n$` | C6, §5 |
| T-M20 | body không version | — | `/\d+\.\d+\.\d+/.test(body) === false` ×6 | **M-6** |
| T-M21 | 0 regex trong lớp vá | đọc mã nguồn engine từ `const OPEN` đến hết `patchAgentsMd` | số literal `/…/` = 0; `new RegExp` = 1 (trong `findLegacy`) | C5 |
| T-M22 | 0 byte điều khiển | buffer engine + doctor | 0 byte ∈ `[0x00–0x08,0x0B–0x1F,0x7F]` | **M-10, Đ7** |
| T-M23 | CRLF end-to-end thuần | `normalizeEol(crlfText)` → patch → `restoreEol(...,'crlf')` | 0 `\n` không kèm `\r`; mốc là dòng CRLF | R5 |
| **T-M24** | **oracle viết tay** | input S1 ≈ 25 dòng (4 thân cũ, văn bản riêng, 1 bảng, 1 ``` chứa dòng giả `<!-- brain:rule:boot -->` thụt lề) | `content === EXPECTED` (chuỗi viết tay trong test, **không** sinh từ engine) | **Đ8.3**, M-1, M-3 |
| T-M25 | `diff-scope` trên F09 | before/after | `deletedOutside=[]`, `addedOutside=[]` | **A2, A3** |

### 1.2 `tests/unit/diagnose.test.js` — bổ sung

| ID | Đầu vào | Kỳ vọng |
| :-- | :--- | :--- |
| T-U-D01 | snapshot AGENTS S1 | BRN-002 `detail.adopt` = 4 id, `absent` = 2 id, fixable |
| T-U-D02 | S2 + bản thừa J ngoài khối | BRN-003 `extra=['dual-entry']`, `fixable=false` |
| T-U-D03 | H1 ở `spec-package` + `edited` ở `boot` | BRN-016 `{malformed:['spec-package'], edited:['boot']}`, không fixable, `isStandard=false` |
| T-U-D04 | `archiveEntries=['2026-09-02.md','.gitkeep','notes.txt','2026-09.md']` | BRN-017 `files=['notes.txt','2026-09.md']`, warning; `archiveEntries=null` ⇒ không BRN-017/009 |
| T-U28 (đảo) | `SPEC PACKAGE` chỉ trong code block | BRN-002 `absent` chứa `spec-package` (mốc trong ``` là vô hình) |

### 1.3 `tests/cli/` — hộp đen

| ID | Fixture / lệnh | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- |
| T-C30 | **F09** ghi | exit 0; `patches` đúng thứ tự SPEC-P02 §7; RUN2 exit 0 + `NÃO ĐÃ OK` + sha `AGENTS.md` không đổi; `diff-scope` = 0/0; `memory/archive/` được tạo; marker `v1.4.0.md`, `v1.3.0.md` mất | A1–A3, TQ6 |
| T-C31 | **F10** `--check` rồi ghi | `--check`: exit 2, stdout có `BRN-016`, cây không đổi. Ghi: exit 2; khối `dual-entry` byte-identical; các khối khác đã bọc | Đ3, M-4 |
| T-C32 | F02 (S2) `--check` | exit 0, `NÃO ĐÃ OK` | S2 |
| T-C33 | F04 ghi | exit 2; `add:spec-package` đã ghi; BRN-003 `legacy_planning` | TQ5 |
| T-C34 | F05 (CRLF) ghi | exit 0; 100% CRLF; 12 dòng mốc; RUN2 sha không đổi | R5, A1 |
| T-C35 | F03 (1.2.0) ghi | `adopt:root-marker` qua lỗ version; ruột không còn `v1.2.0` | Đ7 |
| T-C36 | F01 ghi | cây có `brain4agent/memory/archive/` (rỗng, không `.gitkeep`) | TQ6, C13 |
| T-C37 | F02 + file `memory/archive/x.txt` `--check` | exit 1 (warning), BRN-017; ghi ⇒ exit 0, file vẫn còn | BRN-017 |
| T-C10 (sửa) | `--version` | `brain-engine ${ENGINE_VERSION} template ${BRAIN_TEMPLATE_VERSION}\n` — test đọc hằng số từ engine, KHÔNG ghim số | §8 |

### 1.4 `tests/hygiene/`

| ID | Kỳ vọng |
| :-- | :--- |
| T-H02 | 7 token từ `engine.RULE_BLOCKS[].token`: AGENTS ×n = CORE ×n, n ≥ 1 |
| T-H02b | mỗi token ×1 mỗi file; không `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)` |
| T-H02d | với mỗi khối: `findBlock(hubLines,id).inner === body`; `patchAgentsMd(hub).changed===false`; `broken=[]`; 0 `extra` |
| **T-H02e** | bánh cóc `RULE_BLOCKS.length === 6` (thông điệp: "thêm luật ⇒ sửa CORE + số này + SPEC") |
| T-H05 / T-H05b / **T-H05f** | allowlist từ JSON; không mục chết; `ci.yml` tham chiếu JSON và không còn `'scripts/deploy_skills.ps1':` |
| T-H07 (mở rộng) | engine: 0 `PHỤ LỤC TỰ ĐỘNG VÁ`, 0 `RULE_ANCHORS`, 0 `AGENTS_PATCH_LOGS`, 0 `### G\\.`; `tests/unit/patch-agents.test.js` không tồn tại |
| T-H03 | trục dự án khớp ×3 (`ENGINE_VERSION` · `package.json` · `state.json.current_version`) + template `1.4.0` |
| T-H09 | `index.md` không còn `brain4agent-v1.3.0.md`; `README.md` không còn `v1.4.0)` ở tiêu đề |

### 1.5 `tests/doctor/`

| ID | Kỳ vọng |
| :-- | :--- |
| T-R20 | fleet fixture: `03-moc-hong` = ERROR {BRN-016}; `01-nhan-doi-luat` = ERROR {BRN-003}; `00-chuan` CLEAN; exit 2 |
| T-R21 | `--json`: findings có `code` ∈ {BRN-016} với `detail.malformed=['dual-entry']`; schema #09 §7 pass |
| T-R16 | doctor vẫn 0 lệnh ghi (grep) |

## §2. ĐỘ PHỦ 5 DẠNG HỎNG (Đ2) — bắt buộc 5/5, mỗi dạng ≥ 2 tầng

| Dạng | Đơn vị | Hộp đen / doctor | Bằng chứng "test có răng" |
| :-- | :--- | :--- | :--- |
| H1 thiếu đóng | T-M03 | T-R20, T-U-D03 | thay tạm `findBlock` bằng bản "mở → EOF" ⇒ T-M03 **phải đỏ** (ghi output vào `plan.md`) |
| H2 thiếu mở | T-M04 | T-U-D03 (biến thể) | như trên với "đóng → BOF" |
| H3 đóng trước mở | T-M05 | — | bản "swap nếu ngược" ⇒ đỏ |
| H4 ≥2 mở | T-M06 | T-U-D03 (biến thể) | bản "lấy cặp đầu" ⇒ đỏ |
| H5 ≥2 đóng | T-M07 | — | bản "lấy đóng đầu" ⇒ đỏ |

## §3. ĐỘ PHỦ BẤT BIẾN M-1..M-10

| ID | Test |
| :-- | :--- |
| M-1 | T-M08, T-M24, T-U28 |
| M-2 | T-M03–07, T-M16, T-U-D03 |
| M-3 | T-M09, T-M12, T-M24 |
| M-4 | T-M15, T-C31 |
| M-5 | T-M18 |
| M-6 | T-M20 |
| M-7 | T-M13 |
| M-8 | T-H02e; G3 (đo) |
| M-9 | T-M11 + grep `includes('SPEC PACKAGE')` = 0 ngoài `RULE_BLOCKS` |
| M-10 | T-M22 |

A1: T-M17, T-C30, T-C34, sóng rollout 5.1.4 · A2/A3: T-M25, T-C30, sóng 0 · A4: OPERATIONS §5 sóng 0.

## §4. BA GATE CHỐNG OVERENGINEERING (Đ5) — định nghĩa đo

**G1 — lõi vá teo ≥ 25%.**
- *Trước* (đo 2026-09-02, engine `dd7967e`): `AGENTS_PATCH_LOGS` 459–465 = **7**; `patchAgentsMd` 508–613 = **106**; chú thích + `RULE_ANCHORS` + vòng đếm 746–769 = **24**; thân luật lặp trong `renderFullAgentsMd`: 315 (1) + 350–367 (18) + 440 (1) + 446–453 (8) = **28**. **Tổng 165.**
- *Sau* = tổng dòng của: `OPEN`, `CLOSE`, `escapeRe`, `SEMVER_HOLE`, `findBlock`, `findLegacy`, `classifyRuleBlocks`, `patchAgentsMd`, `APPENDIX_HEADING`, **`RULE_BLOCKS` kể cả 4 thân luật cũ và 2 `legacy`** (`BOOT_V130`, `RM_A/RM_B`; `SPEC_V130`/`DUAL_V130` trùng body nên không đếm hai lần), nhánh AGENTS trong `diagnose` (thay 734–769). **Không** tính 2 thân luật mới + 2 phần tử `RULE_BLOCKS` của chúng (đo ở G3), không tính 12 dòng mốc rỗng trong skeleton (là template).
- Ngưỡng: **≤ 123**. Cách đo: đánh dấu 2 dòng chú thích `// [G1-BEGIN]` / `// [G1-END]` quanh từng vùng (được phép, không tính vào số) và `awk` đếm.

**G2 — trần tuyệt đối:** `wc -l init_brain.js` ≤ **1472**. Ước lượng [Mô hình]: 1447 − 165 + ~117 (G1 sau) + ~13 (G3) + ~12 (mốc rỗng skeleton) + ~7 (archive + BRN 016/017 + snapshot) ≈ **1431**.

**G3 — chi phí luật thứ 7:** dòng engine thật sự tốn cho `cold-memory` + `structural-extension` = 2 phần tử `RULE_BLOCKS` + 2 thân + 2 cặp mốc skeleton ≤ **20** (≤ 10/luật). Không tính dòng ở CORE/AGENTS hub (không phải engine).

**Vượt bất kỳ gate nào ⇒ DỪNG, ghi số vào `plan.md` §4, báo orchestrator. KHÔNG tự nới.**

## §5. BẰNG CHỨNG THẬT PHẢI ĐIỀN (chỉ số đếm — không tên repo, không đường dẫn)

| Mục | Giá trị | Nguồn |
| :--- | :--- | :--- |
| Số test đỏ ngay sau khi xoá `patch-agents.test.js` (H2) | `__` (kỳ vọng ≥ 7) | SPEC-P05 §1.1 |
| `npm test` cuối WP4: pass/fail/skip | `___/0/0` (≥ 215) | |
| Golden: `engine_commit` / số case / số file | `________` / 7 / `__` | T-G02 |
| Output khi thay `findBlock` bằng bản "mở → EOF" | T-M03 đỏ (dán 2 dòng) | §2 |
| G1 trước/sau · G2 · G3 | `165/___` · `___` · `___` | §4 |
| `deploy:verify` trước / sau D5 | `exit 2 …` → `diff=0 missing=0 cmd=ok` | OPERATIONS §4 |
| `--version` từ global | khớp ĐÚNG `--version` của hub; template `1.4.0` | D6 |
| Doctor chỉ đọc sau deploy, trước rollout: candidates/clean/warning/error/blocker/skipped/duration_ms | `70/__/__/__/__/2/____` (kỳ vọng 65 ERROR fixable + 5 có BRN-016) | D7 |
| Sóng 0 `--dry-run`: S1 / S1' / S4 / vi phạm A2 / A3 | `49/9/5/0/0` kỳ vọng | OPERATIONS §5 |
| Mỗi sóng 1–5: ghi / bỏ qua bẩn / BRN-016 xử tay / A1 lỗi | `__/__/__/0` | |
| Doctor sau rollout: clean/error | `__/__` (kỳ vọng ≥ 63 clean; 2 ngoại lệ) | |
| CI run id ubuntu / windows; cảnh báo Node 20 | `____` / `____` / 0 | SPEC-P06 §2 |

## §6. EXIT GATES — theo môi trường (đóng khi **mọi ô bắt buộc** ✅; cột `fleet` có thể ⏸ theo OPERATIONS §7)

| # | Gate | local | CI | máy thật (global) | fleet |
| :-- | :--- | :-: | :-: | :-: | :-: |
| X01 | 5/5 dạng hỏng có test (T-M03–07) **và** mỗi dạng đã chứng minh "có răng" (§2) | ⬜ | ⬜ | — | — |
| X02 | Oracle viết tay T-M24 xanh; F09 sinh từ engine v1.6.0 (`git show dd7967e`) | ⬜ | ⬜ | — | — |
| X03 | A1 trên mọi fixture + hub (T-M17, T-C30, T-C34) | ⬜ | ⬜ | — | ⬜ |
| X04 | A2/A3 = 0 trên F09 (T-M25) | ⬜ | ⬜ | — | ⬜ (sóng 0) |
| X05 | `renderFullAgentsMd() === patchAgentsMd(AGENTS_SKELETON).content`; 0 cặp mốc rỗng trong output (T-M18) | ⬜ | ⬜ | — | — |
| X06 | Hub S2: `changed===false`, 6/6 `inner===body`, `--check .` = 0 (T-H02d, self-check) | ⬜ | ⬜ | ⬜ (từ global) | — |
| X07 | Hai hiến pháp: 7 token khớp, ×1 (T-H02/b); bánh cóc 6 khối (T-H02e) | ⬜ | ⬜ | — | — |
| X08 | Cơ chế cũ đã gỡ: grep 0 ×4 chuỗi; `patch-agents.test.js` không tồn tại; lượt đỏ H2 đã ghi | ⬜ | ⬜ | — | — |
| X09 | BRN-002/003/016/017 mỗi mã ≥ 1 test đơn vị + 1 hộp đen; `Object.keys(BRN).length===15` | ⬜ | ⬜ | — | — |
| X10 | Golden 7 case chụp **sau** X01–X09, từng case, `engine_commit` = HEAD (H3 duyệt) | ⬜ | ⬜ | — | — |
| X11 | Fixture byte: F05 CRLF thật, F07 BOM thật (T-H06c) | ⬜ | ⬜ | — | — |
| X12 | Vệ sinh: 0 byte điều khiển (T-M22); 0 regex lớp vá (T-M21); A9 không đường dẫn/tên repo trong file mới (T-H05) | ⬜ | ⬜ | — | — |
| X13 | **G1 ≤ 123 · G2 ≤ 1472 · G3 ≤ 20** — số ghi vào `plan.md` §4 | ⬜ | — | — | — |
| X14 | `npm test` 0 fail 0 skip, ≥ 215 ca | ⬜ | ⬜ (2 OS) | — | — |
| X15 | Version 3 trục khớp nhau, template `1.4.0`; `--version` đúng | ⬜ | ⬜ | ⬜ | — |
| X16 | Allowlist một nguồn (T-H05f); actions v5, 0 cảnh báo Node 20 | ⬜ | ⬜ | — | — |
| X17 | Deploy: `deploy:verify` = 0; hash tay khớp; file lệnh không BOM | — | — | ⬜ | — |
| X18 | Doctor chỉ đọc từ global: 5 BRN-016 đúng dự báo; ≤ 40 s; 0 ghi | — | — | ⬜ | — |
| X19 | Sóng 0 dry-run: phân bố khớp SPEC-P02 §2; A2/A3 = 0 toàn fleet | — | — | — | ⬜ |
| X20 | Sóng 1–5: mỗi repo A1 tại chỗ; doctor sau ≥ 63 CLEAN; 0 repo bẩn bị ghi | — | — | — | ⬜ |
| X21 | Sync Cascade 6 điểm + docs + gotchas (OPERATIONS §7) | ⬜ | — | — | — |
| X22 | Không push / không ghi repo ngoài hub-fixture khi user chưa ra lệnh — kiểm `today.md` + `git status` các repo vệ tinh không có commit mới ngoài sóng đã lệnh | ⬜ | — | — | ⬜ |
