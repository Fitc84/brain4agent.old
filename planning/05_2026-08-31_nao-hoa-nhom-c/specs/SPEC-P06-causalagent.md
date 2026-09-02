# SPEC-P06 — CausalAgent (Lớp D: bị chặn bởi git — GATED) 🔴

- **Hiện trạng (2026-08-31):** **CHƯA THỰC THI ĐƯỢC** — repo unborn `main` (`## No commits yet on main`), 34 mục untracked (toàn bộ dự án). Root ngập rác: ~20 file `scratch_*.py`, `critique_round_*.txt`, `document_v*.txt`, `*_results.json` — vi phạm Root Clean nặng nhất Nhóm C. Não kiểu cũ: `-agent-workflow.md`, `-causalagent-strategy.md`, `-hackathon-operating-system.md`, `-quant-analysis-engine.md`, `-v1-implementation-plan.md`, `changelog.md`, `index.md`, `memory-distill.txt`. Repo ĐÃ có sẵn thư mục `scratch/`.
- Tech: Python (hackathon project — critique/sandbox/evidence pipeline).

## 🚧 PHẠM VI ĐÃ THU HẸP — ✅ CHỐT 2026-08-31 (plan.md mục 4, quyết định 3)

SPEC này được chia làm 2 giai đoạn. **Giai đoạn 1 làm ngay; Giai đoạn 2 bị hoãn, chờ user.**

### Giai đoạn 1 — LÀM NGAY (an toàn, không cần git)
Chỉ não hóa: di trú nội dung trong `brain4agent/` + chạy engine + sinh AGENTS/CLAUDE/marker/hot memory.
- **KHÔNG tạo commit đầu tiên của repo** (mốc lịch sử thuộc quyền user; repo có `.env`, commit gộp mù dễ lộ key).
- **KHÔNG chạy `git init`, KHÔNG `git add`, KHÔNG `git commit`, KHÔNG `git mv`** (git mv không dùng được vì file chưa tracked).
- Di chuyển file bằng thao tác filesystem thường (`Move-Item`), an toàn nhờ **backup thủ công bắt buộc** — đúng mô hình đã dùng cho 4 repo không git ở kế hoạch #04.
- Kiểm chứng thay `git diff` bằng **subsequence check** so với backup + so khớp tập key JSON (hợp đồng V5 biến thể).

### Giai đoạn 2 — HOÃN, chờ user (KHÔNG làm trong đợt này)
Dọn Root Clean: ~20 `scratch_*.py`, `critique_round_*.txt`, `document_v*.txt`, `*_results.json`.
- **Lý do hoãn:** các script Python này import/gọi lẫn nhau theo path tương đối; di chuyển mà không có git để lùi là rủi ro gãy runtime cao nhất chiến dịch. Backup thủ công không đủ an toàn cho thao tác nhiều file phụ thuộc chéo.
- **Điều kiện mở:** user tạo commit đầu tiên (commit "as-is" toàn bộ trước là tốt nhất — để mọi thay đổi sau soi được bằng `git diff`), rồi mới thực hiện phần dọn root theo bảng ánh xạ bên dưới.

## Bảng ánh xạ di trú (sau khi mở gate)

| Mục cũ | Đích | Loại |
| :--- | :--- | :--- |
| `brain4agent/-causalagent-strategy.md` | GỘP: mục tiêu → `project-intro.md`; định hướng → `roadmap.md`; nếu dài giữ `docs/causalagent-strategy.md` | gộp |
| `brain4agent/-agent-workflow.md` | `docs/agent-workflow.md` | mv |
| `brain4agent/-quant-analysis-engine.md` | `docs/quant-analysis-engine.md` | mv |
| `brain4agent/-hackathon-operating-system.md` | `docs/hackathon-operating-system.md` | mv |
| `brain4agent/-v1-implementation-plan.md` | `planning/01_<ngày-gốc>_v1-implementation/plan.md` (đưa về đúng khu planning chuẩn; ngày lấy từ nội dung file) | mv |
| `changelog.md`, `index.md`, `memory-distill.txt` | GIỮ, cập nhật nội dung sau di trú | sửa |
| Root: `scratch_*.py` (~20 file) | ⏸️ **GIAI ĐOẠN 2 — HOÃN.** `scratch/` (repo có sẵn) — TRƯỚC ĐÓ grep tham chiếu chéo (các file scratch thường import lẫn nhau hoặc được `run_critique.py` gọi) | mv có kiểm |
| Root: `critique_round_*.txt`, `document_v*.txt`, `*_results.json` | ⏸️ **GIAI ĐOẠN 2 — HOÃN.** Quyết theo grep tham chiếu; ghi quyết định vào đây | mv có kiểm |
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

## Nghiệm thu

### ✅ GIAI ĐOẠN 1 — HOÀN THÀNH 2026-08-31 · ⏸️ GIAI ĐOẠN 2 HOÃN CHỜ USER

**Không chạy bất kỳ lệnh git ghi nào** (`init` / `add` / `commit` / `mv` / `push`).
Repo giữ nguyên trạng thái `## No commits yet on main`. Không đọc nội dung `.env`.

#### Pre-flight

- `git rev-parse --show-toplevel` = `D:/Data/Repositories/.My-Repositories/CausalAgent` ✅
  (đúng chính repo, không leo lên repo cha).
- `git status --short --branch` → `## No commits yet on main`, 34 mục untracked.
- Không có thư mục `DOCS` / `Plan` viết hoa (repo chưa hề có `docs/` trước đó).

#### Backup (đường lùi duy nhất)

`scratchpad/backup-plan05-CausalAgent/` — **SRC 8 file / 54.259 bytes = BAK 8 file /
54.259 bytes** ✅ (xác nhận trước khi sửa bất cứ thứ gì).

#### Quyết định cho `-causalagent-strategy.md`

**GIỮ NGUYÊN VĂN thành `docs/causalagent-strategy.md`, đồng thời TÓM TẮT vào não.**
Lý do: file dài 101 dòng / 7.177 bytes, chứa cả Khung phân tích Đa chiều (công thức
định lượng cho 3 lăng kính) lẫn lộ trình V1/V2/V3 và danh sách rủi ro chiến lược — gộp
toàn văn vào `project-intro.md` sẽ phá quy tắc "kernel tinh gọn / phân vùng đơn nhiệm".
Đã tóm tắt: mục tiêu + luận điểm cốt lõi + bảng khung đa chiều → `project-intro.md`;
lộ trình V1/V2/V3 + lĩnh vực demo + các ý tưởng mở rộng → `roadmap.md` (gồm Idea Vault).

#### Bảng ánh xạ ĐÃ THỰC HIỆN (bằng `Move-Item`, không dùng git)

| Nguồn | Đích | Kiểm |
| :--- | :--- | :--- |
| `brain4agent/-causalagent-strategy.md` | `docs/causalagent-strategy.md` (+ tóm tắt vào `project-intro.md`, `roadmap.md`) | hash IDENTICAL |
| `brain4agent/-agent-workflow.md` | `docs/agent-workflow.md` | hash IDENTICAL |
| `brain4agent/-quant-analysis-engine.md` | `docs/quant-analysis-engine.md` | hash IDENTICAL |
| `brain4agent/-hackathon-operating-system.md` | `docs/hackathon-operating-system.md` | hash IDENTICAL |
| `brain4agent/-v1-implementation-plan.md` | `planning/01_2026-06-24_v1-implementation/plan.md` | hash IDENTICAL |
| `changelog.md` | giữ, prepend mục `2026-08-31 / v0.1.0` | 156 → 183 dòng, 0 dòng cũ mất |
| `index.md` | giữ, viết lại thành Router + Codebase Map + Entry Points | 32 → 74 dòng |
| `memory-distill.txt` | giữ, vá Bước 0 + cập nhật `<source_docs>`/`<module_map>` | 80 → 92 dòng (< 100 ✅) |

*Ngày thư mục planning:* nội dung file không ghi ngày; lấy theo mốc tạo file gốc
`24/06/2026 15:10` — trùng ngày các phiên trong `changelog.md` → `01_2026-06-24_v1-implementation`.

*Tên docs vs module thật:* `ls src/causal_agent/` cho thấy `core/{llm_client,search_engine,
sandbox_generator,empirical_sandbox,schemas}.py` + `sandbox/executor.py` — không có module
nào trùng tên 1-1 với 4 tài liệu này (chúng là tài liệu phương pháp luận, không phải tài
liệu module). Giữ tên theo chủ đề và đã ghi router đầy đủ trong `brain4agent/index.md`.

#### Cổng nghiệm thu (output thật)

- **V1 — Idempotent:** chạy `init_brain.js` lần 2 →
  `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!`, đủ 8 dấu ✅, `EXITCODE=0`. ✅
- **V2 — Dual entry:** `CLAUDE.md` = **8 dòng**, `has_at_agents=True`, `has_backtick=False`. ✅
- **V3 — Marker:** `ls brain4agent-v*.md` → đúng 1 file `brain4agent-v1.2.0.md`. ✅
- **V4 — State:** `[System.IO.File]::ReadAllBytes($p)[-1]` = **10**;
  `current_version=0.1.0`, `brain_template_version=1.2.0` (thêm `current_version_source`
  ghi rõ nguồn: dự án hackathon chưa từng có số phiên bản). ✅
- **V5 — Không mất nội dung (biến thể không-git):** 5 file move đều `Get-FileHash`
  IDENTICAL với backup. 3 file giữ lại: `changelog.md` 0 dòng cũ biến mất;
  `memory-distill.txt` chỉ 6 dòng cũ được thay (đúng 6 dòng con trỏ `<module_map>`/
  `<source_docs>` trỏ tới đường dẫn đã lỗi thời), `index.md` viết lại toàn bộ vì mọi
  route cũ đều trỏ tới file đã di chuyển — mọi route cũ đều có route mới tương ứng trong
  bảng Router. Kiểm nội dung gộp: grep các chuỗi đặc trưng của strategy
  (`Humanity Optimization Engine`, `Contagion Rate`, `Cascading Failure`, `S_market`,
  `Radar Điểm đau`) → 14 lần xuất hiện trên 6 file trong `brain4agent/`. **0 file nội dung mất.** ✅
- **V7 — Root:** trước 30 file, sau 33 file = +`AGENTS.md`, +`CLAUDE.md`,
  +`brain4agent-v1.2.0.md` (3 file hợp lệ, không file nháp nào). Đếm lại rác còn nguyên
  vị trí cũ: **18 `scratch_*.py`, 3 `critique_round_*.txt`, 3 `document_v*.txt`,
  2 `*_results.json`** — không đụng file nào. ✅ (V6 không áp dụng: repo không có hệ
  governance riêng cần bảo tồn.)

#### Chống "não giả"

Đã điền nội dung THẬT (rút từ 5 tài liệu di trú + `src/causal_agent/`, `scripts/`,
`requirements.txt`, `changelog.md`) cho: `project-intro.md`, `roadmap.md`,
`-known-gotchas.md`, `-data-architecture.md`, `index.md`, `today.md`, `state.json`.
Không còn chữ mẫu "Điền/Mô tả ... tại đây" trong `brain4agent/`.
`-known-gotchas.md` có mục bắt buộc: *"Repo CHƯA có commit đầu tiên — root còn ~20 file
`scratch_*.py` chờ dọn ở Giai đoạn 2, xem planning kế hoạch #05 SPEC-P06."*

#### ⏸️ Giai đoạn 2 — điều kiện mở gate

User tạo **commit đầu tiên "as-is"** cho toàn repo (kiểm `.gitignore` để `.env` KHÔNG bị
add — file này chứa khoá API của bên thứ ba). Sau đó mới dọn root theo bảng ánh xạ,
có `git diff` làm đường lùi, kèm grep tham chiếu chéo giữa các `scratch_*.py` và smoke
`run_critique.py`.

- [x] Kết quả grep tham chiếu + quyết định mv: **hoãn sang Giai đoạn 2** (chưa mv file root nào).
- [x] V1–V5, V7: đạt (bằng chứng ở trên). V6 không áp dụng.
- [x] ~~SHA commit não hóa: **KHÔNG tạo** — chờ user tạo commit đầu tiên của repo.~~ → **ĐÃ XONG ở #06 (SPEC-P02)**: commit đầu `c702ea9` (baseline as-is), rồi `6771b3b` nâng khung não lên `1.3.0` và `249daa2` dọn khối luật cũ ở #07. Đo 2026-09-02: `brain_template_version = 1.3.0`, `git status` sạch. Việc dọn root vẫn hoãn (cần sửa `scratch_*.py` cho độc-lập-vị-trí trước) — đã ghi ở mục 🔴 Active của `roadmap.md`.
