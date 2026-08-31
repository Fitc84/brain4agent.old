# SPEC-P02 — First-Commit 13 Repo Unborn 🔴

## Phạm vi (đóng khung)

`1seed`(1), `AI-input`(2), `auto-hot-key`(2), `bi-kip-luyen-agent`(2), `CausalAgent`(39), `coding-orchestrator`(11), `congquyengop.vn`(2), `control-discord`(3), `control-PC-by-chatweb-ai`(1), `docker`(2), `manage-fitc84`(9), `RE-Kit`(1), `teamworkflow`(15)

**Bối cảnh:** đã `git init` nhưng 0 commit — không HEAD, không diff, không đường lùi. **User đã ra lệnh tường minh sửa git trong đề bài #06** — căn cứ cho phép tạo commit đầu tiên (trước đây #04/#05 phải kiêng vì chưa có lệnh). `CausalAgent` có `.env` (đã não hóa GĐ1 ở #05 — commit đầu bao gồm luôn não mới, hợp lệ vì tất cả cùng là "trạng thái hiện có").

## Các bước trên TỪNG repo

1. **Pre-flight:** xác nhận `## No commits yet` + toplevel trùng chính repo. Lệch → DỪNG repo đó.
2. **Giao Thức Chống Lộ Key** (01-CONTRACTS §3) + `.gitignore` baseline (§4). `CausalAgent`: xác nhận `.env` bị ignore TRƯỚC khi add (bắt buộc — điều kiện sống còn đã nêu từ #05).
3. **Dry-run `git add -A -n`** — soi danh sách: không secret, không rác nặng, không file >50MB bất thường. Bất thường → DỪNG repo, báo cáo.
4. Add → kiểm cached → **commit baseline "as-is"** theo §5 → kiểm §3.4.
5. Ghi SHA + số file + secret-scan vào bảng.

## Hệ quả mở khóa (ghi vào báo cáo, thực thi ở SPEC khác)

- `CausalAgent`: commit đầu MỞ GATE Giai đoạn 2 của #05 SPEC-P06 (dọn 18 `scratch_*.py` + 8 file dữ liệu, có grep tham chiếu + smoke Python) → thực thi trong P04 của kế hoạch này, COMMIT RIÊNG sau baseline.
- `control-discord`: sau baseline đủ điều kiện vá não treo từ #04 (thiếu `CLAUDE.md`) → P04.
- `teamworkflow`: sau baseline, xử theo kết luận #04: shim đã chuẩn, `AGENTS.md` hiện là Next.js tooling notice — P04 sẽ hỏi user trước khi thay/đắp bộ luật não (KHÔNG tự quyết ở SPEC này).

## Nghiệm thu — ⚠️ HOÀN THÀNH MỘT PHẦN 8/13 (2026-08-31 17:52)

| Repo | SHA baseline | Files | Secret-scan | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1seed | `72f883f` | 1 | CLEAN | kho TRỐNG (chỉ `.gitignore`) |
| AI-input | — | — | — | ⛔ **DỪNG** — repo git LỒNG NHAU |
| auto-hot-key | — | — | — | ⛔ **DỪNG** — 1066 file / 490 MB build artifacts |
| bi-kip-luyen-agent | — | — | — | ⛔ **DỪNG** — repo git LỒNG NHAU |
| CausalAgent | `c702ea9` | 62 | CLEAN — `.env` ignored ✅ | mở gate GĐ2 (kết quả: xem cuối SPEC-P04) |
| coding-orchestrator | `092930b` | 103 | CLEAN — `secrets.env` ignored ✅ | repo lồng ở `runtime/.../scope-gate-test` đã bị gitignore → không sinh gitlink |
| congquyengop.vn | — | — | — | ⛔ **DỪNG** — repo git LỒNG NHAU |
| control-discord | `bfbcf98` | 11 | CLEAN | mở vá não treo #04 → `c61f74f` |
| control-PC-by-chatweb-ai | `2503c9d` | 1 | CLEAN | kho TRỐNG |
| docker | `7964888` | 3 | CLEAN — `9router/.env` ignored ✅ | |
| manage-fitc84 | — | — | — | ⛔ **DỪNG** — 2 repo git LỒNG NHAU |
| RE-Kit | `8f5e7ef` | 1 | CLEAN | kho TRỐNG |
| teamworkflow | `e1fa27e` | 40 | CLEAN | `node_modules/`, `.next/` đã ignore; xử tiếp ở lô 4e → `cb33a09` |

- [x] 8/13 hết unborn; 0 secret trong mọi commit mới (kiểm 2 lớp: `git show --name-only` + audit `git ls-files`; cả 8 `SECRET_HITS=NONE`, `gitlinks=0`).
- [ ] 5/13 CÒN UNBORN — chờ user quyết (chi tiết dưới).

### 5 repo DỪNG — sai lệch khảo sát, cần user quyết

Khảo sát P00 đếm "file bẩn" bằng `git status`, nên một thư mục con là **repo git riêng** chỉ hiện ra thành 1 dòng. Thực tế:

| Repo | Phát hiện | Vì sao dừng | Khuyến nghị |
| :--- | :--- | :--- | :--- |
| `AI-input` | thư mục con `AI-input/` là repo git riêng; repo ngoài chỉ có `.gitignore` | commit sẽ ghi **gitlink 160000** không kèm URL submodule → tham chiếu hỏng, không clone lại được | thư mục ngoài chỉ là vỏ bọc — hoặc gỡ 1 tầng, hoặc để repo ngoài KHÔNG phải repo git |
| `bi-kip-luyen-agent` | như trên (`bi-kip-luyen-agent/` lồng bên trong) | như trên | như trên |
| `congquyengop.vn` | như trên (`congquyengop.vn/` lồng bên trong, 1.4 GB) | như trên | như trên |
| `manage-fitc84` | có 18 file THẬT của chính nó + **2 repo lồng**: `9router/`, `Quản lý công ty FITC84/` | 18 file kia commit được, nhưng 2 gitlink sẽ lọt vào cùng commit | quyết cách xử 2 thư mục lồng (submodule thật / gitignore / gỡ) rồi commit |
| `auto-hot-key` | 1066 file / **490 MB** sẽ vào commit đầu: `hidmacros-master/.../bin/`, `obj/`, `HIDMacros_Net.exe` 146 MB, `.r2r.dll` 82 MB | nhồi 490 MB build artifact vào commit đầu là không thể xoá sạch về sau; quyết định thuộc chủ dự án | thêm `bin/`, `obj/` vào `.gitignore` rồi commit baseline (còn ~vài chục file nguồn) |

Không repo nào trong 5 repo trên bị chạm: `git status` trước = sau, không `git add`, không `.gitignore` bị sửa.
