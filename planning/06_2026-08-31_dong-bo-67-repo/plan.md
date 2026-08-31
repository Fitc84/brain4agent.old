# KẾ HOẠCH NÂNG CẤP: ĐỒNG BỘ CẤU TRÚC 67 REPO — GIT ĐÚNG CHỖ + NÃO CHUẨN v1.2.0 (#06)

- **STT KẾ HOẠCH:** #06
- **TRẠNG THÁI:** ✅ ĐÃ HOÀN THÀNH (một phần có chủ đích — 14 repo dừng có lý do ghi rõ, chờ user)
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31 (lập kế hoạch)
- **THỜI GIAN HOÀN TẤT:** 2026-08-31 19:02:00 (+07)
- **PHIÊN BẢN MỤC TIÊU:** hub bump **v1.3.0** (docs/governance, KHÔNG đổi engine — không bug engine nào lộ ra); `BRAIN_TEMPLATE_VERSION` giữ **1.2.0**

---

## 🎯 1. Mục Tiêu Nghiệp Vụ

1. **Git đúng chỗ 100%:** mọi repo trong `D:\Data\Repositories\.My-Repositories\` phải có `.git` của CHÍNH NÓ tại root và có ít nhất 1 commit — chấm dứt hai bệnh đã gây đo sai ở #04: (a) không có `.git` riêng nên `git -C` leo lên repo cha (gotcha #4); (b) unborn branch không có HEAD để diff/rollback (gotcha #5).
2. **Não chuẩn 100%:** mọi repo (trừ ca đặc biệt) đạt schema v1.2.0 — `AGENTS.md` + `CLAUDE.md` shim + marker + `brain4agent/` 7 phân vùng + `memory/hot/` — theo đúng nguyên tắc #05: *di trú ngữ nghĩa TRƯỚC — engine SAU*.
3. **Không lộ secret:** 15 repo có `.env`/secret ở root (danh sách mục 4) — mọi thao tác `git init`/first-commit phải qua **Giao Thức Chống Lộ Key** (01-CONTRACTS §3) trước khi chạm `git add`.
4. **Không phá dự án sống:** ca đặc biệt (SPEC-P05) cách ly khỏi xử lý hàng loạt.

## 📊 2. Kiểm Kê 67/67 (đo 2026-08-31, script khảo sát read-only)

**Chú thích:** `A`=AGENTS.md · `C`=CLAUDE.md · `M`=marker · `B`=brain4agent/ · số trong ngoặc = file bẩn/untracked.

### Nhóm G1 — KHÔNG CÓ GIT RIÊNG (`git -C` leo lên repo cha `D:\Data\Repositories`) — 9 repo → SPEC-P01

`control-chrome`, `control-facebook`, `control-keypassxc`†, `control-pc`, `control-router`†, `control-syncthing`†, `control-tailscale`†, `control-telegram`, `control-zalo`
*(† = 4 repo đã có não chuẩn từ #04, chỉ thiếu git)*

### Nhóm G2 — UNBORN (đã `git init`, chưa có commit nào) — 13 repo → SPEC-P02

`1seed`(1), `AI-input`(2), `auto-hot-key`(2), `bi-kip-luyen-agent`(2), `CausalAgent`(39)‡, `coding-orchestrator`(11), `congquyengop.vn`(2), `control-discord`(3), `control-PC-by-chatweb-ai`(1), `docker`(2), `manage-fitc84`(9), `RE-Kit`(1), `teamworkflow`(15)
*(‡ = đã não hóa GĐ1 ở #05; first-commit mở luôn gate GĐ2 dọn root)*

### Nhóm G3 — DIRTY (có git + có commit, working tree bẩn) — 15 repo → SPEC-P03

`brain4agent`(38)⚠, `Bugbounty-Hunter`(3), `control-chatgpt-web`(1)*, `control-cloudflare`(1), `control-codex`(2), `control-gpm`(59), `control-LDplayer`(1), `convert-json-to-9router-from-keycrop`(9), `CV`(4), `FITC84-WorkOs-`(7), `GramPilot`(15), `jina-proxy`(1), `openclaw-pro-studio`(2), `Token-Calcultor`(3), `ViDiaNorm`(294)
*(⚠ = ca đặc biệt SPEC-P05, KHÔNG xử lý hàng loạt; \* = sạch lúc commit #04, bẩn lại 1 file sau đó — soi trước)*

### Nhóm G4 — CLEAN (git chuẩn, tree sạch) — 30 repo

Trong đó **21 đã chuẩn não đầy đủ** (A+C+M+B): `Agent to Product`, `ai-news-radar`, `aiedu4vn`⛔, `Audit`, `block-ads-fb-v2`, `brain4agent.old`(hub), `control-9router`, `control-claude-code`, `control-linux-server`, `dreamteam4vn`, `fitc84.com`, `reverse Claude`, `router4vn`, `translate4ide`, `wikiultra` + 4 repo † nhóm G1 + `CausalAgent`‡ + `control-chatgpt-web`\*.
**9 repo clean còn thiếu não** → SPEC-P04: `AI-Factory-FPT-DOCS`(A, không B), `auto-excel`, `Base.labMCP`, `Công cụ phân tích partern`, `Create-Restore-point`, `CRM_MVP-main`, `cross_ai_bridge`, `enterprise-signal-intelligence`(A, không B), `Fix-PC`, `Heimdall`, `phong-chong-thien-tai`, `Radar-Scan-and-Collect`, `Web-hoc-tap`, `control-phone`(A, không B), `xoayproxy`(A, không B, DOCS hoa).

### Trạng thái não gộp toàn kho

| Trạng thái não | Số repo |
| :--- | :--- |
| ✅ Chuẩn đầy đủ v1.2.0 (A+C+M+B) | 21 |
| 🔶 Có `AGENTS.md`, thiếu `CLAUDE.md` (treo từ #04 vì dirty/unborn) | 5 (`control-cloudflare`, `control-codex`, `control-discord`, `control-gpm`, `GramPilot`) |
| 🔶 Có `AGENTS.md` nhưng KHÔNG có `brain4agent/` | 7 (`AI-Factory-FPT-DOCS`, `control-LDplayer`, `control-phone`, `CV`, `enterprise-signal-intelligence`, `jina-proxy`, `xoayproxy`) |
| 🔶 `teamworkflow` — shim chuẩn, `AGENTS.md` là Next.js notice, thiếu marker | 1 |
| ⬜ Chưa có gì | 32 |
| ⚠️ Ca đặc biệt (SPEC-P05) | 2 (`brain4agent` mới, `aiedu4vn`) — hub `brain4agent.old` không tính |

### Cờ rủi ro chéo

- **Secret ở root (15):** `ai-news-radar`, `aiedu4vn`, `Audit`, `brain4agent`, `CausalAgent`, `control-gpm`, `control-keypassxc`, `control-linux-server`, `control-router`, `dreamteam4vn`(.env.local), `GramPilot`(.env.local), `openclaw-pro-studio`, `phong-chong-thien-tai`, `router4vn`, `translate4ide`.
- **Thư mục `DOCS`/`Plan` viết hoa (5):** `brain4agent`(Plan), `control-codex`, `control-LDplayer`(2), `ViDiaNorm`, `xoayproxy` — engine tự đổi tên → phải grep tham chiếu trước, hoặc chạy engine SAU khi xử lý tay.
- **Tên có dấu cách / tiếng Việt (3):** `Agent to Product`, `reverse Claude`, `Công cụ phân tích partern` — mọi lệnh bọc ngoặc kép.

## 📋 3. Checklist Thực Thi (Model Tier Tagged)

- [x] **P00 🔴 [Khảo sát 67/67 + lập kế hoạch]:** bảng kiểm kê trên; bộ specs này. Xong 2026-08-31.
- [x] **P00b 🔴 [USER APPROVAL GATE]:** duyệt kế hoạch + trả lời 3 câu hỏi mở (mục 5). KHÔNG thực thi trước khi duyệt.
- [x] **P01 🔴 [Git-init 9 repo Nhóm G1]:** ✅ 9/9. theo [specs/SPEC-P01-git-init-9-parent-git.md](specs/SPEC-P01-git-init-9-parent-git.md). Làm ĐẦU TIÊN — nền tảng cho mọi bước sau.
- [x] **P02 🔴 [First-commit 13 repo Nhóm G2]:** ⚠️ 8/13 (5 dừng). theo [specs/SPEC-P02-first-commit-13-unborn.md](specs/SPEC-P02-first-commit-13-unborn.md).
- [x] **P03 🟠 [Xử lý 14 repo Nhóm G3]:** ✅ 5 commit Bậc 1 · 8 báo cáo Bậc 2 · 2 chẩn đoán Bậc 3. theo [specs/SPEC-P03-xu-ly-repo-ban.md](specs/SPEC-P03-xu-ly-repo-ban.md) (trừ `brain4agent` — sang P05).
- [x] **P04 🟠 [Não hóa phần còn thiếu]:** ✅ 31 repo (6 hoãn). theo [specs/SPEC-P04-nao-hoa-phan-con-lai.md](specs/SPEC-P04-nao-hoa-phan-con-lai.md) — chạy SAU P01–P03 để mọi repo đều có git soi diff.
- [x] **P05 🔴 [Ca đặc biệt]:** ✅ 2 repo cách ly không suy suyển. theo [specs/SPEC-P05-ca-dac-biet.md](specs/SPEC-P05-ca-dac-biet.md) — `brain4agent` mới (cách ly chờ user), `aiedu4vn` (⛔ không đụng), 3 repo tên đặc biệt.
- [x] **P06 🟢 [Nghiệm thu toàn kho]:** ✅ chạy lại script kiểm kê, bảng TRƯỚC/SAU ở mục 6. chạy lại script kiểm kê — mục tiêu: 0 `PARENT_GIT`, 0 `UNBORN`, não chuẩn ≥ 64/67 (trừ ca đặc biệt); bảng đối chiếu trước/sau.
- [x] **P07 🟢 [Sync Cascade + đóng kế hoạch]:** ✅ cập nhật `brain4agent/` hub, commit local, đóng plan ✅.

**Thứ tự bắt buộc: P01 → P02 → P03 → P04.** Lý do: não hóa (P04) cần git lành mạnh để soi diff và commit; sửa git trước thì mọi thao tác sau đều có đường lùi. Thực thi bằng subagent song song THEO NHÓM (như #05), mỗi subagent khoá phạm vi danh sách repo của nó.

## 🛡️ 4. Cổng Nghiệm Thu Toàn Chiến Dịch

1. **Git:** 67/67 repo có `rev-parse --show-toplevel` trùng chính nó; 0 repo unborn; mỗi repo ≥ 1 commit.
2. **Secret:** 0 file secret bị track ở BẤT KỲ commit mới nào — kiểm bằng `git show --name-only` grep pattern secret trên từng commit mới tạo (01-CONTRACTS §3).
3. **Não:** repo trong phạm vi P04 chạy `init_brain.js` lần 2 báo `NÃO ĐÃ OK`; shim/marker/state đủ như V1–V7 của #05.
4. **Không mất nội dung:** di trú nào cũng theo hợp đồng C1 của #05 (mv/gộp/archive có vết).
5. **KHÔNG PUSH** bất kỳ repo nào. `aiedu4vn` và `brain4agent` (mới) không bị chạm nếu user chưa quyết.
6. Bảng đối chiếu kiểm kê TRƯỚC/SAU in vào plan này khi đóng.

## ✅ 5. Ba Quyết Định Đã Chốt Mặc Định (hiệu lực khi user phát lệnh thực thi; user đổi được trước khi chạy)

User uỷ quyền tự quyết theo hướng an toàn nhất (tiền lệ #05). Chốt:

1. **`brain4agent` (không `.old`) → CÁCH LY TUYỆT ĐỐI** khỏi #06: không dọn, không commit hộ 38 file, không não hóa, không đổi `Plan/`. Nghi là hub thế hệ mới — mọi quyết định về nó chờ user riêng. Kiểm cuối chiến dịch: `git status` của nó TRƯỚC = SAU.
2. **15 repo Nhóm G3 (dirty) → BẬC THANG SPEC-P03:** bẩn ≤4 file và lành tính rõ ràng → commit as-is với message mô tả thật; nhiều/khó hiểu → chỉ báo cáo, không commit hộ; `ViDiaNorm`(294)/`control-gpm`(59) → chỉ chẩn đoán.
3. **32 repo trắng → NÃO HÓA HẾT theo một tiêu chuẩn v1.2.0** (đúng đề bài "đồng bộ theo 1 tiêu chuẩn"; engine idempotent). Repo nào lộ dấu hiệu đặc thù lúc thực thi (governance riêng, file lạ) thì rơi về quy tắc "DỪNG repo đó, báo cáo".

## 📌 Ghi Chú Phạm Vi

- Kế hoạch này KẾ THỪA và ĐÓNG các mục treo của #04 (4 repo dirty, 2 unborn, 4 không git) và #05 (CausalAgent GĐ2) — tất cả đã nằm trong nhóm G1/G2/G3 tương ứng.
- Backup bắt buộc trước mọi thao tác trên repo chưa có commit hoặc chưa có git (mô hình #04/#05).
- Script kiểm kê tái chạy được để nghiệm thu P06 (lưu tại scratchpad khi thực thi).

---

## 📊 6. KẾT QUẢ NGHIỆM THU TOÀN KHO (P06) — TRƯỚC vs SAU

Đo bằng cùng một script kiểm kê read-only (`scratchpad/p06/inventory.ps1`), chạy đầu và cuối phiên.

| Trục | Trạng thái | TRƯỚC | SAU | Kết luận |
| :--- | :--- | ---: | ---: | :--- |
| **GIT** | `PARENT_GIT` (không có `.git` riêng) | **9** | **0** | ✅ **ĐẠT mục tiêu** |
| | `UNBORN` (chưa có commit nào) | 13 | **5** | ⚠️ còn 5, lý do ghi rõ |
| | `DIRTY` | 16 | 10 | 5 do #06 dọn; số còn lại là việc đang dở của user |
| | `CLEAN` | 29 | **52** | |
| **NÃO** | `FULL` (A + C + marker + `brain4agent/` + hot) | 21 | **52** | ⚠️ mục tiêu ≥64 — **chưa đạt** |
| | `PARTIAL` | 14 | 5 | |
| | `NONE` | 32 | 10 | |
| | **TỔNG** | 67 | 67 | |

### Tổng commit do chiến dịch #06 tạo ra: **46 commit local, 0 push**

`9` baseline P01 · `2` vá Bước 0 · `8` baseline P02 · `5` Bậc 1 P03 · `3` lô 4a · `5` lô 4b · `22` lô 4c · `1` lô 4e (`teamworkflow`) + `1` commit đồng bộ hub.

### 15 repo CHƯA đạt chuẩn — không repo nào bị bỏ qua trong im lặng

| Repo | Vướng | Cần user quyết gì |
| :--- | :--- | :--- |
| `AI-input` | UNBORN — thư mục con `AI-input/` là **repo git riêng** | gỡ 1 tầng, hay biến nó thành submodule thật, hay để vỏ ngoài không phải repo git? |
| `bi-kip-luyen-agent` | UNBORN — repo git lồng cùng tên | như trên |
| `congquyengop.vn` | UNBORN — repo git lồng cùng tên (1.4 GB) | như trên |
| `manage-fitc84` | UNBORN — có 18 file thật + **2 repo lồng** (`9router/`, `Quản lý công ty FITC84/`) | xử 2 thư mục lồng rồi commit 18 file kia |
| `auto-hot-key` | UNBORN — commit đầu sẽ nuốt **1066 file / 490 MB** build artifacts (`bin/`, `obj/`, `.exe` 146 MB) | thêm `bin/`+`obj/` vào `.gitignore` rồi commit? |
| `brain4agent` (mới) | cách ly theo quyết định 5.1 | 3 câu hỏi ở SPEC-P05 mục 1 |
| `control-gpm` | 59 file bẩn GIAO với `brain4agent/` | commit đợt refactor `module-tools` trước |
| `GramPilot` | 15 file bẩn GIAO với `AGENTS.md` + `brain4agent/` | commit trước, rồi chạy engine |
| `CV` | 4 mục bẩn, GIAO với `AGENTS.md`; có `D agent.md` | `AGENTS.md` mới có thay thế `agent.md` không? |
| `ViDiaNorm` | 294 mục bẩn + `Plan/` VIẾT HOA | gitignore `reports/`+`data/`, commit 51 file dev, rồi mới não hóa |
| `convert-json-to-9router-from-keycrop` | 9 mục — một phiên governance đang dở | tự đóng bằng message đúng ngữ cảnh |
| `FITC84-WorkOs-` | 7 mục, trong đó **4 repo lồng** | xử 4 repo lồng trước |
| `openclaw-pro-studio` | thay đổi **con trỏ submodule** + 3 repo lồng | tự commit |
| `Token-Calcultor` | đang giữa thao tác **gỡ submodule dở dang** | hoàn tất trước |
| `control-LDplayer` | `Plan/` + `DOCS/` VIẾT HOA có **≥8 tham chiếu path cứng đang sống** trong `.agent/domains/` | đổi tên + sửa hết tham chiếu, hay giữ nguyên và bỏ chuẩn hoá tên? |

### Bằng chứng an toàn

- **Secret:** 0 file secret trong **bất kỳ** commit nào của #06. Kiểm 3 lớp độc lập: (1) `git check-ignore` từng file secret trước `add`; (2) `git show --name-only HEAD` sau commit; (3) audit lại toàn bộ bằng `git ls-files` với regex viết tại chỗ. Riêng 5 commit Bậc 1 quét thêm **nội dung** (`api_key|bearer|token|sk-|ghp_|jina_|AIza`) → 0 khớp.
- **Secret ĐÃ tracked từ TRƯỚC (§3.5 — chỉ báo cáo, KHÔNG untrack hộ):** **4 repo có secret đã tracked từ trước #06.** Danh sách repo, đường dẫn và loại khoá đã được gỡ khỏi kho công khai và giữ ở hồ sơ chỉ-lưu-máy ngoài git. **Khuyến nghị: xoay (revoke) các khoá này — sửa code là chưa đủ vì chúng đã nằm trong lịch sử git.**
- **`git push`:** KHÔNG chạy lần nào, ở bất kỳ repo nào.
- **Gitlink:** 0 gitlink `160000` mới do #06 tạo. (`Bugbounty-Hunter` có 1 gitlink `.claude/worktrees/...` nhưng có từ commit `8f065e5` của user.)

### 3 gotcha mới rút ra (đã ghi vào `brain4agent/-known-gotchas.md` của hub)

6. PowerShell không phân biệt hoa/thường tên biến — `$sec` ghi đè `$SEC` làm **chết cổng kiểm secret trong im lặng**.
7. Audit hàng loạt đếm "file bẩn" **che mất repo git lồng nhau** — `git status` gộp cả một repo con thành 1 dòng.
8. Kho nhiều repo — **phiên agent khác chạy song song** làm trạng thái đổi giữa chừng; phải kiểm dấu thời gian commit trước khi commit hộ.

