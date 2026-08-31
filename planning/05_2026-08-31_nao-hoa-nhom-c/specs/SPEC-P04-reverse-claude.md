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

## Nghiệm thu (điền khi thực thi)

- [ ] Kết quả grep tham chiếu trước di trú: (điền)
- [ ] V1–V7, bằng chứng: (điền)
- [ ] SHA commit: (điền)
