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

## 5b. Não Song Trùng — Chạy Engine Đè Lên Não Schema Cũ
- **Triệu chứng:** não hóa một dự án cũ xong, agent đời sau đọc `brain4agent/index.md` thấy trống rỗng và mất sạch trí nhớ dự án, dù dữ liệu vẫn còn nguyên trên đĩa.
- **Nguyên nhân:** `init_brain.js` chỉ sinh file THIẾU **theo tên chuẩn** — nó không hiểu ngữ nghĩa. Dự án cũ để dữ liệu ở tên/vị trí khác (`core/memory-distill.txt`, `gotchas.md`, `modules/-api-routing.md`...) thì engine coi như phân vùng chuẩn chưa tồn tại và sinh bản RỖNG nằm cạnh bản ĐẦY. Hai bộ song song, agent đọc đúng tên chuẩn nên trúng bộ rỗng.
- **Cách tránh:** luôn **di trú ngữ nghĩa TRƯỚC, chạy engine SAU**. Con người/agent quyết file nào là gotchas/roadmap/data-architecture rồi `git mv` về đúng tên chuẩn; engine chỉ được lấp phần cấu trúc còn thiếu. Không bao giờ để engine "đoán" ngữ nghĩa.
- **Trường hợp không di trú được** (dự án có Brain OS riêng đang vận hành, di trú sẽ gãy logic): dùng mẫu **cộng sinh** — giữ nguyên hệ legacy, biến mỗi phân vùng chuẩn rỗng thành **pointer file ≤15 dòng** trỏ về file legacy tương ứng. Tuyệt đối KHÔNG copy nội dung sang (sẽ thành 2 nguồn chân lý lệch nhau).
- **Nguồn:** kế hoạch #05, thấy rõ nhất ở `Audit` (lồng `core/`+`modules/`+`setup/`) và `Agent to Product` (Brain OS legacy đầy đủ).

## 5c. Đừng Tin "File Root Trông Như Rác" — Grep Tham Chiếu Trước Khi Dọn
- **Triệu chứng:** dọn Root Clean, xoá/di chuyển mấy file trông như nháp (`task.md`, `memory-distill.md`) → gãy pipeline kiểm định của dự án.
- **Nguyên nhân:** ở dự án có governance riêng, các file này có thể là **projection sinh tự động từ registry** hoặc **đầu vào bắt buộc của gate CI**. Ví dụ thật (`reverse Claude`): `memory-distill.md` nằm trong `DOCS_TO_CHECK` của `scripts/verify-documentation-integrity.js` — thiếu file là FAIL gate; `task.md` là dashboard sinh từ `spec-registry.json`.
- **Cách tránh:** trước khi di chuyển/xoá BẤT KỲ file nào, `grep -r "<tên file>"` toàn repo (trừ `node_modules`, `.git`, thư mục dữ liệu thô). Có tham chiếu → GIỮ NGUYÊN, ghi chú vào `-known-gotchas.md` của repo đó.
- **Hệ quả kèm theo:** quy ước sẵn có của dự án THẮNG dự đoán trong SPEC. Cùng ca đó, SPEC ghi transcript vào `raw/` nhưng `raw/` là input read-only ghim manifest SHA và hook hygiene báo động mọi path chứa `raw` → đích đúng là `scratch/` theo `CODEBASE_ATLAS.md` của chính dự án.

## 5. Nhầm "Unborn Branch" Thành "Detached HEAD"
- **Triệu chứng:** `git rev-parse --abbrev-ref HEAD` in ra đúng chữ `HEAD` → tưởng repo đang detached, sợ commit sẽ mồ côi nên né.
- **Nguyên nhân:** Repo mới `git init` và **chưa có commit nào** (unborn branch) cũng làm `--abbrev-ref HEAD` in `HEAD` và `rev-parse HEAD` báo `fatal: Needed a single revision` — trùng triệu chứng với detached.
- **Cách phân biệt (dứt khoát):** đọc trực tiếp `.git/HEAD` — `ref: refs/heads/<tên>` là **unborn/bình thường**, còn **SHA trần** mới là detached thật. Hoặc `git status -sb`: `## No commits yet on main` = unborn.
- **Vì sao vẫn phải cẩn thận:** Không có nguy cơ commit mồ côi, nhưng commit vào repo unborn sẽ tạo **commit đầu tiên của cả dự án**, gộp mọi file đang untracked — đó là mốc lịch sử, phải để chủ dự án quyết, không được làm như hệ quả phụ của một đợt vá tự động.

## 6. PowerShell Không Phân Biệt Hoa/Thường Tên Biến — `$sec` Ghi Đè `$SEC` Làm Chết Cổng Kiểm Secret
- **Triệu chứng:** script quét secret hàng loạt chạy đúng ở repo ĐẦU TIÊN, từ repo thứ hai trở đi trả kết quả vô lý — có repo liệt kê MỌI file là "ứng viên secret", có repo bỏ sót cả `.env` nằm sờ sờ ở root. Không lỗi, không cảnh báo.
- **Nguyên nhân:** hằng số regex đặt tên `$SEC` (`$SEC = '(?i)(^\.env...|secret|credential|...)'`), còn vòng lặp per-repo lại đặt `$sec = @(Find-SecretFiles $p)`. **PowerShell coi `$SEC` và `$sec` là CÙNG MỘT biến** ⇒ ngay sau repo đầu tiên, regex bị thay bằng mảng đường dẫn file. Từ đó `-match $SEC` so khớp với chuỗi nối của mảng đó, cho kết quả ngẫu nhiên.
- **Bẫy kép:** cùng lỗi này làm hàm `Assert-NoSecretStaged` mất hiệu lực trong im lặng — cổng an toàn *báo PASS* trong khi thực ra không kiểm gì cả.
- **Cách phát hiện:** đừng chỉ nhìn "PASS/FAIL", hãy **nhìn dữ liệu cổng kiểm in ra**. `control-tailscale` không có file secret nào mà in ra 13 ứng viên → đó là tín hiệu. Nguyên tắc: cổng an toàn phải in bằng chứng, không chỉ in kết luận.
- **Khắc phục:** (a) đặt tên hằng số dài, khác biệt rõ (`$SECRET_RE`, `$SECRET_OK_RE`) và biến vòng lặp khác hẳn (`$secList`); (b) **kiểm chứng độc lập bằng nguồn khác**: sau khi commit, audit lại bằng `git ls-files` trên toàn repo với regex viết TẠI CHỖ — nếu 2 đường đo độc lập cùng nói CLEAN thì mới tin.
- **Nguồn:** chiến dịch #06, phát hiện ngay trong lượt chạy P01 (9 repo `git init`); đã chạy lại toàn bộ cổng bằng code sửa và audit độc lập — cả 9 repo sạch.

## 7. Audit Hàng Loạt Đếm "File Bẩn" Che Mất Repo Git LỒNG NHAU
- **Triệu chứng:** khảo sát ghi `AI-input`(2 file bẩn), `bi-kip-luyen-agent`(2), `congquyengop.vn`(2) — trông như repo gần sạch, chỉ cần commit là xong. Đến lúc thực thi mới thấy `git add -A -n` in ra `add 'AI-input/'` **có dấu `/` ở cuối**.
- **Nguyên nhân:** `git status --porcelain` gộp **cả một repo git con** thành ĐÚNG MỘT dòng. Con số "2 file bẩn" thật ra là `.gitignore` + toàn bộ một dự án khác nằm lồng bên trong (có repo nặng 1.4 GB).
- **Vì sao nguy hiểm:** `git add` một thư mục chứa `.git` riêng sẽ ghi **gitlink mode `160000`** mà KHÔNG có `.gitmodules` kèm URL ⇒ commit trỏ tới một SHA không ai tìm lại được; clone repo ngoài về sẽ ra thư mục rỗng, và người sau tưởng mất dữ liệu.
- **Cách phát hiện (rẻ, làm trước mọi first-commit):** (1) `git add -A -n` rồi grep dòng khớp `^add '.*/'$`; (2) `Get-ChildItem -Recurse -Directory -Force -Filter '.git'` và lọc những cái KHÔNG phải `.git` ở root; (3) sau commit `git ls-files -s | Where-Object { $_ -match '^160000' }` phải rỗng.
- **Khắc phục:** KHÔNG tự quyết. Repo lồng là quyết định cấu trúc của chủ dự án — hoặc là submodule thật (cần URL remote), hoặc phải gitignore, hoặc gỡ một tầng thư mục. Dừng repo đó và hỏi.
- **Nguồn:** chiến dịch #06 SPEC-P02 — 4/13 repo unborn phải dừng vì lý do này (`AI-input`, `bi-kip-luyen-agent`, `congquyengop.vn`, `manage-fitc84`); ngoài ra `FITC84-WorkOs-`, `openclaw-pro-studio`, `Token-Calcultor` cũng dính.

## 8. Kho Nhiều Repo — Phiên Agent KHÁC Đang Chạy Song Song Làm Trạng Thái Đổi Giữa Chừng
- **Triệu chứng:** chụp kiểm kê đầu phiên xong, làm việc 15 phút, chụp lại thì HEAD của mấy repo mình chưa hề đụng đã đổi; có repo đang sạch bỗng bẩn 2-3 file.
- **Nguyên nhân:** người dùng mở nhiều phiên agent trên cùng workspace. Đo được bằng `git log -1 --date=format:'%H:%M:%S'` — dấu thời gian commit nằm GIỮA phiên của mình.
- **Vì sao nguy hiểm:** (a) dễ kết luận nhầm "repo lệch hiện trạng khảo sát → có bất thường"; (b) tệ hơn, commit đè lên việc đang dở của phiên khác, hoặc `git add -A` nuốt luôn file phiên kia vừa tạo.
- **Cách xử:** trước khi commit hộ BẤT KỲ repo bẩn nào, chạy `git log -1 --format='%ad' --date=format:'%Y-%m-%d %H:%M:%S'`. Nếu commit gần nhất nằm trong vòng vài chục phút của phiên hiện tại ⇒ coi như **repo đang có người làm**, chỉ báo cáo, không đụng. Với repo hub thì kiểm lại `git status` ngay trước khi commit đồng bộ.
- **Nguồn:** chiến dịch #06 — `control-claude-code`, `fitc84.com`, `ai-news-radar` và chính hub `brain4agent.old` đều nhận commit từ phiên khác lúc 17:36–17:45 trong khi #06 đang chạy.
