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

## Nghiệm thu (điền khi thực thi)

| Repo | SHA baseline | Files | Secret-scan | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1seed | | | | |
| AI-input | | | | |
| auto-hot-key | | | | |
| bi-kip-luyen-agent | | | | |
| CausalAgent | | | | `.env` phải bị ignore; mở gate GĐ2 |
| coding-orchestrator | | | | |
| congquyengop.vn | | | | |
| control-discord | | | | mở vá não treo #04 |
| control-PC-by-chatweb-ai | | | | |
| docker | | | | |
| manage-fitc84 | | | | |
| RE-Kit | | | | |
| teamworkflow | | | | AGENTS.md = Next.js notice — chờ user ở P04 |

- [ ] 13/13 hết unborn; 0 secret trong commit mới.
