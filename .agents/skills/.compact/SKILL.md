---
name: .compact
description: Tự động nén và đúc kết toàn bộ bối cảnh cuộc hội thoại, các quyết định quan trọng, gotchas và trạng thái máy vào brain4agent/ (memory/hot/today.md, memory/hot/state.json và đồng bộ các phân vùng). Tuyệt đối không sinh file rác ngoài root.
---

# Mục Đích & Nguyên Lý (.compact)

Khi một phiên hội thoại kéo dài, bộ nhớ ngữ cảnh (token) tích lũy sẽ rất lớn. Skill này giúp Agent tự động đúc kết toàn bộ "linh hồn" của phiên làm việc vào hệ thống **Bộ Nhớ Đa Tầng trong `brain4agent/`** thay vì sinh file nháp lẻ loi ngoài root:
1. **`brain4agent/memory/hot/today.md`**: Lưu nhật ký làm việc chi tiết của phiên (Human-readable Daily Session Log).
2. **`brain4agent/memory/hot/state.json`**: Lưu trạng thái máy (Machine-readable State: version, benchmark results, active plans).
3. **Đồng bộ phân vùng liên quan**: Tự động cập nhật `roadmap.md` (nếu có task hoàn thành/ý tưởng mới) và `-known-gotchas.md` (nếu gặp bug dị biệt).
4. **Root Clean 100% (Zero Root Clutter Invariant)**: Xóa bỏ hoặc không bao giờ tạo file `latest_memory.md` ngoài root.

Skill này **dùng chung cho mọi project** có cấu trúc `brain4agent/`.

---

# Hướng Dẫn Thực Thi Tuần Tự

Khi Người dùng gọi `/.compact` hoặc yêu cầu "nén ngữ cảnh", "lưu ký ức", "đóng phiên":

---

## Bước 1: Phát hiện Project Root & Thư Mục Não Bộ

Xác định thư mục gốc của project bằng lệnh:
```bash
git rev-parse --show-toplevel
```
- Biến `PROJECT_ROOT` = đường dẫn tuyệt đối đến thư mục gốc project.
- Biến `BRAIN_DIR` = `PROJECT_ROOT/brain4agent`
- Biến `HOT_DIR` = `BRAIN_DIR/memory/hot`

> Nếu chưa có `brain4agent/memory/hot/`, tạo tự động thư mục này.
> Nếu có file `latest_memory.md` ở `PROJECT_ROOT`, xóa bỏ file này để giữ Root sạch sẽ.

---

## Bước 2: Thu Thập Thông Tin Phiên Làm Việc

Chạy tại `PROJECT_ROOT`:
```bash
git log -1 --oneline             # commit cuối cùng
git branch --show-current        # branch hiện tại
git status --short               # file chưa commit / vừa sửa
```

Đọc các file cấu hình và phân vùng não bộ:
- `package.json` / `pyproject.toml` / `Cargo.toml` / `tauri.conf.json` $\rightarrow$ lấy phiên bản hiện tại (`vX.Y.Z`).
- `brain4agent/roadmap.md` $\rightarrow$ lấy Active Tasks và Idea Vault.
- `brain4agent/changelog.md` $\rightarrow$ lấy mốc phát hành gần nhất.

---

## Bước 3: Biên Soạn Nhật Ký Phiên (`brain4agent/memory/hot/today.md`)

Ghi đè nội dung mới nhất vào `brain4agent/memory/hot/today.md` theo cấu trúc chuẩn:

```markdown
# 📅 Nhật Ký Làm Việc Ngày [DD/MM/YYYY] (Session Memory Log)

> Cập nhật lúc: `[YYYY-MM-DDTHH:mm:ss+07:00]` | Phiên bản: `vX.Y.Z` (Grade A Runtime Verified)

---

## 🎯 Thành Tựu Cốt Lõi Đạt Được Trong Phiên:
1. **[Tên Thành Tựu / Module 1]**:
   - [Mô tả chi tiết giải pháp, kiến trúc hoặc tính năng vừa code].
2. **[Tên Thành Tựu / Module 2]**:
   - [Mô tả chi tiết giải pháp, kiến trúc hoặc tính năng vừa code].

---

## 🧪 Kết Quả Benchmark / Kiểm Thử Thực Chiến:
[Bảng kết quả benchmark, tỷ lệ pass/fail, thời gian thực thi, profile test].

---

## 📁 Danh Sách File Đã Tạo / Sửa:
- **Tạo mới:** [`đường_dẫn_file`](file:///đường_dẫn_tuyệt_đối) — [mục đích]
- **Chỉnh sửa:** [`đường_dẫn_file`](file:///đường_dẫn_tuyệt_đối) — [nội dung thay đổi]

---

## ⚠️ Bẫy Kỹ Thuật (Gotchas) & Lưu Ý:
[Các lưu ý quan trọng hoặc cách xử lý lỗi dị biệt phát hiện trong phiên].
```

---

## Bước 4: Cập Nhật Trạng Thái Máy (`brain4agent/memory/hot/state.json`)

Cập nhật file `brain4agent/memory/hot/state.json` với JSON snapshot mới nhất:

```json
{
  "current_version": "X.Y.Z",
  "system_status": "healthy_and_runtime_verified",
  "last_verification": {
    "timestamp": "[ISO Timestamp]",
    "scenarios_passed": [
      "[Danh sách test cases pass]"
    ],
    "benchmark_accuracy": "100%",
    "grade": "Grade A Runtime Verified"
  },
  "active_plans_completed": [Số lượng plan đã xong]
}
```

---

## Bước 5: Báo Cáo Hoàn Tất

Thông báo ngắn gọn với Người dùng:
```text
✅ Đã nén và lưu trữ ngữ cảnh thành công vào Não Bộ:
   • brain4agent/memory/hot/today.md (Nhật ký phiên)
   • brain4agent/memory/hot/state.json (Trạng thái máy)
   • Thư mục root sạch sẽ 100% (Zero root clutter).

👉 Ở phiên chat mới, bạn chỉ cần nhắn:
"Đọc brain4agent/memory/hot/today.md và state.json rồi tiếp tục công việc."
Agent sẽ lập tức khôi phục 100% ngữ cảnh!
```
