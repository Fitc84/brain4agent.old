# SPEC-P05 — Agent to Product (Lớp C: Brain OS legacy đầy đủ đang sống) 🔴

- **Hiện trạng (2026-08-31):** git sạch, `main` ahead 2. Đây KHÔNG phải "não thiếu chuẩn" — là một **Brain OS thế hệ khác, hoàn chỉnh và đang vận hành**:
  - `brain4agent/specs/`: registry riêng (`registry.json`, `spec_schema.json`, `SPEC_TEMPLATE.md`, `MASTER_PLAN.md`, SPEC-ATP-xx...).
  - `brain4agent/tasks/`: state machine (`proposed/ → approved/ → active/ → review/ → done/ | rejected/`) + task JSON.
  - `brain4agent/memory/`: có `hot/` SẴN, `archive/`, `migrations/`, **`graph.db` SQLite + `graph_schema.sql` + `state_schema.json`** — bộ nhớ đồ thị máy đọc.
  - Governance riêng: `rules.md`, `SOP_WORKFLOW.md`, `SPEC_GOVERNANCE.md`, `PROMPTS_GUIDE.md`, `LLM_ROUTING.md`, `agent_registry.json`, `Context_Index.md`, `master_plan.md`, `gotchas.md`, `locks/`, `logs/`, `releases/`, `architecture/`, `context_manager/`.
  - `.agents/skills/` có 7 skill legacy, trong đó **`.brain-build` chứa script lạc `init_brain.js` đời cũ** (0 nhắc CLAUDE.md — đã cảnh báo ở #04).
  - Tech: Python (pyproject, pytest, ruff, Docker), có `docs/` sẵn.

## Phương án kiến trúc: CỘNG SINH — ✅ ĐÃ CHỐT (plan.md mục 4, quyết định 1 & 2: cộng sinh + archive `.brain-build`)

KHÔNG di trú/không archive hệ legacy. Lý do: tasks state machine + graph.db là dữ liệu vận hành sống, di trú = viết lại cả hệ, rủi ro gãy logic cao nhất toàn chiến dịch, lợi ích thấp. Thay vào đó:

1. **Thêm lớp chuẩn tối thiểu** để mọi agent nạp được luật: `AGENTS.md` + `CLAUDE.md` + marker + `state.json.brain_template_version`.
2. `AGENTS.md` viết TAY (không dùng nguyên template engine): phần đầu là giao thức khởi động chuẩn v1.2.0, phần thân là "PHỤ LỤC LUẬT RIÊNG DỰ ÁN" ánh xạ sang hệ legacy:
   - kernel → `brain4agent/memory-distill.txt` (TẠO MỚI, cô đọng từ `rules.md` + `master_plan.md` + `Context_Index.md`, <100 dòng);
   - router → `Context_Index.md` (giữ vai trò index legacy), gotchas → `gotchas.md`, roadmap → `master_plan.md` + `tasks/`;
   - quy trình làm việc → `SOP_WORKFLOW.md` + `SPEC_GOVERNANCE.md` (bất khả xâm phạm).
3. Vì các phân vùng chuẩn (`index.md`, `roadmap.md`...) KHÔNG tồn tại đúng tên, `init_brain.js` chạy lên sẽ sinh bộ file chuẩn RỖNG cạnh hệ legacy → **não song trùng**. Xử lý: sau khi engine chạy, các file chuẩn mới sinh phải được điền thành **file trỏ (pointer file)** ≤15 dòng: "phân vùng này của dự án do <file legacy> đảm nhiệm — đọc ở đó" — KHÔNG copy nội dung (một nguồn chân lý).
4. **Script lạc `.brain-build`:** `git mv` cả thư mục skill vào `archive/legacy-skills/.brain-build/` của chính repo (đề xuất — chờ user chốt câu 2). Cấm chạy nó từ nay; ghi vào `gotchas.md` legacy + `-known-gotchas.md` mới.

## Các bước

1. Pre-flight + backup (`brain4agent/` TOÀN BỘ — chú ý `graph.db` là binary, copy nguyên).
2. Viết `memory-distill.txt` (đọc `rules.md`, `master_plan.md`, `Context_Index.md` trước).
3. Chạy engine bằng đường dẫn bọc ngoặc kép (tên repo có dấu cách).
4. Biến các phân vùng chuẩn engine vừa sinh rỗng thành pointer file; viết lại `AGENTS.md` theo mục 2 (engine sinh bản template trước, sau đó thay thân bằng phụ lục — giữ các mục luật bất biến chung).
5. Archive `.brain-build` (nếu user duyệt câu 2).
6. `state.json` hot có sẵn — CHỈ để engine vá thêm `brain_template_version`, đối chiếu trước/sau bằng parse JSON: 0 key mất (hệ legacy có `state_schema.json` riêng — không đụng schema của họ).
7. Verify V1–V7 (V6 grep: `SOP_WORKFLOW.md`, `spec_schema.json`, `graph.db`, `Context_Index.md` trong AGENTS.md); commit `feat(brain): add template v1.2.0 governance layer over the legacy brain OS (symbiosis, no migration)`.

## Rủi ro riêng (cao nhất chiến dịch)

- `locks/`, `logs/`, `context_manager/` có thể được code trong `src/`, `scripts/`, `atp.py` đọc theo path cứng → TUYỆT ĐỐI không đổi tên/di chuyển bất kỳ thứ gì trong hệ legacy.
- `graph.db` đang có dữ liệu — mọi thao tác chỉ THÊM file mới bên cạnh, không mở/ghi db.
- Engine đổi tên `DOCS`→`docs`: repo đã có `docs/` thường — không dính; vẫn re-check pre-flight.

## Nghiệm thu — ✅ ĐÃ HOÀN THÀNH (2026-08-31)

- [x] **Quyết định của user (plan.md mục 4):** câu 1 = **CỘNG SINH** (không di trú, không archive hệ legacy); câu 2 = **archive `.brain-build`**. Cả hai đã thực thi đúng.
- [x] **Pre-flight:** `git status --porcelain` rỗng; `rev-parse --show-toplevel` = `D:/Data/Repositories/.My-Repositories/Agent to Product`; branch `main`; root không có `DOCS`/`Plan` viết hoa (đã có `docs/` thường). Backup toàn bộ `brain4agent/` (67 file, gồm `graph.db` binary) vào `scratchpad/backup-plan05-agent-to-product/`.
- [x] **Danh sách pointer file đã tạo (6 file — đều do engine vừa sinh RỖNG, không file nào có nội dung thật bị đè):**

  | Pointer file | Trỏ về |
  | :--- | :--- |
  | `brain4agent/index.md` | `Context_Index.md` (+ `docs/CODEBASE_MAP.md`, `specs/MASTER_PLAN.md`, `SOP_WORKFLOW.md`) |
  | `brain4agent/roadmap.md` | `master_plan.md` + `tasks/` (state machine) + `specs/registry.json` + `releases/` |
  | `brain4agent/-known-gotchas.md` | `gotchas.md` (+ cảnh báo cấm chạy `.brain-build`, cảnh báo pointer-file) |
  | `brain4agent/project-intro.md` | `README.md` + `brain4agent/README.md` + `architecture/` + `ARCHITECTURE_DIAGRAMS.md` + `atp_workflow.html` |
  | `brain4agent/-data-architecture.md` | `memory/graph_schema.sql` + `memory/state_schema.json` + `specs/spec_schema.json` + `tasks/task_schema.json` + `memory/migrations/` |
  | `brain4agent/changelog.md` | `releases/` + `master_plan.md` (Release hiện hành) + `git log`/tag |

- [x] **`memory-distill.txt`:** viết mới, **45 dòng** (< 100), nội dung THẬT (role ATP, SOP 6 bước, tech Python/`atp.py`, release `v0.1.0` @ `06d4e63`, `stable_single_worker`), có Bước 0 `.xay-dung-nao-bo` + mục `<governance_legacy>` + `<hard_rules>`.
- [x] **`AGENTS.md`:** engine sinh template chuẩn (giữ nguyên Luật J và §5.G mục 3), sau đó thêm mục 6 "PHỤ LỤC LUẬT RIÊNG DỰ ÁN — AGENT TO PRODUCT (Legacy Brain OS Symbiosis)": 6.0 bất biến cấm động hệ legacy, 6.1 bảng ánh xạ pointer, 6.2 luật vận hành legacy, 6.3 thứ tự ưu tiên khi xung đột luật, 6.4 skill lạc bị vô hiệu hoá.

### Bằng chứng V1–V8

- **V1 (idempotent):** engine chạy lần 2 → `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` … `👉 Trạng thái: NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM!`, `EXIT=0`.
- **V2 (dual entry):** `CLAUDE.md` = **8 dòng**, có đúng 1 dòng `@AGENTS.md`, 0 code fence.
- **V3 (marker):** `Get-ChildItem -Filter "brain4agent-v*.md"` → đúng 1 file `brain4agent-v1.2.0.md`.
- **V4 (state):** tail byte `[System.IO.File]::ReadAllBytes($p)[-1]` = **10**; `brain_template_version = 1.2.0`.
  Key set TRƯỚC (16): `active_input_dir, active_task_id, capability_mode, context_pressure, current_step, inputs_hash, last_checkpoint, last_compacted_at, last_error, last_ingest_at, outputs, project, release, release_commit, review_gate, status`.
  Key set SAU (17): y hệt **+ `brain_template_version`**. → **0 key legacy bị mất**. Validator legacy `python brain4agent/scripts/validate_state.py brain4agent/memory/hot/state.json brain4agent/memory/state_schema.json` → `[OK] State is valid.` (exit 0).
- **V5 (không đụng legacy):** `git status --porcelain` trước commit chỉ có: 2 dòng `R` (rename `.brain-build` → `archive/legacy-skills/`), 1 dòng `M brain4agent/gotchas.md` (thêm mục "Brain / Governance Tooling" — additive, SPEC cho phép), còn lại toàn `??` file mới. Không file legacy nào bị xoá/đổi tên ngoài `.brain-build` đã được duyệt.
- **V6 (grep `AGENTS.md`):** `SOP_WORKFLOW.md` = 2, `spec_schema.json` = 2, `graph.db` = 2, `Context_Index.md` = 2 — mỗi chuỗi ≥ 1. ✅
- **V7 (`graph.db` nguyên vẹn):** SHA256 trước = sau = `2718DE67849FAD6BC4F3FEDC350DDCC9BBB1E740E8F9AD2F2353862FBC81C7A3`. Không mở, không ghi DB.
- **V8:** xem bảng pointer file phía trên (6 file, mỗi file ≤ 15 dòng, chỉ trỏ đường dẫn, không copy nội dung).

- [x] **SHA commit:** `a7c6ce457cb8aa954a8af8ca3163f88fddf7b829` (`a7c6ce4`) trên branch `main` — 13 files changed, 370 insertions(+). KHÔNG push. `git status` sau commit: sạch.
- [x] **Hệ legacy còn nguyên:** `specs/`, `tasks/`, `locks/`, `logs/`, `context_manager/`, `memory/graph.db`, `releases/`, `architecture/`, `scripts/` đều tồn tại, không đổi tên/di chuyển.
- [x] **`.brain-build`:** `git mv .agents/skills/.brain-build → archive/legacy-skills/.brain-build/` (rename R100, giữ history). Cảnh báo cấm chạy đã ghi ở `brain4agent/gotchas.md`, `brain4agent/-known-gotchas.md` và `AGENTS.md` §6.4.
