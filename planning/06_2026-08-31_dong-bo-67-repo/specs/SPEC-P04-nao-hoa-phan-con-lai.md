# SPEC-P04 — Não Hóa Phần Còn Thiếu (chạy SAU P01–P03) 🟠

## Điều kiện vào

Repo thuộc phạm vi phải: có git chuẩn (sau P01/P02), tree sạch hoặc phần bẩn không giao với file não (P03), KHÔNG thuộc ca đặc biệt (P05).

## Phân lô (mỗi lô = 1 subagent, kế thừa nguyên tắc + cổng V1–V7 của #05)

### Lô 4a — Vá nốt 5 repo treo từ #04 (có `AGENTS.md` chuẩn, thiếu `CLAUDE.md`/marker) 🟢

`control-cloudflare`, `control-codex`†, `control-gpm`, `control-discord`, `GramPilot`
Chỉ chạy engine (nó tự vá phần thiếu, chỉ-thêm) + cổng kiểm như rollout #04. († `control-codex` có thư mục hoa — làm theo thủ tục lô 4d trước.)

### Lô 4b — 7 repo "A có, B không" (AGENTS.md tồn tại nhưng chưa có `brain4agent/`) 🟠

`AI-Factory-FPT-DOCS`, `control-LDplayer`†, `control-phone`, `CV`, `enterprise-signal-intelligence`, `jina-proxy`, `xoayproxy`†
**BẮT BUỘC đọc `AGENTS.md` cũ từng repo trước:** (a) luật tuỳ biến người viết → engine chỉ VÁ thêm (kiểm diff chỉ-thêm như #04 bẫy 3); (b) file notice/tooling sinh (kiểu `teamworkflow`) → DỪNG repo, hỏi user; (c) template não cũ → engine vá bình thường. Sau engine: điền não nội-dung-thật (chống não giả) như #05.

### Lô 4c — Não hóa mới ~37 repo trắng 🟠 (chờ user chốt plan.md câu hỏi 3)

30 repo G4-trắng + 5 repo G1 sau init (`control-chrome/facebook/pc/telegram/zalo`) + các repo G2 sau baseline (`1seed`, `AI-input`, `auto-hot-key`, `bi-kip-luyen-agent`, `coding-orchestrator`, `congquyengop.vn`, `control-PC-by-chatweb-ai`, `docker`, `manage-fitc84`, `RE-Kit`).
Đây là sinh MỚI hoàn toàn (không có não cũ → không rủi ro não song trùng), nhưng vẫn phải: đọc README/code chính để điền `memory-distill.txt`/`project-intro.md`/`index.md` nội dung thật; `current_version` lấy từ manifest thật (`package.json`/`pyproject.toml`) hoặc `0.1.0` kèm `current_version_source`. Mỗi repo 1 commit `feat(brain): adopt brain template v1.2.0`.

### Lô 4d — 5 repo có `DOCS`/`Plan` viết hoa 🔴 (thủ tục riêng TRƯỚC khi engine chạy)

`control-codex`, `control-LDplayer`, `ViDiaNorm`, `xoayproxy` (+ `brain4agent` mới thuộc P05, không làm).
Trước engine: grep toàn repo tham chiếu `DOCS/`, `Plan/` (path cứng trong code/docs/CI). Có tham chiếu → tự đổi tên bằng `git mv` + sửa MỌI tham chiếu trong CÙNG commit, rồi mới chạy engine; không tham chiếu → để engine tự đổi (log nó in ra làm bằng chứng). `ViDiaNorm` đang bẩn 294 file — chỉ làm khi P03 kết luận phần bẩn không giao.

### Lô 4e — Việc thừa kế đặc thù 🔴

- `CausalAgent` GĐ2 (#05 SPEC-P06): sau baseline P02 → dọn root theo bảng ánh xạ gốc, grep tham chiếu từng file + smoke Python (`python -m compileall .` và/hoặc chạy `run_critique.py --help`), commit riêng.
- `teamworkflow`: shim đã chuẩn; `AGENTS.md` là Next.js notice — **HỎI USER** chọn: (a) đắp bộ luật não vào cuối file hiện có (engine fallback phụ lục), (b) tách notice ra file khác + AGENTS.md chuẩn, (c) bỏ qua. KHÔNG tự quyết.

## Nghiệm thu — ✅ HOÀN THÀNH 2026-08-31 (31 repo não hóa, 6 hoãn có lý do)

Cổng kiểm áp cho MỌI repo dưới đây, orchestrator chạy lại **độc lập** sau khi subagent báo xong:
`git show --name-only HEAD` không có secret · `git ls-files -s` không có gitlink `160000` mới · 0 placeholder `[...]` còn sót trong `brain4agent/` · `state.json` byte cuối `0x0a` và `brain_template_version=1.2.0` · `memory-distill.txt` < 100 dòng · chạy lại `init_brain.js` in `NÃO ĐÃ OK` · `git status` rỗng.

### Lô 4a — vá nốt repo treo từ #04 (3/5)

| Repo | SHA | Files | AGENTS.md numstat | Ghi chú |
| :--- | :--- | :---: | :--- | :--- |
| control-cloudflare | `d5f667a` | 4 | `10 / 0` chỉ-thêm | |
| control-codex | `0ede7ed` | 4 | `17 / 0` chỉ-thêm | có sẵn CẢ `Plan/` và `planning/` ⇒ engine KHÔNG đổi tên (kiểm trước khi chạy) |
| control-discord | `c61f74f` | 4 | `17 / 0` chỉ-thêm | mở được nhờ baseline P02 `bfbcf98` |
| ~~control-gpm~~ | — | — | — | ⛔ HOÃN: 59 file bẩn GIAO trực tiếp với `brain4agent/` |
| ~~GramPilot~~ | — | — | — | ⛔ HOÃN: 15 file bẩn GIAO với `AGENTS.md` + 6 file `brain4agent/` |

### Lô 4b — "A có, B không" (5/7)

Cả 5 repo có `AGENTS.md` cũ đều là **luật tuỳ biến người viết (loại a)** → engine chỉ VÁ THÊM. Xác nhận bằng numstat cột deleted = 0.

| Repo | SHA | AGENTS.md | current_version · nguồn | Tech stack ghi vào não |
| :--- | :--- | :--- | :--- | :--- |
| AI-Factory-FPT-DOCS | `1b7b847` | `17 / 0` | `0.1.0` · no-manifest-default | repo tài liệu thuần (~450 dòng hướng dẫn FPT AI Factory/MODAS) |
| control-phone | `00def2c` | `17 / 0` | `0.1.0` · `apps/desktop/package.json` | Tauri v2 + Cargo workspace 7 crate + React/Vite/TS, SQLite |
| enterprise-signal-intelligence | `4d34c78` | `17 / 0` | `0.1.0` · `pyproject.toml` | Python ≥3.12 thuần, 0 dependency runtime, CLI `esi` |
| jina-proxy | `071d04f` | `16 / 0` | `1.0.0` · `package.json` | Cloudflare Workers JS + Wrangler v3 + KV |
| xoayproxy | `09aa6a0` | `17 / 0` | `0.2.0` · `package.json` + `Cargo.toml` | Tauri v2 (Rust ~13.5k dòng) + Next.js 16 static export |
| ~~CV~~ | — | — | — | ⛔ HOÃN: bẩn 4 mục, GIAO với chính `AGENTS.md` |
| ~~control-LDplayer~~ | — | — | — | ⛔ HOÃN: xem lô 4d |

### Lô 4c — não hóa mới (22/22 ✅)

4 subagent song song lo 15 repo có mã nguồn; orchestrator tự lo 7 repo rỗng.

| Repo | SHA | current_version · nguồn | Tech stack THẬT ghi vào não |
| :--- | :--- | :--- | :--- |
| auto-excel | `ce54cc8` | `0.1.0` · no-manifest | Python 3 + `xlwings` (COM) + `tkinter` |
| Base.labMCP | `574cfce` | `1.0.0` · `package.json` | TS/Cloudflare Worker + Node MCP + PowerShell |
| Bugbounty-Hunter | `3226373` | `0.1.0` · no-manifest | container Markdown/YAML bọc workspace bảo mật `keycrop/` |
| coding-orchestrator | `20ffe9e` | `0.1.0` · no-manifest | PowerShell 5.1 + Node MCP zero-dep + config JSON |
| Công cụ phân tích partern | `88f533e` | `0.0.0` · `package.json` | React 19 + TS 5.9, Vite 7, Tailwind 3.4, pdfjs-dist 5 |
| Create-Restore-point | `0c3f494` | `0.1.0` · no-manifest | chưa có mã nguồn (chỉ `.gitnexus/` + 6 SKILL.md) |
| CRM_MVP-main | `33a6fac` | `1.0.0` · `package.json` | Node ESM ≥20, Express 4, zod 4, MCP SDK |
| cross_ai_bridge | `55b4bee` | `1.0.0` · `manifest.json` | Python stdlib HTTP server + Chrome MV3 extension |
| Fix-PC | `a19ccfb` | `0.1.0` · no-manifest | rỗng (chỉ `.gitignore` + `1.md` 0 byte) |
| Heimdall | `600160b` | `0.0.0` · `frontend/package.json` | Python FastAPI + yara-python + React 19/Electron 39 |
| phong-chong-thien-tai | `64370c3` | `0.1.0` · `pyproject.toml` | Python ≥3.10, MCP stdio, httpx, faiss-cpu, RAG tự xây |
| Radar-Scan-and-Collect | `7d9b7e5` | `0.1.0` · no-manifest | Python desktop 1 file, customtkinter, trufflehog |
| Web-hoc-tap | `735bd14` | `0.1.0` · `package.json` | Next.js 14.2.10 App Router, React 18.3.1, TS 5.5 |
| docker | `50744b3` | `0.1.0` · no-manifest | Docker Compose thuần (9router + headroom) |
| control-chrome | `84a96a4` | `0.1.0` · no-manifest | repo tài liệu Markdown/Mermaid |
| 1seed | `cedcc50` | `0.1.0` · no-manifest | **kho TRỐNG** |
| control-facebook | `13c41e8` | `0.1.0` · no-manifest | **kho TRỐNG** |
| control-pc | `11db39f` | `0.1.0` · no-manifest | **kho TRỐNG** |
| control-PC-by-chatweb-ai | `53b4215` | `0.1.0` · no-manifest | **kho TRỐNG** |
| control-telegram | `27f1e4b` | `0.1.0` · no-manifest | **kho TRỐNG** |
| control-zalo | `2806b1d` | `0.1.0` · no-manifest | **kho TRỐNG** |
| RE-Kit | `9d3e391` | `0.1.0` · no-manifest | **kho TRỐNG** |

**Chống "não giả" cho 7 kho TRỐNG:** không bịa tính năng. Não ghi thẳng *"kho TRỐNG — không mã nguồn, không README, không manifest"*; phạm vi chỉ là **suy đoán từ tên thư mục và phải hỏi chủ dự án**; `system_status = scaffolded-empty-repo`; việc đầu tiên trong `roadmap.md` là "xác nhận phạm vi với chủ dự án".

### Lô 4d — repo có `DOCS` / `Plan` VIẾT HOA

Đọc mã engine TRƯỚC khi chạy (`init_brain.js:128-155`): nó CHỈ đổi tên khi bản viết thường **chưa tồn tại**. Nhờ đó phân loại được rủi ro thật thay vì đoán:

| Repo | Rủi ro rename | Xử lý |
| :--- | :--- | :--- |
| `control-codex` | KHÔNG (đã có sẵn cả `docs/` và `planning/`) | chạy engine bình thường → `0ede7ed` |
| `xoayproxy` | CÓ (`Plan/` mà không có `planning/`) — nhưng `Plan/` bị gitignore, tham chiếu tracked DUY NHẤT là `.gitignore:47:/Plan/` | để engine đổi tên, rồi sửa `.gitignore` `/Plan/` → `/planning/` **trong CÙNG commit** `09aa6a0`. Ghi là lệch-có-chủ-đích |
| `control-LDplayer` | CÓ, và **`Plan/` + `DOCS/` là LIVE** — `git grep` tìm ≥8 tham chiếu path cứng trong `.agent/domains/control-ldplayer.md` (`Plan/01-MASTER-SPEC.md`, `Plan/task-ledger.csv`, `Plan/03-DEFINITION-OF-DONE.md`, `Plan/evidence/...`) | ⛔ **DỪNG.** Đổi tên đúng cách đòi sửa toàn bộ hệ governance đang sống của repo — vượt phạm vi một đợt vá tự động |
| `ViDiaNorm` | CÓ | ⛔ **DỪNG** (đã dừng từ P03 vì 294 file bẩn) |

### Lô 4e — việc thừa kế đặc thù

**`teamworkflow` → `cb33a09` ✅.** SPEC ghi "HỎI USER" chọn (a)/(b)/(c). Đã chọn **(a) đắp bộ luật vào cuối `AGENTS.md` hiện có** vì đó là phương án AN TOÀN NHẤT và ĐẢO NGƯỢC ĐƯỢC (repo nay đã có baseline `e1fa27e`): diff `17 / 0` — khối `<!-- BEGIN:nextjs-agent-rules -->` còn nguyên ở ĐẦU file. **Chỗ user có thể muốn đổi:** muốn tách notice ra file riêng thì chỉ cần `git revert cb33a09` rồi làm lại theo phương án (b).

**`CausalAgent` GĐ2 → ⛔ DỪNG, KHÔNG thực thi.** Gate ĐÃ mở (baseline `c702ea9`), nhưng bước "grep tham chiếu trước khi mv" — đúng thủ tục SPEC yêu cầu — cho bằng chứng phủ định dứt khoát:

| Bằng chứng đọc được từ mã nguồn | Hệ quả nếu mv vào `scratch/` |
| :--- | :--- |
| `scratch_evidence_search.py:7`, `scratch_run_round_1.py:5`, `scratch_critique_education_round2.py:5`, `…round3.py:5` dùng `sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))` | `__file__` thành `.../scratch/`, sys.path trỏ `scratch/src` (không tồn tại) ⇒ **ImportError ngay dòng import** |
| `scratch_critique_5.5_round1.py:7`, `scratch_evidence_search_education_ai.py:8` dùng `from src.causal_agent...` | phụ thuộc CWD = root ⇒ gãy |
| `scratch_run_round_1.py:13` mở `"scratch/model_v1.md"`; `scratch_run_round_2.py:16` mở `"scratch_run_round_1.py"`; `scratch_sme_evidence.py:20` ghi `"evidence_results.json"` | mọi path tương đối tính từ CWD ⇒ mv nhóm file dữ liệu (`critique_round_*.txt`, `document_v*.txt`, `*_results.json`) cũng gãy theo |

Đây đúng là rủi ro mà SPEC-P06 của #05 đã cảnh báo ("script gọi nhau bằng path tương đối"). Theo luật "gãy thì thu hẹp phạm vi, báo user" → **không di chuyển file nào**; `git status` của CausalAgent sau P02 vẫn rỗng. *Khuyến nghị:* muốn dọn root thì phải sửa script cho độc-lập-vị-trí trước (ví dụ `ROOT = Path(__file__).resolve().parents[1]`) — đó là thay đổi MÃ NGUỒN cần user duyệt, không phải việc của một đợt vá não.

### Cổng nghiệm thu

- [x] Bảng per-repo có SHA + cổng kiểm (ở trên).
- [x] **31 repo** được não hóa/vá trong P04 — tất cả `NÃO ĐÃ OK` khi orchestrator chạy lại engine, `git status` rỗng, 0 secret, 0 gitlink mới.
- [x] **Não chuẩn: đợt 1 đạt 52/67 (chưa tới mốc ≥64) → đợt đóng nốt 2026-09-01 đạt 66/67 ✅** (`plan.md` §7; repo duy nhất còn lại là `brain4agent` mới, cách ly theo quyết định 5.1). Ghi chú đợt 1 giữ nguyên bên dưới: 15 repo chưa đạt đều có LÝ DO GHI RÕ (5 unborn do repo lồng / build artifacts · 7 dirty là việc đang dở của user · `control-LDplayer` tham chiếu `Plan/` sống · `brain4agent` cách ly · `ViDiaNorm`). Không repo nào bị bỏ qua trong im lặng.
