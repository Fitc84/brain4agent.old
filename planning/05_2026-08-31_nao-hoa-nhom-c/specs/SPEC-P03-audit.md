# SPEC-P03 — Audit (Lớp B: não lồng thư mục phi chuẩn) 🟠

- **Hiện trạng (2026-08-31):** git sạch, `master` (không thấy remote tracking trong khảo sát — xác nhận lại lúc thực thi, không ảnh hưởng vì không push). Não lồng 3 thư mục phi chuẩn:
  - `core/`: `-security-platform-strategy.md`, `memory-distill.txt`
  - `modules/`: `-agent-auto-fixer.md`, `-api-routing.md`, `-database-schema.md`, `-orchestrator-engine.md`, `-reporting-engine.md`
  - `setup/`: `-system-requirements.md`
  - ngang cấp: `changelog.md`, `index.md`
- Tech: Python security platform (venv/, src/, bin/, `security_platform.db`, server .bat).

## Bảng ánh xạ di trú (git mv / gộp)

| File cũ | Đích | Loại |
| :--- | :--- | :--- |
| `core/memory-distill.txt` | `brain4agent/memory-distill.txt` | mv |
| `core/-security-platform-strategy.md` | ĐỌC lúc thực thi: thiên về mục tiêu/định hướng → GỘP vào `project-intro.md` + phần chiến lược dài hạn vào `roadmap.md`; nếu quá dài giữ nguyên văn thành `docs/security-platform-strategy.md` và chỉ tóm tắt vào não | gộp/mv |
| `modules/-agent-auto-fixer.md` | `docs/agent-auto-fixer.md` | mv (luật §5.C — đối chiếu tên module thật trong `src/` trước khi chốt) |
| `modules/-api-routing.md` | `docs/api-routing.md` | mv |
| `modules/-database-schema.md` | nội dung schema DB → nền cho `brain4agent/-data-architecture.md` (tạo mới bằng nội dung này); bản chi tiết đầy đủ → `docs/database-schema.md` nếu dài | gộp |
| `modules/-orchestrator-engine.md` | `docs/orchestrator-engine.md` | mv |
| `modules/-reporting-engine.md` | `docs/reporting-engine.md` | mv |
| `setup/-system-requirements.md` | `docs/system-requirements.md`; `index.md` router trỏ tới | mv |
| `changelog.md`, `index.md` | GIỮ NGUYÊN vị trí, cập nhật nội dung router sau di trú | sửa nội dung |
| `core/`, `modules/`, `setup/` (thư mục rỗng sau mv) | xóa trong cùng commit | dọn |

Sau di trú, engine sẽ sinh các phân vùng còn thiếu: `project-intro.md` (nếu chưa gộp xong thì gộp trước), `roadmap.md`, `-known-gotchas.md`, `memory/hot/`, AGENTS/CLAUDE/marker.

## Các bước

1. Pre-flight + backup toàn bộ `brain4agent/`.
2. ĐỌC từng file trước khi mv/gộp (bảng trên có 2 ô "đọc lúc thực thi" — ghi quyết định thật vào SPEC).
3. Thực hiện ánh xạ; tạo `docs/` (repo chưa có); grep `core/|modules/|setup/` trong `index.md` và sửa router.
4. Chạy engine; hoàn thiện ngữ nghĩa các file engine vừa sinh rỗng (`project-intro.md`, `roadmap.md` — rút từ README.md + strategy doc).
5. `state.json`: `current_version` khởi tạo `1.0.0` (repo không có manifest version; ghi chú nguồn).
6. Verify V1–V7; kiểm riêng: `brain4agent/` không còn thư mục con nào ngoài `memory/`; commit `feat(brain): adopt brain template v1.2.0 and flatten nested brain partitions`.

## Rủi ro riêng

- `.env` và `security_platform.db` ở root: TUYỆT ĐỐI không add vào commit nếu đang untracked; nếu đã tracked thì giữ nguyên không đụng.
- `venv/` — như trên, không đụng.

## Nghiệm thu (điền khi thực thi)

- [ ] Quyết định 2 ô "đọc lúc thực thi": (điền)
- [ ] V1–V7, bằng chứng: (điền)
- [ ] SHA commit: (điền)
