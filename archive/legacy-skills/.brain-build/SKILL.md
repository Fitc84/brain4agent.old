---
name: .brain-build
description: Khởi tạo hệ thống bộ nhớ brain4agent Đa Tầng (Hot/Cold Memory) V5.0 cho một dự án mới, tự động sinh đầy đủ 7 phân vùng chuẩn, Hot Memory, planning/ và AGENTS.md.
---

# Hướng dẫn Khởi tạo & Tối ưu brain4agent (Chuẩn V5.0 Đa Tầng)

Khi Người dùng yêu cầu khởi tạo hoặc thiết lập bộ não `brain4agent` cho một dự án mới, hãy thực hiện tuần tự:

## 1. Khởi chạy Auto-Script Khởi Tạo
Đảm bảo đang ở thư mục gốc của dự án, sử dụng công cụ `run_command` để chạy file script khởi tạo:

```powershell
node C:\Users\hoang\.gemini\config\skills\.brain-build\scripts\init_brain.js
```

Script sẽ tự động tạo trọn gói:
- `brain4agent/memory/hot/` (`state.json`, `today.md`) — Phân khu Ký ức Nóng.
- `brain4agent/memory-distill.txt` (< 100 dòng) — Kernel hiện trạng.
- `brain4agent/index.md` — Master Router & Codebase Map.
- `brain4agent/roadmap.md` — Active Tasks, Kho Ý Tưởng (Idea Vault) & Done.
- `brain4agent/changelog.md` — Lịch sử Semantic Releases.
- `brain4agent/-known-gotchas.md` & `-data-architecture.md` & `project-intro.md`.
- `planning/` — Thư mục quản lý kế hoạch & RFCs chuẩn hóa.
- `.agents/skills/` — Kho kỹ năng chuyên dụng cho workspace.
- `AGENTS.md` — Luật quản trị tối cao của dự án.

## 2. Nạp Kiến Thức Dự Án Thực Tế
Sau khi script tạo xong khung sườn, Agent chủ động đọc mã nguồn và cấu hình của dự án hiện tại để điền thông tin thực tế vào:
1. `project-intro.md`: Tech stack, mục tiêu sản phẩm.
2. `memory-distill.txt`: Điền Tech stack, Rules đặc thù và Startup Protocol.
3. `index.md`: Cập nhật Codebase Directory Map tương ứng với các thư mục thực tế của dự án.
4. `memory/hot/state.json`: Cập nhật phiên bản và trạng thái ban đầu.

## 3. Báo Cáo Hoàn Tất
Thông báo với Người dùng rằng hệ thống Bộ Nhớ Đa Tầng `brain4agent` V5.0 đã được thiết lập thành công và sẵn sàng vận hành.
