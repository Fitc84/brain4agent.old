# SPEC-P01 — block-ads-fb-v2 (Lớp A: gần chuẩn) 🟢

- **Hiện trạng (2026-08-31):** git sạch, `master` ahead 1. `brain4agent/` đã đúng 7 tên chuẩn: `-data-architecture.md`, `-known-gotchas.md`, `changelog.md`, `index.md`, `memory-distill.txt`, `project-intro.md`, `roadmap.md`. Thiếu: `memory/hot/`, `AGENTS.md`, `CLAUDE.md`, marker. Tech: Vite + TS + Tailwind (browser extension, có `manifest.config.ts`).
- **Vai trò trong chiến dịch:** pilot lớp A — ca dễ nhất, chạy đầu tiên.

## Bảng ánh xạ di trú

KHÔNG có gì phải di trú — 7 phân vùng đã đúng tên, engine sẽ giữ nguyên toàn bộ (nhánh "Đã có sẵn ... Giữ nguyên dữ liệu").

## Các bước

1. Pre-flight + backup `brain4agent/` theo quy trình chuẩn (00-ARCHITECTURE §4).
2. Chạy engine. Kỳ vọng engine sinh: `AGENTS.md` (bộ luật đầy đủ — repo chưa có nên là sinh MỚI, không phải vá), `CLAUDE.md`, marker, `memory/hot/{today.md, state.json}`, `planning/`, `.agents/skills/` (nếu thiếu).
3. Hoàn thiện ngữ nghĩa: đối chiếu `memory-distill.txt` sẵn có với thực tế repo (extension chặn quảng cáo FB v2) — nếu distill cũ vẫn đúng thì GIỮ NGUYÊN, chỉ vá Bước 0 nếu engine chưa vá.
4. `state.json` mới sinh: đặt `current_version` theo `package.json` của repo (đọc lúc thực thi).
5. Verify V1–V7; commit `feat(brain): adopt brain template v1.2.0 (AGENTS.md, CLAUDE.md shim, marker, hot memory)`.

## Rủi ro riêng

- `dist/` và `node_modules/` tồn tại — engine không đụng tới, nhưng khi commit dùng `git add -A` phải xác nhận `.gitignore` đã che chúng (khảo sát: repo có `.gitignore`; kiểm lại lúc thực thi bằng `git status` — nếu 2 thư mục này hiện ra thì chỉ add từng file chủ đích, KHÔNG add -A).

## Nghiệm thu (điền khi thực thi)

- [x] **Pre-flight sạch:** `git status --porcelain` rỗng; `rev-parse --show-toplevel` =
  `D:/Data/Repositories/.My-Repositories/block-ads-fb-v2` (trùng repo); không có `DOCS`/`Plan` viết hoa;
  7 phân vùng chuẩn có sẵn, thiếu đúng như khảo sát (`memory/hot/`, `AGENTS.md`, `CLAUDE.md`, marker).
- [x] **Backup:** copy `brain4agent/` sang
  `scratchpad/backup-plan05-block-ads-fb-v2/brain4agent/` trước khi sửa (7 file gốc nguyên vẹn).
- [x] **Engine chạy lần 1:** sinh mới `AGENTS.md`, `CLAUDE.md`, `brain4agent-v1.2.0.md`,
  `brain4agent/memory/hot/{state.json, today.md}`, `planning/`, `.agents/skills/`, `docs/`; tự vá
  Bước 0 vào `memory-distill.txt`; giữ nguyên 6 file phân vùng còn lại (log: "Đã có sẵn ... Giữ nguyên dữ liệu").
- [x] **Hoàn thiện ngữ nghĩa:** `memory-distill.txt`/`index.md`/`project-intro.md` sẵn có đã mô tả đúng
  thực tế (React+TS+Vite+Tailwind+CRXJS, Chrome Extension MV3) → giữ nguyên, chỉ có Bước 0 do engine tự vá.
  Viết lại `today.md` mô tả thật phiên não hóa này (không còn câu template "Khởi tạo thành công...").
  Sửa `state.json.current_version` từ giá trị mặc định engine sinh (`1.0.0`) → **`0.0.0`** (đúng
  `package.json.version` đọc lúc thực thi).
- [x] **V1 (Idempotent):** chạy `init_brain.js` lần 2 → in đúng
  `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` kèm 8 dòng ✅, không ghi đè lại `state.json` đã sửa tay.
- [x] **V2 (Dual entry):** `CLAUDE.md` dài 7 dòng, chứa dòng `@AGENTS.md` không bọc backtick.
- [x] **V3 (Marker):** đúng 1 file `brain4agent-v1.2.0.md` tại root.
- [x] **V4 (State):** `[System.IO.File]::ReadAllBytes($p)[-1]` = `10` (0x0a); JSON parse ra
  `current_version=0.0.0`, `brain_template_version=1.2.0`.
- [x] **V5 (Không mất nội dung):** `Get-ChildItem brain4agent -Recurse` sau khi xong liệt kê đủ 7 file
  gốc + `memory/hot/{state.json, today.md}` — không file nào biến mất; `git status` chỉ hiện các file mới
  (`AGENTS.md`, `CLAUDE.md`, `brain4agent-v1.2.0.md`, `brain4agent/memory/`) + 1 file sửa
  (`memory-distill.txt`, do engine tự vá Bước 0).
- [x] **V7 (Root Clean):** root sau cùng chỉ thêm đúng 1 file mới hợp lệ là marker
  `brain4agent-v1.2.0.md`; không có file nháp nào khác; `node_modules/`, `dist/` đã bị `.gitignore` che
  (không hiện trong `git status`) nên add có chọn lọc từng path, không dùng `git add -A`.
- [x] **SHA commit:** `1c0569e` trên branch `master` (local only, không push) —
  `feat(brain): adopt brain template v1.2.0 (AGENTS.md, CLAUDE.md shim, marker, hot memory)`.
