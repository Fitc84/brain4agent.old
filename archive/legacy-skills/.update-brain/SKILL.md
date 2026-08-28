---
name: .update-brain
description: Nâng cấp và tái cấu trúc (migration) bộ nhớ brain4agent cũ ở các repo khác lên phiên bản chuẩn mới nhất V5.0 (Kiến trúc Đa Tầng Hot/Cold Memory, planning/, Single Skill Vault và AGENTS.md).
---

# Hướng dẫn Nâng Cấp & Tái Cấu Trúc brain4agent (Chuẩn V5.0 Migration)

Khi Người dùng yêu cầu nâng cấp, tái cấu trúc (refactor) hoặc dọn dẹp `brain4agent` cho một dự án đang có bộ não kiểu cũ (bị phình to hoặc thiếu phân vùng), hãy thực thi quy trình migration sau đây:

---

## Bước 1: Sinh Bổ Sung Các Phân Vùng Mới (Scaffolding)
Chạy script của skill `.brain-build` tại thư mục gốc của dự án để tự động bổ sung các phân vùng còn thiếu mà **không làm mất/ghi đè** các file đã có:

```powershell
node C:\Users\hoang\.gemini\config\skills\.brain-build\scripts\init_brain.js
```

---

## Bước 2: Chuẩn Hóa Kiến Trúc Đa Tầng (Hot/Cold Memory)
1. **Di dời `latest_memory.md` ngoài root:**
   - Nếu dự án đang có file `latest_memory.md` ở root, hãy bóc tách thông tin gần nhất của nó đưa vào:
     - `brain4agent/memory/hot/today.md` (Nhật ký phiên dạng markdown).
     - `brain4agent/memory/hot/state.json` (Trạng thái máy dạng JSON).
   - Xóa bỏ file `latest_memory.md` ngoài root để giữ **Root Clean 100%**.
2. **Khởi tạo Hot Memory:** Đảm bảo thư mục `brain4agent/memory/hot/` luôn có 2 tệp `today.md` và `state.json`.

---

## Bước 3: Bóc Tách & Giải Nén Kernel Cũ
Đọc `brain4agent/memory-distill.txt` hiện tại và bóc tách thông tin:
- **Bóc tách Gotchas:** Chuyển toàn bộ các lỗi khó, bẫy kỹ thuật, trick vào `brain4agent/-known-gotchas.md`.
- **Bóc tách Data Flow:** Chuyển Database Schema, cơ chế lưu trữ, phân quyền vào `brain4agent/-data-architecture.md`.
- **Bóc tách Lộ trình & Lịch sử:** Chuyển Active tasks/Idea Vault vào `brain4agent/roadmap.md` và mốc release vào `brain4agent/changelog.md`.
- **Cô đọng Kernel:** Đảm bảo `memory-distill.txt` sau khi bóc tách **tuyệt đối phải dưới 100 dòng**.

---

## Bước 4: Chuẩn Hóa Thư Mục Kế Hoạch & Kỹ Năng
1. **Thư mục Kế hoạch:** Đổi tên thư mục kế hoạch cũ (như `Planing/` hoặc `Plans/`) thành **`planning/`** (chữ thường). Cập nhật toàn bộ link RFCs trong `roadmap.md` và `changelog.md`.
2. **Kho Kỹ năng Workspace:** Chuyển toàn bộ kỹ năng tùy biến cho workspace vào đúng **`.agents/skills/<skill_name>/`** (Single Skill Vault Invariant).

---

## Bước 5: Cập Nhật Master Index Map (`brain4agent/index.md`) & `AGENTS.md`
- Cập nhật Bảng Router Mục 1 (trỏ đầy đủ tới `memory/hot/`, `planning/`, `docs/`).
- Cập nhật Codebase Map Mục 2 phản ánh chính xác cấu trúc thực tế của repo.
- Đảm bảo file `AGENTS.md` ở root có đầy đủ Startup Protocol, Ma trận 7 phân vùng + Hot Memory, và Quy chuẩn SemVer.

---

## Bước 6: Kiểm Toán & Báo Cáo
1. Kiểm tra trạng thái Git bằng `git status`.
2. Báo cáo ngắn gọn với Người dùng về các phân vùng đã được nâng cấp thành công lên **Chuẩn V5.0**.
