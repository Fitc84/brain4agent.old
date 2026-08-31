# SPEC-P05 — Agent to Product (Lớp C: Brain OS legacy đầy đủ đang sống) 🔴

- **Hiện trạng (2026-08-31):** git sạch, `main` ahead 2. Đây KHÔNG phải "não thiếu chuẩn" — là một **Brain OS thế hệ khác, hoàn chỉnh và đang vận hành**:
  - `brain4agent/specs/`: registry riêng (`registry.json`, `spec_schema.json`, `SPEC_TEMPLATE.md`, `MASTER_PLAN.md`, SPEC-ATP-xx...).
  - `brain4agent/tasks/`: state machine (`proposed/ → approved/ → active/ → review/ → done/ | rejected/`) + task JSON.
  - `brain4agent/memory/`: có `hot/` SẴN, `archive/`, `migrations/`, **`graph.db` SQLite + `graph_schema.sql` + `state_schema.json`** — bộ nhớ đồ thị máy đọc.
  - Governance riêng: `rules.md`, `SOP_WORKFLOW.md`, `SPEC_GOVERNANCE.md`, `PROMPTS_GUIDE.md`, `LLM_ROUTING.md`, `agent_registry.json`, `Context_Index.md`, `master_plan.md`, `gotchas.md`, `locks/`, `logs/`, `releases/`, `architecture/`, `context_manager/`.
  - `.agents/skills/` có 7 skill legacy, trong đó **`.brain-build` chứa script lạc `init_brain.js` đời cũ** (0 nhắc CLAUDE.md — đã cảnh báo ở #04).
  - Tech: Python (pyproject, pytest, ruff, Docker), có `docs/` sẵn.

## Phương án kiến trúc: CỘNG SINH (đề xuất — chờ user chốt ở plan.md mục 4 câu 1)

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

## Nghiệm thu (điền khi thực thi)

- [ ] Quyết định của user cho câu 1 & 2 (plan.md mục 4): (điền)
- [ ] Danh sách pointer file đã tạo: (điền)
- [ ] V1–V7, bằng chứng: (điền)
- [ ] SHA commit: (điền)
