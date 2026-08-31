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

## Nghiệm thu — ✅ HOÀN THÀNH 2026-08-31 17:47

Thực thi bằng script `scratchpad/p06/p01.ps1` (`git init -b main` → secret gate §3 → dry-run → add → commit baseline).

| Repo | SHA baseline | Files trong commit | Secret-scan | Não sau init |
| :--- | :--- | :--- | :--- | :--- |
| control-chrome | `a07df91` | 6 | CLEAN (0 high-risk) | → P04 (lô 4c) |
| control-facebook | `c1cdcbb` | 1 | CLEAN (0 high-risk) | → P04 (kho TRỐNG) |
| control-keypassxc | `1ccae59` | 105 | CLEAN — `.env` ignored ✅ | `NÃO ĐÃ OK` ✅ |
| control-pc | `b6375ee` | 1 | CLEAN (0 high-risk) | → P04 (kho TRỐNG) |
| control-router | `d3a6d4f` | 46 | CLEAN — `.env` ignored ✅ | vá Bước 0 → `4cbdc68` → `NÃO ĐÃ OK` |
| control-syncthing | `e686af6` | 20 | CLEAN (0 high-risk) | vá Bước 0 → `fa3cf53` → `NÃO ĐÃ OK` |
| control-tailscale | `e9e2d39` | 14 | CLEAN (0 high-risk) | `NÃO ĐÃ OK` ✅ |
| control-telegram | `903c89e` | 1 | CLEAN (0 high-risk) | → P04 (kho TRỐNG) |
| control-zalo | `903c89e` | 1 | CLEAN (0 high-risk) | → P04 (kho TRỐNG) |

- [x] 9/9 `rev-parse --show-toplevel` trùng chính repo sau khi xong (kiểm bằng output lệnh).
- [x] 0 secret trong mọi commit mới — kiểm 2 lớp: `git show --name-only HEAD` (§3.4) VÀ audit độc lập `git ls-files` toàn repo. Cả 9 repo `SECRET_HITS=NONE`.

### Sai lệch so với khảo sát (ghi nhận, không tự chế phương án)

1. **4 repo RỖNG HOÀN TOÀN (0 file):** `control-facebook`, `control-pc`, `control-telegram`, `control-zalo`. Khảo sát P00 không phát hiện. Xử lý: vẫn `git init` + ghi `.gitignore` baseline (§4) + commit baseline 1 file — đủ điều kiện hợp đồng §1 (≥1 commit). `control-telegram` và `control-zalo` ra CÙNG SHA `903c89e` vì cây commit + message + timestamp trùng khớp — đúng bản chất nội dung-định-địa-chỉ của git, không phải lỗi.
2. **`control-router` + `control-syncthing` sinh diff khi chạy engine** (SPEC kỳ vọng `NÃO ĐÃ OK` ngay). Nguyên nhân xác định: kernel của 2 repo này không có tag `<agent_startup_protocol>`, và nhánh vá fallback chỉ ra đời ở **engine v1.2.2 (kế hoạch #05)** — SAU đợt rollout #04 đã não hóa chúng. Diff thuần cộng `+4/-0`. Xử lý: commit RIÊNG (`fix(brain): patch missing step-0 boot protocol into kernel`), không trộn vào baseline; sau đó cả 2 báo `NÃO ĐÃ OK`.
3. **Bug harness (không phải bug repo):** biến `$sec` trong script trùng tên `$SEC` (PowerShell không phân biệt hoa/thường) → regex secret bị ghi đè bằng mảng đường dẫn từ repo thứ 2 trở đi, làm cổng §3 mất hiệu lực trong lượt chạy đầu. Phát hiện nhờ output vô lý (`control-tailscale` liệt kê MỌI file là "ứng viên secret"). Đã đổi tên biến (`$SECRET_RE`/`$secList`) và **chạy lại toàn bộ cổng kiểm trên 9 repo bằng code đã sửa** — tất cả CLEAN. Xem gotcha mới ghi trong `brain4agent/-known-gotchas.md`.
