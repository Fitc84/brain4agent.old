# AGENTS.md — Quy Tac Quan Tri Cho AI Agent (du-an-mau)

---

## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)

Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:

1. **Bước 0 (Bắt buộc tiên quyết):** Chạy đồng bộ não bộ qua skill `.xay-dung-nao-bo`.
2. Đọc `brain4agent/memory-distill.txt` để nắm kernel hiện trạng.
3. Đọc `brain4agent/index.md` để định tuyến tài liệu.

---

## 🧠 2. MA TRẬN PHÂN VÙNG NÃO BỘ

Bộ nhớ dự án nằm trong `brain4agent/` với 7 phân vùng cố định.

---

## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (planning/)

1. **Quy tắc đặt tên:** `planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/`.

---

## 🛡️ 5. CÁC BỘ LUẬT VẬN HÀNH

### G. Quy tắc Kỷ Luật Root Clean 100%
1. Thư mục root của dự án phải luôn giữ trạng thái sạch sẽ tuyệt đối.
2. CẤM tạo file nháp tạm thời trực tiếp ngoài root.
3. **NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não:** root được phép có ĐÚNG MỘT file `brain4agent-v<x.y.z>.md`.

### H. Quy tắc Giám Sát Tác Vụ Ngầm
1. CẤM polling file log liên tục theo giây.

### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)
1. Root repo BẮT BUỘC đủ 2 file: `AGENTS.md` (nguồn chân lý) và `CLAUDE.md` (shim mỏng).
