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

## 9. Tiến Trình NHÂN BẢN Ngoài Git Sao Chép Repo Vào Thư Mục Lồng — Làm Gãy `git status` Của Repo Cha
- **Triệu chứng:** `git status` ở repo cha thỉnh thoảng chết hẳn với `fatal: bad object HEAD` / `failed in submodule <X>`; và liên tục hiện file lạ (`?? cross_ai_bridge/brain4agent/`) dù không ai sửa gì trong repo cha.
- **Nguyên nhân:** có một tiến trình sao chép **gần-thời-gian-thực** chép `.My-Repositories\<repo>` ở cấp trên đè vào bản lồng cùng tên bên trong repo khác. Khi bản top-level có commit mới, object store mới bị chép đè lên bản lồng ⇒ SHA gitlink cũ mà repo cha đang ghi (`160000 8ae15d32`) **biến mất khỏi object store** ⇒ `bad object HEAD`.
- **Cách nhận diện (đây là phần khó):** KHÔNG phải junction/symlink/hardlink — `fsutil reparsepoint query` và `fsutil hardlink list` đều phủ định, `LinkType` rỗng. Dấu vân tay quyết định là **`CreationTime` bản lồng trễ hơn bản top-level 13–71 giây trong khi `LastWriteTime` giống hệt** — đó là chữ ký của thao tác copy bảo toàn mtime nhưng reset ctime. Thêm: `.git/` hai bên byte-identical, `git count-objects -v` khớp từng số.
- **Chưa định danh được công cụ.** Đã loại: Syncthing (config chỉ phủ `C:\Users\hoang\Documents\agent-share`), scheduled task, marker của Dropbox/Resilio/GoodSync/FreeFileSync/Backblaze. Còn ngờ: Google Drive for desktop, hoặc tiện ích IDE/agent.
- **Cách làm việc an toàn khi chưa tắt được nguồn:** cấm `git add -A` ở repo cha; stage tường minh + `git commit -- <paths>`; đọc trạng thái bằng `git status --porcelain --ignore-submodules=all`; trước commit kiểm `git ls-files -s | Select-String '^160000'`.
- **Quy mô:** quét toàn kho thấy **12 cặp repo lồng** cùng kiểu, gồm cả bản tự-lồng-trùng-tên (`AI-input\AI-input`, `bi-kip-luyen-agent\bi-kip-luyen-agent`, `congquyengop.vn\congquyengop.vn`).
- **Nguồn:** chiến dịch #06 đợt đóng nốt, 2026-09-01.

## 10. Não Hóa Repo Đang Bẩn Mà Không Đụng Việc Dang Dở Của User
- **Vấn đề:** repo có 59/294 file user đang sửa, nhưng vẫn cần thêm bộ não chuẩn. `git add -A` sẽ commit hộ việc của user; bỏ qua repo thì không bao giờ đạt chuẩn.
- **Cách làm đã kiểm chứng trên 8 repo:** (1) chụp `git status --porcelain` làm ĐƯỜNG CƠ SỞ trước khi động vào gì; (2) chỉ stage bằng đường dẫn tường minh các file MỚI mình tạo; (3) commit bằng dạng **`git commit -m "..." -- <paths>`** — dạng pathspec này chỉ commit đúng path đó **kể cả khi index đã có thứ khác user stage sẵn** (ca `Token-Calcultor`: user đang có `D wikiultra` staged, commit thường sẽ cuốn luôn); (4) cuối cùng `diff` đường cơ sở với `git status` mới — phải giống hệt từng dòng.
- **Ngoại lệ phải né engine:** nếu `AGENTS.md` hoặc `brain4agent/memory/hot/state.json` của repo ĐANG nằm trong danh sách bẩn thì **KHÔNG chạy `init_brain.js`** (nó sẽ sửa đúng 2 file đó). Thay vào đó chép tay `CLAUDE.md` + marker từ một repo đã chuẩn. Đánh đổi: `state.json` tạm thiếu field `brain_template_version` cho tới khi user commit xong và engine chạy được — phải ghi rõ ra báo cáo, đừng giấu.
- **Nguồn:** chiến dịch #06 đợt đóng nốt (`control-gpm`, `GramPilot`, `CV`, `convert-json-...`, `ViDiaNorm`, `FITC84-WorkOs-`, `Token-Calcultor`, `openclaw-pro-studio`).

## 11. Regex Vá Tài Liệu Dùng `\n` Cứng — Trượt Trên File CRLF Rồi CHÈN THÊM Thay Vì THAY THẾ
- **Triệu chứng:** sau một đợt vá luật hàng loạt, `AGENTS.md` của 33 repo chứa **đồng thời** khối luật CŨ và khối luật MỚI — hai phát biểu ngược nhau cùng sống. Engine vẫn báo `NÃO ĐÃ OK`. Agent đời sau đọc trúng khối nào là hên xui.
- **Nguyên nhân:** nhánh vá dò khối cũ bằng regex `/2\. \*\*...\*\*\n(?:.*\n)*?   ```\n/`. Trên Windows, git checkout với `core.autocrlf` cho ra file **CRLF**, nên `   ```\n` không khớp (thực tế là `   ```\r\n`). Regex trượt ⇒ code rơi xuống nhánh dự phòng "chèn thêm sau tiêu đề §3" ⇒ **nhân đôi luật thay vì thay thế**.
- **Vì sao nguy hiểm gấp đôi:** nhánh dự phòng được thiết kế cho ca "không tìm thấy khối cũ vì repo chưa từng có nó" — hoàn toàn hợp lệ. Khi regex trượt vì lý do kỹ thuật, nó **im lặng đi vào nhánh hợp lệ đó**, không có lỗi, không cảnh báo.
- **Cách vá:** (a) mọi regex chạm nội dung file phải dùng `\r?\n`, không bao giờ `\n` trần; (b) thêm **chẩn đoán hậu điều kiện** vào `isFullyStandard` — "không được tồn tại đồng thời khối cũ và khối mới" — để tình trạng này bị PHÁT HIỆN thay vì được chấp nhận âm thầm; (c) thêm nhánh dọn tàn dư cho repo đã lỡ bị nhân đôi.
- **Cổng kiểm đúng cho một đợt vá THAY THẾ:** không phải "chỉ-thêm / 0 dòng xoá" (bản vá thay thế thì xoá dòng là ĐÚNG), mà là **"không mất thông tin"** — liệt kê các token bắt buộc và kiểm chúng vẫn còn sau khi vá.
- **Nguồn:** kế hoạch #07, 2026-09-02.

## 12. Bản Deploy Global Kẹt Phiên Bản Cũ — Nguy Cơ Thoái Lui Thầm Lặng Toàn Hệ Sinh Thái
- **Triệu chứng:** hub đã ở template `1.3.0` nhưng bản engine tại `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js` vẫn là `1.2.0`.
- **Vì sao chết người:** Bước 0 được ghi vào `memory-distill.txt` của **mọi** repo trỏ tới **bản global**. Agent nào tuân thủ Bước 0 sẽ chạy engine CŨ; engine cũ coi marker `brain4agent-v1.3.0.md` là "lỗi thời", **xoá nó và ghi lại marker 1.2.0** ⇒ kéo ngược cả hệ sinh thái về chuẩn cũ, âm thầm, không báo lỗi.
- **Cách phát hiện:** sau MỌI lần sửa engine, so hash từng file giữa `.agents/skills/.xay-dung-nao-bo/` và bản global; `diff` phải RỖNG. Đừng tin "đã chạy deploy rồi".
- **Cách khắc phục:** backup bản global → chạy `scripts/deploy_skills.ps1` → so hash lại. Luật §5.B đã yêu cầu điều này; lỗi xảy ra vì bump version mà bỏ qua bước deploy.
- **Nguồn:** kế hoạch #07, 2026-09-02.

## 13. Deploy Sinh File Lệnh Trùng Tên Lệnh BUILT-IN — Chiếm Chỗ `/compact` Của Claude Code
- **Triệu chứng:** user gõ `/compact` mong nén cửa sổ ngữ cảnh (tính năng built-in của Claude Code) nhưng agent lại chạy nghi thức ghi não vào `brain4agent/memory/hot/`. Không có lỗi, không cảnh báo — chỉ là **làm sai việc**.
- **Nguyên nhân:** `scripts/deploy_skills.ps1` sinh `C:\Users\hoang\.claude\commands\compact.md`. Claude Code nạp mọi `*.md` trong `~/.claude/commands/` thành slash-command, và file cùng tên **đè lên lệnh built-in**. Nghi thức ghi não vốn đã có lệnh riêng `/luu-nao` (chính nó ghi rõ *"KHÔNG phải lệnh `/compact` nén ngữ cảnh built-in"*) ⇒ file kia vừa THỪA vừa CHE tính năng gốc.
- **Bẫy kép — nội dung file còn bị hỏng:** script dùng here-string **nháy kép** `@"..."@`. Trong PowerShell, backtick là ký tự escape, nên `` `b `` → **backspace (0x08)** và `` `r `` → **CR**. Kết quả: `` `brain4agent` `` biến thành `ain4agent`, `` `roadmap.md` `` biến thành `\` + xuống dòng + `oadmap.md`, ```` ```bash ```` thành `\sh`. Soi bằng byte thô mới thấy: `0x5c 0x08`.
- **Cách phát hiện:** (a) đối chiếu tên file trong `~/.claude/commands/` với danh sách lệnh built-in (`/compact`, `/clear`, `/help`, `/model`, `/init`…) — trùng tên nào là chiếm chỗ tên đó; (b) sau mỗi lần deploy, đọc lại file đã sinh và đếm byte `0x08` — phải bằng 0.
- **Khắc phục:** (1) trong script, mọi nội dung Markdown tĩnh phải dùng here-string **nháy đơn** `@'...'@` để backtick giữ nguyên nghĩa literal; (2) KHÔNG sinh file lệnh trùng tên built-in — đã gỡ hẳn khối sinh `compact.md`; (3) file cũ đổi tên thành `compact.md.disabled-by-plan07` (đuôi khác `.md` nên không được nạp) thay vì xoá, để còn đường lùi.
- **Nguồn:** kế hoạch #07, 2026-09-02 — user tự phát hiện khi thấy `/compact` chạy sai việc.

## 14. Kho CÔNG KHAI Mang Bản Đồ Vị Trí Secret Của Kho RIÊNG TƯ
- **Triệu chứng:** hub `brain4agent.old` là repo **PUBLIC**, nhưng tài liệu chiến dịch #06/#07 ghi thẳng bảng *repo → đường dẫn → loại khoá* của 6 dự án **PRIVATE**. Bản thân giá trị khoá không lộ, nhưng đây là chỉ dẫn sẵn cho người tấn công: chỉ cần một repo private kia lỡ chuyển sang public là biết ngay phải mở file nào.
- **Nguyên nhân gốc:** viết phát hiện bảo mật vào não/kế hoạch mà **không kiểm `visibility` của chính repo đang ghi**. Não là để chia sẻ ngữ cảnh; nhưng hub public thì mọi thứ trong đó là công bố.
- **Luật rút ra:** trước khi ghi bất kỳ phát hiện bảo mật nào vào docs, chạy `gh repo view --json visibility`. Repo PUBLIC ⇒ chỉ được ghi **sự kiện + số đếm** (ví dụ "4 repo có secret tracked từ trước"), TUYỆT ĐỐI không ghi đường dẫn và loại khoá. Chi tiết đưa vào hồ sơ **ngoài git** rồi trỏ tới nó.
- **Bẫy khi khắc phục:** sửa file ở commit mới là **KHÔNG đủ** — nội dung vẫn nằm trong diff của các commit trước và `git log -p` đọc được hết. Commit chưa push thì phải **viết lại lịch sử** (`git filter-branch --tree-filter`) trước khi push; commit đã push rồi thì buộc phải force-push và coi như khoá đã lộ.
- **Bẫy kỹ thuật khi viết lại:** `--tree-filter` checkout theo `core.autocrlf` nên file có thể thành CRLF trong thư mục tạm. Vì vậy **mọi cặp thay thế phải nằm trọn MỘT dòng** — chuỗi tìm kiếm chứa ký tự xuống dòng sẽ trượt trên bản CRLF (cùng họ gotcha #11).
- **Nghiệm thu bắt buộc:** duyệt **mọi file × mọi commit** trong khoảng sắp push bằng `git show <sha>:<path>` cộng regex marker, phải ra 0. Chỉ `git grep` ở HEAD là chưa đủ.
- **Nguồn:** 2026-09-02, ngay trước lần push đầu tiên của chiến dịch — user ra lệnh "loại bỏ các bí mật quan trọng ra khỏi lần push này".

