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

## Nghiệm thu (điền khi thực thi)

- [ ] V1–V7 + grep src-modules = 0, bằng chứng: (điền)
- [ ] SHA commit: (điền)
