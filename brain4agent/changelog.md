# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của **brain4agent**.

## [v1.2.1] - 2026-08-31: POSIX Newline Hotfix + Rollout Khung Não v1.2.0 Ra Hệ Sinh Thái
### Fixed
- **`state.json` thiếu newline cuối file (user phát hiện khi duyệt pilot):** cả hai chỗ ghi `state.json` trong `init_brain.js` dùng `JSON.stringify(..., null, 2)` không kèm `'\n'` → mọi repo được vá sẽ mang vết `\ No newline at end of file` vĩnh viễn trong git diff. Sửa cả hai thành `+ '\n'`; rà toàn bộ điểm ghi file khác (`CLAUDE.md`, marker, `AGENTS.md`, `today.md`) — đều đã kết thúc `0a`, không cần sửa.
- Thêm chẩn đoán `hasStateJsonTrailingNewline` vào `isFullyStandard` + mở rộng nhánh vá state.json (ghi lại khi thiếu newline dù version đã đúng) — để repo đã "NÃO ĐÃ OK" vẫn tự sửa được newline khi chạy lại. Kiểm chứng: chạy lại trên `brain4agent.old` và `control-claude-code` → tail byte `0a`, chạy lần 2 báo OK (idempotent).
- **Quyết định:** GIỮ `BRAIN_TEMPLATE_VERSION = 1.2.0` (không bump) vì nội dung sinh ra không đổi về bản chất — tránh churn đổi tên marker trên 9 repo vừa commit. Version DỰ ÁN bump v1.2.1.

### Added
- **Rollout khung não v1.2.0 ra hệ sinh thái (kế hoạch #04):** vá + commit local 9 repo Nhóm A (`control-claude-code` pilot `eeba58a`, `ai-news-radar`, `control-9router`, `control-chatgpt-web`, `control-linux-server`, `fitc84.com`, `router4vn`, `translate4ide`, `wikiultra`); 9 repo bỏ qua vì working tree bẩn; `teamworkflow` (Nhóm B) bỏ qua — CLAUDE.md là shim chuẩn nhưng repo chưa có commit nào và AGENTS.md chỉ là Next.js tooling notice. KHÔNG push repo nào. Chi tiết + bằng chứng: [`planning/04_2026-08-31_rollout-ecosystem/plan.md`](file:///planning/04_2026-08-31_rollout-ecosystem/plan.md).
- Xác nhận thực chiến cơ chế fallback phụ lục của P09: 2 repo có `AGENTS.md` không theo cấu trúc chuẩn (`control-chatgpt-web`, `translate4ide`) được vá qua "PHỤ LỤC TỰ ĐỘNG VÁ" cuối file, diff chỉ-thêm-không-xoá.
- **Đợt bổ sung — xử lý 4 repo không có git riêng:** `control-keypassxc`, `control-router`, `control-syncthing`, `control-tailscale` được vá kèm bản lưu thủ công (`AGENTS.md` + `state.json`) và kiểm chứng bằng *subsequence check* thay cho `git diff` (`onlyAdditions=True` cả 4, `lostStateKeys=0`); không `git init`, không commit. Nâng tổng số repo đã xử lý lên 13/19.
- Hai gotcha mới trong `-known-gotchas.md`: (4) `git -C` leo lên repo cha làm audit hàng loạt đo sai trạng thái repo con — cách phát hiện bằng `rev-parse --show-toplevel` + `check-ignore`; (5) phân biệt *unborn branch* với *detached HEAD* qua `.git/HEAD` (`ref:` vs SHA trần).

### Corrected
- **Đo sai ở đợt 1:** 4 repo trên bị ghi nhận nhầm là "bẩn 341 file" nên bỏ qua oan — thực chất `git -C` đang báo trạng thái của repo cha `D:\Data\Repositories`. Đã đo lại và xử lý dứt điểm.
- **Đính chính phân loại:** `control-discord` và `teamworkflow` không phải *detached HEAD* mà là *unborn branch* (chưa có commit nào); kết luận bỏ qua giữ nguyên nhưng lý do được ghi lại chính xác để lần sau không né nhầm.

## [v1.2.0] - 2026-08-31: Brain Version Marker (Nhìn Thấy Ngay Phiên Bản Khung Não Ở Root)
### Added
- **Nguồn chân lý máy đọc:** thêm field `brain_template_version` vào `brain4agent/memory/hot/state.json` — tách bạch tuyệt đối với `current_version` (version DỰ ÁN). `init_brain.js` tự vá field này vào state.json đã có mà không đụng field khác.
- **Bản soi cho người:** `init_brain.js` sinh marker `brain4agent-v<x.y.z>.md` ở root (nội dung chuẩn, dẫn xuất từ `state.json`). Cưỡng chế ĐÚNG MỘT file: trước khi ghi, script glob tìm và xoá mọi `brain4agent-v*.md` khác version; nếu bản đúng version đã tồn tại thì không ghi lại (idempotent).
- **Chẩn đoán mở rộng:** thêm `hasBrainVersionMarker` (so khớp đúng tên file + đúng 1 file duy nhất) vào khối chẩn đoán và điều kiện `isFullyStandard` của `init_brain.js` — dự án cũ thiếu marker hoặc marker sai version bị phát hiện và tự vá khi chạy lại.
- **Luật quản trị:** nhúng ngoại lệ tường minh vào §5.G (`AGENTS.md`) và LUẬT 6 (`CORE_GOVERNANCE_RULES.md`) + template `fullAgentsMdContent` sinh bởi `init_brain.js`, để dự án mới khởi tạo đã có luật đúng ngay từ đầu.
- Cập nhật sơ đồ cây thư mục trong template `index.md` sinh bởi `init_brain.js`, thêm dòng marker.
- Dogfooding: chính repo `brain4agent.old` có `brain4agent-v1.2.0.md` ở root và `state.json` có `brain_template_version: "1.2.0"`.
- Kế hoạch chi tiết & bằng chứng kiểm chứng: [`planning/03_2026-08-31_brain-version-marker/plan.md`](file:///planning/03_2026-08-31_brain-version-marker/plan.md).

### Fixed
- **Lỗi báo-ổn-sai (silent false-OK) phát hiện qua kiểm chứng độc lập:** `init_brain.js` chỉ nhúng ngoại lệ §5.G mục 3 (Marker) và Luật J (Dual Entry-Point Invariant) vào `AGENTS.md` khi sinh **mới**, KHÔNG vá vào `AGENTS.md` **đã tồn tại** của dự án cũ — cùng lớp lỗi với sự cố Luật J ở v1.1.0 (đã vá CLAUDE.md nhưng bỏ sót AGENTS.md text). Hệ quả: script báo "NÃO ĐÃ OK" trong khi luật cho phép marker tồn tại đang vắng mặt, khiến một đợt Root Clean audit khác có thể xoá nhầm marker.
- Thêm chẩn đoán `hasRootMarkerException` và `hasDualEntryPointLawInAgentsMd` (dò bằng chuỗi ổn định `Marker Phiên Bản Khung Não` / `Dual Entry-Point Invariant`, không dò theo số dòng) vào điều kiện `isFullyStandard`.
- `init_brain.js` giờ tự vá cả hai luật vào `AGENTS.md` đã tồn tại nếu thiếu (chèn vào đúng section §5.G / mục J theo cấu trúc chuẩn, có fallback phụ lục cuối file nếu cấu trúc khác chuẩn), idempotent — chạy lại không nhân đôi đoạn luật.
- Kiểm chứng bằng 3 ca thật (Ca A: dự án cũ thiếu cả 2 luật → vá và KHÔNG báo OK ở lần đó; Ca B: chạy lại → idempotent, báo OK; Ca C: dự án trắng không hồi quy) — chi tiết trong `planning/03_2026-08-31_brain-version-marker/plan.md`.

## [v1.1.0] - 2026-08-31: Dual Entry-Point Invariant (CLAUDE.md Shim Fix)
### Fixed
- **Lỗi nghiêm trọng đã xác minh:** Claude Code CHỈ tự động nạp `CLAUDE.md`, KHÔNG đọc `AGENTS.md` (theo docs chính thức code.claude.com/docs/en/memory.md). `init_brain.js` cũ chỉ sinh `AGENTS.md` → mọi dự án mới khởi tạo qua skill này bị Claude Code bỏ qua toàn bộ luật quản trị một cách im lặng.
- Sửa dòng sai sự thật trong sơ đồ cây thư mục (`index.md` template, `README.md`, `brain4agent/index.md`): bỏ câu khẳng định sai "AGENTS.md nạp tự động khi khởi động phiên".

### Added
- **Luật J / LUẬT 9 — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant):** nhúng vào `AGENTS.md`, `CORE_GOVERNANCE_RULES.md` và template governance sinh bởi `init_brain.js`. Quy định `AGENTS.md` là nguồn chân lý DUY NHẤT, `CLAUDE.md` là shim mỏng ≤10 dòng chỉ chứa `@AGENTS.md`.
- `init_brain.js`: sinh/vá tự động `CLAUDE.md` (idempotent), thêm `hasClaudeMd` vào chẩn đoán và điều kiện `isFullyStandard` để phát hiện + tự sửa các dự án cũ thiếu shim.
- Dogfooding: tạo `CLAUDE.md` ở root chính repo `brain4agent.old`.
- Kế hoạch chi tiết & bằng chứng kiểm chứng: [`planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md`](file:///planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md).

## [v1.0.1] - 2026-08-28: Single Skill Vault Alignment & Project Identity Standard
### Added
- Khởi tạo `package.json` định danh chính thức dự án **`brain4agent v1.0.1`** (Single Source of Version Truth).
- Thêm npm scripts: `npm run init-brain` và `npm run deploy`.

### Changed
- Di dời toàn bộ skills gốc (`.xay-dung-nao-bo`, `.compact`) vào kho chuẩn `.agents/skills/`.
- Cập nhật `scripts/deploy_skills.ps1` đồng bộ từ `.agents/skills/` sang Global Config.
- Cập nhật toàn bộ tài liệu dự án, `AGENTS.md`, `README.md` theo chuẩn định danh `brain4agent v1.0.1`.

---

## [v1.0.0] - 2026-08-28: Universal Brain Governance Hub Modernization
### Added
- Trang bị hệ thống Bộ Nhớ Đa Tầng `brain4agent/` và `AGENTS.md` cho chính Workspace Hub.
- Thêm thư mục `archive/legacy-skills/` lưu trữ các phiên bản tiền thân (`.brain-build`, `.update-brain`).
- Bổ sung quy chuẩn **Spec-First Planning Framework** và **Model Tiering Tagging (🔴/🟠/🟢)** vào `CORE_GOVERNANCE_RULES.md`.
- Thêm cơ chế kiểm tra an toàn tự động (Safe Validation) vào `scripts/deploy_skills.ps1`.
- Cập nhật mã nguồn `.compact/SKILL.md` tuân thủ nghiêm ngặt 100% Root Clean.
- Cập nhật `.xay-dung-nao-bo/scripts/init_brain.js` đồng bộ trọn gói các luật quản trị tinh hoa mới nhất.
