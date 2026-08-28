# 🧠 CẨM NANG HƯỚNG DẪN BỘ NÃO ĐA TẦNG V5.2 (BRAIN4AGENT ARCHITECTURE GUIDE)

Tài liệu này giải thích chi tiết triết lý thiết kế, vai trò của từng phân vùng và luồng luân chuyển dữ liệu trong hệ thống **Não Bộ Đa Tầng AI Agent (Multi-Tier Hot/Cold Memory Architecture V5.2)**.

---

## 🏛️ 1. TRIẾT LÝ THIẾT KẾ ĐA TẦNG (HOT/COLD MEMORY DESIGN)

Tại sao lại cần kiến trúc Đa Tầng thay vì chỉ lưu 1 file markdown duy nhất?

1. **Vấn Đề Của Não Truyền Thống (Flat Memory):**
   - File log hội thoại/bộ nhớ phình to nhanh chóng ($> 1,000$ dòng) làm tràn Context Window của LLM, gây tốn token và suy giảm khả năng suy luận (Attention Degradation).
   - Thông tin quan trọng bị loãng giữa hàng trăm dòng log vụn vặt.
2. **Giải Pháp Đa Tầng (Multi-Tier Architecture):**
   - **Tầng Nóng (Hot Memory - `memory/hot/`):** Chứa dữ liệu thay đổi liên tục theo từng phiên (nhật ký hôm nay `today.md`, trạng thái máy `state.json`). Giúp Agent khôi phục $100\%$ ngữ cảnh phiên trước trong $0.1\text{s}$.
   - **Tầng Lạnh (Cold Memory - 7 Phân Vùng Cố Định):** Chứa tri thức bền vững của dự án (kiến trúc, gotchas, roadmap, changelog, data flow). Mỗi phân vùng đảm nhận **duy nhất 1 vai trò (Single Responsibility)**.
   - **Tầng Kernel Tối Thượng (`memory-distill.txt`):** Giữ bản cô đọng cao cấp nhất dưới 100 dòng để luôn được nạp ở đầu mọi phiên làm việc.

---

## ⚖️ 2. CHI TIẾT VAI TRÒ CỦA 7 PHÂN VÙNG CỐ ĐỊNH

### 1. `memory-distill.txt` — Bản Cô Đọng Tối Thượng (< 100 dòng)
- **Mục đích:** Nạp ngay vào đầu context của Agent khi khởi động.
- **Nội dung:** Vai trò Agent, Startup Protocol Bước 0-3, Tech stack nền tảng, các quy tắc bất biến.
- **Kỷ luật:** Luôn ghi đè (overwrite) để giữ kích thước $< 100\text{ dòng}$.

### 2. `index.md` — Master Router & Codebase Map
- **Mục đích:** Bản đồ định tuyến tri thức trung tâm.
- **Nội dung:** Bảng Router tài liệu theo lĩnh vực, Bản đồ cây thư mục mã nguồn (Codebase Map), Bảng Router Kỹ năng Workspace (`.agents/skills/`), Sơ đồ luồng giao tiếp IPC/CDP và Bảng tra cứu Entry Points/Ports.

### 3. `project-intro.md` — Tổng Quan Nghiệp Vụ
- **Mục đích:** Giúp Agent hiểu lý do tồn tại của dự án.
- **Nội dung:** Mục tiêu nghiệp vụ, bài toán cần giải quyết, triết lý thiết kế hệ thống.

### 4. `roadmap.md` — Lộ Trình, Active Tasks & Kho Ý Tưởng (Idea Vault)
- **Mục đích:** Quản lý tiến độ công việc và bảo tồn ý tưởng sáng tạo.
- **Nội dung:** 
  - `Active Tasks`: Việc đang làm dở.
  - `Upcoming`: Kế hoạch sắp tới.
  - `💡 Kho Ý Tưởng & Backlog (Idea Vault)`: Nơi nạp tự động các ý tưởng hay nảy sinh trong lúc code nhưng chưa làm ngay.
  - `Đã hoàn thành (Done)`: Lưu vết các mốc tính năng đã xong.

### 5. `changelog.md` — Lịch Sử Quyết Định & Semantic Releases (SemVer 2.0.0)
- **Mục đích:** Nhật ký tiến hóa của mã nguồn.
- **Nội dung:** Lưu vết các quyết định kiến trúc lớn, lý do thay đổi và các mốc phiên bản phát hành (`vX.Y.Z`).

### 6. `-known-gotchas.md` — Bẫy Kỹ Thuật & Cạm Bẫy Dị Biệt
- **Mục đích:** Chống dẫm lại vết xe đổ.
- **Nội dung:** Tổng hợp các lỗi khó: Trusted Types, CSP, lock Excel file, race condition, mẹo vượt qua Anti-bot.

### 7. `-data-architecture.md` — Cơ Sở Dữ Liệu & Data Flow
- **Mục đích:** Quản trị luồng luân chuyển dữ liệu.
- **Nội dung:** Cấu trúc bảng tính Excel, JSON stores, cơ chế hàng đợi ghi (Write Queue), Database schema.

---

## 🎯 3. BẢNG MA TRẬN ĐỒNG BỘ 6 ĐIỂM (MANDATORY SYNC CASCADE)

Khi hoàn thành một tính năng, một Kế hoạch trong `planning/` hoặc thay đổi kiến trúc, Agent bắt buộc cập nhật đồng thời:
1. `docs/<module_name>.md` (Chi tiết kỹ thuật 1-1).
2. `brain4agent/index.md` (Bản đồ Codebase & Router).
3. `brain4agent/roadmap.md` (Đưa task vào Done, nạp Idea Vault).
4. `brain4agent/changelog.md` (Ghi nhận mốc SemVer mới).
5. `brain4agent/memory/hot/` (`today.md` & `state.json`).
6. `brain4agent/memory-distill.txt` (Cập nhật kernel < 100 dòng).
