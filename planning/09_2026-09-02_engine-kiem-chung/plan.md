# KẾ HOẠCH #09: ENGINE CÓ KIỂM CHỨNG — MÃ THOÁT THẬT, BỘ TEST 0-DEPENDENCY, DEPLOY FAIL-CLOSED, `brain-doctor` (#09)

- **STT KẾ HOẠCH:** #09
- **TRẠNG THÁI:** 🔄 ĐANG THỰC THI
- **THỜI GIAN BẮT ĐẦU:** 2026-09-02 (lập bộ SPEC)
- **THỜI GIAN HOÀN TẤT:** —
- **PHIÊN BẢN MỤC TIÊU:** hub **v1.5.4 → v1.6.0** (`MINOR` — thêm năng lực, giữ tương thích ngược); **`BRAIN_TEMPLATE_VERSION` GIỮ NGUYÊN `1.3.0`** (không đổi chuẩn khung não ⇒ không chạm hàng loạt các repo vệ tinh)
- **LOẠI GÓI:** SPEC PACKAGE đầy đủ theo `AGENTS.md` §3 mục 2 (bắt buộc vì là `MINOR`)
- **PHẠM VI MỘT CÂU:** biến hub từ *"tập tài liệu + 1 script 772 dòng không ai kiểm"* thành *"công cụ kỹ thuật có kiểm chứng tự động, có cổng chặn thật, có khả năng đo độ lệch toàn hệ sinh thái"*.

> File này là **HỒ SƠ** kế hoạch. Toàn bộ thiết kế nằm trong `specs/`. Theo `AGENTS.md` §3 mục 2.3, **CẤM** nhét thiết kế vào đây.

---

## 🧾 1. Nhật Ký Quyết Định (có mốc thời gian)

| Thời điểm | Quyết định | Lý do |
| :--- | :--- | :--- |
| 09-02 07:30 | Chốt scope 6 Work Package, `MINOR`, template giữ `1.3.0` | Đợt này thêm năng lực kiểm chứng, không đổi chuẩn não ⇒ không kéo theo đợt ghi vào các repo vệ tinh. |
| 09-02 07:30 | **0 dependency runtime, 0 build step** — chỉ `node:test` + `node:assert` + `child_process` | Node v24.15.0 đã có đủ. Có build step = sinh thêm một tầng "bản deploy kẹt version cũ" (gotcha #12). |
| 09-02 07:30 | Engine tách thành **lõi thuần (pure) + vỏ I/O mỏng** thay vì chỉ thêm `module.exports` vào code hiện tại | `--dry-run` và `--check` cần biết *sẽ ghi gì* mà không ghi ⇒ bắt buộc có bước "lập kế hoạch ghi" tách khỏi "ghi". Đây là refactor tối thiểu đủ để test được, không phải viết lại. |
| 09-02 07:30 | **`.gitattributes` là việc ĐẦU TIÊN**, trước cả khi tạo fixture | Fixture CRLF/BOM/UTF-16 phải được commit nguyên byte; với `core.autocrlf=true` mà không có `tests/fixtures/** -text` thì fixture bị chuẩn hoá thành LF ngay lúc `git add`, test mất tác dụng. |
| 09-02 07:30 | **Chụp golden bằng engine HIỆN TẠI (v1.5.4) trước khi refactor** | "Byte-identical" chỉ chứng minh được khi có bản đối chứng sinh từ code cũ. Refactor xong mới chụp là tự chấm bài mình. |
| 09-02 07:30 | Mã thoát engine phân tầng `0/1/2/3/64`; `brain-doctor` phân tầng `0/1/2/3/64`; deploy `0/1/2/3` | Cùng một quy ước cho cả 3 công cụ; `3` = công cụ tự lỗi, **không bao giờ** lẫn với `2` = dự án có lỗi (yêu cầu brief mục F). |
| 09-02 07:30 | `brain-doctor` đặt tại `.agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js`, `require('./init_brain.js')` | Dùng lại đúng hàm chẩn đoán của engine (một nguồn chân lý về "thế nào là chuẩn"); bản deploy global tự có doctor. |
| 09-02 07:30 | `brain-doctor` **CẤM quét đệ quy** — chỉ root + `brain4agent/` (+ `memory/hot/`) | Số đo thật: quét đệ quy toàn cây tìm BOM TIMEOUT sau 5 phút; quét root + `brain4agent/` cho ~70 thư mục = 1,445 s. |
| 09-02 07:30 | `fleet-report.json` **không** ghi đường dẫn tuyệt đối, **bị `.gitignore`** | Hub là repo PUBLIC; báo cáo chứa tên các repo vệ tinh (gotcha #14). |
| 09-02 07:30 | Test đặt tại `tests/` ở root hub, **không** nằm trong thư mục skill | Deploy copy toàn bộ thư mục skill ra global; fixture/test không được theo ra đó. |
| 09-02 07:30 | Deploy: bắt buộc `pwsh` ≥ 7 **và** ghi bằng `UTF8Encoding($false)` | Hai lớp độc lập cùng chặn BOM (D5). `#requires -Version 7.0` là fail-closed; bộ ghi .NET không BOM chống cả trường hợp ai đó gỡ `#requires`. |
| 09-02 07:30 | Deploy **không xoá** file lạ ở đích, chỉ cảnh báo | File `*.disabled-by-plan07` ở đích đang tồn tại có chủ đích (#08). Xoá = thao tác phá huỷ, ngoài scope. |
| 09-02 07:30 | Chỉ bump hub **một lần** `v1.5.4 → v1.6.0` khi đóng kế hoạch, không bump từng WP | Các WP phụ thuộc nhau chặt; phiên bản trung gian không có ý nghĩa phát hành. `ENGINE_VERSION` trong engine phải khớp `package.json` (có test kiểm). |
| 09-02 07:30 | Tài liệu module 1-1: tạo `docs/xay-dung-nao-bo.md` và `docs/compact.md` (**bỏ dấu chấm đầu**) | Dấu chấm đầu tên thư mục skill nghĩa là "skill ẩn", không phải một phần tên module; file ẩn trong `docs/` là chống người đọc. ⚠️ *User có thể muốn đổi thành tên có dấu chấm để khớp 100% chữ nghĩa luật §5.C.* |
| 09-02 07:30 | Ghi nhận trung thực về D3: cơ chế có thật (`$&`, `` $` ``, `$'`, `$$` làm hỏng văn bản — chạy Node kiểm 2026-09-02), nhưng 8 dòng `$\rightarrow$`/`$\ge`/`$<` trong `AGENTS.md` hub **không** thuộc nhóm mẫu đặc biệt ⇒ với hub bug đang **tiềm ẩn**, với repo vệ tinh có `AGENTS.md` tuỳ biến thì **sống** | SPEC là hợp đồng, không được phóng đại bằng chứng. Vẫn sửa bắt buộc vì văn bản thay thế là nội dung do người dùng kiểm soát. Fixture D3 phải chứa mẫu đặc biệt thật mới bắt được lỗi. |

### Quyết định bị thay thế

- **#07 chốt** *"nếu sửa engine: BẮT BUỘC chạy `scripts/deploy_skills.ps1` rồi so hash tới khi diff RỖNG"* (kỷ luật thủ công ghi trong `state.json` → `next_session_first_steps`) → **THAY BẰNG** *"chính script deploy tự so SHA-256 nguồn↔đích và trả mã thoát ≠ 0 khi lệch"* (SPEC-P03). Kỷ luật thủ công vẫn đúng nhưng không còn là hàng rào duy nhất.
- **Engine v1.2.x–v1.5.x: "chẩn đoán = danh sách boolean `isFullyStandard` (dòng 109)"** → **THAY BẰNG** *"chẩn đoán = hàm thuần `diagnose()` trả về danh sách mã `BRN-xxx` có mức độ, có đếm số lần"* (SPEC-P01 + 01-CONTRACTS §8). Danh sách boolean đã sót 3 lần trong lịch sử.
- **Quy ước đo EOL trong brief mục C** *"`git show :file` cho kết quả SAI (áp bộ lọc cây làm việc)"* → **CHÍNH XÁC HOÁ**: đo 2026-09-02 trên hub, `git show :f` / `git cat-file -p :f` / `git show HEAD:f` đều trả blob thô (0 CRLF); lệnh **áp bộ lọc** là `git cat-file --filters :f` (219 CRLF). Kết luận vận hành **giữ nguyên**: chỉ tin `git ls-files --eol`. (Ghi lại để agent sau không tranh cãi với brief.)

## 📦 2. Phân Công Work Packages + Model Tier

| WP | Tên | Tier | SPEC | Sản phẩm chính |
| :-- | :--- | :-: | :--- | :--- |
| **WP5a** | `.gitattributes` + chuẩn hoá EOL/BOM cây làm việc | 🟠 | [SPEC-P05](specs/SPEC-P05-gitattributes-ci.md) §A | `.gitattributes`, 0 file `w/crlf`/`w/mixed`, 0 BOM trong file text được track |
| **WP2a** | Fixture + chụp golden bằng engine v1.5.4 + harness CLI hộp đen | 🔴 | [SPEC-P02](specs/SPEC-P02-bo-test-node-test.md) §A | `tests/fixtures/`, `tests/golden/manifest.json`, `tests/helpers/` |
| **WP6** | Refactor tối thiểu để test được (lõi thuần + vỏ I/O) + sửa D3, D4 | 🟠 | [SPEC-P06](specs/SPEC-P06-refactor-testable.md) | `init_brain.js` có `module.exports`, hàm thuần chuỗi→chuỗi, chuẩn hoá-khi-đọc |
| **WP1** | Mã thoát thật + `--check` / `--dry-run` / `--version` + chẩn đoán có mã (sửa D7) | 🔴 | [SPEC-P01](specs/SPEC-P01-engine-cli-exit-code.md) | CLI hợp đồng, bảng mã thoát, `diagnose()` |
| **WP2b** | Unit test hàm thuần + test khiếm khuyết D1..D7 + `npm test` | 🔴 | [SPEC-P02](specs/SPEC-P02-bo-test-node-test.md) §B | `tests/*.test.js`, `npm test` xanh trên 2 OS |
| **WP5b** | CI GitHub Actions matrix `windows-latest` × `ubuntu-latest` | 🟠 | [SPEC-P05](specs/SPEC-P05-gitattributes-ci.md) §B | `.github/workflows/ci.yml` |
| **WP3** | `deploy_skills.ps1` fail-closed + SHA-256 + `pwsh` + không BOM | 🔴 | [SPEC-P03](specs/SPEC-P03-deploy-fail-closed.md) | script deploy mới, `npm run deploy` gọi `pwsh` |
| **WP4** | `brain-doctor` quét độ lệch hệ sinh thái | 🔴 | [SPEC-P04](specs/SPEC-P04-brain-doctor.md) | `brain_doctor.js`, `fleet-report.json`, 15 mã `BRN-*` |
| **WP0/WP7** | Đóng: docs 1-1, sửa lỗi tài liệu nhỏ (brief mục H), bump `v1.6.0`, Sync Cascade 6 điểm | 🟢 | [OPERATIONS](specs/OPERATIONS.md) §6 | `docs/xay-dung-nao-bo.md`, `docs/compact.md`, não hub |

Thứ tự bắt buộc và lý do: xem [OPERATIONS.md §1](specs/OPERATIONS.md).

## 📋 3. Checklist Thực Thi

- [ ] **P00 🔴 [Lập bộ SPEC]** — 10 file trong `specs/` (00, 01, SPEC-P01..P06, OPERATIONS, TESTING-ACCEPTANCE) + hồ sơ này. *(Xong khi user duyệt.)*
- [ ] **P00b 🔴 [USER APPROVAL GATE]** — user duyệt bộ SPEC. KHÔNG thực thi trước khi duyệt.
- [ ] **P01 🟠 [WP5a `.gitattributes` + EOL/BOM]** — theo SPEC-P05 §A. Gate: `git ls-files --eol` = 100% `w/lf` (trừ `tests/fixtures/**` và file khai báo binary); 0 BOM.
- [ ] **P02 🔴 [WP2a fixture + golden]** — theo SPEC-P02 §A. Gate: `tests/golden/manifest.json` sinh từ engine **v1.5.4 chưa sửa** (ghi SHA commit engine vào manifest).
- [ ] **P03 🟠 [WP6 refactor]** — theo SPEC-P06. Gate: golden byte-identical 100% ca; `require()` engine không in gì, không ghi gì.
- [ ] **P04 🔴 [WP1 CLI + mã thoát + diagnose]** — theo SPEC-P01. Gate: bảng mã thoát 01-CONTRACTS §6 nghiệm thu từng dòng bằng test.
- [ ] **P05 🔴 [WP2b test khiếm khuyết + `npm test`]** — theo SPEC-P02 §B. Gate: 7/7 khiếm khuyết D1..D7 có ≥1 ca; 11/11 bất biến có ≥1 ca; `npm test` xanh Windows + Linux.
- [ ] **P06 🟠 [WP5b CI]** — theo SPEC-P05 §B. Gate: workflow xanh trên cả 2 OS ở commit đầu tiên có workflow.
- [ ] **P07 🔴 [WP3 deploy fail-closed]** — theo SPEC-P03. Gate: `-VerifyOnly` báo lệch trước deploy, exit 0 sau deploy; 0 byte BOM/0x08 ở file lệnh. **Người bấm nút** (ghi vào máy user).
- [ ] **P08 🔴 [WP4 brain-doctor]** — theo SPEC-P04. Gate: quét thật toàn hệ sinh thái ≤ 40 s, kết quả khớp số liệu #07 (66/67 chuẩn; 1 repo cách ly kẹt `1.2.0` phải hiện đúng 3 lỗi BRN-006/007/010 + BRN-011). **Chỉ đọc.**
- [ ] **P09 🟢 [WP7 đóng kế hoạch]** — theo OPERATIONS §6: docs 1-1, sửa `index.md` marker `v1.3.0`, bump `v1.6.0` (`package.json` + `ENGINE_VERSION` + `state.json.current_version`), Sync Cascade 6 điểm, đề xuất commit (tiếng Anh).

## 🛡️ 4. Cổng Nghiệm Thu Toàn Kế Hoạch

Chi tiết ma trận và Exit Gates theo môi trường (`⬜ local / ⬜ CI`): [TESTING-ACCEPTANCE.md](specs/TESTING-ACCEPTANCE.md). Kế hoạch chỉ đóng khi **mọi** gate ở cả hai môi trường chuyển ✅.

## 🗂️ 5. Bảng Trỏ Sang SPEC

| File | Vai trò | Đọc khi |
| :--- | :--- | :--- |
| [specs/00-ARCHITECTURE.md](specs/00-ARCHITECTURE.md) | Mục tiêu, Non-goals (8 vùng cấm), bất biến kiến trúc, router, sơ đồ | Đầu tiên, luôn luôn |
| [specs/01-CONTRACTS.md](specs/01-CONTRACTS.md) | Chữ ký hàm thuần, CLI, mã thoát, JSON Schema, 15 mã `BRN-*`, 11 bất biến, quy ước chuẩn hoá văn bản | Trước khi viết bất kỳ dòng code nào |
| [specs/SPEC-P01-engine-cli-exit-code.md](specs/SPEC-P01-engine-cli-exit-code.md) | WP1 | Làm CLI/mã thoát/chẩn đoán |
| [specs/SPEC-P02-bo-test-node-test.md](specs/SPEC-P02-bo-test-node-test.md) | WP2a + WP2b | Làm fixture/golden/test |
| [specs/SPEC-P03-deploy-fail-closed.md](specs/SPEC-P03-deploy-fail-closed.md) | WP3 | Sửa script deploy |
| [specs/SPEC-P04-brain-doctor.md](specs/SPEC-P04-brain-doctor.md) | WP4 | Viết doctor |
| [specs/SPEC-P05-gitattributes-ci.md](specs/SPEC-P05-gitattributes-ci.md) | WP5a + WP5b + lỗi tài liệu nhỏ (brief mục H) | Làm hygiene/CI/docs |
| [specs/SPEC-P06-refactor-testable.md](specs/SPEC-P06-refactor-testable.md) | WP6 | Refactor engine |
| [specs/OPERATIONS.md](specs/OPERATIONS.md) | Thứ tự bắt buộc, quy trình deploy, runbook rollback từng WP, việc cần người bấm nút | Trước khi bắt đầu mỗi WP và khi có sự cố |
| [specs/TESTING-ACCEPTANCE.md](specs/TESTING-ACCEPTANCE.md) | Ma trận test ↔ D1..D7 / I1..I11, Exit Gates theo môi trường | Khi viết test và khi đóng kế hoạch |
