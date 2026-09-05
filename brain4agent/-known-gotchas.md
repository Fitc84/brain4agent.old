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
→ Đã cài thành luật máy ở #11 (`BRN-018`); kỷ luật so hash vẫn giữ, nhưng engine cũ nay tự từ chối ghi.

## 13. Deploy Sinh File Lệnh Trùng Tên Lệnh BUILT-IN — Chiếm Chỗ `/compact` Của Claude Code
- **Triệu chứng:** user gõ `/compact` mong nén cửa sổ ngữ cảnh (tính năng built-in của Claude Code) nhưng agent lại chạy nghi thức ghi não vào `brain4agent/memory/hot/`. Không có lỗi, không cảnh báo — chỉ là **làm sai việc**.
- **Nguyên nhân:** `scripts/deploy_skills.ps1` sinh `C:\Users\hoang\.claude\commands\compact.md`. Claude Code nạp mọi `*.md` trong `~/.claude/commands/` thành slash-command, và file cùng tên **đè lên lệnh built-in**. Nghi thức ghi não vốn đã có lệnh riêng `/luu-nao` (chính nó ghi rõ *"KHÔNG phải lệnh `/compact` nén ngữ cảnh built-in"*) ⇒ file kia vừa THỪA vừa CHE tính năng gốc.
- **Bẫy kép — nội dung file còn bị hỏng:** script dùng here-string **nháy kép** `@"..."@`. Trong PowerShell, backtick là ký tự escape, nên `` `b `` → **backspace (0x08)** và `` `r `` → **CR**. Kết quả: `` `brain4agent` `` biến thành `<CR>ain4agent`, `` `roadmap.md` `` biến thành `\` + xuống dòng + `oadmap.md`, ```` ```bash ```` thành `\<0x07>sh`. Soi bằng byte thô mới thấy: `0x5c 0x08`.
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

## 15. Cổng An Toàn Chỉ IN Cảnh Báo Mà Không CHẶN — Nối `&&` Nên Lệnh Nguy Hiểm Vẫn Chạy
- **Triệu chứng:** cổng kiểm secret cuối cùng trước `git push` in ra `CO DAU VET`, nhưng lệnh `push` ngay sau đó **vẫn chạy** và hoàn tất. Người vận hành chỉ đọc được cảnh báo SAU khi việc đã rồi.
- **Nguyên nhân:** cổng được viết dạng `for ...; do ...; echo "CO DAU VET"; done && git push`. Vòng lặp chỉ **in** kết quả và gán biến, luôn kết thúc với mã thoát `0` ⇒ `&&` coi là thành công ⇒ push chạy. Biến `bad=1` không có tác dụng gì nếu không ai `exit` theo nó.
- **Luật rút ra:** cổng chặn thao tác khó đảo ngược (push, xoá, deploy) **BẮT BUỘC phải trả mã thoát khác 0 khi phát hiện vấn đề**: kết thúc bằng `[ $bad -eq 0 ] || exit 1`, hoặc tách hẳn thành lệnh riêng và ĐỌC kết quả trước khi gõ lệnh sau. Không bao giờ nối cổng với hành động bằng `&&` khi cổng chỉ `echo`.
- **Hệ quả phụ cần biết:** regex quét secret dễ dính **dương tính giả** vì chính tài liệu mô tả mẫu quét (ví dụ câu "quét bằng regex `api_key|bearer|token|sk-|ghp_|AIza`" sẽ khớp mẫu `ghp_`). Cổng phải **in ra dòng khớp** để phân biệt được khoá thật với văn bản mô tả, thay vì chỉ đếm.
- **Nguồn:** kế hoạch #08, 2026-09-02 — lỗi của chính orchestrator, ghi lại để không lặp.

## 16. `git checkout-index -f` KHÔNG Ghi Đè File Đã Tồn Tại
- **Triệu chứng:** cần đưa file trong cây làm việc về đúng dạng xuống dòng của `.gitattributes`; chạy `git checkout-index --force -- <file>` xong đo lại thì file **y nguyên** (vẫn 53 CRLF).
- **Nguyên nhân:** cờ `-f`/`--force` của `checkout-index` không có nghĩa "ghi đè file đang có" như trực giác.
- **Cách đúng:** `rm -- <file>` rồi `git checkout -- <file>`. **BẮT BUỘC** kiểm `git status --porcelain -- <file>` rỗng trước khi xoá — chỉ làm với file không có thay đổi chưa commit.
- **Nguồn:** kế hoạch #09, WP5a, 2026-09-02.

## 17. Đếm TOKEN TRẦN Để Dò Luật Nhân Đôi — 15 Báo Động Giả
- **Triệu chứng:** công cụ quét báo **15 repo** có "token luật lặp 2 lần", trong khi soi tay thì không repo nào nhân đôi luật thật.
- **Nguyên nhân:** chính engine, khi vá theo **đường phụ lục**, sinh ra TIÊU ĐỀ chứa token (`## [PHỤ LỤC TỰ ĐỘNG VÁ] ... SPEC PACKAGE bắt buộc`) rồi thân luật lặp lại token. Repo vá **đúng** vẫn đếm ra 2. Ngoài ra token còn xuất hiện trong văn xuôi tham chiếu.
- **Số đo:** đếm token trần → 2 ở 8 repo; đếm **mệnh đề luật** (`BẮT BUỘC DẠNG SPEC PACKAGE`, `NGOẠI LỆ TƯỜNG MINH — Marker...`, nguyên văn tiêu đề Luật J) → **1 ở tất cả**. Sau khi sửa: lỗi từ 15 xuống 1, repo sạch từ 44 lên 58.
- **Luật rút ra:** dò trùng lặp phải neo vào **mệnh đề chuẩn tắc**, không neo vào từ khoá. Từ khoá còn sống trong tiêu đề tự sinh và trong văn xuôi.
- **Nguồn:** kế hoạch #09, WP4, phát hiện khi quét thật hệ sinh thái.

## 18. Đo Mã Thoát Qua Ống Dẫn Trả Về Mã Của Lệnh CUỐI
- **Triệu chứng:** `lenh_can_do | tail -5; echo $?` luôn in `0` dù lệnh cần đo thất bại. Đã dính **ba lần** trong một phiên, một lần khiến `git push` chạy dù cổng kiểm vừa báo có vấn đề.
- **Nguyên nhân:** trong shell, `$?` sau một ống dẫn là mã thoát của lệnh **cuối cùng** (`tail`, `head`, `cut`, `grep`), không phải lệnh đầu.
- **Cách đúng:** chạy lệnh **không qua ống**, chuyển hướng ra `/dev/null` hoặc ra file rồi đọc `$?`; hoặc dùng `${PIPESTATUS[0]}`. Với cổng chặn thao tác khó đảo ngược thì **luôn tách thành lệnh riêng**, đọc kết quả, rồi mới gõ lệnh sau — đừng nối `&&` (xem gotcha #15).
- **Nguồn:** kế hoạch #09, 2026-09-02 — lỗi của chính orchestrator, lặp lại 3 lần nên ghi thành luật.
## 19. Bước CI Trỏ Tài Nguyên Chưa Commit — Local Xanh 100% Không Chứng Minh Bước CI Chạy Được
- **Triệu chứng:** local 192/192 test xanh, mọi cổng tự kiểm đạt; push lần đầu thì CI **đỏ cả 2 OS** tại bước `doctor-fixture-check` — doctor thoát mã 3 (`root không tồn tại`) thay vì 2.
- **Nguyên nhân:** bước CI `doctor-fixture-run` trỏ vào `tests/fixtures/fleet` (SPEC-P05 bước 9 quy định) nhưng fixture **chưa từng được tạo**; bộ test doctor dựng fleet trong thư mục tạm nên không test nào đụng tới đường dẫn đó — tài nguyên chỉ CI dùng thì chỉ CI mới phát hiện thiếu.
- **Luật rút ra:** mọi tài nguyên mà một bước CI tham chiếu (fixture, script, đường dẫn) phải có **test local chốt sự tồn tại** (dạng T-H06), để `npm test` đỏ trước khi CI kịp đỏ. Khi viết workflow, đối chiếu từng đường dẫn trong `ci.yml` với `git ls-files`.
- **Nguồn:** kế hoạch #09, run CI đầu tiên 33608846259, 2026-09-02. Sửa tại `fc03be5`.
## 20. Mốc Marker Phải Chiếm Trọn Một Dòng — Thụt Lề Là Vô Hình Với Engine
- **Triệu chứng:** đặt `<!-- brain:rule:x -->` thụt lề (trong ví dụ, trong khối ```) — engine không thấy, coi khối là `absent`.
- **Nguyên nhân:** so khớp mốc theo `lines[i] === OPEN(id)` NGUYÊN DÒNG sau `normalizeEol` — cố ý, để mốc nằm trong khối code ví dụ không bị nhận nhầm (F09 có ca này làm chứng).
- **Luật:** viết mốc ở cột 0, một mình một dòng. Kèm theo: đoạn `legacy` khớp mà không kết thúc ở cuối dòng ⇒ mốc CLOSE dính đuôi văn bản ⇒ lần chạy sau `malformed` (fail-closed, không mất dữ liệu — nhưng cần người gỡ).
- **Nguồn:** kế hoạch #10, WP1, 2026-09-02.

## 21. Đếm Chuỗi Dò Luật Có Cả ÂM TÍNH GIẢ — 9 Repo Thiếu Luật Mà Vẫn "Sạch"
- **Triệu chứng:** 9–10 repo không hề có phát biểu Bước 0, engine v1.6.0 vẫn cho qua BRN-002.
- **Nguyên nhân:** token `xay-dung-nao-bo` xuất hiện ở luật J mục 4 ⇒ `includes(token)` = true dù luật thật vắng. Anh em ngược chiều của gotcha #17 (dương tính giả) — cùng căn nguyên: đếm chuỗi thay vì định biên.
- **Luật:** dò sự tồn tại của luật phải định biên bằng mốc máy-đọc (khối marker), không bằng chuỗi con.
- **Nguồn:** kế hoạch #10, đo thật trên fleet khi viết SPEC, 2026-09-02.

## 22. Template Và Bản Vá Là Hai Nguồn Văn Bản — Tự Trôi Lệch Nhau
- **Triệu chứng:** `renderFullAgentsMd` hardcode ví dụ `v1.2.0.md` trong khi `patchAgentsMd` nội suy `${version}` ⇒ repo khởi tạo mới và repo được vá mang hai văn bản khác nhau cho CÙNG một luật.
- **Cách trị (đã làm ở #10):** `renderFullAgentsMd = patchAgentsMd(AGENTS_SKELETON)` — thân luật chỉ tồn tại MỘT bản trong `RULE_BLOCKS`; thân luật không chứa version (TQ3).
- **Luật:** mọi văn bản máy quản phải có đúng một nguồn; template chỉ là skeleton + mốc rỗng.
- **Nguồn:** kế hoạch #10, phát hiện khi viết SPEC-P03, 2026-09-02.
## 23. File Lệnh Global Nằm NGOÀI Ma Trận Đồng Bộ — Trôi Lệch Luật Mà Không Cổng Nào Bắt
- **Triệu chứng:** khung não lên v1.4.0 (Bước 0 phải chạy `--check` trước, `exit 2` = cần người), nhưng `~/.claude/commands/xay-dung-nao-bo.md` vẫn dạy agent chạy thẳng **chế độ GHI** và chỉ biết 2 kết cục ⇒ **file lệnh vi phạm chính luật mà bản phát hành đó vừa cài vào repo**.
- **Nguyên nhân:** file lệnh được sinh từ một template **hardcode trong `scripts/deploy_skills.ps1`**. Template đó không thuộc Ma Trận Đồng Bộ 6 Điểm, cũng không phải tài liệu module ⇒ không luật nào buộc rà khi luật khung đổi. Bước CI `deploy-dry` cũng không thấy được vì dry-run KHÔNG ghi file lệnh.
- **Cách trị:** (a) template chạy `--check` trước, phân nhánh theo mã thoát 0/1/2/3, nêu rõ gặp `BRN-016` thì DỪNG và CẤM tự sửa vùng luật; (b) cổng deploy đòi file lệnh chứa mốc `--check` + `BRN-016` (thiếu ⇒ `CMD-BAD`, exit 2); (c) test `T-H07` khoá template trong `npm test` — nơi DUY NHẤT kiểm được nội dung template mà không cần ghi ra đĩa.
- **Luật rút ra:** mọi **văn bản do máy sinh ra rồi phát tán ra ngoài repo** (file lệnh, hook, template deploy) phải có một test trong `npm test` neo nó vào luật hiện hành. Ngoài repo thì Ma Trận 6 Điểm không với tới.
- **Nguồn:** phát hiện khi kiểm bản deploy sau #10, 2026-09-04. Sửa tại `774da32`.

## 24. Đặt Tên Biến Trùng Biến Đếm Trong Script Dài — Vỡ Ở Chỗ Khác Hẳn
- **Triệu chứng:** thêm một khối kiểm vào `deploy_skills.ps1`, khối đó chạy đúng (in `CMD-OK`), nhưng script chết ở CUỐI: `[System.Object[]] does not contain a method named 'op_Addition'`.
- **Nguyên nhân:** biến mới đặt tên `$missing` (mảng) trùng biến đếm file thiếu `$missing = 0` khai báo cách đó ~35 dòng; dòng tổng kết `$diff + $missing` cộng số với mảng.
- **Cách tìm nhanh:** chạy đối chứng bản gốc (`git stash` → chạy → `git stash pop`) để phân định lỗi mới hay có sẵn, rồi `grep -n '\$tenbien'` xem toàn bộ điểm dùng.
- **Luật:** trong script > 100 dòng không có scope hàm, `grep` tên biến TRƯỚC khi đặt. PowerShell không cảnh báo khi ghi đè kiểu.
- **Nguồn:** 2026-09-04, lỗi của chính orchestrator khi sửa gotcha #23.

## 25. README Nằm Ngoài Mọi Cổng Kiểm Version — Lẫn Lộn Hai Trục Version Âm Thầm Qua Nhiều Đợt Phát Hành
- **Triệu chứng:** README công bố `v1.4.0` là version của dự án dù đó là version khung não; `package.json`, `ENGINE_VERSION` và `state.json.current_version` đã ở `1.7.1`.
- **Nguyên nhân:** các cổng `version-sync` chỉ canh các nguồn máy đọc của engine và state, không hề đọc README. Vì vậy một file giới thiệu công khai có thể trôi qua nhiều bản vá mà toàn bộ test vẫn xanh.
- **Cách trị:** T-H03f đọc ba điểm công bố version dự án trong README và buộc từng điểm khớp `package.json`; marker khung não được kiểm riêng, không bị coi nhầm là version dự án.
- **Nguồn:** vá nội bộ phần còn lại của kế hoạch #10, 2026-09-04.

## 26. Ghim SỐ VERSION Vào Cổng Của Việc CHƯA LÀM — Mỗi Bản Vá Làm Nó Rỗng Nghĩa
- **Triệu chứng:** hồ sơ kế hoạch #10 cùng lúc mang **ba** số version khác nhau trong các cổng nghiệm thu (`1.7.0` ở `TESTING-ACCEPTANCE.md`, `1.7.1` ở `plan.md`/`OPERATIONS.md`/`01-CONTRACTS.md`) trong khi thực tế đã là `1.7.2` — chỉ sau 2 bản vá PATCH.
- **Nguyên nhân:** cổng cho việc CHƯA làm (ở đây: deploy global) được viết dạng *"`--version` phải in `brain-engine 1.7.0 template 1.4.0`"*. Mỗi lần bump PATCH là số đó sai, và người sửa lại phải đuổi theo bằng tay ở nhiều file — lần nào cũng sót một file.
- **Nguy hiểm thật:** agent thực thi deploy sau này đọc cổng thấy số không khớp sẽ (a) báo hỏng giả, hoặc tệ hơn (b) "sửa cho khớp" bằng cách đổi version — đúng loại thao tác đã suýt gây thoái lui version.
- **Luật rút ra:** cổng hướng tới việc CHƯA làm **CẤM ghim số version cụ thể**; phải tham chiếu ĐỘNG (vd *"khớp đúng output `--version` của hub"*). Chỉ **nhật ký/lịch sử** mới được mang số cứng — và ngược lại, **CẤM sửa số trong dòng lịch sử** (`AGENTS.md` §3 mục 2.3): dòng ghi "#10 bump lên 1.7.0" phải giữ nguyên 1.7.0 dù nay đã 1.7.2.
- **Nguồn:** 2026-09-04, phát hiện khi soát bản vá v1.7.2.

## 27. Đánh ✅ Cho Cột CI Bằng Một Lần Chạy CŨ — Xanh Giả Trong Chính Bảng Nghiệm Thu
- **Triệu chứng:** bảng Exit Gate của kế hoạch được đánh ✅ toàn bộ cột `CI`, trong khi CI lần cuối chạy ở một commit **cách HEAD 3 commit chưa push** — và một trong 3 commit đó có đổi code (hằng số version + thêm một test).
- **Nguyên nhân:** agent đóng hồ sơ lấy câu "CI xanh 2 OS" trong phần BỐI CẢNH của nhiệm vụ làm bằng chứng, thay vì đo lại tại đúng commit đang xét. Bối cảnh mô tả quá khứ, không phải số đo hiện tại.
- **Luật rút ra:** mỗi ô `✅` phải gắn với **số đo tại ĐÚNG commit đang xét**. Nếu bằng chứng thuộc commit khác thì phải ghi rõ commit đó ngay cạnh bảng. Cột đo ở môi trường mà agent không chạm được (CI remote, máy thật, fleet) thì **cấm suy ra** từ mô tả trong prompt.
- **Cách phát hiện nhanh:** `git rev-list --left-right --count main...origin/main` và `gh run list --limit 1 --json headSha` — nếu `headSha` của run khác HEAD thì mọi ô CI đang là suy diễn.
- **Nguồn:** 2026-09-04, khi soát lượt đóng kế hoạch #10.

## 28. Cổng Đo "Sức Khoẻ Tổng Thể" Thay Vì "Thứ Việc Này Đổi" — Chặn Nhầm Việc Làm Đúng
- **Triệu chứng:** cổng của một đợt di trú ghi *"số repo `CLEAN` phải tăng đúng số repo trong lô"*. Lô chạy xong, di trú đúng hoàn toàn, nhưng `CLEAN` chỉ tăng 9/10 ⇒ cổng đỏ, rollout dừng.
- **Nguyên nhân:** 3 repo di trú **đúng** vẫn ở `WARNING` vì mang lỗi **CÓ SẴN, ngoài phạm vi** (`BRN-014` repo lồng nhau đang chờ user quyết; `BRN-017` file lạ trong `memory/archive/`). Cổng trộn *"việc này đã hội tụ chưa"* với *"đối tượng có hoàn hảo không"*.
- **Vì sao nguy hiểm hơn là phiền:** cổng chặn nhầm tạo áp lực **nới cổng** — và người thực thi rất dễ nới sang một tiêu chí lỏng hơn mức cần (vd "miễn không còn ERROR"), làm mất luôn phần bảo vệ thật.
- **Luật rút ra:** cổng phải đo **đúng đại lượng mà việc này thay đổi**, theo **từng đối tượng**, không đo tổng trạng thái. Ở đây đúng là: mỗi repo trong lô phải có `template_version` = đích, **không còn mã thuộc phạm vi di trú**, và idempotent tại chỗ. Lỗi có sẵn ⇒ **liệt kê cho user quyết**, không tự sửa, không dùng làm lý do chặn.
- **Nguồn:** 2026-09-04, Sóng 4 của rollout khung 1.4.0. Cổng đã sửa tại `OPERATIONS.md` §5.2.

## 29. Cùng Một Lỗi Cổng Tái Diễn Vì Chỉ Sửa CHỖ Bị Bắt, Không Sửa CẢ HỌ
- **Triệu chứng:** cổng Sóng 4 vừa được sửa vì đo "số `CLEAN` toàn đội hình" (#28). Vài giờ sau, Exit Gate `X20` trong **cùng bộ SPEC** lộ ra y hệt: *"doctor sau ≥ 63 CLEAN"* — cùng lỗi, cùng kế hoạch, cùng đợt.
- **Nguyên nhân:** khi #28 được phát hiện, việc sửa dừng lại ở **đúng dòng bị bắt**. Không ai quét xem **còn dòng nào khác trong bộ SPEC mắc cùng khuôn** — mà cổng sai thường được viết hàng loạt trong một lần, bởi cùng một người, cùng một lối nghĩ.
- **Dấu hiệu nhận biết khuôn:** cổng chứa **một con số tuyệt đối về trạng thái cuối của cả hệ** (`≥ 63 CLEAN`, `diff = 0`, `100% repo đạt`) cho một việc **chỉ đụng tới một phần** của hệ đó. Ghép thêm gotcha #26 (ghim số version vào việc chưa làm) thì đây là cùng một họ: **ghim hằng số vào cổng của việc chưa đo**.
- **Luật rút ra:** vá xong một lỗi cổng, **quét ngay cả bộ SPEC bằng chính đặc trưng của lỗi đó** trước khi đóng — `grep` các cổng chứa số tuyệt đối và tự hỏi từng cái: *"số này đo phép biến đổi bước này thực hiện, hay đo trạng thái cuối mong muốn của cả hệ?"* Chỉ loại một là đúng.
- **Nguồn:** 2026-09-04, đóng #10. Sửa tại `TESTING-ACCEPTANCE.md` §6 (`X20`) + §6.1. Xem #26, #28.

## 30. Thư Mục Lồng Trùng Tên KHÔNG Mặc Nhiên Là Bản Sao Thừa — Có Khi Repo Cha Chỉ Là Cái Vỏ
- **Triệu chứng:** `brain-doctor` báo `BRN-014` cho `X/X` (repo tự chứa chính nó). Suy luận tự nhiên: *"tiến trình nhân bản (gotcha #9) chép lỗi, gỡ thư mục lồng là xong"*. Suy luận đó **SAI** ở 3/9 trường hợp đo được, và nếu làm theo sẽ **xoá sạch toàn bộ dự án**.
- **Nguyên nhân:** với `AI-input`, `bi-kip-luyen-agent`, `congquyengop.vn`, repo cha **chỉ chứa 13 file** — đúng bộ file não do `init_brain.js` sinh ra — còn **100% mã nguồn thật nằm trong thư mục lồng**. Repo cha là **cái vỏ** được `git init` cao hơn một tầng; thư mục lồng mới là dự án.
- **Phép thử quyết định (rẻ, chạy trước mọi thao tác gỡ):** đếm file của repo cha **loại trừ** thư mục lồng.
  - ra **~13 file** ⇒ cha là VỎ ⇒ **CẤM gỡ thư mục lồng**;
  - ra hàng nghìn file, và thư mục lồng có **0 file riêng** so với repo top-level cùng tên ⇒ đúng là bản sao thừa.
- **BỐN tầng bằng chứng bắt buộc trước khi gỡ bất kỳ thư mục lồng nào:** (1) tồn tại repo top-level **cùng tên**; (2) `comm -23` danh sách file cho **0 file chỉ-có-ở-bản-lồng**; (3) `rev-list --all` cho **0 commit riêng** và `stash list` = 0; (4) **`git -C <repo-cha> ls-files <thư-mục-lồng>` phải RỖNG**. Thiếu một tầng ⇒ không gỡ.
- **Tầng 4 sinh ra từ một lần suýt hỏng thật (2026-09-04).** Ba tầng đầu đều đạt cho `openclaw-pro-studio/cross_ai_bridge`, nên đã gỡ — và cuốn theo **4 file mã nguồn mà repo cha ĐANG TRACK** (`ask.py`, `server.py`, `extension/*`). Nguyên nhân: thư mục đó vừa là **thư mục con hợp lệ được track**, vừa bị tiến trình nhân bản **clone đè một repo git vào bên trong**. Ba tầng đầu chỉ so bản lồng với repo top-level — chúng **mù** với quan hệ giữa bản lồng và repo CHA. Cứu được nhờ `git checkout -- <thư mục>` ngay sau đó (4 file khớp `HEAD`, `git diff --quiet HEAD` sạch), nhưng nếu chúng chưa từng được commit thì đã mất hẳn.
- **Hệ quả vận hành:** sau MỌI thao tác gỡ thư mục lồng, chạy `git status` repo cha và soi các dòng ` D `. Có dòng nào ⇒ khôi phục trước, hỏi sau. Chỉ dòng `D  <tên>` (gitlink 160000 đã staged) mới là kết quả mong muốn.
- **Bẫy phụ:** bản lồng luôn hiện "có thay đổi chưa commit" vì thao tác chép làm đổi `mtime` ⇒ chỉ là nhiễu stat-cache. Phân biệt bằng `git diff --numstat`: `N N` (thêm = xoá) là lệch CRLF, không phải nội dung mới. Kiểm chốt bằng `cmp` với file top-level.
- **Nguồn:** 2026-09-04, xử `BRN-014` sau #10. 3 vỏ bọc · 3 bản sao thừa thật · 3 nội dung riêng không gỡ được.

## 31. Cảnh Báo Của Doctor Hub Áp Lên Repo Có Kiến Trúc Não RIÊNG Là ÂM TÍNH GIẢ
- **Triệu chứng:** `Agent to Product` bị báo `BRN-017` (file lạ trong `memory/archive/`) vì có `session_log.jsonl`. Kế hoạch dọn dẹp coi đó là rác, định `git mv` ra chỗ khác.
- **Sự thật:** repo đó theo diện **cộng sinh** từ kế hoạch #05 — nó có Brain OS riêng, và `session_log.jsonl` được **5 nơi đang sống** tham chiếu: skill `.compact` của chính nó (ghi append vào đó), `-data-architecture.md`, `Context_Index.md`, `README.md`, và **`brain4agent/scripts/brain_doctor.py` — bản doctor RIÊNG của repo đó**. Chuyển file = gãy skill + gãy doctor của họ.
- **Luật rút ra:** trước khi "dọn" một file ở repo vệ tinh, luôn `grep -rn "<tên file>"` toàn repo. Doctor của hub chỉ biết luật của hub; repo được ghi nhận là **cộng sinh** thì cảnh báo hình thức của hub **không có thẩm quyền** ở đó. Ghi vào diện ngoại lệ, đừng "sửa cho sạch bảng".
- **Nguồn:** 2026-09-04. Đây chính là cái bẫy đã tự viết ra trong prompt giao việc (*"file trông như rác có thể là input của cổng CI"*) — và suýt tự bước vào.
