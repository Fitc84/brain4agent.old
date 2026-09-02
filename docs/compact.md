# `.compact` — Skill Nén & Đúc Kết Bối Cảnh Phiên

Tài liệu kỹ thuật 1-1 cho module `.agents/skills/.compact/` (theo `MODULE_DOCUMENTATION_SPEC.md`). Nguồn định nghĩa duy nhất của skill này là `.agents/skills/.compact/SKILL.md` — tài liệu ở đây mô tả kỹ thuật vận hành, không lặp lại nguyên văn.

---

## 1. Vai trò & vị trí trong kiến trúc

`.compact` là một **skill hướng dẫn tuần tự cho Agent** (không phải một script thực thi) — khi được gọi (`/.compact` hoặc yêu cầu tương đương như "nén ngữ cảnh", "lưu ký ức", "đóng phiên"), Agent tự đọc `SKILL.md` và thực hiện các bước mô tả trong đó bằng chính công cụ của mình (đọc file, chạy git, ghi file), **không** có mã nguồn `.js`/`.ps1` riêng để chạy.

Mục đích: khi một phiên hội thoại kéo dài, đúc kết toàn bộ "linh hồn" của phiên (quyết định, thành tựu, bẫy gặp phải, trạng thái) vào hệ thống **Bộ Nhớ Đa Tầng** trong `brain4agent/` thay vì để trôi mất khi phiên kết thúc, và **tuyệt đối không** sinh file nháp rời rạc ngoài root (Zero Root Clutter Invariant — luật §5.G của `AGENTS.md`).

Skill này **dùng chung cho mọi project** có cấu trúc `brain4agent/` (không ràng buộc vào một repo cụ thể) — cùng vai trò với `.xay-dung-nao-bo` nhưng khác tầng: `.xay-dung-nao-bo` dựng/vá **cấu trúc** khung não; `.compact` chỉ **ghi nội dung** vào hai file hot memory đã có sẵn cấu trúc đó.

**Phân biệt với lệnh built-in:** `/.compact` (skill này) khác hoàn toàn với `/compact` built-in của Claude Code (nén cửa sổ ngữ cảnh của chính Claude Code). Xem mục "Bẫy đã biết" bên dưới — từng có một đợt deploy vô tình sinh file lệnh trùng tên `/compact`, che mất tính năng built-in.

---

## 2. Đầu ra ghi ra

| File | Vai trò | Cách ghi |
| :--- | :--- | :--- |
| `brain4agent/memory/hot/today.md` | Nhật ký làm việc chi tiết của phiên (human-readable). | **Ghi đè** toàn bộ nội dung mỗi lần chạy — không append. |
| `brain4agent/memory/hot/state.json` | Trạng thái máy (machine-readable): version hiện tại, benchmark, số plan đã hoàn thành. | Cập nhật (ghi đè) theo cấu trúc JSON chuẩn. |
| `brain4agent/roadmap.md` | Đồng bộ nếu phiên có task hoàn thành hoặc ý tưởng mới phát sinh. | Cập nhật có điều kiện (chỉ khi có nội dung liên quan). |
| `brain4agent/-known-gotchas.md` | Đồng bộ nếu phiên gặp bug dị biệt/bẫy kỹ thuật mới. | Cập nhật có điều kiện. |

Không có tham số dòng lệnh (đây là skill hướng dẫn Agent, không phải CLI) — bảng tham số không áp dụng cho module này.

---

## 3. Các bước thực thi (tóm tắt kỹ thuật)

1. **Phát hiện root & thư mục não bộ.** Chạy `git rev-parse --show-toplevel` để xác định `PROJECT_ROOT`; suy ra `BRAIN_DIR = PROJECT_ROOT/brain4agent` và `HOT_DIR = BRAIN_DIR/memory/hot`. Nếu `memory/hot/` chưa tồn tại, tự tạo. Nếu còn `latest_memory.md` ở root (di tích chuẩn cũ), xoá để giữ Root Clean.
2. **Thu thập thông tin phiên.** Chạy `git log -1 --oneline`, `git branch --show-current`, `git status --short` tại `PROJECT_ROOT`; đọc file version dự án (`package.json`/`pyproject.toml`/`Cargo.toml`/`tauri.conf.json`...), `brain4agent/roadmap.md` (Active Tasks + Idea Vault), `brain4agent/changelog.md` (mốc phát hành gần nhất).
3. **Biên soạn `today.md`** theo khuôn chuẩn: tiêu đề ngày + timestamp + version, mục Thành Tựu Cốt Lõi, Kết Quả Benchmark/Kiểm Thử, Danh Sách File Đã Tạo/Sửa, Bẫy Kỹ Thuật (Gotchas) & Lưu Ý.
4. **Cập nhật `state.json`** với snapshot JSON mới: `current_version`, `system_status`, `last_verification` (timestamp, scenarios_passed, benchmark_accuracy, grade), `active_plans_completed`.
5. **Báo cáo hoàn tất** — thông báo ngắn gọn cho người dùng, kèm gợi ý câu lệnh khôi phục ngữ cảnh ở phiên chat mới ("Đọc `brain4agent/memory/hot/today.md` và `state.json` rồi tiếp tục công việc").

---

## 4. Mã thoát / mã kiểm tra

Không áp dụng — `.compact` là skill hướng dẫn Agent thực thi bằng công cụ có sẵn (đọc/ghi file, chạy git), không phải chương trình CLI riêng nên không có bảng mã thoát hay mã kiểm tra `BRN-*`. Việc file `today.md`/`state.json` có đúng cấu trúc chuẩn hay không được kiểm gián tiếp bởi engine `.xay-dung-nao-bo` (`BRN-011`: `state.json` phải kết thúc bằng byte `0x0A`; `BRN-009`: phải tồn tại `memory/hot/state.json` và `memory/hot/today.md`).

---

## 5. Bẫy đã biết khi dùng module này

- **Đè lên lệnh built-in `/compact` của Claude Code.** Từng có phiên bản `scripts/deploy_skills.ps1` sinh ra một file lệnh trùng tên `compact.md` trong thư mục lệnh của Claude Code — vì mọi `*.md` trong thư mục đó được nạp thành slash-command, file trùng tên **đè lên** lệnh built-in `/compact` (nén cửa sổ ngữ cảnh). Người dùng gõ `/compact` mong nén context nhưng lại kích hoạt nghi thức ghi não — không có lỗi, không cảnh báo, chỉ là làm sai việc. Đã khắc phục: không sinh file lệnh trùng tên built-in nữa; nghi thức ghi não dùng lệnh riêng `/luu-nao` (skill này tự ghi rõ "KHÔNG phải lệnh `/compact` built-in" trong nội dung của nó). Trước khi deploy bất kỳ skill nào sinh ra file lệnh, luôn đối chiếu tên file với danh sách lệnh built-in của Claude Code (`/compact`, `/clear`, `/help`, `/model`, `/init`...).
- **Bẫy kèm theo (đã từng xảy ra ở lần deploy lỗi trên):** nếu script sinh nội dung Markdown bằng here-string PowerShell **nháy kép** (`@"..."@`), backtick trong nội dung (ví dụ `` `brain4agent` ``) bị PowerShell diễn giải thành ký tự escape (`` `b `` → byte backspace `0x08`, `` `r `` → CR) thay vì giữ nguyên literal — làm hỏng nội dung file sinh ra một cách âm thầm, chỉ phát hiện được khi soi byte thô. Bài học áp dụng cho mọi script deploy đụng tới nội dung của `.compact`: nội dung Markdown tĩnh luôn dùng here-string **nháy đơn** (`@'...'@`).
- **`today.md` bị ghi đè, không append.** Nếu Agent chạy `.compact` nhiều lần trong cùng một phiên mà không có ý định tổng hợp lại toàn bộ, nội dung nhật ký của lần chạy trước sẽ mất — vì bước 3 quy định "ghi đè nội dung mới nhất". Muốn giữ lịch sử nhiều phiên phải dựa vào `git log`/`changelog.md`, không phải `today.md`.
- **Chỉ ghi vào `brain4agent/`, không bao giờ tạo file nháp ngoài root.** Nếu một agent thực thi sai và tạo file dạng `task.md`/`latest_memory.md` ở root trong lúc "nén ngữ cảnh", đó là vi phạm trực tiếp Zero Root Clutter Invariant (§5.G) — bước 1 của skill quy định rõ phải xoá `latest_memory.md` nếu phát hiện, không được để tồn tại song song với `today.md`.
