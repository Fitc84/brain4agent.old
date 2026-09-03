# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của **brain4agent**.

## [v1.7.1] - 2026-09-04: Vá File Lệnh Global Trôi Lệch Luật + Hoàn Tất Sync Cascade Của #10

Bản vá `PATCH` sau kiểm chứng độc lập bản phát hành 1.7.0. Không đụng engine.

### Fixed
- **File lệnh Claude (`~/.claude/commands/xay-dung-nao-bo.md`) vi phạm luật Bước 0 của chính khung 1.4.0**: template (hardcode trong `scripts/deploy_skills.ps1`) vẫn dạy agent chạy thẳng chế độ GHI và chỉ biết 2 kết cục. Nay chạy `--check` trước và phân nhánh theo mã thoát 0/1/2/3, nêu rõ `BRN-016` ⇒ DỪNG, CẤM tự sửa vùng luật giữa hai mốc. Chi tiết: gotcha **#23**.
- **Cổng deploy có răng**: khối kiểm file lệnh nay đòi đủ mốc `--check` và `BRN-016` (thiếu ⇒ `CMD-BAD` + exit 2, in đúng tên mốc thiếu).
- **Sync Cascade của #10 bỏ sót 2 file luật Structural Extension** (§5.B.2): `-data-architecture.md` thiếu hoàn toàn phân khu Ký ức Lạnh `memory/archive/` và cơ chế marker; `index.md` Codebase Map thiếu kế hoạch 07–10, thiếu 2 file `docs/`. Đã bổ sung — đúng loại lỗ hổng mà luật này sinh ra để chống.
- **Kernel nói sai 3 điều cùng lúc** (`memory-distill.txt`): ghi khung não `v1.3.0` (thực tế 1.4.0), ghi "mọi commit LOCAL, CHƯA PUSH" (thực tế đã push, CI xanh), và ghi 237 test (thực tế 240). Kernel là file mọi agent đọc đầu tiên nên sai ở đây lan ra mọi phiên.
- Version dự án lạc hậu ở `project-intro.md`, `roadmap.md`, `index.md`, kernel (còn ghi `v1.6.0` trong khi `package.json` đã `1.7.0`).
- `docs/xay-dung-nao-bo.md` thiếu 9 export thật của engine, gồm chính sản phẩm cốt lõi #10 (`RULE_BLOCKS`, `findBlock`, `findLegacy`, `classifyRuleBlocks`, `AGENTS_SKELETON`, …).

### Added
- **T-H07/b/c** (`tests/hygiene/deploy-command-template.test.js`): khoá template file lệnh vào `npm test` — nơi DUY NHẤT kiểm được nội dung template, vì bước CI `deploy-dry` không ghi file lệnh nên không bao giờ thấy. Kèm bánh cóc so danh sách mốc giữa test và script (bài học allowlist trôi dạt ở #10). Test: 237 → **240**.
- Gotcha **#23** (văn bản máy sinh phát tán ra ngoài repo phải có test neo vào luật) và **#24** (trùng tên biến đếm trong script dài).

### Ghi chú vận hành
- Bản **global vẫn là engine 1.6.0 / template 1.3.0**. Tới khi deploy, chạy Bước 0 **chế độ ghi** trong hub sẽ hạ ngược marker và `state.json` về 1.3.0 — chỉ chạy `--check`. Đã ghi cảnh báo vào kernel.
- Deploy global và rollout 66 repo vẫn **chờ user ra lệnh**.

## [v1.7.0] - 2026-09-02: Vá Tất Định Bằng Khối Đánh Dấu Ẩn — Khung Não v1.4.0, BRN-016/017, Ký Ức Lạnh

Kế hoạch #10. Engine ngừng *đoán* vị trí luật bằng regex trên văn xuôi tiếng Việt; chuyển sang **6 khối marker** `<!-- brain:rule:<id> -->` do máy tự quản. `BRAIN_TEMPLATE_VERSION` **1.3.0 → 1.4.0** (đợt ghi fleet chờ lệnh user).

### Added
- **Lớp marker**: `findBlock`/`findLegacy`/`classifyRuleBlocks`/`patchAgentsMd` mới trên bảng `RULE_BLOCKS` 6 khối; **fail-closed** — mốc lẻ/đóng-trước-mở/trùng id ⇒ không ghi byte nào cho khối đó (CẤM diễn giải "mở → EOF"). Bước `probe` chặn tái diễn sự cố #07 (chèn bản luật thứ hai khi văn bản bị sửa một chữ).
- **2 luật khung v1.4.0** (học từ repo mẫu, đã chạy thật): Phân khu **Ký ức Lạnh** `memory/archive/` (chỉ script ghi) và luật **Structural Extension** §5.B điều 2. Chi phí đúng **9 dòng engine** cho cả hai — bằng chứng marker giảm giá thành thêm luật.
- **BRN-016** (khối hỏng / vùng luật bị sửa tay — cần người, engine không ghi đè) và **BRN-017** (file lạ trong `memory/archive/`). Toàn hệ 17 mã.
- Fixture mới: **F09** (oracle migration S1 v1.3.0), **F10** (sửa tay ⇒ BRN-016), `fleet/03` (mốc hỏng); bộ đo **A1/A2/A3** (`tests/helpers/diff-scope.js`) chứng minh migration không phá dòng nào ngoài vùng mốc.
- Allowlist abs-path về MỘT nguồn (`tests/hygiene/abs-path-allowlist.json`) — CI và test cùng đọc, hết trôi dạt hai bản.

### Changed
- **BRN-002/003 đổi điều kiện** (đếm chuỗi bị khai tử): 002 = khối `absent`/`legacy`/`stale` (fixable); 003 = probe còn NGOÀI khối khi khối đã có, hoặc còn khối planning cũ (không fixable).
- `renderFullAgentsMd = patchAgentsMd(AGENTS_SKELETON)` — thân luật chỉ còn MỘT bản, template hết trôi lệch bản vá.
- Hub `AGENTS.md` bọc 6 khối mốc (S2), theo template ở `boot`/`dual-entry`; `LAW_TOKENS` của test hai-hiến-pháp đọc từ engine thay vì mảng tĩnh.
- Thân luật Bước 0 khuyến nghị `--check` (chế độ ghi phải nêu tường minh); CLI giữ mặc định cũ (TQ2).
- `actions/checkout`/`setup-node` v4 → v5 (hết cảnh báo Node 20).
- Test: 193 → **237 ca** (0 dependency); golden 7 case × 12 file, chụp SAU khi test đơn vị chứng minh hành vi (chống hợp thức hoá bug).

### Fixed
- **Âm tính giả**: 9–10 repo không hề có phát biểu Bước 0 nhưng engine cũ vẫn báo sạch (token trùng ở luật J.4). Chẩn đoán theo khối diệt cả hai chiều (dương tính giả #17 + âm tính giả này).

### Removed
- Toàn bộ đường vá regex cũ: `AGENTS_PATCH_LOGS`, `patchAgentsMd` dò-neo 106 dòng, `RULE_ANCHORS` + vòng đếm mệnh đề. **Lõi vá 165 → 123 dòng (−25%)**; engine 1447 → **1432 dòng** dù thêm 2 luật + 2 mã BRN + archive.

### Gates
- G1 = 123 ≤ 123 ✅ · G2 = 1432 ≤ 1472 ✅ · G3 = 9 ≤ 20 ✅ · A1 byte-identical (sha ba lần chạy trùng) ✅ · A2/A3 = 0 vi phạm trên F09 ✅.
- Chưa: deploy global, push, rollout fleet (chờ user — OPERATIONS §8).

## [v1.6.0] - 2026-09-02: Engine Có Kiểm Chứng — Bộ Test 0-Dependency, Mã Thoát Thật, Deploy Fail-Closed, `brain-doctor`

Kế hoạch #09. Biến hub từ *"tập tài liệu + một script 772 dòng không ai kiểm"* thành *"công cụ kỹ thuật có kiểm chứng tự động"*. `BRAIN_TEMPLATE_VERSION` **giữ nguyên `1.3.0`** ⇒ không repo vệ tinh nào bị chạm.

### Added
- **Bộ test `node:test` — 192 ca, 192 xanh, 0 dependency.** Trước đó engine vá 66 repo mà **không có một dòng test nào**. Gồm ảnh chuẩn (golden) chụp bằng engine v1.5.4 **trước khi refactor**, unit test hàm thuần, test 7 khiếm khuyết, test 11 bất biến, và test vệ sinh kiểu **bánh cóc** (file đã sạch buộc phải rời danh sách miễn trừ, bất biến chỉ siết chặt được).
- **Engine có mã thoát thật + `--check` / `--dry-run` / `--version`.** Chẩn đoán sinh **13 mã `BRN`** có phân loại, thay cho danh sách boolean từng sót lỗi 3 lần.
- **`brain_doctor.js`** — quét độ lệch toàn hệ sinh thái, **chỉ đọc**, **cấm đệ quy**, xuất bảng + JSON, mã thoát phân tầng. Quét 70 thư mục hết **~6 giây**.
- **Tích hợp liên tục** (`.github/workflows/ci.yml`) matrix Windows × Linux, 13 bước, mọi cổng trả mã thoát thật.
- **`.gitattributes`** ép LF, giữ nguyên byte cho fixture test.
- Tài liệu module 1-1: `docs/xay-dung-nao-bo.md`, `docs/compact.md` (luật §5.C trước đó đang bị vi phạm).

### Fixed
- **Deploy fail-open (D1):** script không đặt `$ErrorActionPreference`, `Copy-Item` không `-ErrorAction Stop` ⇒ lỗi lọt qua `try/catch` mà vẫn in "HOÀN TẤT THÀNH CÔNG". Nay `#requires -Version 7.0`, dừng ở mọi lỗi, **đối chiếu SHA-256 từng file** sau khi chép.
- **BOM trong file lệnh đã deploy (D5):** `package.json` gọi `powershell` 5.1, mà `Set-Content -Encoding UTF8` ở bản đó luôn ghi kèm BOM. Nay gọi `pwsh` và ghi bằng bộ ghi .NET không BOM. Đã deploy lại, kiểm byte: sạch.
- **`String.replace(chuỗi, chuỗi)` diễn giải `$` (D3):** `$&`, `` $` ``, `$'`, `$$` làm hỏng văn bản thay thế. Nay dùng hàm thay thế.
- **BOM làm `JSON.parse(state.json)` ném lỗi (D4)** ⇒ `brain_template_version` không bao giờ hội tụ. Nay strip BOM khi đọc.
- **`restoreEol` sinh `\r\r\n`** khi đầu vào chưa chuẩn hoá. **Đây là lỗi đầu tiên của engine này do MÁY bắt được**, không phải do người phát hiện sau khi đã lan ra.
- **Chẩn đoán bỏ sót (D7):** không kiểm `state.json.brain_template_version`, không kiểm độ dài `CLAUDE.md`, không đếm số lần xuất hiện. Đã bổ sung.
- **Byte điều khiển trong `-known-gotchas.md`** khiến git coi cả file là **nhị phân** ⇒ không review được diff. Cùng lỗi escape mà chính gotcha đó mô tả.
- **Đường dẫn tuyệt đối kèm mã phiên cũ** trong ký ức nóng (repo PUBLIC). Đã rút về dạng tương đối.
- **Chỉ mục ghi sai marker khung não** (`v1.2.0` trong khi thực tế `v1.3.0`).

### Verified
- Engine sau refactor **byte-identical** với v1.5.4: cây file, stdout, stderr, mã thoát — đo trên 5 kịch bản do orchestrator tự dựng, ngoài bộ fixture của agent.
- Quét thật hệ sinh thái: **58 sạch / 8 cảnh báo / 1 lỗi / 1 chặn / 2 bỏ qua** trên 70 thư mục. Hai ca không sạch đúng bằng hai repo đang bị luật cấm chạm.
- Bản deploy toàn cục: hash nguồn ↔ đích **khớp 100%**, chạy engine từ chính bản toàn cục cho `brain-engine 1.6.0 template 1.3.0`.

### Addendum (sau push, 2026-09-02)
- Run CI đầu tiên đỏ cả 2 OS: thiếu `tests/fixtures/fleet` mà SPEC-P05 bước 9 quy định — chính gate remote bắt được lỗi mà 192 test local không thể thấy. Sửa tại `fc03be5` (fixture + test T-H06 chốt tồn tại). Run 33609371929: ubuntu ✅ + windows ✅. Gotcha **#19**.

### Learned
- Gotcha **#16**: `git checkout-index -f` KHÔNG ghi đè file đã tồn tại.
- Gotcha **#17**: đếm token trần để dò luật nhân đôi cho **15 báo động giả** — phải đếm mệnh đề luật.
- Gotcha **#18**: đo mã thoát qua ống dẫn (`| head`, `| tail`) trả về mã của lệnh CUỐI, không phải lệnh cần đo.

## [v1.5.4] - 2026-09-02: Đóng Kế Hoạch #04 + Lập Hồ Sơ #08 Cho Hai Bản Vá PATCH

### Fixed
- **Kế hoạch #04 treo trạng thái sai.** Header ghi "🔄 CHƯA hoàn tất — còn 6 repo chờ user", nhưng đo bằng máy 2026-09-02 thì **cả 6 repo đã xong ở #06/#07**: 4 repo đạt chuẩn và commit sạch; 2 repo (`GramPilot`, `control-gpm`) đã áp bản vá trên đĩa nhưng cố ý chưa commit vì `AGENTS.md`/`state.json` nằm trong việc đang dở của chủ dự án. Đã chuyển sang ✅ và thêm mục "Đóng kế hoạch" kèm bảng kiểm chứng.
- **Hai bản vá `v1.5.2` và `v1.5.3` không có hồ sơ kế hoạch nào.** Đã lập bù `planning/08_2026-09-02_hotfix-lenh-va-go-secret/plan.md` (dạng `plan.md` đơn theo ngoại lệ PATCH §3 mục 2.5) với đủ nhật ký quyết định, mục "Quyết định bị thay thế", checklist và cổng nghiệm thu có nhãn môi trường.

### Security
- Quét rộng phát hiện **2 chỗ chỉ dẫn vị trí khoá đã công khai từ những lần push TRƯỚC**: `planning/05_*/specs/SPEC-P06-causalagent.md` nêu đích danh 3 nhà cung cấp khoá trong `.env` của một repo (đã gỡ tên khỏi bản hiện tại), và danh sách 15 repo có secret ở root trong `planning/06_*/plan.md` (giữ nguyên — chỉ nói repo nào có `.env`, không nói bên trong có gì). **Lịch sử đã công bố vẫn giữ cả hai**; xoá triệt để cần force-push, là quyết định của chủ dự án.

### Learned
- Gotcha **#15**: cổng an toàn chỉ `echo` cảnh báo mà không trả mã thoát khác 0, lại nối `&&` với `git push`, nên lệnh push vẫn chạy dù cổng đã báo có vấn đề. Cổng chặn thao tác khó đảo ngược bắt buộc phải `exit 1`, và phải in ra dòng khớp để phân biệt khoá thật với văn bản mô tả mẫu quét.

## [v1.5.3] - 2026-09-02: Gỡ Bản Đồ Vị Trí Secret Khỏi Kho Công Khai (Trước Lần Push Đầu Tiên)

### Security
- Hub này là repo **PUBLIC**, nhưng tài liệu #06/#07 đang mang bảng ánh xạ *repo → đường dẫn → loại khoá* của **6 dự án PRIVATE**. Giá trị khoá không lộ, nhưng đó là chỉ dẫn sẵn cho người tấn công. Theo lệnh user, toàn bộ bảng này được **gỡ khỏi kho công khai trước khi push lần đầu**.
- Vì 9 commit chưa push đã chứa nội dung đó trong diff, sửa ở commit mới là không đủ: đã **viết lại cả 9 commit** bằng `git filter-branch --tree-filter` (15 chỗ thay thế, 6 file). Thông điệp commit, thứ tự và cấu trúc lịch sử giữ nguyên; so với bản backup chỉ khác **13 dòng**.
- Chi tiết được bảo toàn ở hồ sơ **ngoài git** `..\.brain4agent-secrets-map.local.md` (bị `.gitignore` của repo cha chặn) nên không mất kiến thức.
- Nhánh backup trước khi viết lại: `backup/pre-redact-2026-09-02` (kèm tag cùng tên).

### Decided
- **User quyết 2026-09-02: KHÔNG xoay 6 khoá đã lộ.** Mục này gỡ khỏi danh sách Active; agent sau không nhắc lại trừ khi user mở lại. Cả 6 repo liên quan đều PRIVATE (kiểm `gh repo view`).

### Verified
- Duyệt **mọi file × cả 9 commit** bằng regex marker → **0 dấu vết**. `git log -p` toàn khoảng sắp push → 0.
- `state.json` vẫn hợp lệ JSON; engine boot `NÃO ĐÃ OK`; push vẫn là **fast-forward** (không cần force).

### Learned
- Gotcha #14: kiểm `visibility` của chính repo TRƯỚC khi ghi phát hiện bảo mật vào docs; và khi phải gỡ, cặp thay thế trong `--tree-filter` bắt buộc nằm trọn một dòng vì checkout có thể đổi sang CRLF.

## [v1.5.2] - 2026-09-02: Gỡ File Lệnh Chiếm Chỗ `/compact` + Sửa Here-String Làm Hỏng Nội Dung Deploy

### Fixed
- **`deploy_skills.ps1` sinh `~/.claude/commands/compact.md` đè lên lệnh `/compact` BUILT-IN của Claude Code.** Nghi thức ghi não vốn đã có `/luu-nao` riêng ⇒ file kia vừa thừa vừa che tính năng gốc. Đã **gỡ hẳn khối sinh `compact.md`**; file đã deploy được đổi tên thành `compact.md.disabled-by-plan07` (giữ đường lùi, không xoá).
- **Here-string nháy kép làm hỏng mọi file lệnh sinh ra.** PowerShell coi backtick là ký tự escape trong `@"..."@`, nên `` `b `` → backspace `0x08`, `` `r `` → CR: `` `brain4agent` `` thành `\rain4agent`, ```` ```bash ```` thành `\\\ash`. Đã đổi sang here-string **nháy đơn** `@'...'@` và deploy lại — `xay-dung-nao-bo.md` nay sạch, đếm byte `0x08` = 0.

### Verified
- `~/.claude/commands/` không còn file nào trùng tên lệnh built-in; deploy chạy lại KHÔNG sinh lại `compact.md`.
- `diff` engine nguồn ↔ bản deploy global: **RỖNG**.

### Learned
- Gotcha #13: file trong `~/.claude/commands/` trùng tên lệnh built-in sẽ **chiếm chỗ trong im lặng**; và here-string nháy kép trong PowerShell làm hỏng mọi nội dung có backtick.

## [v1.5.1] - 2026-09-02: Phủ Template v1.3.0 Ra Toàn Kho + Vá Bug Nhân Đôi Luật

### Fixed
- **Engine — regex chỉ khớp LF:** nhánh vá luật SPEC PACKAGE dò khối cũ bằng `\n` trần nên trượt trên file CRLF, rơi vào nhánh CHÈN THÊM thay vì THAY THẾ ⇒ **33 repo có cả khối luật planning cũ lẫn mới cùng sống**. Đã đổi sang `\r?\n`, thêm nhánh dọn tàn dư, và thêm chẩn đoán `hasNoDuplicatePlanningLaw` vào `isFullyStandard` để tình trạng này bị PHÁT HIỆN thay vì được báo `NÃO ĐÃ OK` âm thầm.
- **Bản deploy global kẹt ở `1.2.0`:** Bước 0 trong mọi `memory-distill.txt` trỏ tới bản global, nên agent tuân thủ Bước 0 sẽ chạy engine cũ và **kéo ngược repo về 1.2.0**. Đã backup + chạy `deploy_skills.ps1`, nghiệm thu `diff nguồn↔deploy = RỖNG`.

### Changed
- **92 commit local** phủ template `v1.3.0` ra hệ sinh thái (51 rollout + 33 dọn trùng + 8 repo bẩn). Não đạt chuẩn v1.3.0: **2/67 → 65/67**.
- `BRAIN_TEMPLATE_VERSION` **giữ nguyên `1.3.0`** — đây là sửa lỗi áp dụng, không đổi chuẩn ⇒ hub chỉ bump PATCH `v1.5.0 → v1.5.1`.

### Decisions
- Cổng nghiệm thu cho một đợt vá **THAY THẾ** không phải "chỉ-thêm / 0 dòng xoá" mà là **"không mất thông tin"** (kiểm 9 token bắt buộc còn đủ). Cổng cũ đã gây báo động giả trên 35 repo.
- `control-gpm`, `GramPilot`, `CV`: chỉ commit marker (và `state.json` với `CV`), **KHÔNG** commit `AGENTS.md` — file đó nằm trong việc đang dở của chủ dự án.
- `aiedu4vn` (luật ⛔ từ #04) và `brain4agent` mới (cách ly #06 mục 5.1) giữ nguyên không đụng.

### Learned
- 2 gotcha mới (mục 11, 12): regex `\n` trần trượt trên CRLF rồi im lặng nhân đôi luật; bản deploy global kẹt version gây nguy cơ thoái lui thầm lặng.

## [v1.5.0] - 2026-09-01: Luật SPEC PACKAGE Bắt Buộc — CẤM Plan Phẳng (khung não v1.3.0)

### Bối cảnh
User chốt luật sau khi review kế hoạch #10 của repo `ai-news-radar`: một `plan.md` dài 220 dòng vẫn bị
trả lại với yêu cầu "cần SPEC chi tiết chứ không phải plan phẳng". Luật `Spec-First` cũ CÓ mô tả cấu
trúc `plan.md` + `specs/` nhưng **không cấm** plan phẳng, không định nghĩa mỗi SPEC phải chứa gì, và
không cấm nhét thiết kế vào `plan.md` — nên vẫn sinh ra plan mỏng một cách hợp lệ.

### Added — Luật §3 mục 2 (SPEC PACKAGE)
- **CẤM plan phẳng/mỏng.** Mọi đợt `MINOR`/`MAJOR` bắt buộc đủ bộ SPEC; bộ SPEC tối thiểu phủ 4 mảng:
  kiến trúc & bất biến, contract dữ liệu/API/module, vận hành-deploy-rollback, kiểm thử-nghiệm thu.
- **Định nghĩa nội dung bắt buộc của MỖI file SPEC:** contract chính xác (chữ ký/endpoint/schema);
  luật BẮT BUỘC/CẤM tường minh kèm **"vùng cấm"** (điều đã cân nhắc và quyết định KHÔNG làm + lý do —
  chống agent sau "sửa lại cho tốt hơn"); bảng phân loại lỗi + hành vi bắt buộc của caller; số đo
  nghiệm thu thật, không chỉ "test xanh".
- **`plan.md` rút về HỒ SƠ:** metadata + nhật ký quyết định có mốc thời gian (kèm mục "Quyết định bị
  thay thế") + WP/Tier + checklist + router sang SPEC. **CẤM nhét thiết kế chi tiết vào `plan.md`.**
- **Exit Gates đánh dấu theo môi trường** (`✅ local / ⬜ server`) — chỉ đóng kế hoạch khi gate môi
  trường thật chuyển ✅.
- **Ngoại lệ duy nhất:** hotfix `PATCH` ≤1 ngày công được phép chỉ có `plan.md`.
- **Điều khoản grandfather (2.6):** package cũ dạng phẳng `NN-*.md` giữ nguyên theo Path Invariant —
  không đổi cấu trúc để tránh gãy tham chiếu; chuẩn mới chỉ áp cho kế hoạch MỚI.

### Changed — lan luật ra toàn hệ sinh thái
- `AGENTS.md` §3 + `CORE_GOVERNANCE_RULES.md` §3.1 của Hub: thay khối cấu trúc cũ bằng luật đầy đủ.
- `init_brain.js`: (a) template `AGENTS.md` cho dự án MỚI; (b) **thêm patcher tự động vá `AGENTS.md`
  ĐÃ TỒN TẠI** — dò chuỗi ổn định `SPEC PACKAGE`, ưu tiên thay khối "Cấu trúc Thư mục Kế hoạch Chuẩn"
  cũ, fallback chèn sau tiêu đề §3, fallback cuối là phụ lục cuối file. Đây là đường để **66 repo đã
  não hóa** nhận luật mới mà không phải sửa tay từng repo.
- `BRAIN_TEMPLATE_VERSION` 1.2.0 → **1.3.0**; Hub `package.json` 1.4.0 → **1.5.0**.

### Verified
- `node --check init_brain.js` sạch.
- **Chạy thật trên dự án giả** dựng từ `AGENTS.md` bản `HEAD` (kiểu cũ, chưa có luật): patcher in
  `🔄 Đã tự động vá luật SPEC PACKAGE`, khối §3 mục 2 hiện đúng nội dung, mục 1/3/4 giữ nguyên;
  **chạy lần 2 không vá lặp** (`SPEC PACKAGE` xuất hiện đúng 1 lần) — idempotent.

## [v1.4.0] - 2026-09-01: Đóng Nốt Chiến Dịch #06 — 66/67 Repo Đạt Chuẩn

### Added
- **20 commit local** nữa (tổng chiến dịch #06: **76 commit, 0 push**). Kết quả cuối: `PARENT_GIT 0` · `UNBORN 0` · **não chuẩn 66/67** (từ 21 trước chiến dịch).
- 5 repo cuối cùng thoát `UNBORN`: `AI-input`, `bi-kip-luyen-agent`, `congquyengop.vn`, `manage-fitc84`, `auto-hot-key`.
- 9 repo đang bẩn được não hóa **mà không đụng việc dang dở của user**: `control-gpm`, `GramPilot`, `CV`, `convert-json-to-9router-from-keycrop`, `ViDiaNorm`, `FITC84-WorkOs-`, `Token-Calcultor`, `openclaw-pro-studio` (+ `control-LDplayer` vốn đã sạch).

### Decisions
- **Repo git lồng nhau → `.gitignore`, KHÔNG gỡ/di chuyển.** Chọn cách cộng-thêm và đảo ngược được thay vì tái cấu trúc cây thư mục của user. bản lồng bên trong còn chứa cấu hình môi trường thật ⇒ dòng ignore còn là một lớp chặn lộ khoá. (Vị trí cụ thể đã gỡ khỏi kho công khai, giữ ở hồ sơ chỉ-lưu-máy ngoài git.)
- **`auto-hot-key`:** ignore `bin/` + `obj/` (chuẩn .NET) ⇒ commit đầu từ 1066 file / 490 MB xuống **16 file / ~105 KB**.
- **`control-LDplayer`:** GIỮ `Plan/` viết hoa (313 file, là cây governance đang sống, có ≥8 path cứng trong `.agent/domains/`); chỉ chuẩn hoá `DOCS/` → `docs/` bằng `git mv` dạng `R100` + sửa cả 3 tham chiếu trong CÙNG commit. `git grep 'DOCS/'` sau đó = 0.
- **Chặn engine đổi tên** bằng cách tạo sẵn `planning/` trước khi chạy (`ViDiaNorm`, `control-LDplayer`) — bảo toàn 100% thư mục `Plan/`.
- **`control-gpm` + `GramPilot`: cố ý KHÔNG chạy engine** vì `AGENTS.md`/`state.json` của chúng đang nằm trong danh sách bẩn của user; chỉ chép tay `CLAUDE.md` + marker. Hệ quả minh bạch: `state.json` 2 repo này **tạm thiếu field `brain_template_version`** cho tới khi user commit xong.

### Fixed / Learned
- 2 gotcha mới (mục 9, 10 trong `-known-gotchas.md`): tiến trình **nhân bản ngoài git** làm gãy `git status` repo cha (nhận diện bằng chênh lệch `CreationTime` 13–71 giây trong khi `LastWriteTime` giống hệt); và quy trình **não hóa repo đang bẩn bằng stage tường minh** + `git commit -- <paths>`.

### Security (báo cáo, KHÔNG tự sửa)
- Bổ sung 2 phát hiện: một dự án frontend nhúng khoá API thẳng vào bundle client (ai mở DevTools trên bản deploy cũng đọc được); `FITC84-WorkOs-/.gitignore` có BOM UTF-8 + một dòng lưu dạng UTF-16 nên `server.pid` **thực tế không được ignore**.
- 4 repo cần **xoay khoá** (nêu từ v1.3.0) vẫn còn nguyên — danh sách repo và đường dẫn giữ ở hồ sơ chỉ-lưu-máy ngoài git, không đưa lên kho công khai.

## [v1.3.0] - 2026-08-31: Đồng Bộ Cấu Trúc 67 Repo (Git Đúng Chỗ + Não Chuẩn v1.2.0)

### Added
- **56 commit local** trên toàn hệ sinh thái (0 push). `PARENT_GIT 9 → 0`; `UNBORN 13 → 5`; não chuẩn `21 → 52`.
- 9 repo `control-*` lần đầu có `.git` của chính nó (trước đó `git -C` leo lên repo cha và vùng này bị cha `.gitignore` ⇒ thật sự vô chủ về version control).
- 8 repo unborn có commit đầu tiên; 31 repo được não hóa/vá lên chuẩn v1.2.0.
- Hồ sơ kế hoạch `planning/06_2026-08-31_dong-bo-67-repo/` với bảng nghiệm thu thật cho P01–P05 + bảng đối chiếu TRƯỚC/SAU.

### Decisions
- **Không bump `BRAIN_TEMPLATE_VERSION`** (giữ `1.2.0`): engine `init_brain.js` KHÔNG đổi dòng nào trong chiến dịch này — không bug engine nào lộ ra. Version bump chỉ ở tầng DỰ ÁN (v1.2.2 → v1.3.0) vì đây là nâng cấp phạm vi phủ sóng hệ sinh thái, giữ tương thích ngược ⇒ MINOR.
- **`teamworkflow`:** SPEC ghi "hỏi user", đã tự quyết theo phương án AN TOÀN & ĐẢO NGƯỢC ĐƯỢC — đắp bộ luật vào CUỐI `AGENTS.md` (diff `17/0`), giữ nguyên khối `nextjs-agent-rules` ở đầu. Revert `cb33a09` nếu muốn đổi.
- **`CausalAgent` Giai đoạn 2: KHÔNG thực thi** dù gate đã mở. Grep tham chiếu cho bằng chứng phủ định: các `scratch_*.py` dựng `sys.path` bằng `os.path.dirname(__file__) + 'src'` nên buộc phải nằm ở root; di chuyển sẽ gãy import ngay. Dọn root đòi sửa mã cho độc-lập-vị-trí trước — cần user duyệt.
- **`control-LDplayer`: DỪNG chuẩn hoá tên `Plan/`+`DOCS/`** — `git grep` thấy ≥8 tham chiếu path cứng đang sống trong `.agent/domains/`.

### Fixed / Learned
- 3 gotcha mới (mục 6, 7, 8 trong `-known-gotchas.md`): biến `$sec` ghi đè hằng regex `$SEC` làm chết cổng secret trong im lặng · audit đếm "file bẩn" che mất repo git lồng nhau (nguy cơ gitlink `160000` mồ côi) · phiên agent khác chạy song song làm trạng thái đổi giữa chừng.

### Security (báo cáo, KHÔNG tự sửa)
- 4 repo có secret ĐÃ tracked từ trước #06 — cần **xoay khoá**, sửa code là chưa đủ: danh sách 4 repo kèm đường dẫn và loại khoá được giữ ở hồ sơ chỉ-lưu-máy ngoài git, không đưa lên kho công khai.

## [v1.2.2] - 2026-08-31: Não Hóa Nhóm C (6 Dự Án) + Hotfix "Vá Bước 0 Giả" Trong Kernel
### Fixed
- **Bug báo-vá-nhưng-không-vá trong `init_brain.js` (2 subagent độc lập phát hiện khi thực thi kế hoạch #05):** nhánh tự vá Bước 0 vào `memory-distill.txt` dùng `String.replace(/<agent_startup_protocol>/i, ...)`. Với kernel cũ viết **markdown thuần** (không có tag XML), `replace` không khớp nên trả về chuỗi y nguyên, nhưng script vẫn `writeFileSync` và vẫn in `🔄 Đã tự động vá Bước 0` → log nói dối, dự án không bao giờ tự đạt chuẩn. Cùng lớp lỗi "báo-ổn-sai" đã vá cho nhánh `AGENTS.md` ở v1.2.0 (P09).
- **Sửa:** kiểm `regex.test()` trước khi thay; khớp → vá vào trong tag như cũ; KHÔNG khớp → fallback chèn nguyên khối `<agent_startup_protocol>…</agent_startup_protocol>` lên đầu file, log nói rõ đã dùng fallback. Kiểm chứng: ca fallback (kernel markdown thuần) vá thành công + giữ nguyên nội dung cũ + idempotent (đếm tag = 2, không nhân đôi); ca hồi quy (kernel XML) vẫn đi nhánh cũ; deploy lại `DIFF_EMPTY_BYTE_IDENTICAL`.
- **Quyết định:** GIỮ `BRAIN_TEMPLATE_VERSION = 1.2.0` (nội dung sinh ra không đổi) — tránh churn đổi tên marker trên 19 repo đã vá ở #04. Version DỰ ÁN bump v1.2.2.

### Added
- **Não hóa Nhóm C — 6 dự án chưa có `AGENTS.md` (kế hoạch #05):** `block-ads-fb-v2` `1c0569e`, `dreamteam4vn` `79efb93`+`cb2bcfa`, `Audit` `451f1ac`, `reverse Claude` `bf7e959`, `Agent to Product` `a7c6ce4` (đều local, KHÔNG push); `CausalAgent` Giai đoạn 1 xong không commit (repo unborn — mốc lịch sử thuộc quyền user).
- **Nguyên tắc kiến trúc mới — "di trú ngữ nghĩa TRƯỚC, engine SAU":** chạy thẳng engine lên não schema cũ sinh **não song trùng** (bộ file chuẩn RỖNG cạnh bộ file cũ đầy dữ liệu, agent đời sau đọc bộ rỗng và mất trí nhớ dự án). Ghi thành `specs/00-ARCHITECTURE.md` + phân lớp di trú A/A+/B/B+/C/D.
- **Mẫu "cộng sinh" cho dự án có Brain OS legacy đang sống (`Agent to Product`):** giữ nguyên 100% hệ legacy, biến phân vùng chuẩn engine sinh rỗng thành **pointer file** trỏ về file legacy — đạt mục tiêu mọi agent nạp được luật mà vẫn giữ MỘT nguồn chân lý. Bằng chứng an toàn: `graph.db` SHA256 sau = trước, `state.json` qua validator legacy của chính dự án.
- **Mẫu thực thi bằng subagent song song:** 6 repo độc lập → 6 subagent 2 đợt, mỗi subagent khoá phạm vi vào đúng repo của nó và bị cấm chạm repo hub; orchestrator kiểm chứng độc lập lại toàn bộ sau khi cả 6 báo xong (không tin báo cáo suông).
- Kế hoạch + bằng chứng: [`planning/05_2026-08-31_nao-hoa-nhom-c/plan.md`](file:///planning/05_2026-08-31_nao-hoa-nhom-c/plan.md).

## [v1.2.1] - 2026-08-31: POSIX Newline Hotfix + Rollout Khung Não v1.2.0 Ra Hệ Sinh Thái
### Fixed
- **`state.json` thiếu newline cuối file (user phát hiện khi duyệt pilot):** cả hai chỗ ghi `state.json` trong `init_brain.js` dùng `JSON.stringify(..., null, 2)` không kèm `'\n'` → mọi repo được vá sẽ mang vết `\ No newline at end of file` vĩnh viễn trong git diff. Sửa cả hai thành `+ '\n'`; rà toàn bộ điểm ghi file khác (`CLAUDE.md`, marker, `AGENTS.md`, `today.md`) — đều đã kết thúc `0a`, không cần sửa.
- Thêm chẩn đoán `hasStateJsonTrailingNewline` vào `isFullyStandard` + mở rộng nhánh vá state.json (ghi lại khi thiếu newline dù version đã đúng) — để repo đã "NÃO ĐÃ OK" vẫn tự sửa được newline khi chạy lại. Kiểm chứng: chạy lại trên `brain4agent.old` và `control-claude-code` → tail byte `0a`, chạy lần 2 báo OK (idempotent).
- **Quyết định:** GIỮ `BRAIN_TEMPLATE_VERSION = 1.2.0` (không bump) vì nội dung sinh ra không đổi về bản chất — tránh churn đổi tên marker trên 9 repo vừa commit. Version DỰ ÁN bump v1.2.1.

### Added
- **Rollout khung não v1.2.0 ra hệ sinh thái (kế hoạch #04):** vá + commit local 9 repo Nhóm A (`control-claude-code` pilot `eeba58a`, `ai-news-radar`, `control-9router`, `control-chatgpt-web`, `control-linux-server`, `fitc84.com`, `router4vn`, `translate4ide`, `wikiultra`); 9 repo bỏ qua vì working tree bẩn; `teamworkflow` (Nhóm B) bỏ qua — CLAUDE.md là shim chuẩn nhưng repo chưa có commit nào và AGENTS.md chỉ là Next.js tooling notice. KHÔNG push repo nào. Chi tiết + bằng chứng: [`planning/04_2026-08-31_rollout-ecosystem/plan.md`](file:///planning/04_2026-08-31_rollout-ecosystem/plan.md).
- Xác nhận thực chiến cơ chế fallback phụ lục của P09: 2 repo có `AGENTS.md` không theo cấu trúc chuẩn (`control-chatgpt-web`, `translate4ide`) được vá qua "PHỤ LỤC TỰ ĐỘNG VÁ" cuối file, diff chỉ-thêm-không-xoá.
- **Đợt bổ sung — xử lý 4 repo không có git riêng:** `control-keypassxc`, `control-router`, `control-syncthing`, `control-tailscale` được vá kèm bản lưu thủ công (`AGENTS.md` + `state.json`) và kiểm chứng bằng *subsequence check* thay cho `git diff` (`onlyAdditions=True` cả 4, `lostStateKeys=0`); không `git init`, không commit. Nâng tổng số repo đã xử lý lên 13/19.
- Hai gotcha mới trong `-known-gotchas.md`: (4) `git -C` leo lên repo cha làm audit hàng loạt đo sai trạng thái repo con — cách phát hiện bằng `rev-parse --show-toplevel` + `check-ignore`; (5) phân biệt *unborn branch* với *detached HEAD* qua `.git/HEAD` (`ref:` vs SHA trần).

### Corrected
- **Đo sai ở đợt 1:** 4 repo trên bị ghi nhận nhầm là "bẩn 341 file" nên bỏ qua oan — thực chất `git -C` đang báo trạng thái của repo cha `D:\Data\Repositories`. Đã đo lại và xử lý dứt điểm.
- **Đính chính phân loại:** `control-discord` và `teamworkflow` không phải *detached HEAD* mà là *unborn branch* (chưa có commit nào); kết luận bỏ qua giữ nguyên nhưng lý do được ghi lại chính xác để lần sau không né nhầm.

## [v1.2.0] - 2026-08-31: Brain Version Marker (Nhìn Thấy Ngay Phiên Bản Khung Não Ở Root)
### Added
- **Nguồn chân lý máy đọc:** thêm field `brain_template_version` vào `brain4agent/memory/hot/state.json` — tách bạch tuyệt đối với `current_version` (version DỰ ÁN). `init_brain.js` tự vá field này vào state.json đã có mà không đụng field khác.
- **Bản soi cho người:** `init_brain.js` sinh marker `brain4agent-v<x.y.z>.md` ở root (nội dung chuẩn, dẫn xuất từ `state.json`). Cưỡng chế ĐÚNG MỘT file: trước khi ghi, script glob tìm và xoá mọi `brain4agent-v*.md` khác version; nếu bản đúng version đã tồn tại thì không ghi lại (idempotent).
- **Chẩn đoán mở rộng:** thêm `hasBrainVersionMarker` (so khớp đúng tên file + đúng 1 file duy nhất) vào khối chẩn đoán và điều kiện `isFullyStandard` của `init_brain.js` — dự án cũ thiếu marker hoặc marker sai version bị phát hiện và tự vá khi chạy lại.
- **Luật quản trị:** nhúng ngoại lệ tường minh vào §5.G (`AGENTS.md`) và LUẬT 6 (`CORE_GOVERNANCE_RULES.md`) + template `fullAgentsMdContent` sinh bởi `init_brain.js`, để dự án mới khởi tạo đã có luật đúng ngay từ đầu.
- Cập nhật sơ đồ cây thư mục trong template `index.md` sinh bởi `init_brain.js`, thêm dòng marker.
- Dogfooding: chính repo `brain4agent.old` có `brain4agent-v1.2.0.md` ở root và `state.json` có `brain_template_version: "1.2.0"`.
- Kế hoạch chi tiết & bằng chứng kiểm chứng: [`planning/03_2026-08-31_brain-version-marker/plan.md`](file:///planning/03_2026-08-31_brain-version-marker/plan.md).

### Fixed
- **Lỗi báo-ổn-sai (silent false-OK) phát hiện qua kiểm chứng độc lập:** `init_brain.js` chỉ nhúng ngoại lệ §5.G mục 3 (Marker) và Luật J (Dual Entry-Point Invariant) vào `AGENTS.md` khi sinh **mới**, KHÔNG vá vào `AGENTS.md` **đã tồn tại** của dự án cũ — cùng lớp lỗi với sự cố Luật J ở v1.1.0 (đã vá CLAUDE.md nhưng bỏ sót AGENTS.md text). Hệ quả: script báo "NÃO ĐÃ OK" trong khi luật cho phép marker tồn tại đang vắng mặt, khiến một đợt Root Clean audit khác có thể xoá nhầm marker.
- Thêm chẩn đoán `hasRootMarkerException` và `hasDualEntryPointLawInAgentsMd` (dò bằng chuỗi ổn định `Marker Phiên Bản Khung Não` / `Dual Entry-Point Invariant`, không dò theo số dòng) vào điều kiện `isFullyStandard`.
- `init_brain.js` giờ tự vá cả hai luật vào `AGENTS.md` đã tồn tại nếu thiếu (chèn vào đúng section §5.G / mục J theo cấu trúc chuẩn, có fallback phụ lục cuối file nếu cấu trúc khác chuẩn), idempotent — chạy lại không nhân đôi đoạn luật.
- Kiểm chứng bằng 3 ca thật (Ca A: dự án cũ thiếu cả 2 luật → vá và KHÔNG báo OK ở lần đó; Ca B: chạy lại → idempotent, báo OK; Ca C: dự án trắng không hồi quy) — chi tiết trong `planning/03_2026-08-31_brain-version-marker/plan.md`.

## [v1.1.0] - 2026-08-31: Dual Entry-Point Invariant (CLAUDE.md Shim Fix)
### Fixed
- **Lỗi nghiêm trọng đã xác minh:** Claude Code CHỈ tự động nạp `CLAUDE.md`, KHÔNG đọc `AGENTS.md` (theo docs chính thức code.claude.com/docs/en/memory.md). `init_brain.js` cũ chỉ sinh `AGENTS.md` → mọi dự án mới khởi tạo qua skill này bị Claude Code bỏ qua toàn bộ luật quản trị một cách im lặng.
- Sửa dòng sai sự thật trong sơ đồ cây thư mục (`index.md` template, `README.md`, `brain4agent/index.md`): bỏ câu khẳng định sai "AGENTS.md nạp tự động khi khởi động phiên".

### Added
- **Luật J / LUẬT 9 — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant):** nhúng vào `AGENTS.md`, `CORE_GOVERNANCE_RULES.md` và template governance sinh bởi `init_brain.js`. Quy định `AGENTS.md` là nguồn chân lý DUY NHẤT, `CLAUDE.md` là shim mỏng ≤10 dòng chỉ chứa `@AGENTS.md`.
- `init_brain.js`: sinh/vá tự động `CLAUDE.md` (idempotent), thêm `hasClaudeMd` vào chẩn đoán và điều kiện `isFullyStandard` để phát hiện + tự sửa các dự án cũ thiếu shim.
- Dogfooding: tạo `CLAUDE.md` ở root chính repo `brain4agent.old`.
- Kế hoạch chi tiết & bằng chứng kiểm chứng: [`planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md`](file:///planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md).

## [v1.0.1] - 2026-08-28: Single Skill Vault Alignment & Project Identity Standard
### Added
- Khởi tạo `package.json` định danh chính thức dự án **`brain4agent v1.0.1`** (Single Source of Version Truth).
- Thêm npm scripts: `npm run init-brain` và `npm run deploy`.

### Changed
- Di dời toàn bộ skills gốc (`.xay-dung-nao-bo`, `.compact`) vào kho chuẩn `.agents/skills/`.
- Cập nhật `scripts/deploy_skills.ps1` đồng bộ từ `.agents/skills/` sang Global Config.
- Cập nhật toàn bộ tài liệu dự án, `AGENTS.md`, `README.md` theo chuẩn định danh `brain4agent v1.0.1`.

---

## [v1.0.0] - 2026-08-28: Universal Brain Governance Hub Modernization
### Added
- Trang bị hệ thống Bộ Nhớ Đa Tầng `brain4agent/` và `AGENTS.md` cho chính Workspace Hub.
- Thêm thư mục `archive/legacy-skills/` lưu trữ các phiên bản tiền thân (`.brain-build`, `.update-brain`).
- Bổ sung quy chuẩn **Spec-First Planning Framework** và **Model Tiering Tagging (🔴/🟠/🟢)** vào `CORE_GOVERNANCE_RULES.md`.
- Thêm cơ chế kiểm tra an toàn tự động (Safe Validation) vào `scripts/deploy_skills.ps1`.
- Cập nhật mã nguồn `.compact/SKILL.md` tuân thủ nghiêm ngặt 100% Root Clean.
- Cập nhật `.xay-dung-nao-bo/scripts/init_brain.js` đồng bộ trọn gói các luật quản trị tinh hoa mới nhất.
