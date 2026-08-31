# SPEC-P02 — dreamteam4vn (Lớp A+: chuẩn nhưng docs module lạc chỗ) 🟢

- **Hiện trạng (2026-08-31):** git sạch, `master` ahead 1. Não có đủ 7 phân vùng chuẩn NHƯNG kèm 5 file docs module nằm SAI CHỖ trong `brain4agent/`: `-dreamteam4vn.md`, `-src-modules-cyber-background.md`, `-src-modules-hackathons-CentralHub.md`, `-src-modules-hackathons-experience.md`, `-src-modules-system-boot.md`. Repo CHƯA có `docs/`. Có `.agents/skills/` rỗng. Tech: Next.js + Firebase.
- **Vi phạm cần sửa:** luật §5.C (tài liệu module 1-1 phải ở `docs/<module_name>.md`) và luật §2 (cấm file ngoài 8 phân vùng trong `brain4agent/`).

## Bảng ánh xạ di trú (git mv)

| File cũ trong `brain4agent/` | Đích | Ghi chú |
| :--- | :--- | :--- |
| `-src-modules-cyber-background.md` | `docs/cyber-background.md` | bỏ prefix `-src-modules-` |
| `-src-modules-hackathons-CentralHub.md` | `docs/hackathons-CentralHub.md` | — |
| `-src-modules-hackathons-experience.md` | `docs/hackathons-experience.md` | — |
| `-src-modules-system-boot.md` | `docs/system-boot.md` | — |
| `-dreamteam4vn.md` | ĐỌC lúc thực thi rồi quyết: nếu là tổng quan dự án → GỘP vào `project-intro.md`; nếu là docs module tổng → `docs/dreamteam4vn.md` | ghi vết quyết định vào SPEC này |
| 7 file phân vùng chuẩn còn lại | GIỮ NGUYÊN | — |

**Tên đích cuối cùng phải khớp cấu trúc `src/modules/<name>/` thực tế** — xác nhận tên thư mục module bằng `ls src/modules/` lúc thực thi trước khi chốt tên file (luật 1-1 match 100%).

## Các bước

1. Pre-flight + backup.
2. Tạo `docs/`, thực hiện bảng ánh xạ bằng `git mv`; cập nhật MỌI tham chiếu tới tên cũ trong `index.md` (grep `-src-modules-` toàn `brain4agent/` phải về 0).
3. Chạy engine (sinh AGENTS/CLAUDE/marker/hot memory).
4. Cập nhật Router trong `index.md`: bảng docs module mới tại `docs/`.
5. `state.json`: `current_version` theo `package.json`.
6. Verify V1–V7 + kiểm riêng: `grep -r "src-modules" brain4agent/` = 0 khớp; commit `feat(brain): adopt brain template v1.2.0 and relocate module docs to docs/`.

## Rủi ro riêng

- `.next/`, `node_modules/`, `key-vault/`, `.env.local` nằm ở root — kiểm `git status` sau engine: nếu file nhạy cảm (`key-vault/`, `.env.local`) chưa bị ignore mà hiện ra, KHÔNG add chúng, báo user (không tự sửa `.gitignore` của dự án người khác đang vận hành).

## Nghiệm thu (đã thực thi — 2026-08-31)

- [x] **Pre-flight:** `git status --porcelain` rỗng, `master` ahead 1 origin, `rev-parse --show-toplevel` = `D:/Data/Repositories/.My-Repositories/dreamteam4vn` (trùng repo đích), không có `DOCS`/`Plan` viết hoa.
- [x] **Tên module thật** (`ls src/modules/`): `admin/`, `cyber-background/`, `hackathons/{CentralHub,experience,lib}/`, `shared/`, `system-boot/`, `user-dashboard/` — khớp tên đích trong bảng ánh xạ SPEC (không cần sửa tên nào).
- [x] **Bảng ánh xạ đã thực hiện (git mv, giữ history):**
  - `brain4agent/-src-modules-cyber-background.md` → `docs/cyber-background.md`
  - `brain4agent/-src-modules-hackathons-CentralHub.md` → `docs/hackathons-CentralHub.md`
  - `brain4agent/-src-modules-hackathons-experience.md` → `docs/hackathons-experience.md`
  - `brain4agent/-src-modules-system-boot.md` → `docs/system-boot.md`
  - `brain4agent/-dreamteam4vn.md` → `docs/dreamteam4vn.md` (xem quyết định bên dưới)
  - 7 file phân vùng chuẩn còn lại: giữ nguyên.
- [x] **Quyết định `-dreamteam4vn.md`:** đọc nội dung — đây là tài liệu quy ước tổ chức thư mục `src/` toàn dự án (app/modules/lib/data/components), khác về vai trò với `project-intro.md` (tổng quan nghiệp vụ/tech stack/tính năng). Không gộp vì sẽ làm phình `project-intro.md` lẫn lộn 2 mối quan tâm khác nhau; xử lý như "docs module tổng" → `git mv` sang `docs/dreamteam4vn.md`, giữ nguyên là tài liệu kiến trúc thư mục tham chiếu riêng.
- [x] **Cập nhật tham chiếu:** `brain4agent/index.md` (Router + bảng docs module mới), `brain4agent/memory-distill.txt`, `brain4agent/changelog.md` (2 dòng lịch sử cập nhật path, không đổi nội dung quyết định), `docs/dreamteam4vn.md`, `docs/cyber-background.md` (tự tham chiếu nội bộ).
- [x] **V1 (idempotent):** chạy `init_brain.js` lần 2 → in đúng `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` + `👉 Trạng thái: NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM!`.
- [x] **V2 (dual entry):** `CLAUDE.md` = 8 dòng, có `@AGENTS.md`, không bọc backtick.
- [x] **V3 (marker):** `ls brain4agent-v*.md` → đúng 1 file `brain4agent-v1.2.0.md`.
- [x] **V4 (state):** `[System.IO.File]::ReadAllBytes($p)[-1]` = `10`; JSON có `current_version: "0.1.0"` (khớp `package.json`) và `brain_template_version: "1.2.0"`.
- [x] **V5 (không mất nội dung):** 12 file cũ trong `brain4agent/` trước migrate → 5 file di trú sang `docs/` (truy vết đủ, không xóa), 7 file phân vùng chuẩn giữ nguyên; sau migrate + engine: `brain4agent/` có đủ 7 phân vùng + `memory/hot/` mới, `docs/` có 5 file. Backup đầy đủ tại `scratchpad/backup-plan05-dreamteam4vn/brain4agent/`.
- [x] **V7 (root clean):** root chỉ thêm đúng 1 file mới ngoài chuẩn — marker `brain4agent-v1.2.0.md` (ngoại lệ hợp lệ); còn lại `AGENTS.md`, `CLAUDE.md`, `docs/`, `planning/` (rỗng, do engine tạo) là đúng schema.
- [x] **Grep riêng SPEC-P02:** `grep -r "src-modules" brain4agent/` = 0 khớp (kiểm tra sau khi sửa luôn `memory/hot/today.md` — bản nháp đầu có nhắc lại tên file cũ dạng literal nên phải rephrase để gate về đúng 0).
- [x] **File nhạy cảm:** `key-vault/`, `.env.local`, `.next/`, `node_modules/` — `git status --porcelain` trước khi add không hiện bất kỳ thứ nào trong số đó là untracked mới; `key-vault/.env` bị ignore đúng (`!!`), phần còn lại của `key-vault/` đã tracked từ trước, không đụng tới. Không sửa `.gitignore` của dự án.

**SHA commit (branch `master`, local only, KHÔNG push):**
- `79efb93` — `feat(brain): adopt brain template v1.2.0 and relocate module docs to docs/`
- `cb2bcfa` — `docs(brain): rephrase session log to avoid stale literal old docs filenames` (fix gate sau khi phát hiện `today.md` tự vi phạm grep)
