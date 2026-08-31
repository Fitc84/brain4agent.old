# SPEC-P06 — CausalAgent (Lớp D: bị chặn bởi git — GATED) 🔴

- **Hiện trạng (2026-08-31):** **CHƯA THỰC THI ĐƯỢC** — repo unborn `main` (`## No commits yet on main`), 34 mục untracked (toàn bộ dự án). Root ngập rác: ~20 file `scratch_*.py`, `critique_round_*.txt`, `document_v*.txt`, `*_results.json` — vi phạm Root Clean nặng nhất Nhóm C. Não kiểu cũ: `-agent-workflow.md`, `-causalagent-strategy.md`, `-hackathon-operating-system.md`, `-quant-analysis-engine.md`, `-v1-implementation-plan.md`, `changelog.md`, `index.md`, `memory-distill.txt`. Repo ĐÃ có sẵn thư mục `scratch/`.
- Tech: Python (hackathon project — critique/sandbox/evidence pipeline).

## 🚧 GATE TIÊN QUYẾT (user tự làm, agent không thay)

1. User tạo **commit đầu tiên** của repo (mốc lịch sử — theo bài học P04c #04, agent không tự tạo).
   - Gợi ý cho user: commit "as-is" toàn bộ trước, để mọi thay đổi não hóa sau đó soi được bằng `git diff`.
2. Sau commit đầu, `git status` phải sạch → SPEC này mới được chạy.

## Bảng ánh xạ di trú (sau khi mở gate)

| Mục cũ | Đích | Loại |
| :--- | :--- | :--- |
| `brain4agent/-causalagent-strategy.md` | GỘP: mục tiêu → `project-intro.md`; định hướng → `roadmap.md`; nếu dài giữ `docs/causalagent-strategy.md` | gộp |
| `brain4agent/-agent-workflow.md` | `docs/agent-workflow.md` | mv |
| `brain4agent/-quant-analysis-engine.md` | `docs/quant-analysis-engine.md` | mv |
| `brain4agent/-hackathon-operating-system.md` | `docs/hackathon-operating-system.md` | mv |
| `brain4agent/-v1-implementation-plan.md` | `planning/01_<ngày-gốc>_v1-implementation/plan.md` (đưa về đúng khu planning chuẩn; ngày lấy từ nội dung file) | mv |
| `changelog.md`, `index.md`, `memory-distill.txt` | GIỮ, cập nhật nội dung sau di trú | sửa |
| Root: `scratch_*.py` (~20 file) | `scratch/` (repo có sẵn) — TRƯỚC ĐÓ grep tham chiếu chéo (các file scratch thường import lẫn nhau hoặc được `run_critique.py` gọi) | mv có kiểm |
| Root: `critique_round_*.txt`, `document_v*.txt`, `*_results.json` | `_outputs/` không tồn tại → tạo `outputs/` hoặc dùng `scratch/` — quyết theo grep tham chiếu; ghi quyết định vào đây | mv có kiểm |
| Root: `run_critique.py`, `requirements.txt`, `.env`, `.gitignore` | GIỮ root (entry point + manifest hợp lệ); `.env` không bao giờ add vào git | không đụng |

## Các bước (sau gate)

1. Pre-flight + backup `brain4agent/`.
2. Grep tham chiếu cho từng file root trước khi mv (rủi ro số 1 của repo này — script gọi nhau bằng path tương đối).
3. Di trú theo bảng; chạy engine; hoàn thiện ngữ nghĩa (`-known-gotchas.md`, `-data-architecture.md` mới sinh — rút từ pipeline critique/sandbox/evidence).
4. `state.json`: `current_version` khởi tạo `0.1.0` (hackathon, chưa có version).
5. Verify V1–V7 + kiểm riêng: root sau dọn chỉ còn entry point + manifest + AGENTS/CLAUDE/marker + thư mục; commit `feat(brain): adopt brain template v1.2.0 with root cleanup and content migration`.

## Rủi ro riêng

- Mv script Python đang được import → gãy runtime. Bắt buộc: sau di trú chạy `python -c "import compileall"` hoặc chạy thử `run_critique.py --help` (nếu có) để smoke; gãy thì restore từ backup, thu hẹp phạm vi mv, báo user.
- `.env` chứa key — không add, không đọc nội dung vào log/SPEC.

## Nghiệm thu (điền khi thực thi)

- [ ] Gate mở (SHA commit đầu tiên của user): (điền)
- [ ] Kết quả grep tham chiếu + quyết định mv: (điền)
- [ ] V1–V7 + smoke Python, bằng chứng: (điền)
- [ ] SHA commit não hóa: (điền)
