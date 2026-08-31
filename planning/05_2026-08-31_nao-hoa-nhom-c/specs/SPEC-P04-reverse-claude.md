# SPEC-P04 — reverse Claude (Lớp B+: não rỗng, governance riêng đang sống) 🟠

- **Hiện trạng (2026-08-31):** git sạch, `main`. `brain4agent/` chỉ có `memory-distill.txt` (4435 bytes — có nội dung thật). Nhưng dự án có **hệ governance riêng ĐANG SỐNG và rất sâu**:
  - `planning/` riêng: `MASTER_PLAN.md`, `spec-registry.json`, `assignments/`, `specs/`, `tasks/` — đang chạy tới SPEC-115+, có approval gate, manifest SHA pinned.
  - `agent.md` ở root = **Project Snapshot** (trạng thái phase hiện hành) — KHÔNG phải file luật; được quy trình riêng cập nhật.
  - 9 skill riêng trong `.agents/skills/`: `.cleanup`, `.commit`, `.compact`, `.cross-ai-collaboration`, `.dynamic-re-workflow`, `.planning-governance`, `.planning-init`, `.proxy-instrumentation`, `.push` — đúng Single Skill Vault, GIỮ NGUYÊN.
  - Root rác: `task.md`, `memory-distill.md` (292 bytes — bản mồ côi, não chính là bản .txt 4435 bytes), 2 file `transcript_*.jsonl`, nhiều script rời (`dump_files.js`, `examine_bash.js`...), `.githooks/`.
- **Tinh thần:** đây là dự án đối tác lớn nhất về governance riêng — não hóa phải là LỚP BỔ SUNG trỏ vào hệ đang chạy, không được cạnh tranh với nó.

## Bảng ánh xạ di trú

| Mục cũ | Đích | Loại |
| :--- | :--- | :--- |
| `brain4agent/memory-distill.txt` | GIỮ — đối chiếu và cập nhật trạng thái theo `agent.md` hiện hành | sửa nội dung |
| `memory-distill.md` (root, 292B) | ĐỌC: nếu nội dung đã có trong bản .txt → xóa (ghi vết trong commit message); nếu có ý mới → gộp vào bản .txt rồi xóa | gộp |
| `task.md` (root) | ĐỌC: nội dung task đang sống → `brain4agent/memory/hot/today.md` (sau khi engine sinh); task đã xong → `roadmap.md` mục Done | gộp |
| `transcript_*.jsonl` (2 file, root) | `raw/` (repo đã có thư mục này cho dữ liệu thô) — hỏi user nếu `raw/` có quy ước riêng | mv |
| `agent.md` | **GIỮ NGUYÊN TÊN VÀ VỊ TRÍ** — hệ riêng tham chiếu nó; AGENTS.md mới sẽ trỏ tới như "snapshot hiện hành" | không đụng |
| `planning/` riêng | GIỮ NGUYÊN 100% — não `index.md` router trỏ vào `planning/MASTER_PLAN.md` + `spec-registry.json` | không đụng |
| Script rời root (`dump_files.js`...) | KHÔNG di trú đợt này (có thể được SPEC nội bộ của dự án tham chiếu theo path) — ghi vào `-known-gotchas.md` của não mới là "root chưa clean, cần đợt riêng có kiểm tra tham chiếu" | ghi nhận |

## Phụ lục luật riêng trong AGENTS.md (hợp đồng C3)

AGENTS.md sinh mới phải THÊM mục cuối "PHỤ LỤC LUẬT RIÊNG DỰ ÁN" với các chuỗi định danh (V6 grep):

- `spec-registry.json` — mọi thay đổi phạm vi phải qua registry + approval gate của `planning/`.
- `agent.md` — snapshot trạng thái phase, đọc ĐẦU TIÊN cùng memory-distill.
- `.githooks/` — hook riêng của dự án, không bypass.

## Các bước

1. Pre-flight + backup (`brain4agent/` + `agent.md` + `task.md` + `memory-distill.md`).
2. Di trú theo bảng (các ô ĐỌC → ghi quyết định thật vào đây).
3. Chạy engine (sinh 6 phân vùng còn thiếu + AGENTS/CLAUDE/marker/hot).
4. Hoàn thiện ngữ nghĩa: `project-intro.md`, `index.md` router (trỏ planning riêng, `docs/CODEBASE_ATLAS.md`, 9 skill), `-known-gotchas.md` (ghi chú root chưa clean); vá Phụ lục luật riêng vào AGENTS.md.
5. `state.json`: `current_version` khởi tạo `0.1.0` (dự án nghiên cứu chưa có version chính thức; ghi chú nguồn).
6. Verify V1–V7 (V6: grep 3 chuỗi trên); commit `feat(brain): adopt brain template v1.2.0 as a layer over the existing spec-registry governance`.

## Rủi ro riêng

- **RỦI RO CAO NHẤT: đứt tham chiếu.** Trước khi mv `transcript_*.jsonl` hay xóa `memory-distill.md`/`task.md`, PHẢI `grep -r "<tên file>"` toàn repo (trừ node_modules, raw) — có tham chiếu thì KHÔNG di chuyển, giữ nguyên và ghi chú.
- `agent.md` tên gần giống `AGENTS.md` — cấm nhầm lẫn ghi đè; hai file khác vai trò hoàn toàn.

## Nghiệm thu — ✅ ĐÃ HOÀN THÀNH (2026-08-31)

### Pre-flight

- `git rev-parse --show-toplevel` = `D:/Data/Repositories/.My-Repositories/reverse Claude` ✅ · branch `main` · `git status --porcelain` RỖNG ✅
- Không có thư mục `DOCS`/`Plan` viết hoa (`docs/`, `planning/` đã đúng chuẩn) ✅
- Backup: `scratchpad\backup-plan05-reverse-claude\` chứa `brain4agent\memory-distill.txt` (4435 B), `agent.md` (4551 B), `task.md` (1940 B), `memory-distill.md` (292 B) ✅

### [x] Kết quả grep tham chiếu trước di trú (loại trừ `node_modules`, `raw`, `scratch`, `.git`)

| File | Tham chiếu tìm được | Quyết định |
| :--- | :--- | :--- |
| `task.md` | `.agents/AGENTS.md:121,164`; `scripts/render-planning-roadmap.js` (TASK_PATH); `scripts/verify-planning-governance.js` (TASK_PATH); `.agents/skills/.planning-init/scripts/init.js:52-54` + templates; `Update-project/UPGRADE_GOVERNANCE.md` | **CÓ tham chiếu → GIỮ NGUYÊN.** Là dashboard SINH TỰ ĐỘNG từ `spec-registry.json`, không phải file nháp. |
| `memory-distill.md` (292 B) | `.agents/AGENTS.md:66,173`; `scripts/verify-documentation-integrity.js:11` (`DOCS_TO_CHECK` — thiếu file là FAIL gate); `planning/spec-registry.json:1732,2324` (coordinatorWriteSet SPEC-122); `planning/assignments/SPEC-96.json`, `SPEC-122.json` | **CÓ tham chiếu → GIỮ NGUYÊN, KHÔNG gộp, KHÔNG xoá.** |
| `transcript_9b28848e-….jsonl` | 0 hit | KHÔNG tham chiếu → `git mv` |
| `transcript_b32eac3c-….jsonl` | 0 hit | KHÔNG tham chiếu → `git mv` |

**Lệch SPEC có chủ đích (báo cáo):** đích của 2 transcript là **`scratch/` chứ không phải `raw/`**. Lý do: `raw/` là input read-only ghim manifest (`raw/anthropic.claude-code-2.1.207-win32-x64.zip`, SHA-256 `87fe1ac4…`) và `scripts/verify-worktree-hygiene.js:34` báo **"Tracked Raw Capture Risk"** cho *mọi* path đã thay đổi có chứa chuỗi `raw`. `docs/CODEBASE_ATLAS.md` quy định `scratch/` là nơi chứa script/log vứt đi và "never put scratch files at repository root" → `scratch/` là đích đúng theo quy ước sẵn có của dự án.

### [x] Bảng ánh xạ đã thực hiện

| Mục cũ | Đã làm | Ghi chú |
| :--- | :--- | :--- |
| `brain4agent/memory-distill.txt` | Viết lại theo khuôn `<kernel_instructions>` (89 dòng), thêm Bước 0 `.xay-dung-nao-bo`, trỏ trạng thái phase về `agent.md` | Giữ NGUYÊN 100% quyết định bền vững + gotcha bản cũ; giữ chuỗi `mini-claude-v2` (bắt buộc bởi `verify-documentation-integrity.js` architecture marker); dùng backtick thay markdown link để không sinh broken link |
| `memory-distill.md` (root) | **KHÔNG đụng** | Có tham chiếu code + gate (xem bảng grep) |
| `task.md` (root) | **KHÔNG đụng** | Projection sinh tự động; nội dung là dashboard SPEC-114→122, đã phản ánh vào `brain4agent/roadmap.md` dưới dạng tóm tắt trỏ về registry |
| `transcript_*.jsonl` ×2 | `git mv` → `scratch/` | rename 100%, git history giữ vết |
| `agent.md` | **KHÔNG đụng** (`git diff` rỗng) | AGENTS.md §6.2 trỏ tới như "snapshot đọc ĐẦU TIÊN" |
| `planning/`, `Update-project/`, `.agents/` (gồm `.agents/AGENTS.md` + 9 skill) | **KHÔNG đụng** | `index.md` router + AGENTS.md §6 trỏ vào |
| Script rời root (`dump_files.js`, `examine_bash.js`, `run_proxy.ts`, `search_sandbox.js`) | KHÔNG di trú | Ghi vào `-known-gotchas.md` §4 + `roadmap.md` Idea Vault |

### [x] V1–V8, bằng chứng thật

- **V1 (idempotent):** chạy `init_brain.js` lần 2 → `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` + đủ 8 dòng ✅, `EXITCODE=0`.
- **V2 (dual entry):** `CLAUDE.md` = **8 dòng**, `has @AGENTS.md: True`, `backticked import: False` ✅.
- **V3 (marker):** đúng **1** file `brain4agent-v1.2.0.md` (689 B) ✅.
- **V4 (state):** `[System.IO.File]::ReadAllBytes($p)[-1]` = **10** (kiểm cả trước và sau commit/normalize) ✅; `current_version=0.1.0`, `brain_template_version=1.2.0` ✅ (kèm field `current_version_source` ghi rõ nguồn: repo không có `package.json` ở root, chưa có release chính thức).
- **V5 (không mất nội dung):** `git status --porcelain` cuối = **RỖNG**; commit `14 files changed, 695 insertions(+), 44 deletions(-)` với 2 dòng `rename … (100%)` — mọi file cũ truy vết được, 0 file nội dung bị mất.
- **V6 (luật riêng còn sống):** grep trong `AGENTS.md` → `spec-registry.json` **2 hits**, `agent.md` **7 hits**, `.githooks/` **2 hits** ✅ (mục mới `## 📜 6. PHỤ LỤC LUẬT RIÊNG DỰ ÁN` với 6 tiểu mục 6.1–6.6).
- **V7 (bảo tồn):** `git diff -- agent.md` và `git diff --cached -- agent.md` đều RỖNG ✅; `git status --porcelain -- planning .agents task.md memory-distill.md docs scripts Update-project` RỖNG ✅.
- **V8 (riêng SPEC này):** `git status` cuối cùng RỖNG hoàn toàn — không file nào trong `planning/` hay `.agents/skills/` bị thay đổi ✅.
- **Bonus — gate riêng của dự án:** `node scripts/verify-worktree-hygiene.js` → `Hygiene checks passed.` exit 0 ✅. `node scripts/verify-documentation-integrity.js` FAIL với **2 broken link CÓ TRƯỚC** (`docs/README.md` và `docs/CODEBASE_ATLAS.md` trỏ `../output/target_corpus/verification/phase-xxi-static.json`; thư mục `output/` không tồn tại trong worktree này) — hai file đó KHÔNG bị đợt não hóa này chạm vào.

### [x] SHA commit

- `bf7e959d212b872ad67cc43b8513e2097680b4f5` trên branch `main` (repo `reverse Claude`) — **KHÔNG push**.
- Message: `feat(brain): adopt brain template v1.2.0 as a layer over the existing spec-registry governance`
