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

- [ ] V1–V7 đạt, bằng chứng: (điền)
- [ ] SHA commit: (điền)
