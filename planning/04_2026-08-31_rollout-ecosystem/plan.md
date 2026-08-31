# KẾ HOẠCH NÂNG CẤP: ROLLOUT KHUNG NÃO v1.2.0 RA TOÀN HỆ SINH THÁI (#04)

- **STT KẾ HOẠCH:** #04
- **TRẠNG THÁI:** 🔄 ĐÃ XỬ LÝ 13/19 REPO — **CHƯA hoàn tất**: còn 6 repo chờ user (4 working tree bẩn + 2 repo chưa có commit nào). Xem bảng phân loại 4 nhóm ở Cổng Nghiệm Thu.
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31
- **THỜI GIAN HOÀN TẤT ĐỢT 1:** 2026-08-31 (sau phê duyệt pilot của user cùng ngày)
- **PHIÊN BẢN MỤC TIÊU:** v1.2.1 (PATCH — hotfix newline `state.json` phát sinh khi user duyệt pilot; template khung não GIỮ v1.2.0)

---

## 🎯 1. Mục Tiêu Nghiệp Vụ

1. Vá lỗi im lặng "Claude Code không nạp luật" cho 18 repo Nhóm A (có `AGENTS.md` nhưng thiếu `CLAUDE.md`) bằng cách chạy `init_brain.js` v1.2.0: sinh shim `CLAUDE.md`, vá Luật J + ngoại lệ marker §5.G mục 3 vào `AGENTS.md` hiện có, sinh marker `brain4agent-v1.2.0.md`, ghi `brain_template_version` vào `state.json`.
2. Xử lý riêng Nhóm B (`teamworkflow` — đã có cả 2 file nhưng thiếu marker): kiểm `CLAUDE.md` có phải shim `@AGENTS.md` không; nếu là file luật người viết → DỪNG hỏi user, không ghi đè.
3. BỎ QUA toàn bộ Nhóm C (6 repo không có `AGENTS.md`): `Agent to Product`, `Audit`, `CausalAgent`, `block-ads-fb-v2`, `dreamteam4vn`, `reverse Claude` — chạy script sẽ SINH MỚI nguyên bộ luật, là quyết định riêng từng dự án.
4. KHÔNG ĐỤNG: `aiedu4vn` (phiên riêng xử lý, AGENTS.md tuỳ biến 188 dòng) và `brain4agent.old` (đã chuẩn v1.2.0).
5. Mỗi repo vá xong: commit riêng LOCAL (Conventional Commits tiếng Anh), **KHÔNG PUSH** — user tự push.

### Bốn bẫy phải né (theo chỉ thị user)

1. Script tự đổi tên `DOCS` → `docs`, `Plan` → `planning` → repo nào có thư mục viết hoa đó: DỪNG hỏi user trước.
2. `git status` phải sạch trước khi chạy; repo đang dở → BỎ QUA, ghi báo cáo, không commit hộ.
3. Đường vá `AGENTS.md` người viết tay chưa kiểm chứng rộng → mỗi repo phải xem `git diff` xác nhận script chỉ THÊM, không mất nội dung cũ.
4. Bản script CŨ lạc tại `Agent to Product/.agents/skills/.brain-build/scripts/init_brain.js` (0 lần nhắc `CLAUDE.md`) → chỉ BÁO, không tự xoá.

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P01 🔴 [Pilot — control-claude-code]:** Tiền trạm (`git status` sạch, không `DOCS`/`Plan` hoa) → chạy script → thu bằng chứng: `git status` trước/sau, `git diff AGENTS.md` đầy đủ, nội dung `CLAUDE.md` + marker, diff `state.json`. **DỪNG chờ user duyệt — CHƯA commit.** (Xong 2026-08-31, bằng chứng ở Cổng Nghiệm Thu bên dưới.)
- [x] **P02 🔴 [User Approval Gate]:** User DUYỆT pilot 2026-08-31 ("diff đúng như mong đợi — chỉ thêm, 0 xoá, Bước 0 không vá đôi"), CHẤP NHẬN re-format `state.json`, kèm yêu cầu phát sinh P02b.
- [x] **P02b 🔴 [Hotfix Newline — yêu cầu phát sinh từ user khi duyệt]:** `init_brain.js` ghi `state.json` thiếu newline cuối (2 chỗ, dòng 367/377 cũ). Sửa cả hai thành `JSON.stringify(...) + '\n'`; rà mọi điểm ghi file khác (`CLAUDE.md`, marker, `AGENTS.md`, `today.md`) — tail byte đều đã `0a`, không cần sửa; thêm chẩn đoán `hasStateJsonTrailingNewline` vào `isFullyStandard` + mở rộng nhánh vá state.json (repo đã "NÃO ĐÃ OK" vẫn tự sửa được — cần thiết vì script có early-exit dòng 95-109). Re-deploy + kiểm chứng: xem Cổng Nghiệm Thu.
- [x] **P03 🟠 [Commit pilot]:** `control-claude-code` → **`eeba58a`** (`master`, 4 files, 95 insertions / 15 deletions — deletions toàn bộ thuộc re-format JSON state.json, AGENTS.md 0 deletion).
- [x] **P04 🟠 [Rollout 17 repo Nhóm A còn lại]:** Chạy qua script `rollout.ps1` (scratchpad) với 5 cổng kiểm máy mỗi repo (status sạch; không `DOCS`/`Plan` hoa; diff `AGENTS.md` numstat deletions=0; đoạn luật xuất hiện đúng 1 lần; đúng 1 marker + CLAUDE.md shim + state.json tail `0a`). Kết quả: **8 vá + commit, 9 bỏ qua vì dirty** (bảng ở Cổng Nghiệm Thu). 2 repo (`control-chatgpt-web`, `translate4ide`) ban đầu FAIL cổng đếm chuỗi → điều tra xác nhận là false-positive của cổng kiểm (fallback phụ lục P09 làm tiêu đề + nội dung cùng chứa chuỗi; đoạn luật thật đếm = 1) → kiểm lại chuẩn rồi commit.
- [x] **P05 🟠 [Nhóm B — teamworkflow]:** `CLAUDE.md` LÀ shim chuẩn (nguyên văn 1 dòng `@AGENTS.md`) — không phải file luật người viết. NHƯNG: (a) repo CHƯA có commit nào (`fatal: branch 'main' does not have any commits yet`, toàn bộ file untracked → không có HEAD để soi diff/rollback, dính bẫy 2); (b) `AGENTS.md` của nó chỉ là **notice 5 dòng do tooling Next.js sinh** ("This is NOT the Next.js you know"), không phải bộ luật não — chạy script sẽ vá luật quản trị vào file notice framework. → BỎ QUA, chờ user quyết.
- [x] **P04b 🔴 [4 repo không có git riêng]:** Đính chính artefact đo "341 file bẩn"; backup thủ công `AGENTS.md` + `state.json`; chạy engine; kiểm chứng bằng subsequence + so khớp key JSON thay cho `git diff`; KHÔNG `git init`, KHÔNG commit. Chi tiết ở Cổng Nghiệm Thu P04b.
- [x] **P04c 🔴 [Đính chính detached HEAD]:** `control-discord` và `teamworkflow` KHÔNG detached mà là unborn branch (`ref: refs/heads/main` + `No commits yet on main`); vẫn BỎ QUA nhưng vì lý do khác (commit sẽ tạo mốc lịch sử đầu tiên của repo — user quyết).
- [x] **P06 🟢 [Báo cáo cuối]:** Trình bày đủ 7 mục (a)-(g) trong phản hồi phiên 2026-08-31.
- [x] **P07 🟢 [Sync Cascade repo này]:** `changelog.md` (+mục v1.2.1), `roadmap.md` (Done + Active phần treo), `today.md`, `state.json` (current_version 1.2.1 + khối `rollout_2026-08-31_plan04`), `memory-distill.txt`, version bump `package.json`/`README.md`/`project-intro.md`/`index.md`.

---

## 🛡️ 3. Cổng Nghiệm Thu (Bằng Chứng Thật)

### Ca thí điểm — control-claude-code (chạy 2026-08-31, engine bản nguồn `brain4agent.old`)

1. **Tiền trạm:** `git status` = `nothing to commit, working tree clean` (branch `master`); root listing không có `DOCS`/`Plan` viết hoa (đã có sẵn `docs/`, `planning/` thường).
2. **Output script:** vá `brain_template_version=1.2.0` vào `state.json` (giữ field khác), tạo `brain4agent-v1.2.0.md`, vá ngoại lệ §5.G mục 3 + Luật J vào `AGENTS.md` hiện có, tạo `CLAUDE.md` shim. 7 phân vùng não giữ nguyên (log "Giữ nguyên dữ liệu" × 7).
3. **`git status --short` sau:** ` M AGENTS.md`, ` M brain4agent/memory/hot/state.json`, `?? CLAUDE.md`, `?? brain4agent-v1.2.0.md` — đúng 4 thay đổi, không file nào khác bị đụng.
4. **`git diff AGENTS.md`:** CHỈ THÊM 2 khối (mục 3 vào §G, nguyên §J sau §H) — 0 dòng xoá/sửa nội dung cũ. Bước 0 đã có sẵn từ trước (dòng 11), không bị vá đôi. Grep count sau vá: `Marker Phiên Bản Khung Não` = 1, `Dual Entry-Point Invariant` = 1 (không nhân đôi).
5. **`CLAUDE.md` sinh ra:** 8 dòng, đúng shim `@AGENTS.md`, không chứa luật.
6. **⚠️ Điểm cần user biết:** diff `state.json` LỚN vì script parse rồi re-serialize JSON — mọi mảng inline bị bung xuống nhiều dòng và mất newline cuối file. **Dữ liệu không mất field nào** (chỉ thêm `brain_template_version`), nhưng format đổi. 17 repo còn lại sẽ bị tương tự.

### Ca hotfix newline (P02b — chạy 2026-08-31, sau phê duyệt pilot)

- `node --check init_brain.js` → `OK_SYNTAX`.
- `deploy_skills.ps1` chạy lại → `Compare-Object` nguồn ↔ `C:\Users\hoang\.gemini\config\skills\...` = `DIFF_EMPTY_BYTE_IDENTICAL`.
- Dogfood `brain4agent.old` + re-run pilot: cả hai log `🔄 Đã bổ sung newline cuối file cho memory/hot/state.json (chuẩn POSIX, sạch git diff).`; tail byte cả 2 file `state.json` = `0a` (trước đó `7d`).
- Idempotent: chạy lần 2 trên pilot → `🎉 NÃO ĐÃ HOÀN HẢO` / `NÃO ĐÃ OK`.

### Kết quả rollout Nhóm A (P04 — đo 2026-08-31, engine bản nguồn sau hotfix)

| Repo | Kết quả | SHA / Lý do | Ghi chú |
| :--- | :--- | :--- | :--- |
| control-claude-code (pilot) | ✅ VÁ + COMMIT | `eeba58a` (master) | adds AGENTS=10, dels=0 |
| ai-news-radar | ✅ VÁ + COMMIT | `6e8d41a` (main) | adds=10, dels=0 |
| control-9router | ✅ VÁ + COMMIT | `5172ef0` (main) | adds=10, dels=0 |
| control-chatgpt-web | ✅ VÁ + COMMIT | `e433b55` (master) | AGENTS.md phi chuẩn → fallback phụ lục P09; adds=17, dels=0; đoạn luật thật đếm=1 |
| control-linux-server | ✅ VÁ + COMMIT | `cf32bf0` (main) | adds=10, dels=0 |
| fitc84.com | ✅ VÁ + COMMIT | `44db266` | ⚠️ commit nằm trên nhánh đang checkout `feat/ui-upgrade-v1.1` (status sạch) |
| router4vn | ✅ VÁ + COMMIT | `2753b87` (main) | adds=10, dels=0 |
| translate4ide | ✅ VÁ + COMMIT | `7485563` (main) | fallback phụ lục P09; adds=17, dels=0 |
| wikiultra | ✅ VÁ + COMMIT | `5f0b859` (main) | adds=13 = 2 luật + vá thêm Bước 0 (repo thiếu) |
| GramPilot | ⏭️ BỎ QUA | dirty — 15 file đang dở | user dọn rồi tự chạy lại engine |
| control-cloudflare | ⏭️ BỎ QUA | dirty — 1 file | — |
| control-codex | ⏭️ BỎ QUA | dirty — 2 file | — |
| control-gpm | ⏭️ BỎ QUA | dirty — 59 file | — |
| control-discord | ⏭️ BỎ QUA | repo CHƯA có commit nào | `## No commits yet on main`, `AGENTS.md` + `brain4agent/` đều untracked |
| control-keypassxc | ✅ VÁ (P04b) | không có git riêng | xử lý ở đợt bổ sung, có bản lưu |
| control-router | ✅ VÁ (P04b) | không có git riêng | — |
| control-syncthing | ✅ VÁ (P04b) | không có git riêng | — |
| control-tailscale | ✅ VÁ (P04b) | không có git riêng | — |

### P04b 🔴 — Đính chính đo đạc & xử lý 4 repo KHÔNG CÓ GIT RIÊNG (2026-08-31, đợt bổ sung)

**Đính chính 1 — "341 file bẩn" là ARTEFACT ĐO, không phải repo bẩn.** 4 repo `control-keypassxc`, `control-router`, `control-syncthing`, `control-tailscale` **không có `.git` riêng**. Lệnh `git -C <repo> status` leo lên tổ tiên và trả về trạng thái của repo cha `D:\Data\Repositories` (`rev-parse --git-dir` → `D:/Data/Repositories/.git`), lúc đó đang có 341 thay đổi — nên cổng "status sạch" của đợt 1 hiểu nhầm là repo con bẩn. Đo lại 2026-08-31: repo cha đã sạch (`main...origin/main [ahead 2]`, dirty=0).

**Xác nhận 4 repo này THẬT SỰ không được version control:** `.gitignore` của repo cha dòng 4 là `/.My-Repositories/` → `git check-ignore -v` khớp cho cả 4; `git ls-files` = 0 file được theo dõi. Nghĩa là không thể revert bằng git → BẮT BUỘC backup thủ công trước khi sửa.

- **Bản lưu (trước khi chạy):** `…\scratchpad\backup-nogit-2026-08-31\<repo>\{AGENTS.md, state.json}` — keypassxc 11821/1622 bytes, router 13207/914, syncthing 12948/1929, tailscale 12919/1166.
- **KHÔNG chạy `git init`, KHÔNG commit** (quyết định của user, không phải của agent).
- **Cổng kiểm thay cho `git diff` (so với bản lưu):** kiểm *subsequence* — mọi dòng của `AGENTS.md` gốc phải còn nguyên, đúng thứ tự, trong bản mới ⇒ chứng minh chỉ-thêm-không-mất; và so khớp tập key JSON của `state.json`.

| Repo | AGENTS.md dòng | onlyAdditions | luật đếm | marker | CLAUDE.md shim | state tail `0a` | key JSON mất |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| control-keypassxc | 102 → 118 | ✅ True | 1 / 1 | ✅ | ✅ | ✅ | 0 |
| control-router | 125 → 135 | ✅ True | 1 / 1 | ✅ | ✅ | ✅ | 0 |
| control-syncthing | 145 → 154 | ✅ True | 1 / 1 | ✅ | ✅ | ✅ | 0 |
| control-tailscale | 125 → 135 | ✅ True | 1 / 1 | ✅ | ✅ | ✅ | 0 |

- Cả 4 vá vào **đúng section chuẩn** (không phải fallback phụ lục); `brain_template_version=1.2.0` ghi thành công, 0 key cũ bị mất.
- Repo cha `D:\Data\Repositories` **vẫn dirty=0** sau khi chạy — đúng như dự đoán vì `/.My-Repositories/` bị ignore, thao tác không rò rỉ sang repo cha.

### P04c 🔴 — Đính chính về "detached HEAD"

Ngữ cảnh bổ sung của user nêu `control-discord` và `teamworkflow` đang **detached HEAD**. **Đo lại cho thấy KHÔNG PHẢI detached:** file `.git/HEAD` của cả hai là `ref: refs/heads/main` (detached thì phải là SHA trần), `git status -sb` trả về `## No commits yet on main`. Đây là **nhánh chưa sinh (unborn branch)** — repo đã `git init` nhưng chưa có commit nào, nên `git rev-parse HEAD` báo `fatal: Needed a single revision` và `--abbrev-ref HEAD` in ra chữ `HEAD` (chính chỗ này dễ bị nhầm là detached).

**Kết luận xử lý vẫn là BỎ QUA cả hai** (trùng chỉ thị của user, khác lý do): commit ở đây sẽ tạo **commit đầu tiên của repo** gộp toàn bộ file dự án đang untracked (`control-discord`: 3 mục gồm cả `brain4agent/`; `teamworkflow`: 15 mục gồm `src/`, `package.json`…) — đó là mốc lịch sử của dự án, phải do user quyết, không phải hệ quả phụ của một đợt vá não. Không có nguy cơ commit mồ côi.

- Không repo nào có thư mục `DOCS`/`Plan` viết hoa (kiểm case-sensitive từng repo trước khi chạy) — bẫy 1 không kích hoạt ở bất kỳ đâu.
- Mỗi repo PATCHED đều qua đủ 5 cổng máy: numstat AGENTS.md deletions=0; đoạn luật đếm=1; đúng 1 marker `brain4agent-v1.2.0.md`; `CLAUDE.md` chứa `@AGENTS.md`; `state.json` tail `0a`. `git status` sau commit = rỗng.

### Nhóm B — teamworkflow (P05)

- `CLAUDE.md` = đúng 1 dòng `@AGENTS.md` → LÀ shim chuẩn (không phải file luật người viết, nên không dính điều kiện "dừng hỏi" của brief).
- `git log` → `fatal: your current branch 'main' does not have any commits yet`; `status -sb` → `## No commits yet on main`; toàn bộ 15 mục `??` untracked → không có HEAD để soi diff/rollback (bẫy 2). **Không phải detached HEAD** — xem P04c.
- `AGENTS.md` chỉ 5 dòng notice `<!-- BEGIN:nextjs-agent-rules -->` do tooling Next.js sinh — không phải bộ luật não. Grep: dual=0, marker_law=0, step0=0.
- → BỎ QUA, bàn giao user quyết (nên commit mốc đầu repo trước, và quyết định có muốn não hóa repo này không).

### 📊 Phân loại tổng kết — 19/19 repo (không sót)

| Nhóm | Số repo | Danh sách |
| :--- | :--- | :--- |
| ✅ ĐÃ XỬ LÝ — vá + commit local | 9 | control-claude-code, ai-news-radar, control-9router, control-chatgpt-web, control-linux-server, fitc84.com, router4vn, translate4ide, wikiultra |
| ✅ KHÔNG CÓ GIT — đã xử lý kèm backup | 4 | control-keypassxc, control-router, control-syncthing, control-tailscale |
| ⏭️ BỎ QUA — working tree bẩn sẵn | 4 | GramPilot (15 file), control-gpm (59), control-codex (2), control-cloudflare (1) |
| ⏭️ BỎ QUA — repo chưa có commit nào (unborn `main`, KHÔNG phải detached) | 2 | control-discord (3 mục untracked), teamworkflow (15 mục untracked) |
| **TỔNG** | **19** | — |

**CHƯA HOÀN TẤT TOÀN BỘ:** còn **6 repo** chờ user xử lý (4 bẩn + 2 chưa có commit), cộng 6 repo Nhóm C ngoài phạm vi đợt này.

- [x] KHÔNG push bất kỳ repo nào (user tự push) — mọi thao tác chỉ `git commit` local, không lệnh `push` nào được chạy.

---

## 📌 Ghi Chú Phạm Vi

- `aiedu4vn`: TUYỆT ĐỐI không đụng — phiên riêng xử lý.
- Nhóm C (6 repo không `AGENTS.md`): bỏ qua toàn bộ đợt này.
- Bản script cũ lạc `Agent to Product/.agents/skills/.brain-build/scripts/init_brain.js`: chỉ báo cáo, không xoá.
- Engine dùng: bản nguồn repo này = bản global `.gemini` (byte-identical, đã xác nhận ở kế hoạch #03).
