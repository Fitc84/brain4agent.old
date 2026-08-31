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

## Nghiệm thu (thực thi 2026-08-31) — ✅ ĐÃ HOÀN THÀNH

**Pre-flight:** `git status --porcelain` rỗng; `rev-parse --show-toplevel` = `D:/Data/Repositories/.My-Repositories/Audit`; branch `master`; không có `DOCS`/`Plan` viết hoa. Backup 10 file `brain4agent/` → `scratchpad/backup-plan05-Audit/`.

### [x] Quyết định 2 ô "đọc lúc thực thi"

1. **`core/-security-platform-strategy.md` (41 dòng, 1571 B) → `git mv` thành `brain4agent/project-intro.md`.**
   Lý do: file NGẮN, và nội dung của nó (định vị, architecture layers, workflow 8 phase, 10/10 principles)
   đúng là phần "Tổng quan dự án + triết lý thiết kế" của phân vùng `project-intro.md`. Không cần tách sang
   `docs/` (chỉ tạo thêm 1 hop tra cứu). Toàn bộ nguyên văn được giữ, bổ sung thêm bảng tech stack và mục
   "Đường vào tài liệu". Phần chiến lược "sẽ làm" được rút ra thành task/Idea Vault trong `roadmap.md`.

2. **`modules/-database-schema.md` (23 dòng, 1609 B) → `git mv` thành `brain4agent/-data-architecture.md`;
   KHÔNG tạo `docs/database.md`.** Lý do: file ngắn và 100% là nội dung của phân vùng data-architecture;
   tách đôi sẽ sinh 2 nguồn chân lý lệch nhau. Giữ nguyên văn 3 mục gốc, bổ sung bảng bản đồ dữ liệu/cấu hình
   toàn hệ thống (`data/`, `.env`, `reports/`, `bin/`, trạng thái git), luồng ghi dữ liệu và mục bẫy đã biết.
   `index.md` có dòng ghi chú rõ: schema DB nằm ở `-data-architecture.md`, không có file docs riêng.

### [x] Bảng ánh xạ đã thực hiện (V5 — 0 file mất, 100% truy vết được)

| File cũ (10) | Đích | Loại |
| :--- | :--- | :--- |
| `brain4agent/core/memory-distill.txt` | `brain4agent/memory-distill.txt` | mv + viết lại kernel (thêm Bước 0) |
| `brain4agent/core/-security-platform-strategy.md` | `brain4agent/project-intro.md` | mv + mở rộng |
| `brain4agent/modules/-database-schema.md` | `brain4agent/-data-architecture.md` | mv + mở rộng |
| `brain4agent/modules/-api-routing.md` | `docs/api.md` | mv (R100) |
| `brain4agent/modules/-agent-auto-fixer.md` | `docs/ai.md` | mv (R100) |
| `brain4agent/modules/-orchestrator-engine.md` | `docs/scanner.md` | mv (R100) |
| `brain4agent/modules/-reporting-engine.md` | `docs/reporting.md` | mv (R100) |
| `brain4agent/setup/-system-requirements.md` | `docs/system-requirements.md` | mv (R100) |
| `brain4agent/index.md` | giữ chỗ, viết lại router + Codebase Map + Entry Points | sửa nội dung |
| `brain4agent/changelog.md` | giữ chỗ, thêm mục `2026-08-31 - Brain Governance Standardization` | append |

**Đặt tên `docs/` theo module THẬT trong `src/`** (luật §5.C): `src/api/`→`docs/api.md`,
`src/domains/ai/`→`docs/ai.md`, `src/domains/scanner/`→`docs/scanner.md`,
`src/domains/reporting/`→`docs/reporting.md`. `-system-requirements.md` là tài liệu **cross-cutting**
(binary ngoài, python deps, portable `bin/`) không map 1-1 với module code nào nên giữ tên mô tả
`docs/system-requirements.md`.

### [x] V1–V7 (bằng chứng thật)

- **V1** — engine chạy lần 2: `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` + đủ 8 dòng ✅, exit 0.
  (Ghi chú: engine tự vá Bước 0 vào distill là **no-op** vì file không có tag `<agent_startup_protocol>` —
  đã tự tay viết mục "GIAO THUC KHOI DONG" có chuỗi `xay-dung-nao-bo` vào kernel thì V1 mới xanh.)
- **V2** — `CLAUDE.md`: 8 dòng, có `@AGENTS.md`, 0 code-fence.
- **V3** — root có đúng 1 marker: `brain4agent-v1.2.0.md`.
- **V4** — `state.json` tail byte = `10`; `current_version=1.0.0`, `brain_template_version=1.2.0`.
- **V5** — 10 file cũ → 10 đích ở bảng trên; `git show --name-only HEAD` không chứa `.env`/`venv`/`db`;
  working tree sạch sau commit.
- **V6** — không áp dụng (repo không có hệ governance riêng cần bảo tồn).
- **V7** — `brain4agent/` chỉ còn thư mục con `memory/`; `index.md` còn **0** tham chiếu
  `brain4agent/(core|modules|setup)/`; root không có file nháp mới (marker là ngoại lệ duy nhất).
- Kernel `memory-distill.txt` = 84 dòng (< 100).

### [x] SHA commit

`451f1ac888ee2b006a0af651d225d3b22e76cf21` — branch `master`, **không push**.

### Ghi chú

- `current_version=1.0.0`: repo KHÔNG có manifest version (không `package.json`/`pyproject.toml`/`setup.py`),
  nên khởi tạo 1.0.0 theo SPEC. Lưu ý `changelog.md` có mục "Version 5.0" — đó là version **tính năng** của
  platform, khác con số quản trị này; đã ghi cảnh báo vào `-known-gotchas.md` để agent sau không trộn.
- File nhạy cảm: `.env` untracked + gitignore (KHÔNG add), `venv/` gitignore (KHÔNG add),
  `security_platform.db` đã tracked từ commit cũ → giữ nguyên, không đụng.
- Bug thật phát hiện thêm và đã nạp `-known-gotchas.md` + `roadmap.md`: DB path SQLite tương đối theo CWD
  sinh `security_platform.db` mồ côi ở root; `requirements.txt` dòng cuối lẫn encoding UTF-16LE.
