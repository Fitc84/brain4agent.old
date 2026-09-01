# 📅 Nhật Ký Làm Việc Ngày 02/09/2026 (Session Memory Log)

> Cập nhật lúc: `2026-09-02` | Phiên bản: `v1.5.1` (Phủ Template v1.3.0 + Vá Bug Nhân Đôi Luật — kế hoạch #07)

---

## 🔒 ĐÓNG PHIÊN 2026-09-02 — BÀN GIAO NGẮN

**Trạng thái chốt:** hub `v1.5.1` (`8cb91f0`) · khung não template `v1.3.0` · **65/67 repo đạt chuẩn** ·
engine nguồn ↔ bản deploy global **byte-identical** · 0 repo còn 2 khối luật mâu thuẫn ·
**mọi commit LOCAL, chưa push lần nào**.

**2 repo chưa đạt, cả hai vì LUẬT CẤM CHẠM chứ không phải vướng kỹ thuật:**
`aiedu4vn` (luật ⛔ thường trực từ #04) · `brain4agent` (KHÔNG `.old` — cách ly theo #06 mục 5.1).
Gỡ luật là xong trong một lần chạy engine.

**Việc đầu tiên của phiên sau — theo đúng thứ tự:**
1. Chạy Bước 0 (boot engine), rồi **`git log -3` của hub** xem có phiên khác vừa đổi `BRAIN_TEMPLATE_VERSION` không.
   Bài học #07: chuẩn có thể dịch chuyển ngay sau khi mình vừa phủ xong.
2. Đọc mục **🔴 Active** trong `roadmap.md` — việc ưu tiên cao nhất là **xoay 6 khoá đã lộ trong lịch sử git**.
3. Nếu sửa engine: **BẮT BUỘC** chạy `scripts/deploy_skills.ps1` rồi so hash tới khi `diff` RỖNG (gotcha #12).

---

## 🩹 Hậu Đóng Phiên 02/09 — User Phát Hiện `/compact` Chạy Sai Việc

User hỏi *"đang bị nhầm thành .compact à?"* sau khi thấy `/compact` chạy nghi thức ghi não thay vì nén
ngữ cảnh. Soi ra **3 lỗi chồng nhau, đều từ `scripts/deploy_skills.ps1`**:

1. **Chiếm chỗ lệnh built-in:** script sinh `~/.claude/commands/compact.md`; Claude Code nạp mọi `*.md`
   trong thư mục đó thành slash-command nên nó **đè lên `/compact` gốc**. Đúng nghĩa "sai lệch âm thầm":
   không lỗi, không cảnh báo, chỉ là làm sai việc.
2. **Thừa:** nghi thức ghi não đã có lệnh riêng `/luu-nao` — chính file đó còn ghi rõ *"KHÔNG phải lệnh
   `/compact` nén ngữ cảnh built-in của Claude Code"*.
3. **Nội dung file hỏng:** script dùng here-string **nháy kép** `@"..."@`, mà backtick là ký tự escape của
   PowerShell ⇒ `` `b `` thành backspace `0x08`, `` `r `` thành CR. Soi byte thô thấy `0x5c 0x08`:
   `` `brain4agent` `` → `\rain4agent`, ```` ```bash ```` → `\\\ash`. `xay-dung-nao-bo.md` hỏng y hệt.

**Đã sửa:** gỡ hẳn khối sinh `compact.md` khỏi script · đổi toàn bộ here-string sang nháy đơn `@'...'@` ·
đổi tên file cũ thành `compact.md.disabled-by-plan07` (giữ đường lùi thay vì xoá) · deploy lại và nghiệm
thu: byte `0x08` = 0, `diff` nguồn↔global RỖNG, deploy không sinh lại `compact.md`. Hub bump `v1.5.2`.

**Bài học chung:** trước khi đặt tên một slash-command, phải đối chiếu với danh sách lệnh **built-in**.
Trùng tên = chiếm chỗ, và người dùng sẽ mất một tính năng mà không hề biết.

---

## ⚠️ BÀI HỌC LỚN NHẤT PHIÊN NÀY: "XONG" CHỈ ĐÚNG SO VỚI CHUẨN TẠI THỜI ĐIỂM ĐO

Ngày 01/09 đóng chiến dịch #06 với 66/67 repo đạt chuẩn **v1.2.0**. Chỉ **1 tiếng sau**, một phiên
agent KHÁC commit `529ca8a` nâng `BRAIN_TEMPLATE_VERSION` lên **1.3.0**. Sáng 02/09 đo lại theo chuẩn
mới: **chỉ 2/67 đạt**. Bài học: trong kho nhiều phiên chạy song song, **luôn đo lại theo chuẩn HIỆN
HÀNH trước khi khẳng định "đã xong"** — và kiểm `git log` của hub xem có ai vừa đổi luật không.

## ✅ Việc Đã Làm (kế hoạch #07)

1. **92 commit local** (51 rollout + 33 dọn trùng + 8 repo bẩn). Não đạt chuẩn v1.3.0: **2/67 → 65/67**.
2. **Vá 3 lỗi thật:**
   - **Engine regex `\n` trần trượt trên file CRLF** → rơi vào nhánh CHÈN THÊM thay vì THAY THẾ ⇒ **33 repo có cả khối luật planning cũ lẫn mới cùng sống**. Đổi sang `\r?\n` + thêm nhánh dọn tàn dư.
   - **`isFullyStandard` không phát hiện tình trạng đó** — repo nhân đôi luật vẫn được báo `NÃO ĐÃ OK`. Thêm biến chẩn đoán `hasNoDuplicatePlanningLaw`.
   - **Bản engine deploy global kẹt `1.2.0`** trong khi hub đã `1.3.0`. Vì Bước 0 trỏ tới bản global, agent tuân thủ Bước 0 sẽ **kéo ngược repo về 1.2.0**. Đã deploy lại, `diff nguồn↔deploy = RỖNG`.
3. **Sai lầm của chính orchestrator, ghi lại để tự răn:** cổng "AGENTS.md phải chỉ-thêm" parse `numstat` bằng `-split` trên mảng → lấy nhầm cột → **báo động giả trên 35 repo**. Cùng họ lỗi với gotcha #6. Đã đổi sang regex có neo. Và nhận ra cổng đó SAI VỀ BẢN CHẤT cho một bản vá THAY THẾ: cổng đúng là **"không mất thông tin"** (kiểm 9 token bắt buộc còn đủ), không phải "0 dòng xoá".
4. **Repo đang bẩn:** giữ đúng công thức gotcha #10 — stage tường minh + `git commit -- <paths>`; việc user nguyên vẹn **8/8** (`Token-Calcultor` vẫn giữ nguyên index user đã stage sẵn).
5. **`control-gpm`, `GramPilot`, `CV`: cố ý chỉ nhận marker**, không commit `AGENTS.md`/`state.json` vì các file đó nằm trong việc đang dở của chủ dự án. Đạt chuẩn một phần, đã ghi rõ trong roadmap.

## 📌 Còn Lại
2 repo chưa đạt và **cả hai đều vì luật cấm chạm, không phải vì kỹ thuật**: `aiedu4vn` (⛔ từ #04) và
`brain4agent` (cách ly #06 mục 5.1). Gỡ luật là xong trong một lệnh.

---

## 🏛️ Phiên KHÁC 2026-09-01 22:23 — v1.5.0: Luật SPEC PACKAGE, CẤM plan phẳng (khung não 1.3.0)

**Nguồn gốc:** user review kế hoạch #10 của repo `ai-news-radar`, trả lại **2 lần** với yêu cầu "cần SPEC chi tiết chứ không phải plan phẳng", rồi yêu cầu ghi thành quy tắc chung cho MỌI dự án.

**Chẩn đoán vì sao luật cũ không đủ:** `Spec-First` cũ CÓ vẽ cấu trúc `plan.md` + `specs/` — nhưng chỉ là *mô tả*, không phải *ràng buộc*. Nó không cấm plan phẳng, không nói mỗi file SPEC phải chứa gì, và không cấm nhét thiết kế vào `plan.md`. Kết quả: một agent viết plan mỏng vẫn "đúng luật". Đây là lỗi kinh điển của luật mô tả mà không có mệnh đề CẤM.

**Đã sửa — luật §3 mục 2 (SPEC PACKAGE):** cấm plan phẳng cho mọi đợt MINOR/MAJOR; bộ SPEC tối thiểu phủ 4 mảng; định nghĩa nội dung bắt buộc của MỖI file SPEC (contract chính xác, luật BẮT BUỘC/CẤM kèm **"vùng cấm"** để chống agent sau tự ý "sửa cho tốt hơn", bảng phân loại lỗi + hành vi caller, số đo nghiệm thu thật); `plan.md` rút về hồ sơ (metadata + nhật ký quyết định có mốc thời gian + mục "quyết định bị thay thế" + WP/Tier + checklist + router); Exit Gates đánh dấu theo môi trường; ngoại lệ duy nhất hotfix PATCH; điều khoản grandfather cho package cũ dạng phẳng.

**Lan ra hệ sinh thái — điểm mấu chốt:** ngoài template cho dự án MỚI, đã thêm **patcher** vào `init_brain.js` dò chuỗi ổn định `SPEC PACKAGE` để vá `AGENTS.md` **ĐÃ TỒN TẠI** (cùng cơ chế đã dùng cho Luật J và Marker). Không có patcher thì 66 repo đã não hóa sẽ giữ luật cũ vĩnh viễn — đúng lỗ hổng đã mắc với Luật J ở v1.1.0.

**Verify (không tin code chưa chạy):** `node --check` sạch; dựng dự án giả từ `AGENTS.md` bản `HEAD` (kiểu cũ) rồi chạy engine thật → in `🔄 Đã tự động vá luật SPEC PACKAGE`, khối §3 mục 2 đúng nội dung, mục 1/3/4 nguyên vẹn; **chạy lần 2 không vá lặp** (`SPEC PACKAGE` đúng 1 lần).

**Version:** Hub `package.json` 1.4.0 → **1.5.0**; `BRAIN_TEMPLATE_VERSION` 1.2.0 → **1.3.0** (marker root sẽ tự đổi tên khi chạy engine).

**CÒN LẠI (cập nhật 02/09):** (a) ~~`npm run deploy`~~ → ĐÃ chạy ở #07, `diff` nguồn↔global RỖNG; (b) ~~quét lại 66 repo~~ → ĐÃ quét ở #07, đạt 65/67; (c) repo `ai-news-radar` đã tự ghi luật này vào `AGENTS.md` riêng trước đó — cần đồng bộ lại cho khớp câu chữ chuẩn của Hub.

---

## ✅ Phiên Đóng Nốt #06 (2026-09-01) — ĐÃ HOÀN THÀNH

1. **Kết quả cuối:** `PARENT_GIT 0` · `UNBORN 0` · **não chuẩn 66/67**. Thêm 20 commit ⇒ tổng chiến dịch **76 commit local, 0 push**. Repo duy nhất chưa não hóa là `brain4agent` (mới) — cách ly theo quyết định 5.1, chờ user.
2. **Điều phối 4 subagent Opus song song** theo nhóm rủi ro, orchestrator kiểm chứng độc lập lại toàn bộ: secret-scan 84 commit → **0 vi phạm**; 0 gitlink `160000` mới; mọi repo chạy lại engine đều `NÃO ĐÃ OK`.
3. **Mẫu quan trọng nhất rút ra — não hóa repo ĐANG BẨN mà không đụng việc user:** chụp đường cơ sở `git status` → stage TƯỜNG MINH từng file mới → **`git commit -m "..." -- <paths>`** (dạng pathspec, không bị cuốn index user đã stage sẵn) → `diff` đường cơ sở trước/sau phải giống hệt. Áp cho 8 repo, cả 8 đều IDENTICAL. Ghi thành gotcha #10.
4. **Chặn engine đổi tên thư mục hoa bằng cách tạo sẵn `planning/`** — bảo toàn 100% `Plan/` 313 file của `control-LDplayer` và `Plan/` của `ViDiaNorm`. Với `control-LDplayer` chỉ chuẩn hoá `DOCS/`→`docs/` (`git mv` dạng `R100`) + sửa cả 3 tham chiếu trong cùng commit; `git grep 'DOCS/'` sau đó = 0.
5. **Giải được bí ẩn "repo tự nhân bản":** có tiến trình sao chép gần-thời-gian-thực chép repo top-level đè vào thư mục lồng. Nhận diện bằng **`CreationTime` bản lồng trễ 13–71 giây trong khi `LastWriteTime` giống hệt** (không phải junction/symlink/hardlink — đã loại bằng `fsutil`). Nó chính là thứ làm `git status` của `openclaw-pro-studio` gãy `bad object HEAD`. Chưa định danh được công cụ ⇒ ghi gotcha #9 + đưa vào roadmap Active.
6. **2 đánh đổi minh bạch, không giấu:** `control-gpm` và `GramPilot` cố ý KHÔNG chạy engine (vì `AGENTS.md`/`state.json` của chúng đang bẩn) nên `state.json` 2 repo này **tạm thiếu field `brain_template_version`**; sẽ đủ khi user commit xong và chạy lại engine.
7. **`brain4agent` (mới) vẫn không suy suyển:** head `e01fdbf` / 38 file bẩn — TRƯỚC = SAU qua cả hai đợt.
8. **Lưu ý môi trường:** phiên agent khác vẫn chạy song song (62 commit ở `ai-news-radar`, `aiedu4vn`, `control-claude-code`, `fitc84.com`, `router4vn` trong cùng khoảng thời gian) — đã tách bạch khi đếm, không đụng vào.

---

## 🚀 Phiên Thực Thi #06 — Đồng Bộ 67 Repo (HOÀN THÀNH MỘT PHẦN CÓ CHỦ ĐÍCH)

1. **Kết quả đo bằng script kiểm kê chạy 2 lần (TRƯỚC/SAU):** `PARENT_GIT 9→0` ✅ · `UNBORN 13→5` · `DIRTY 16→10` · não chuẩn **21→52**. **56 commit local, 0 push.** Mục tiêu não ≥64/67 **chưa đạt** — 15 repo còn treo, mỗi repo có lý do ghi rõ trong `planning/06_*/plan.md` mục 6.
2. **Thứ tự GIT TRƯỚC — NÃO SAU chứng minh là đúng:** P01 (9 repo `git init` + baseline) → P02 (8/13 first-commit) → P03 (5 commit Bậc 1, 8 báo cáo Bậc 2, 2 chẩn đoán Bậc 3) → P04 (31 repo não hóa, 4 subagent song song) → P06 → P07.
3. **3 phát hiện lớn ngoài dự kiến:**
   - **Repo git LỒNG NHAU** ở 7 repo — `git status` gộp cả một repo con thành ĐÚNG 1 dòng nên khảo sát #06 đọc `AI-input(2)` tưởng gần sạch, thật ra bên trong là cả một dự án 1.4 GB. Commit sẽ tạo gitlink `160000` mồ côi ⇒ dừng 4 repo unborn.
   - **Bug cổng an toàn của chính mình:** biến vòng lặp `$sec` ghi đè hằng regex `$SEC` (PowerShell không phân biệt hoa/thường) làm cổng secret **báo PASS mà không kiểm gì**. Phát hiện nhờ NHÌN DỮ LIỆU cổng in ra chứ không nhìn kết luận. Sửa tên biến + audit lại bằng `git ls-files` (đường đo độc lập) ⇒ cả 9 repo sạch thật.
   - **Phiên agent KHÁC chạy song song** trên cùng workspace (commit 17:36–17:45 ở `control-claude-code`, `fitc84.com`, `aiedu4vn` và chính hub này). Nhờ đối chiếu dấu thời gian nên KHÔNG commit đè việc đang dở của họ.
4. **Chống "não giả" cho 7 kho TRỐNG** (`1seed`, `control-facebook/pc/telegram/zalo`, `control-PC-by-chatweb-ai`, `RE-Kit`): não ghi thẳng "kho TRỐNG, không mã nguồn", phạm vi CHỈ là suy đoán từ tên thư mục và phải hỏi chủ dự án; `system_status=scaffolded-empty-repo`.
5. **2 việc DỪNG có bằng chứng, không tự chế phương án:** `CausalAgent` GĐ2 (các `scratch_*.py` dựng `sys.path` từ `os.path.dirname(__file__)` ⇒ mv là gãy import) và `control-LDplayer` (≥8 tham chiếu path cứng tới `Plan/` đang sống).
6. **🔒 Cảnh báo bảo mật cần user xử riêng:** 4 repo có secret ĐÃ nằm trong lịch sử git từ TRƯỚC #06 — danh sách repo, đường dẫn và loại khoá được giữ ở hồ sơ chỉ-lưu-máy ngoài git. **Phải xoay khoá**, sửa code không đủ. #06 chỉ báo cáo, không untrack hộ (§3.5).
7. **Engine KHÔNG đổi dòng nào** — không bug engine nào lộ ra ⇒ `BRAIN_TEMPLATE_VERSION` giữ `1.2.0`, chỉ bump version DỰ ÁN v1.2.2 → v1.3.0.

---

## 🔒 Đóng Phiên 2026-08-31

- Audit lại `planning/05_*/plan.md` theo yêu cầu user → sửa 4 lỗi: tick P00b (gate đã mở bằng uỷ quyền, ghi rõ căn cứ), gạch-cập-nhật câu DRAFT lỗi thời ở Ghi Chú Phạm Vi, chú thích thứ tự P08 trước P07, chuẩn hoá số liệu `~20 → đếm thật 18` file scratch.
- Push `origin main` cho hub `brain4agent.old` theo lệnh tường minh của user (lần đầu trong chuỗi phiên — trước đó mọi commit đều local). Các repo đích (9 repo có commit não hóa) VẪN CHƯA PUSH — user tự quyết từng repo.
- Trạng thái bàn giao: kế hoạch #06 DRAFT + prompt thực thi đã trao cho user (today.md phần dưới); não đã kiểm không lệch.

## 🗺️ Phiên Lập Kế Hoạch #06 — Đồng Bộ 67 Repo (DRAFT, chưa thực thi)

1. **Kiểm kê 67/67 repo** bằng script read-only: trục GIT (9 không có `.git` riêng / 13 unborn / 15 dirty / 30 clean) × trục NÃO (21 chuẩn / 13 nửa vời / 32 trắng / 2 ca đặc biệt). Hồ sơ: `planning/06_2026-08-31_dong-bo-67-repo/` (plan + 7 specs), commit `6fa15f5`.
2. **Xương sống: GIT TRƯỚC — NÃO SAU** (P01 git-init → P02 first-commit → P03 xử bẩn bậc thang → P04 não hóa 4 lô → P06 nghiệm thu toàn kho bằng script kiểm kê tái chạy).
3. **Phát hiện quan trọng:** (a) `brain4agent` (không `.old`) là dự án Python đang dở 38 file, nghi HUB THẾ HỆ MỚI → cách ly; (b) 15 repo có secret `.env*` ở root → Giao Thức Chống Lộ Key 4 lớp bắt buộc (01-CONTRACTS §3); (c) `control-chatgpt-web` bẩn lại 1 file sau commit #04 — soi ở P03.
4. **3 quyết định chốt mặc định** (user uỷ quyền, đổi được trước khi chạy): cách ly `brain4agent` mới · bậc thang cho repo dirty · não hóa hết 32 repo trắng. Ghi tại plan.md mục 5.
5. **Kiểm não trước bàn giao:** boot `NÃO ĐÃ OK`; version 3 tầng khớp (project 1.2.2 / template 1.2.0 / marker đúng); anti-staleness grep sạch (mọi khớp còn lại là mục lịch sử hợp lệ). Kế hoạch #06 kế thừa + đóng mọi mục treo của #04/#05.

## 🧬 Phiên Não Hóa Nhóm C (kế hoạch #05, v1.2.2)

1. **Lập kế hoạch Spec-First** cho 6 repo chưa có `AGENTS.md`: `plan.md` + `specs/{00-ARCHITECTURE, 01-CONTRACTS, SPEC-P01..P06}`. Khảo sát read-only trước cho thấy 6 hiện trạng khác hẳn nhau → phân lớp di trú **A / A+ / B / B+ / C / D**.
2. **Nguyên tắc kiến trúc rút ra:** *di trú ngữ nghĩa TRƯỚC — engine SAU*. Chạy thẳng engine lên não schema cũ sinh **não song trùng** (bộ chuẩn RỖNG cạnh bộ cũ ĐẦY, agent đời sau đọc bộ rỗng và mất trí nhớ).
3. **Thực thi bằng 6 subagent song song 2 đợt** (đợt 1: A/A+/B; đợt 2: B+/C/D), mỗi subagent khoá phạm vi đúng repo của nó, cấm chạm repo hub. Orchestrator **kiểm chứng độc lập lại toàn bộ** sau đó, không tin báo cáo suông.
4. **Kết quả 6/6:** `block-ads-fb-v2` `1c0569e` · `dreamteam4vn` `79efb93`+`cb2bcfa` · `Audit` `451f1ac` · `reverse Claude` `bf7e959` · `Agent to Product` `a7c6ce4` · `CausalAgent` GĐ1 không commit (repo unborn — đúng thiết kế). Tất cả local, KHÔNG push.
5. **Hotfix engine v1.2.2:** 2 subagent độc lập phát hiện nhánh vá Bước 0 vào `memory-distill.txt` là **no-op khi kernel không có tag `<agent_startup_protocol>`** — vẫn in log "Đã tự động vá". Đã thêm fallback chèn khối lên đầu file; test ca fallback + ca hồi quy XML + deploy `DIFF_EMPTY_BYTE_IDENTICAL`.
6. **2 sai lệch hợp đồng CÓ CHỦ ĐÍCH (không phải lỗi):** `Agent to Product` không thêm `current_version` (schema legacy đã có `release` — thêm nữa sẽ thành 2 nguồn chân lý); `reverse Claude` đưa transcript vào `scratch/` thay `raw/` (quy ước sẵn có của dự án thắng dự đoán trong SPEC).
7. **3 gotcha mới:** 5b (não song trùng), 5c (grep tham chiếu trước khi dọn root).

## 🚀 Phiên Rollout Hệ Sinh Thái (kế hoạch #04, v1.2.1):

1. **Pilot `control-claude-code` được user DUYỆT:** diff `AGENTS.md` chỉ-thêm-0-xoá, Bước 0 không vá đôi, CLAUDE.md shim 8 dòng chuẩn. Commit local `eeba58a`.
2. **Hotfix newline (user phát hiện khi duyệt):** `init_brain.js` ghi `state.json` thiếu `\n` cuối file (2 chỗ). Sửa `+ '\n'`, thêm chẩn đoán `hasStateJsonTrailingNewline` vào `isFullyStandard` + mở rộng nhánh vá (sửa được cả repo đã "OK"). Rà các điểm ghi khác (`CLAUDE.md`, marker, `AGENTS.md`) — đều đã `0a`. Re-deploy byte-identical, dogfood + re-pilot: tail byte `0a`, idempotent OK. Bump PROJECT version v1.2.1, GIỮ `BRAIN_TEMPLATE_VERSION=1.2.0`.
3. **Rollout Nhóm A — 9/18 repo vá + commit local (KHÔNG push):** `control-claude-code eeba58a`, `ai-news-radar 6e8d41a`, `control-9router 5172ef0`, `control-chatgpt-web e433b55`, `control-linux-server cf32bf0`, `fitc84.com 44db266` (nhánh `feat/ui-upgrade-v1.1`), `router4vn 2753b87`, `translate4ide 7485563`, `wikiultra 5f0b859` (kèm vá Bước 0). 2 repo (`control-chatgpt-web`, `translate4ide`) có `AGENTS.md` phi chuẩn → engine vá qua fallback "PHỤ LỤC TỰ ĐỘNG VÁ" đúng thiết kế P09, vẫn chỉ-thêm.
4. **9 repo bỏ qua vì working tree bẩn:** GramPilot(15), control-cloudflare(1), control-codex(2), control-discord(3), control-gpm(59), control-keypassxc(341), control-router(341), control-syncthing(341), control-tailscale(341) — 4 repo cùng con số 341 file đáng ngờ hiện tượng chung.
5. **`teamworkflow` (Nhóm B) — BỎ QUA chờ user:** `CLAUDE.md` LÀ shim chuẩn (`@AGENTS.md` 1 dòng), nhưng repo CHƯA có commit nào (no HEAD, toàn bộ untracked) và `AGENTS.md` chỉ là Next.js tooling notice 5 dòng, không phải bộ luật não.
6. **ĐỢT BỔ SUNG — audit lại 19 repo, 2 đính chính lớn:**
   - **"341 file bẩn" là ARTEFACT ĐO:** 4 repo `control-keypassxc|router|syncthing|tailscale` KHÔNG có `.git` riêng → `git -C` leo lên repo cha `D:\Data\Repositories` và trả về trạng thái của repo cha. Repo cha lại `.gitignore` chính `/.My-Repositories/` (dòng 4) ⇒ 4 repo này thật sự KHÔNG được version control. Đã backup thủ công `AGENTS.md`+`state.json` ra scratchpad, chạy engine, kiểm bằng **subsequence** thay `git diff` (onlyAdditions=True cả 4, lostStateKeys=0). KHÔNG `git init`, KHÔNG commit.
   - **`control-discord` & `teamworkflow` KHÔNG detached HEAD:** `.git/HEAD` = `ref: refs/heads/main`, `status -sb` = `No commits yet on main` → là **unborn branch**. Vẫn bỏ qua nhưng vì lý do khác: commit sẽ tạo mốc lịch sử ĐẦU TIÊN của repo.
   - Ghi 2 gotcha mới (mục 4 & 5 trong `-known-gotchas.md`).
   - **Phân loại chốt 19/19:** 9 vá+commit · 4 vá-không-git-kèm-backup · 4 bỏ qua vì bẩn · 2 bỏ qua vì chưa có commit. **Còn 6 repo chờ user.**
7. **Ghi hồ sơ:** `planning/04_2026-08-31_rollout-ecosystem/plan.md` + sync 6 điểm (`changelog`, `roadmap`, `today.md`, `state.json`, `memory-distill`, version bump toàn bộ file cấu hình).

## 🎯 Thành Tựu Cốt Lõi Đạt Được Trong Phiên:
1. **Chống lỗi thời cho não bộ sau đợt vá v1.1.0 (commit `94a4506`):**
   - Sửa `roadmap.md` và `memory-distill.txt` — 2 chỗ còn khẳng định sai `brain4agent (v1.0.1)` trong khi `package.json` đã là `1.1.0`.
   - Grep toàn repo (trừ `archive/` và `changelog.md`) xác nhận không còn tài liệu sống nào khẳng định version cũ hoặc câu sai "AGENTS.md nạp tự động khi khởi động phiên".
2. **Ghi hồ sơ kế hoạch cho đợt vá Dual Entry-Point Invariant:**
   - Tạo [`planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md`](file:///planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md) theo đúng khuôn plan #01, ghi lại bằng chứng nghiệm thu thật (3 ca kiểm chứng, commit `94a4506`, đồng bộ deploy, 7 test pytest bên `aiedu4vn`).
3. **Bổ sung gotcha mới vào `-known-gotchas.md`:** mục "Claude Code — Điểm Nạp Luật (Entry Point)" — triệu chứng, nguyên nhân, bẫy phụ (backtick quanh `@AGENTS.md`), cách phát hiện, cách khắc phục.
4. **Đồng bộ phần não còn lại:** `index.md` (thêm `planning/02_...` vào sơ đồ cây), `changelog.md` (tham chiếu tới plan #02 trong mục `[v1.1.0]`), `memory/hot/today.md` + `state.json` (phiên này).

---

## 🧪 Kết Quả Kiểm Chứng:
- Grep toàn repo `v1\.0\.1|1\.0\.1` (trừ `archive/`, `changelog.md`): 0 kết quả còn sót.
- Grep câu sai "AGENTS.md nạp tự động": chỉ còn xuất hiện trong `changelog.md` với vai trò mô tả LỊCH SỬ lỗi đã sửa (giữ nguyên, không sửa hồi tố).

---

## 📁 Danh Sách File Đã Tạo / Sửa:
- **Tạo mới:**
  - [`planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md)
- **Chỉnh sửa:**
  - [`brain4agent/roadmap.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/roadmap.md)
  - [`brain4agent/memory-distill.txt`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/memory-distill.txt)
  - [`brain4agent/-known-gotchas.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/-known-gotchas.md)
  - [`brain4agent/index.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/index.md)
  - [`brain4agent/changelog.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/changelog.md)
  - [`brain4agent/memory/hot/today.md`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/memory/hot/today.md)
  - [`brain4agent/memory/hot/state.json`](file:///d:/Data/Repositories/.My-Repositories/brain4agent.old/brain4agent/memory/hot/state.json)
