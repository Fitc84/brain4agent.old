# SPEC-P01 — Git-Init 9 Repo Không Có Git Riêng 🔴

## Phạm vi (đóng khung, không thêm bớt)

`control-chrome`, `control-facebook`, `control-keypassxc`, `control-pc`, `control-router`, `control-syncthing`, `control-tailscale`, `control-telegram`, `control-zalo`

**Bối cảnh:** cả 9 không có `.git` riêng; nằm trong `/.My-Repositories/` bị repo cha `D:\Data\Repositories` ignore (dòng 4 `.gitignore` cha) → thật sự vô chủ về version control. 4 repo (`keypassxc`, `router`, `syncthing`, `tailscale`) đã có não chuẩn từ #04 nhưng các thay đổi đó chưa từng được commit ở đâu. `control-keypassxc` + `control-router` có `.env` ở root.

**User đã ra lệnh tường minh trong đề bài #06: "repo nào chưa có git... thì cần sửa lại cho đúng"** — đây là căn cứ cho phép `git init` (khác #04, khi đó chưa có lệnh).

## Các bước trên TỪNG repo (tuần tự)

1. **Pre-flight:** xác nhận lại `Test-Path .git` = False và `rev-parse --show-toplevel` → repo cha (đúng hiện trạng khảo sát). Lệch → DỪNG repo đó.
2. **Backup:** copy `AGENTS.md`, `brain4agent/memory/hot/state.json`, `.gitignore` (nếu có) → `scratchpad/backup-plan06-<repo>/` (nhẹ — vì sau init sẽ có git làm đường lùi, backup chỉ che khoảng trống trước commit đầu).
3. **`git init -b main`** trong repo.
4. **Giao Thức Chống Lộ Key** (01-CONTRACTS §3) + `.gitignore` baseline (§4) — đặc biệt `control-keypassxc`, `control-router` có `.env`.
5. **Dry-run `git add -A -n`** — soi: không secret, không rác nặng (`node_modules/`...). Danh sách bất thường (file quá lạ, quá lớn >50MB) → DỪNG repo, báo cáo.
6. `git add -A` → kiểm §3.3 → commit baseline theo §5 → kiểm §3.4.
7. **Ghi kết quả:** SHA + số file + output secret-scan vào bảng dưới.

## Kỳ vọng đặc biệt

- 4 repo có não: sau commit baseline, chạy `init_brain.js` kiểm — phải báo `NÃO ĐÃ OK` ngay (não đã chuẩn từ #04, không được sinh thêm diff). Nếu có diff → engine hoặc não đã lệch, DỪNG báo cáo.
- 5 repo còn lại (`chrome`, `facebook`, `pc`, `telegram`, `zalo`): não hóa KHÔNG làm ở SPEC này — chuyển danh sách sang SPEC-P04 (giờ chúng đã có git chuẩn).

## Nghiệm thu (điền khi thực thi)

| Repo | SHA baseline | Files | Secret-scan | Não sau init |
| :--- | :--- | :--- | :--- | :--- |
| control-chrome | | | | → P04 |
| control-facebook | | | | → P04 |
| control-keypassxc | | | | phải `NÃO ĐÃ OK` |
| control-pc | | | | → P04 |
| control-router | | | | phải `NÃO ĐÃ OK` |
| control-syncthing | | | | phải `NÃO ĐÃ OK` |
| control-tailscale | | | | phải `NÃO ĐÃ OK` |
| control-telegram | | | | → P04 |
| control-zalo | | | | → P04 |

- [ ] 9/9 `rev-parse --show-toplevel` trùng chính repo sau khi xong.
- [ ] 0 secret trong mọi commit mới (bằng chứng §3.4 từng repo).
