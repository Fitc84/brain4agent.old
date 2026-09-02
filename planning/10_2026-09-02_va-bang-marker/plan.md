# KẾ HOẠCH #10: VÁ TẤT ĐỊNH BẰNG KHỐI ĐÁNH DẤU ẨN + KHUNG NÃO v1.4.0 (#10)

- **STT KẾ HOẠCH:** #10
- **TRẠNG THÁI:** 🔄 ĐANG THỰC THI
- **THỜI GIAN BẮT ĐẦU:** 2026-09-02 (lập bộ SPEC)
- **THỜI GIAN HOÀN TẤT:** —
- **PHIÊN BẢN MỤC TIÊU (3 trục, KHÔNG trộn):** `BRAIN_TEMPLATE_VERSION` **1.3.0 → 1.4.0** · `ENGINE_VERSION` **1.6.0 → 1.7.0** · version DỰ ÁN hub **1.6.0 → 1.7.0** (`MINOR`)
- **LOẠI GÓI:** SPEC PACKAGE đầy đủ theo `AGENTS.md` §3 mục 2 (bắt buộc vì `MINOR` + đụng cơ chế lõi + kéo theo đợt ghi 66 repo)
- **PHẠM VI MỘT CÂU:** engine ngừng *đoán* vị trí luật bằng regex trên văn xuôi; thay bằng **6 khối marker** `<!-- brain:rule:<id> -->` mà nó tự quản, **fail-closed** khi mốc hỏng, **không ghi đè** văn bản người dùng; đồng thời đưa 2 luật v1.4.0 (Ký ức Lạnh, Structural Extension) vào khung.

> File này là **HỒ SƠ**. Thiết kế nằm trong `specs/`. Theo `AGENTS.md` §3 mục 2.3, **CẤM** nhét thiết kế vào đây.

---

## 🧾 1. Nhật Ký Quyết Định (có mốc thời gian)

Đ1–Đ10 là quyết định orchestrator đã chốt trước khi viết SPEC (không lật lại). TQ1–TQ8 là quyết định SPEC-writer tự chốt trong phạm vi được uỷ quyền — **user có thể muốn đổi**, đã đánh dấu ⚠️.

| Thời điểm | Quyết định | Lý do |
| :--- | :--- | :--- |
| 09-02 19:27 | **Đ1** — cú pháp `<!-- brain:rule:<id> -->`, id kebab-case, mốc trọn dòng, so khớp theo DÒNG sau `normalizeEol`; **không nhúng version**; **6 khối nhỏ** | Version trong mốc = nguồn chân lý thứ ba, rewrite toàn fleet mỗi lần bump. Bảng §2 của hub đã đo khác template ⇒ bọc cả file xoá tuỳ biến 66 repo. |
| 09-02 19:27 | **Đ2** — **fail-closed là bất biến hàng đầu**: mốc lẻ / đóng-trước-mở / ≥2 mốc cùng id ⇒ `malformed` ⇒ không ghi byte nào cho khối đó, BRN-016. **CẤM** diễn giải "mở → EOF" | Kịch bản thiệt hại lớn nhất: mất nửa cuối `AGENTS.md` trên mọi repo dính trong một đợt ghi 66 repo. |
| 09-02 19:27 | **Đ3** — người dùng sửa tay vùng luật ⇒ không ghi đè, không chèn, BRN-016, exit 2. Bước `probe` bắt buộc. **CẤM** `--force`/`--adopt` | Tiền lệ BRN-003 (engine không sửa văn bản người dùng); thiếu `probe` thì nguyên mẫu R2 đã tái diễn sự cố #07 (chèn bản thứ hai). |
| 09-02 19:27 | **Đ4** — bỏ tiêu chí "diff = 0" cho migration; dùng **A1 idempotent · A2 không phá · A3 bao hàm (chính) · A4 dry-run fleet** | "diff = 0" chỉ đúng cho lần chạy thứ hai. |
| 09-02 19:27 | **Đ5** — 3 gate chống overengineering **G1/G2/G3** (mục 4). G2 vượt ⇒ DỪNG, báo, không tự nới. Đòn bẩy bắt buộc thử: `renderFullAgentsMd = patchAgentsMd(AGENTS_SKELETON)` | Phép đo "engine phải ngắn hơn" trừng phạt nội dung user yêu cầu; nhưng bỏ ràng buộc thì phình. |
| 09-02 19:27 | **Đ6** — BRN-016 = *khối marker hỏng / vùng luật cũ không nhận diện được* (không fixable); BRN-017 = file lạ trong `memory/archive/`. **Bỏ** "chèn 1 hàng vào bảng §2" cho repo CŨ | Nghĩa cũ của BRN-016 buộc giữ lại đúng đoạn đếm chuỗi đang xoá. Bảng §2 là lãnh địa người dùng; chèn hàng bảng = dò cấu trúc. |
| 09-02 19:27 | **Đ7** — không ký tự sentinel thô (NUL) trong mã nguồn; lỗ version khớp bằng **mảng đoạn**; test hygiene 0 byte điều khiển | Nguyên mẫu R2 chứa byte NUL ⇒ git coi engine là nhị phân, mất khả năng review diff (đúng lỗi đã cắn gotchas ở #09). |
| 09-02 19:27 | **Đ8** — (1) `LAW_TOKENS` đọc từ engine + so **nội dung khối marker** của hub; (2) **CẤM dual-path**; (3) test đơn vị hành vi marker **TRƯỚC**, chụp golden **SAU** | Ba rủi ro xanh giả R1 đã kiểm chứng. |
| 09-02 19:27 | **Đ9** — gộp: allowlist abs-path về MỘT nguồn (mục chết `scripts/deploy_skills.ps1` trong CI); `--check` là mặc định Bước 0; nâng `actions/checkout`/`setup-node` | Đã đo lệch 15/14 mục; CI cảnh báo Node 20. |
| 09-02 19:27 | **Đ10** — bán kính rollout: **66 repo đồng nhất 1.3.0** (kể cả hub) + 2 ca lệch (1.2.0, null) mặc định **BỎ QUA**. Rollout và push **CHỜ USER RA LỆNH** | 2 ca lệch chính là 2 repo đã bị chặn bởi quyết định cũ. |
| 09-02 20:10 | **TQ1** ⚠️ — hub tự bọc mốc bằng tay trong cùng commit đổi engine, và **hub theo template** ở 2 khối: `boot` (bỏ câu nhắc đường dẫn local — vẫn còn trong `memory-distill.txt`) và `dual-entry` (bỏ 2 chỉnh sửa câu chữ riêng của hub: "KHÔNG đọc `AGENTS.md`", dấu chấm ở `.xay-dung-nao-bo`) | Đo: hub lệch template ở đúng 2 khối này. Hub là mẫu đối chứng diff-0; giữ tuỳ biến thì phải đổi thân luật cho 66 repo — diff nhiễu vô ích. |
| 09-02 20:10 | **TQ2** ⚠️ — "`--check` mặc định Bước 0" thực hiện **bằng văn bản** thân luật `boot` (Bước 0 chạy `--check`; chỉ khi `CẦN NÂNG CẤP` mới chạy chế độ ghi và nêu tường minh). **CLI KHÔNG đổi mặc định** (không cờ = ghi, như v1.6.0) | 0 dòng engine, không breaking change CLI, không phá 193 test mã thoát, không đổi bước `self-check` CI. |
| 09-02 20:10 | **TQ3** ⚠️ — thân luật **không phụ thuộc version**: `root-marker` bỏ cụm ví dụ "(vd brain4agent-v1.x.y.md)"; `body` là chuỗi hằng, chỉ `legacy` có lỗ SemVer | Cùng lý lẽ Đ1: version trong thân = rewrite khối ở 66 repo mỗi lần bump. Đo: template hiện hardcode ví dụ `v1.2.0` còn bản vá nội suy `${version}` — chính là "template trôi lệch bản vá". |
| 09-02 20:10 | **TQ4** — BRN-003 giữ mã, đổi điều kiện: *khối đã có nhưng `probe` còn xuất hiện NGOÀI mọi khối* (bản thừa), hoặc còn khối planning cũ. ≥2 mốc cùng id ⇒ `malformed` ⇒ BRN-016 (theo Đ2) | Tách bạch: 016 = máy không nhận diện được; 003 = hai phát biểu cùng sống. |
| 09-02 20:10 | **TQ5** — **KHÔNG cài bước `supersedes`** (gỡ khối luật cũ nguyên văn) ở #10. Khối planning cũ còn sót ⇒ BRN-003 không fixable | Đo trên 66 repo + hub: **0** repo còn khối planning cũ. Cài = +~10 dòng cho đường không ai đi. ⚠️ Nếu user muốn engine tự gỡ, mở lại ở #11. |
| 09-02 20:10 | **TQ6** — `memory/archive/` vào `TARGET_DIRS` (engine tạo khi ở đường ghi) nhưng **KHÔNG** đưa vào BRN-009 | Không sinh `.gitkeep` (vùng cấm) ⇒ thư mục rỗng không được git theo dõi ⇒ nếu kiểm thiếu, mọi clone mới đều `CẦN NÂNG CẤP` giả. |
| 09-02 20:10 | **TQ7** — fixture "đã chuẩn" (F02, `fleet/00-chuan`) chụp lại ở trạng thái **S2** (đã có mốc, thân đúng); thêm **F09** = trạng thái S1 nguyên văn v1.3.0 (oracle migration), **F10** = S4 sửa tay | Đo: fixture hiện tại chỉ có TOKEN, không có thân luật nguyên văn ⇒ dưới thuật toán mới thành BRN-016. Phải chụp lại có chủ đích, không "sửa cho xanh". |
| 09-02 20:10 | **TQ8** — probe của `boot` là `Bước 0 (Bắt buộc tiên quyết`, KHÔNG phải `xay-dung-nao-bo` | Đo: **10 repo** không hề có phát biểu Bước 0 nhưng engine v1.6.0 vẫn cho qua vì luật J mục 4 chứa `xay-dung-nao-bo` — âm tính giả tiềm ẩn. Probe mới ⇒ 9 repo (1.3.0) nhận Bước 0 qua nhánh `add`. |

### Quyết định bị thay thế

- **#09 SPEC-P01 / 01-CONTRACTS §8:** *"BRN-002 = thiếu 1 trong 4 token; BRN-003 = mệnh đề luật lặp đếm bằng `RULE_ANCHORS`"* → **THAY BẰNG** *"BRN-002 = khối bắt buộc ở trạng thái `absent`/`legacy`/`stale` (fixable); BRN-003 = probe ngoài khối khi khối đã có, hoặc còn khối planning cũ (không fixable)"* (01-CONTRACTS §6). Đếm chuỗi bị khai tử.
- **Engine v1.0–v1.6:** *"vá `AGENTS.md` = 4 nhánh `if (!includes(token))` + regex dò `### G.`/`### H.`/`## 📋 3.` + 3 fallback phụ lục"* → **THAY BẰNG** *"một vòng lặp trên `RULE_BLOCKS`: findBlock → findLegacy → probe → add"* (SPEC-P01). **Không giữ đường cũ** (Đ8.2).
- **Scope brief mục GATE** *"engine sau #10 phải NGẮN hơn 1447 dòng"* → **THAY BẰNG** G1/G2/G3 (Đ5).
- **Spec ngoài:** *"BRN-016 = thiếu token v1.4.0"* → **THAY BẰNG** Đ6. *"Chạy engine v1.7.0 trên repo mẫu ⇒ diff `AGENTS.md` = 0"* → **THAY BẰNG** Đ4 (repo mẫu chưa có mốc ⇒ diff ≠ 0 lần đầu là CHỦ ĐÍCH; diff = 0 ở lần hai).
- **R2 §1.4:** *"`boot` có sẵn ở mọi repo"* → **CHÍNH XÁC HOÁ** bằng đo: 52 verbatim / 4 sửa tay / 9 vắng (trong 65 repo vệ tinh 1.3.0).

## 📦 2. Phân Công Work Packages + Model Tier

| WP | Tên | Tier | SPEC | Sản phẩm chính |
| :-- | :--- | :-: | :--- | :--- |
| **WP1** | Lõi marker + `RULE_BLOCKS` + skeleton + **test đơn vị viết TRƯỚC** | 🔴 | [SPEC-P01](specs/SPEC-P01-marker-core.md), [SPEC-P02](specs/SPEC-P02-migration.md) | `findBlock/findLegacy/classifyRuleBlocks/patchAgentsMd`, `AGENTS_SKELETON`, `tests/unit/marker.test.js` |
| **WP2** | 2 luật v1.4.0 + thân luật `boot`/`root-marker` mới + hub tự bọc mốc + `CORE_GOVERNANCE_RULES.md` | 🟠 | [SPEC-P03](specs/SPEC-P03-luat-v140.md) | 6 thân luật, `AGENTS.md` hub (S2), CORE có 2 luật mới |
| **WP3** | `diagnose` theo mốc; BRN-002/003 đổi điều kiện; BRN-016/017; `memory/archive/` | 🔴 | [SPEC-P04](specs/SPEC-P04-doctor-brn.md) | `diagnose()` mới, bảng `BRN` 17 mã, snapshot `archiveEntries` |
| **WP4** | Lưới test: viết lại `patch-agents`, chụp lại fixture (S2/S1/S4), golden **SAU CÙNG**, `LAW_TOKENS` từ engine, bộ so sánh A1–A4 | 🔴 | [SPEC-P05](specs/SPEC-P05-luoi-test.md) | fixture F02/F04/F06/F08/fleet chụp lại; F09, F10 mới; `manifest.json` mới; `tests/helpers/diff-scope.js` |
| **WP5** | Việc nhỏ: allowlist một nguồn, CI actions, docs/README/index | 🟢 | [SPEC-P06](specs/SPEC-P06-viec-nho.md) | `tests/hygiene/abs-path-allowlist.json`, `ci.yml`, `docs/xay-dung-nao-bo.md` |
| **WP6** | Bump 3 trục, deploy global + verify, Sync Cascade 6 điểm, đóng | 🔴 | [OPERATIONS](specs/OPERATIONS.md) §4, §7 | v1.7.0 / template 1.4.0, não hub |
| **WP7** | **Rollout fleet theo sóng** — *chờ user ra lệnh* | 🔴 | [OPERATIONS](specs/OPERATIONS.md) §5 | 66 repo hội tụ 1.4.0, bằng chứng A1–A4 |

Thứ tự bắt buộc và lý do: [OPERATIONS.md §1](specs/OPERATIONS.md).

## 📋 3. Checklist Thực Thi

- [x] **P00 🔴 [Lập bộ SPEC]** — 11 file: `plan.md` + 10 file trong `specs/` (00, 01, P01–P06, OPERATIONS, TESTING-ACCEPTANCE); tổng 1190 dòng.
- [x] **P00b 🔴 [USER APPROVAL GATE]** — user duyệt 2026-09-02: chỉ đạo "điều phối đội ngũ làm việc" sau khi orchestrator trình bộ SPEC + 6 chỗ hở. Phân cấp user chốt: orchestrator tổng (Fable) → Opus 5 / Sonnet / Haiku theo effort. H4–H9 vẫn chờ user từng bước.
- [x] **P01 🔴 [WP1]** — theo SPEC-P01/P02. Gate: `tests/unit/marker.test.js` xanh với **input viết tay** (không fixture, không golden); 5/5 dạng hỏng có test; `patch-agents.test.js` cũ **đã bị xoá và đã ghi nhận lượt chạy đỏ** trước khi viết bản mới (Đ8.3).
- [ ] **P02 🟠 [WP2]** — theo SPEC-P03. Gate: `engine.patchAgentsMd(hubAgents).changed === false`; 6/6 khối hub có `inner === body`; T-H02 xanh với 7 token.
- [ ] **P03 🔴 [WP3]** — theo SPEC-P04. Gate: mỗi mã BRN-002/003/016/017 có ≥1 test đơn vị; `Object.keys(engine.BRN).length === 15` (13 + 2; 014/015 vẫn ở `DOCTOR_BRN`; tổng hệ thống 17 mã).
- [ ] **P04 🔴 [WP4]** — theo SPEC-P05. Gate: fixture chụp lại **bằng tay** (không chạy engine ghi lên fixture); golden chụp lại **từng case**, diff đọc bằng mắt, ghi `engine_commit`; A3 = 0 dòng ngoài vùng mốc trên F09.
- [ ] **P05 🟢 [WP5]** — theo SPEC-P06. Gate: `ci.yml` không còn allowlist nội tuyến; T-H05b xanh với mục engine đo lại; CI 2 OS xanh (remote — sau khi user cho push).
- [ ] **P06 🔴 [WP6]** — theo OPERATIONS §4, §7. Gate: `npm run deploy:verify` = 0; `node <global>/init_brain.js --version` = `brain-engine 1.7.0 template 1.4.0`; G1/G2/G3 điền số (mục 4). **Người bấm nút deploy.**
- [ ] **P07 🔴 [WP7]** — theo OPERATIONS §5, **chỉ khi user ra lệnh**. Gate mỗi sóng: A1–A4 ✅ trước khi sang sóng sau.

## 🛡️ 4. Ba Gate Chống Overengineering (Đ5) — ô ghi số

Số "trước" do SPEC-writer đo 2026-09-02 trên engine `dd7967e` (1447 dòng). Cách đo chính xác: [TESTING-ACCEPTANCE §4](specs/TESTING-ACCEPTANCE.md).

| Gate | Ngưỡng | Trước (đo) | Sau (điền khi P06) | Đạt? |
| :--- | :--- | --: | --: | :-: |
| **G1** lõi vá teo ≥ 25% | ≤ **123** dòng | **165** (= 7 + 106 + 24 + 28) | `___` | ⬜ |
| **G2** trần tuyệt đối | ≤ **1472** dòng (`wc -l`) | **1447** | `___` | ⬜ |
| **G3** chi phí 2 luật mới | ≤ **20** dòng engine (≤ 10/luật) | — | `___` | ⬜ |

**G2 vượt ⇒ DỪNG, báo orchestrator trước khi viết tiếp. KHÔNG tự nới ngưỡng.** G1/G3 vượt ⇒ cũng DỪNG và báo (không có ngoại lệ "gần đạt").

## 🗂️ 5. Bảng Trỏ Sang SPEC

| File | Vai trò | Đọc khi |
| :--- | :--- | :--- |
| [specs/00-ARCHITECTURE.md](specs/00-ARCHITECTURE.md) | Vấn đề (số đo), mục tiêu, 14 vùng cấm, 10 bất biến, router | Đầu tiên |
| [specs/01-CONTRACTS.md](specs/01-CONTRACTS.md) | Cú pháp marker, **luật fail-closed**, kiểu dữ liệu, chữ ký hàm, `RULE_BLOCKS`, bảng BRN, mã thoát, 3 trục version, A1–A4 | Trước khi viết bất kỳ dòng code nào |
| [specs/SPEC-P01-marker-core.md](specs/SPEC-P01-marker-core.md) | WP1 — thuật toán find/replace/validate theo dòng, skeleton | Làm lõi |
| [specs/SPEC-P02-migration.md](specs/SPEC-P02-migration.md) | WP1 — máy trạng thái S0–S5, phân bố đo thật, diff kỳ vọng, chứng minh idempotent | Làm lõi + viết test migration |
| [specs/SPEC-P03-luat-v140.md](specs/SPEC-P03-luat-v140.md) | WP2 — nguyên văn 6 thân luật, skeleton, hub, CORE | Sửa nội dung luật |
| [specs/SPEC-P04-doctor-brn.md](specs/SPEC-P04-doctor-brn.md) | WP3 — BRN-002/003/016/017, archive | Sửa `diagnose`/doctor |
| [specs/SPEC-P05-luoi-test.md](specs/SPEC-P05-luoi-test.md) | WP4 — fixture, golden, chống 3 xanh giả | Sửa test |
| [specs/SPEC-P06-viec-nho.md](specs/SPEC-P06-viec-nho.md) | WP5 — allowlist, CI, docs | Việc nhỏ |
| [specs/OPERATIONS.md](specs/OPERATIONS.md) | Thứ tự WP, nhánh/commit, deploy, **sóng rollout**, rollback, người bấm nút | Trước mỗi WP, khi sự cố |
| [specs/TESTING-ACCEPTANCE.md](specs/TESTING-ACCEPTANCE.md) | Ma trận test, 5 dạng hỏng, A1–A4, G1–G3, Exit Gates theo 4 môi trường | Khi viết test và khi đóng |

### Bằng chứng thực thi (điền khi từng bước xong — chỉ số đếm, không tên repo, không đường dẫn)

| Bước | Commit | Bằng chứng do orchestrator tự đo |
| :-- | :--- | :--- |
| P01 | `460d4a9` | **H2 (Đ8.3):** xoá `tests/unit/patch-agents.test.js` (6 ca) ⇒ `npm test` 193 → **187 pass / 0 fail**; không test nào khác phụ thuộc file đó ⇒ danh sách đỏ của bước H2 = **rỗng** (SPEC-P05 §1.1 dự đoán ≥7 — dự đoán SAI, ghi lại đúng số đo). **`marker.test.js`:** 24 ca / 24 pass (T-M01..T-M24, input viết tay 100%). **5/5 dạng hỏng "có răng"** (thay `findBlock` bằng bản diễn giải sai, chạy lại): H1 "mở→EOF" ⇒ đỏ T-M03, T-M11, T-M16, T-M17 · H2 "đóng→BOF" ⇒ đỏ T-M04, T-M17 · H3 "swap nếu ngược" ⇒ đỏ T-M05 · H4 "lấy cặp đầu" ⇒ đỏ T-M06 · H5 "lấy đóng đầu" ⇒ đỏ T-M07 (mỗi bản đột biến exit 1). **`npm test` sau WP1:** 211 ca / 190 pass / **21 fail** — toàn bộ là đỏ KỲ VỌNG của test bám hành vi cũ: golden 5 (F01/F03/F04/F06 + `A10`) và `T-U33` ⇒ WP4; fixture CLI/invariants 10 (`F04`, `F05`, `F06` ×2 file, `I5`, `I6`, `I10`, `P01-E9`, `D7(b)`) ⇒ WP4; `T-U27` (BRN-003 đếm mệnh đề) ⇒ WP3; `T-U32` (dựng input bằng cách cắt đôi khối `dual-entry`) ⇒ WP4; `T-H02d` (hub chưa bọc mốc) ⇒ WP2; `T-H05` (allowlist abs-path engine 2 → **3** dòng: template distill + `BOOT_V130` + body `boot`) ⇒ WP5. **Số đo dòng:** engine 1447 → **1421** (G2 ≤ 1472 ✅); lõi vá cũ xoá **137 dòng** (`AGENTS_PATCH_LOGS` 7 + `patchAgentsMd` 106 + `RULE_ANCHORS`/vòng đếm 24); lõi marker `const OPEN` → hết `patchAgentsMd` = **70** dòng (SPEC-P01 (e) ≤ 70 ✅); vùng G1 đã có = **112** (khối 489–604 trừ 4 dòng của 2 luật mới) ⇒ nhánh AGENTS trong `diagnose` của WP3 phải ≤ **11 dòng** để G1 ≤ 123. **G3** (2 luật mới) = 4 dòng `RULE_BLOCKS` + 4 dòng mốc rỗng skeleton + 1 hàng bảng §2 = **9** ≤ 20 ✅. **Grep:** 0 `PHỤ LỤC TỰ ĐỘNG VÁ` · 0 `RULE_ANCHORS` · 0 `AGENTS_PATCH_LOGS` · 0 `remove-legacy-planning` · 0 byte điều khiển · 0 literal regex trong lớp vá (T-M21) · 1 `new RegExp`. **Đo thử trên hub (chỉ đọc):** `boot=edited, cold-memory=absent, spec-package=legacy, structural-extension=absent, root-marker=legacy, dual-entry=edited` ⇒ `broken=[boot, dual-entry]` — KHỚP dự báo SPEC-P02 §2 cho hub. |
| P02 | | |
| P03 | | |
| P04 | | |
| P05 | | |
| P06 | | |
| P07 | | |
