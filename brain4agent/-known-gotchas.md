# Known Gotchas & Bugs

Tổng hợp các lỗi khó, các lưu ý dị biệt hoặc cách workaround đặc thù của Brain Governance Hub để AI không dẫm lại vết xe đổ.

## 1. Môi trường & File System
- **Folder Nesting Anomaly khi copy thư mục:** Khi dùng `Copy-Item` hoặc script sync không cẩn thận, có thể vô tình tạo ra thư mục lồng nhau (`.compact/.compact` hoặc `.xay-dung-nao-bo/.xay-dung-nao-bo`). Luôn kiểm tra cấu trúc đích hoặc dùng cơ chế sao chép nội dung chính xác.
- **PowerShell Execution Policy:** Khi chạy script deploy từ terminal mới, cần luôn kèm `-ExecutionPolicy Bypass` để tránh bị chặn bởi chính sách bảo mật hệ thống.

## 2. Đồng Bộ Kỹ Năng (Global Skills Sync)
- **Nguy cơ ghi đè mã nguồn lỗi thời lên Global Skills:** Nếu mã nguồn trong repo chưa được cập nhật theo chuẩn mới (như `.compact` cũ ghi ra `latest_memory.md`), việc chạy deploy sẽ làm ô nhiễm cấu hình toàn cục. Bắt buộc kiểm tra mã nguồn tại Hub trước khi chạy script deploy.
- **Hardcode Absolute Path:** Tránh hardcode đường dẫn tuyệt đối tĩnh trong các script `.ps1` hoặc `.js`. Sử dụng `$PSScriptRoot` hoặc `process.cwd()` / relative resolution để đảm bảo code hoạt động linh hoạt ngay cả khi thư mục được đổi tên.

## 3. Claude Code — Điểm Nạp Luật (Entry Point)
- **Triệu chứng:** Agent làm việc trong một dự án mới không tuân theo luật nào dù `AGENTS.md` đầy đủ và đúng nội dung — không có lỗi, không cảnh báo, sai lệch âm thầm.
- **Nguyên nhân:** Claude Code CHỈ tự động nạp `CLAUDE.md` khi khởi động phiên, KHÔNG đọc `AGENTS.md` (theo docs.claude.com/en/docs/claude-code/memory). Nếu dự án thiếu file shim `CLAUDE.md`, toàn bộ luật quản trị trong `AGENTS.md` bị bỏ qua trong im lặng.
- **Bẫy phụ (chết người):** Bọc dòng `@AGENTS.md` trong backtick hoặc code-block (```@AGENTS.md```) cũng làm cơ chế import chết y hệt trường hợp thiếu file — không hề có lỗi hay cảnh báo nào được ném ra.
- **Cách phát hiện:** Ở một phiên MỚI, chạy `/context` xem có `CLAUDE.md` được nạp hay không; hoặc hỏi agent một chi tiết CHỈ tồn tại trong `AGENTS.md` kèm lệnh cấm dùng công cụ đọc file — nếu agent không biết, nghĩa là luật chưa được nạp.
- **Khắc phục:** Chạy lại `.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js` (từ v1.1.0 trở đi, script tự sinh/vá shim `CLAUDE.md` ≤10 dòng, chỉ chứa `@AGENTS.md`, không bọc backtick, một cách idempotent).

## 4. Audit Hàng Loạt — `git -C` Leo Lên Repo Cha (Đo Sai Trạng Thái Repo Con)
- **Triệu chứng:** Quét hàng loạt dự án, 4 thư mục con báo "bẩn 341 file" giống hệt nhau → tưởng repo con đang dở việc nên bỏ qua oan. Thực tế cả 4 hoàn toàn sạch (không có file nào của chúng bị sửa).
- **Nguyên nhân:** Các thư mục đó **không có `.git` riêng**. Git luôn leo lên thư mục tổ tiên tìm repo; ở đây nó tìm thấy `D:\Data\Repositories\.git` (cách 2 cấp), nên `git -C <thư-mục-con> status` trả về trạng thái của **repo cha**, không phải repo con. Cùng một repo cha ⇒ cả 4 ra cùng con số.
- **Bẫy kép:** Repo cha lại `.gitignore` chính vùng chứa các dự án đó (`/.My-Repositories/`) ⇒ chúng vừa *trông như* có git, vừa thật sự **không được version control**, nên không thể revert nếu script sửa hỏng.
- **Cách phát hiện:** Đừng tin `git status` khi audit hàng loạt. Kiểm 3 lệnh: `Test-Path <repo>\.git`; `git -C <repo> rev-parse --show-toplevel` (phải TRÙNG chính đường dẫn repo); `git -C <repo> check-ignore -v .` (xem có bị tổ tiên ignore không).
- **Khắc phục:** Thư mục nào `--show-toplevel` không trùng chính nó ⇒ coi như KHÔNG có git: backup thủ công file sắp bị sửa ra ngoài trước khi chạy script, và thay `git diff` bằng kiểm **subsequence** (mọi dòng bản gốc còn nguyên, đúng thứ tự, trong bản mới ⇒ chỉ-thêm-không-mất) cộng so khớp tập key JSON.

## 5. Nhầm "Unborn Branch" Thành "Detached HEAD"
- **Triệu chứng:** `git rev-parse --abbrev-ref HEAD` in ra đúng chữ `HEAD` → tưởng repo đang detached, sợ commit sẽ mồ côi nên né.
- **Nguyên nhân:** Repo mới `git init` và **chưa có commit nào** (unborn branch) cũng làm `--abbrev-ref HEAD` in `HEAD` và `rev-parse HEAD` báo `fatal: Needed a single revision` — trùng triệu chứng với detached.
- **Cách phân biệt (dứt khoát):** đọc trực tiếp `.git/HEAD` — `ref: refs/heads/<tên>` là **unborn/bình thường**, còn **SHA trần** mới là detached thật. Hoặc `git status -sb`: `## No commits yet on main` = unborn.
- **Vì sao vẫn phải cẩn thận:** Không có nguy cơ commit mồ côi, nhưng commit vào repo unborn sẽ tạo **commit đầu tiên của cả dự án**, gộp mọi file đang untracked — đó là mốc lịch sử, phải để chủ dự án quyết, không được làm như hệ quả phụ của một đợt vá tự động.
