# KẾ HOẠCH NÂNG CẤP: ĐỒNG BỘ CẤU TRÚC 67 REPO — GIT ĐÚNG CHỖ + NÃO CHUẨN v1.2.0 (#06)

- **STT KẾ HOẠCH:** #06
- **TRẠNG THÁI:** 📝 DRAFT — CHỜ USER DUYỆT (khảo sát 67/67 đã xong, chưa sửa repo nào)
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31 (lập kế hoạch)
- **THỜI GIAN HOÀN TẤT:** (chưa)
- **PHIÊN BẢN MỤC TIÊU:** repo hub không đổi engine (trừ khi lộ bug mới → PATCH); repo đích nhận khung não template v1.2.0

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
- [ ] **P00b 🔴 [USER APPROVAL GATE]:** duyệt kế hoạch + trả lời 3 câu hỏi mở (mục 5). KHÔNG thực thi trước khi duyệt.
- [ ] **P01 🔴 [Git-init 9 repo Nhóm G1]:** theo [specs/SPEC-P01-git-init-9-parent-git.md](specs/SPEC-P01-git-init-9-parent-git.md). Làm ĐẦU TIÊN — nền tảng cho mọi bước sau.
- [ ] **P02 🔴 [First-commit 13 repo Nhóm G2]:** theo [specs/SPEC-P02-first-commit-13-unborn.md](specs/SPEC-P02-first-commit-13-unborn.md).
- [ ] **P03 🟠 [Xử lý 14 repo Nhóm G3]:** theo [specs/SPEC-P03-xu-ly-repo-ban.md](specs/SPEC-P03-xu-ly-repo-ban.md) (trừ `brain4agent` — sang P05).
- [ ] **P04 🟠 [Não hóa phần còn thiếu]:** theo [specs/SPEC-P04-nao-hoa-phan-con-lai.md](specs/SPEC-P04-nao-hoa-phan-con-lai.md) — chạy SAU P01–P03 để mọi repo đều có git soi diff.
- [ ] **P05 🔴 [Ca đặc biệt]:** theo [specs/SPEC-P05-ca-dac-biet.md](specs/SPEC-P05-ca-dac-biet.md) — `brain4agent` mới (cách ly chờ user), `aiedu4vn` (⛔ không đụng), 3 repo tên đặc biệt.
- [ ] **P06 🟢 [Nghiệm thu toàn kho]:** chạy lại script kiểm kê — mục tiêu: 0 `PARENT_GIT`, 0 `UNBORN`, não chuẩn ≥ 64/67 (trừ ca đặc biệt); bảng đối chiếu trước/sau.
- [ ] **P07 🟢 [Sync Cascade + đóng kế hoạch]:** cập nhật `brain4agent/` hub, commit local, đóng plan ✅.

**Thứ tự bắt buộc: P01 → P02 → P03 → P04.** Lý do: não hóa (P04) cần git lành mạnh để soi diff và commit; sửa git trước thì mọi thao tác sau đều có đường lùi. Thực thi bằng subagent song song THEO NHÓM (như #05), mỗi subagent khoá phạm vi danh sách repo của nó.

## 🛡️ 4. Cổng Nghiệm Thu Toàn Chiến Dịch

1. **Git:** 67/67 repo có `rev-parse --show-toplevel` trùng chính nó; 0 repo unborn; mỗi repo ≥ 1 commit.
2. **Secret:** 0 file secret bị track ở BẤT KỲ commit mới nào — kiểm bằng `git show --name-only` grep pattern secret trên từng commit mới tạo (01-CONTRACTS §3).
3. **Não:** repo trong phạm vi P04 chạy `init_brain.js` lần 2 báo `NÃO ĐÃ OK`; shim/marker/state đủ như V1–V7 của #05.
4. **Không mất nội dung:** di trú nào cũng theo hợp đồng C1 của #05 (mv/gộp/archive có vết).
5. **KHÔNG PUSH** bất kỳ repo nào. `aiedu4vn` và `brain4agent` (mới) không bị chạm nếu user chưa quyết.
6. Bảng đối chiếu kiểm kê TRƯỚC/SAU in vào plan này khi đóng.

## ❓ 5. Câu Hỏi Mở Chờ User Quyết

1. **`brain4agent` (không `.old`):** đây là dự án Python đang phát triển dở (38 file modified, commit gần nhất "test: add safe local model smoke automation", có đủ AGENTS/CLAUDE/GEMINI + `Plan/` hoa + `.env`). Nghi là **hub thế hệ mới** kế nhiệm `brain4agent.old`. Đề xuất: CÁCH LY hoàn toàn khỏi #06 (không dọn, không não hóa lại, không đổi `Plan/`) — chờ anh xác nhận quan hệ giữa 2 hub. Đúng không?
2. **15 repo Nhóm G3 (dirty):** agent được phép xử lý theo bậc thang của SPEC-P03 (soi diff → repo bẩn ≤4 file mà thay đổi rõ ràng lành tính thì commit as-is bằng message mô tả thật; repo bẩn nhiều/khó hiểu thì chỉ báo cáo) — hay TẤT CẢ để anh tự dọn?
3. **Não hóa đại trà 32 repo "chưa có gì"** (gồm cả tool nhỏ như `Create-Restore-point`, `docker`, `CV`): làm HẾT theo một tiêu chuẩn (đề xuất — đúng yêu cầu "đồng bộ theo 1 tiêu chuẩn", engine idempotent nên rẻ), hay anh khoanh danh sách loại trừ?

## 📌 Ghi Chú Phạm Vi

- Kế hoạch này KẾ THỪA và ĐÓNG các mục treo của #04 (4 repo dirty, 2 unborn, 4 không git) và #05 (CausalAgent GĐ2) — tất cả đã nằm trong nhóm G1/G2/G3 tương ứng.
- Backup bắt buộc trước mọi thao tác trên repo chưa có commit hoặc chưa có git (mô hình #04/#05).
- Script kiểm kê tái chạy được để nghiệm thu P06 (lưu tại scratchpad khi thực thi).
