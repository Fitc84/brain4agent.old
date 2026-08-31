# SPEC-P04 — Não Hóa Phần Còn Thiếu (chạy SAU P01–P03) 🟠

## Điều kiện vào

Repo thuộc phạm vi phải: có git chuẩn (sau P01/P02), tree sạch hoặc phần bẩn không giao với file não (P03), KHÔNG thuộc ca đặc biệt (P05).

## Phân lô (mỗi lô = 1 subagent, kế thừa nguyên tắc + cổng V1–V7 của #05)

### Lô 4a — Vá nốt 5 repo treo từ #04 (có `AGENTS.md` chuẩn, thiếu `CLAUDE.md`/marker) 🟢

`control-cloudflare`, `control-codex`†, `control-gpm`, `control-discord`, `GramPilot`
Chỉ chạy engine (nó tự vá phần thiếu, chỉ-thêm) + cổng kiểm như rollout #04. († `control-codex` có thư mục hoa — làm theo thủ tục lô 4d trước.)

### Lô 4b — 7 repo "A có, B không" (AGENTS.md tồn tại nhưng chưa có `brain4agent/`) 🟠

`AI-Factory-FPT-DOCS`, `control-LDplayer`†, `control-phone`, `CV`, `enterprise-signal-intelligence`, `jina-proxy`, `xoayproxy`†
**BẮT BUỘC đọc `AGENTS.md` cũ từng repo trước:** (a) luật tuỳ biến người viết → engine chỉ VÁ thêm (kiểm diff chỉ-thêm như #04 bẫy 3); (b) file notice/tooling sinh (kiểu `teamworkflow`) → DỪNG repo, hỏi user; (c) template não cũ → engine vá bình thường. Sau engine: điền não nội-dung-thật (chống não giả) như #05.

### Lô 4c — Não hóa mới ~37 repo trắng 🟠 (chờ user chốt plan.md câu hỏi 3)

30 repo G4-trắng + 5 repo G1 sau init (`control-chrome/facebook/pc/telegram/zalo`) + các repo G2 sau baseline (`1seed`, `AI-input`, `auto-hot-key`, `bi-kip-luyen-agent`, `coding-orchestrator`, `congquyengop.vn`, `control-PC-by-chatweb-ai`, `docker`, `manage-fitc84`, `RE-Kit`).
Đây là sinh MỚI hoàn toàn (không có não cũ → không rủi ro não song trùng), nhưng vẫn phải: đọc README/code chính để điền `memory-distill.txt`/`project-intro.md`/`index.md` nội dung thật; `current_version` lấy từ manifest thật (`package.json`/`pyproject.toml`) hoặc `0.1.0` kèm `current_version_source`. Mỗi repo 1 commit `feat(brain): adopt brain template v1.2.0`.

### Lô 4d — 5 repo có `DOCS`/`Plan` viết hoa 🔴 (thủ tục riêng TRƯỚC khi engine chạy)

`control-codex`, `control-LDplayer`, `ViDiaNorm`, `xoayproxy` (+ `brain4agent` mới thuộc P05, không làm).
Trước engine: grep toàn repo tham chiếu `DOCS/`, `Plan/` (path cứng trong code/docs/CI). Có tham chiếu → tự đổi tên bằng `git mv` + sửa MỌI tham chiếu trong CÙNG commit, rồi mới chạy engine; không tham chiếu → để engine tự đổi (log nó in ra làm bằng chứng). `ViDiaNorm` đang bẩn 294 file — chỉ làm khi P03 kết luận phần bẩn không giao.

### Lô 4e — Việc thừa kế đặc thù 🔴

- `CausalAgent` GĐ2 (#05 SPEC-P06): sau baseline P02 → dọn root theo bảng ánh xạ gốc, grep tham chiếu từng file + smoke Python (`python -m compileall .` và/hoặc chạy `run_critique.py --help`), commit riêng.
- `teamworkflow`: shim đã chuẩn; `AGENTS.md` là Next.js notice — **HỎI USER** chọn: (a) đắp bộ luật não vào cuối file hiện có (engine fallback phụ lục), (b) tách notice ra file khác + AGENTS.md chuẩn, (c) bỏ qua. KHÔNG tự quyết.

## Nghiệm thu (điền khi thực thi)

- Bảng per-repo: lô · hành động · SHA · V1–V7 · lệch-có-chủ-đích nếu có.
- [ ] Chạy lại script kiểm kê toàn kho: não chuẩn ≥ 64/67 (trừ `aiedu4vn` không đụng vẫn tính là chuẩn sẵn, `brain4agent` mới + trường hợp user bỏ qua ở 4e).
