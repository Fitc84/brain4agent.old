# 📜 TỔNG QUAN HỆ THỐNG LUẬT VẬN HÀNH BẤT BIẾN (CORE GOVERNANCE INVARIANTS ARCHIVE)

Tài liệu này là **Bộ Hiến Pháp Chuẩn Mực V5.2** đúc kết toàn bộ các quy tắc vận hành, giao thức khởi động, quản trị kế hoạch Spec-First và tiêu chuẩn kiến trúc cho hệ thống **AI Agent & Não Bộ Đa Tầng (Multi-Tier Hot/Cold Memory Architecture)**. Phục vụ việc nghiên cứu, trích xuất và áp dụng nhất quán cho mọi dự án trong toàn bộ hệ sinh thái.

---

## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (AGENT STARTUP PROTOCOL)

Khi bước vào bất kỳ workspace hoặc phiên làm việc mới nào, Agent **BẮT BUỘC** phải thực hiện tuần tự:

1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy kiểm tra/đồng bộ não bộ qua skill `.xay-dung-nao-bo` (`node C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js`) để đảm bảo toàn bộ hệ thống Não Bộ luôn đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào.
2. **Bước 1 (Đọc Kernel Hiện Trạng):** Mở và đọc tệp [`brain4agent/memory-distill.txt`](file:///brain4agent/memory-distill.txt) để nắm bắt vai trò, tech stack và quy tắc bất biến.
3. **Bước 2 (Định tuyến thông minh & Đọc Codebase Map):** Đọc [`brain4agent/index.md`](file:///brain4agent/index.md) để:
   - Nắm toàn bộ **Bản đồ cấu trúc mã nguồn (Codebase Map)**, khu vực kế hoạch [`planning/`](file:///planning) và các Entry Points.
   - Xác định chính xác tài liệu chuyên trách liên quan đến tác vụ đang được giao tại [`docs/<module_name>.md`](file:///docs).
4. **Bước 3 (Kiểm chứng mã nguồn):** Luôn đối chiếu code thực tế trong repo trước khi tin tưởng tuyệt đối vào tài liệu cũ.

---

## 🧠 2. MA TRẬN PHÂN VÙNG NÃO BỘ ĐA TẦNG V5.2 (HOT/COLD MEMORY MATRIX)

Bộ nhớ dự án trong `brain4agent/` được tổ chức theo kiến trúc **Đa tầng** gồm **7 phân vùng chức năng cố định** và **Phân khu Ký ức Nóng (`memory/hot/`)**:

| Tên File / Thư Mục | Vai trò đơn nhất (Single Responsibility) | Khi nào cần đọc / cập nhật? |
| :--- | :--- | :--- |
| **`memory/hot/`** (`today.md`, `state.json`) | **Ký ức nóng phiên gần nhất**. Trạng thái máy (JSON) & nhật ký phiên làm việc trong ngày. | Đọc khi cần nắm bắt nhanh bối cảnh phiên trước; Cập nhật vào cuối mỗi phiên làm việc. |
| **`memory-distill.txt`** | **Kernel hiện trạng** (< 100 dòng). Bản cô đọng cao cấp nhất về tech stack, vai trò và protocol. | Đọc đầu tiên mọi phiên làm việc; Cập nhật khi đổi kiến trúc nền tảng. |
| **`index.md`** | **Master Index Map & Router**. Chứa Bản đồ Codebase, Luồng giao tiếp, Bảng Entry Points & Router tài liệu. | Đọc ở Bước 2 để định tuyến; Cập nhật khi thêm thư mục/module/entry point mới. |
| **`project-intro.md`** | **Tổng quan dự án**. Mục tiêu nghiệp vụ, tech stack, triết lý thiết kế. | Đọc khi cần hiểu bối cảnh tổng quan của sản phẩm. |
| **`-data-architecture.md`** | **Cơ sở dữ liệu & Data Flow**. Cấu trúc DB, cơ chế lưu trữ và State Flow. | Đọc/Cập nhật khi thao tác lưu trữ, đồng bộ dữ liệu. |
| **`-known-gotchas.md`** | **Bẫy kỹ thuật & Bugs**. Tổng hợp lỗi khó và các lưu ý dị biệt. | Đọc khi gặp lỗi lạ; Cập nhật ngay khi giải quyết xong một bug dị biệt. |
| **`roadmap.md`** | **Tiến độ, Nhiệm vụ & Kho Ý Tưởng**. Danh sách Active tasks, Idea Vault (Backlog) và việc đã hoàn thành. | Đọc/Cập nhật khi bắt đầu/hoàn thành tính năng hoặc nảy ra ý tưởng mới. |
| **`changelog.md`** | **Lịch sử quyết định & Semantic Releases**. Ghi nhận các quyết định thay đổi kiến trúc và các mốc phiên bản `vX.Y.Z`. | Cập nhật sau mỗi đợt nâng cấp hoặc phát hành phiên bản mới. |

---

## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (SPEC-FIRST PLANNING)

Mọi đề xuất nâng cấp tính năng lớn, tái cấu trúc hoặc thêm module mới phải được quản lý tập trung trong thư mục **[`planning/`](file:///planning)** tại root repository:

### 3.1. BẮT BUỘC DẠNG SPEC PACKAGE — CẤM PLAN PHẲNG

Một kế hoạch KHÔNG được là một file `plan.md` dồn hết mọi thứ. Bắt buộc tách thành **bộ SPEC nhiều file**, mỗi file là MỘT hợp đồng độc lập:
```text
planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan]/
├── plan.md                          # HỒ SƠ kế hoạch (KHÔNG chứa thiết kế — xem mục 2.3)
└── specs/                           # Bản thiết kế chi tiết (Spec-First)
    ├── 00-ARCHITECTURE.md           # Mục tiêu, Non-goals, Bất biến kiến trúc, Router thứ tự đọc
    ├── 01-CONTRACTS.md              # Contracts, Types, Schema/DDL bất biến
    ├── SPEC-Pxx-[Name].md           # Đặc tả từng mảng/bước thực thi cụ thể
    ├── OPERATIONS.md                # Deploy, runbook, thứ tự bắt buộc, rollback
    └── TESTING-ACCEPTANCE.md        # Ma trận test + bằng chứng nghiệm thu + Exit Gates
```
- **2.1. Bộ SPEC tối thiểu:** phải phủ đủ 4 mảng — (a) kiến trúc & bất biến, (b) contract dữ liệu/API/module, (c) vận hành-deploy-rollback, (d) kiểm thử-nghiệm thu. Dự án lớn tách thêm SPEC theo từng tính năng.
- **2.2. Mỗi file SPEC BẮT BUỘC có:** contract chính xác (chữ ký hàm/endpoint/schema, không mô tả chung chung); luật **BẮT BUỘC / CẤM** tường minh, kể cả **"vùng cấm"** (điều đã cân nhắc và quyết định KHÔNG làm, kèm lý do — chống việc agent sau "sửa lại cho tốt hơn"); bảng phân loại lỗi + hành vi bắt buộc của caller cho từng loại; số đo/bằng chứng nghiệm thu thật (không chỉ "test xanh").
- **2.3. `plan.md` CHỈ được chứa:** Metadata Header (mục 3); **Nhật ký quyết định có mốc thời gian** — kèm mục **"Quyết định bị thay thế"** (không xoá lịch sử, không để hai phát biểu ngược nhau cùng sống); phân công Work Packages + Model Tier; checklist thực thi; bảng trỏ sang các file SPEC. **CẤM nhét thiết kế chi tiết vào `plan.md`.**
- **2.4. Exit Gates phải đánh dấu theo môi trường** (vd `✅ local / ⬜ server`) — kế hoạch chỉ được đóng khi mọi gate của môi trường thật chuyển ✅.
- **2.5. NGOẠI LỆ DUY NHẤT:** hotfix/patch nhỏ (`PATCH` SemVer, ≤1 ngày công) được phép chỉ có `plan.md`, nhưng vẫn đủ Metadata + nhật ký quyết định + checklist. Mọi đợt `MINOR`/`MAJOR` bắt buộc đủ bộ SPEC.
- **2.6. Package cũ dạng phẳng** (file `NN-*.md` nằm thẳng trong thư mục kế hoạch, không có `specs/`) được GIỮ NGUYÊN theo Path Invariant — không đổi cấu trúc để tránh gãy tham chiếu; chỉ áp cấu trúc chuẩn cho kế hoạch MỚI.

1. **Quy tắc đặt tên thư mục:**
   - **Định dạng chuẩn:** `planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/` *(Ví dụ: `planning/01_2026-08-28_ui-native-v02/`)*.
   - **Quy tắc STT:** Bắt buộc 2 chữ số (`01`, `02`, ..., `99`) tăng dần theo thời gian thực tế để tự động sắp xếp theo trình tự.
   - **Độ dài tên:** Giữ độ dài thư mục trong khoảng $25 - 35\text{ ký tự}$.
   - **Cố định đường dẫn (Path Invariant):** Không đổi tên thư mục khi hoàn thành.
2. **Metadata Header Chuẩn Hóa:**
   ```markdown
   # KẾ HOẠCH NÂNG CẤP: [TÊN TÍNH NĂNG] (#[STT])
   - **STT KẾ HOẠCH:** #[STT]
   - **TRẠNG THÁI:** 🟡 PLANNING | 🔵 IN PROGRESS | ✅ COMPLETED
   - **THỜI GIAN BẮT ĐẦU:** YYYY-MM-DD HH:mm:ss
   - **THỜI GIAN HOÀN TẤT:** YYYY-MM-DD HH:mm:ss
   - **PHIÊN BẢN MỤC TIÊU:** vX.Y.Z (MAJOR / MINOR / PATCH)
   ```

### 3.2. Quy Tắc Gắn Thẻ Phân Tầng Mô Hình (Model Tier Tagging)
Nhằm tối ưu hóa chi phí token và đảm bảo chất lượng kỹ thuật, mỗi bước trong kế hoạch được gắn thẻ phân cấp mô hình:
- 🔴 **Tier Đỏ (Strongest / Architecture Tier):** Dùng mô hình mạnh nhất (Claude 3.7 / Opus / GPT-4.5) để thiết kế kiến trúc nền tảng, Data Contracts, Security & Router.
- 🟠 **Tier Cam (Standard / Feature Tier):** Dùng mô hình cân bằng (Sonnet) để code tính năng, nghiệp vụ chính, luồng xử lý và Unit tests.
- 🟢 **Tier Xanh (Fast / Utility Tier):** Dùng mô hình siêu tốc và rẻ (Haiku / Flash) cho các tác vụ nhẹ, viết docs, format mã nguồn, fix chính tả.

### 3.3. Cổng Nghiệm Thu Chặt Chẽ (Acceptance Gate)
- Không được tùy tiện check `[x]` nếu chưa vượt qua toàn bộ lệnh kiểm tra bắt buộc:
  ```bash
  npm run typecheck && npm run lint && npm test
  ```
- Báo cáo trung thực: Test fail thì báo cáo nguyên văn lỗi và phân tích nguyên nhân, không báo cáo "hoàn tất ảo".

---

## 🏷️ 4. QUY CHUẨN ĐÁNH SỐ PHIÊN BẢN (SEMVER 2.0.0)

Dự án áp dụng chuẩn **SemVer 2.0.0 (`MAJOR.MINOR.PATCH`)**:
1. **Phân loại tự động:**
   - **`MAJOR` (vX.0.0):** Thay đổi kiến trúc nền tảng, Breaking Changes.
   - **`MINOR` (vx.Y.0):** Thêm tính năng mới, module vệ tinh mới, nâng cấp hệ thống giữ tương thích ngược.
   - **`PATCH` (vx.y.Z):** Sửa lỗi nhỏ, hotfix, tối ưu hiệu năng hoặc tinh chỉnh tài liệu.
2. **Đồng bộ phiên bản (Single Source of Version Truth):**
   - Cập nhật đồng thời tại tất cả các file cấu hình của dự án (`package.json`, `tauri.conf.json`, `Cargo.toml`, `pyproject.toml`...).
   - Ghi nhận mục phát hành mới vào [`brain4agent/changelog.md`](file:///brain4agent/changelog.md).

---

## 🛡️ 5. BỘ LUẬT VẬN HÀNH & ĐỒNG BỘ BẤT BIẾN (CORE INVARIANTS)

### 📌 LUẬT 1: Quản Trị Bộ Nhớ & Chống Mất Trí Nhớ (Continuous Memory Sync)
- **Tự động cập nhật đồng thì (Proactive Sync):** Khi hoàn thành một tính năng mới, giải quyết một bug khó, thay đổi API hoặc mốc kiến trúc, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT NGAY** vào phân vùng tương ứng trong `brain4agent/` trước khi hoàn tất phiên làm việc. Tuyệt đối không chờ người dùng nhắc nhở.
- **Cập nhật đúng phân vùng:**
  - Bug mới / Gotchas mới $\rightarrow$ [`-known-gotchas.md`](file:///brain4agent/-known-gotchas.md).
  - Thêm module / thay đổi cấu trúc code $\rightarrow$ [`index.md`](file:///brain4agent/index.md).
  - Hoàn thành tính năng $\rightarrow$ [`roadmap.md`](file:///brain4agent/roadmap.md).
  - Ý tưởng, giải pháp mở rộng chưa làm ngay $\rightarrow$ Tự động nạp vào **Kho Ý Tưởng (Idea Vault)** trong [`roadmap.md`](file:///brain4agent/roadmap.md).
  - Quyết định kiến trúc lớn $\rightarrow$ [`changelog.md`](file:///brain4agent/changelog.md).
- **Kernel tinh gọn:** [`memory-distill.txt`](file:///brain4agent/memory-distill.txt) duy trì dưới 100 dòng.

### 📌 LUẬT 2: Ma Trận Đồng Bộ Bắt Buộc 6 Điểm (Mandatory Sync Cascade)
- Khi hoàn thành 1 Kế hoạch (`planning/`) hoặc thay đổi API, CLI, cấu trúc code, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT ĐỒNG THÌ NGAY LẬP TỨC** theo **Ma Trận Đồng Bộ 6 Điểm**:
  1. **`docs/<module_name>.md`:** Cập nhật chi tiết kỹ thuật, bảng tham số CLI/API, giải thuật mới.
  2. **`brain4agent/index.md`:** Cập nhật Bản Đồ Cấu Trúc Mã Nguồn (Mục 2) và Router (Mục 1).
  3. **`brain4agent/roadmap.md`:** Chuyển task sang mục `Done`, ghi nhận mốc phát hành, nạp ý tưởng mới vào `Idea Vault`.
  4. **`brain4agent/changelog.md`:** Ghi nhận mục phát hành phiên bản mới theo chuẩn SemVer 2.0.0.
  5. **`brain4agent/memory/hot/` (`today.md`, `state.json`):** Ghi nhận nhật ký phiên và benchmark thực chiến.
  6. **`brain4agent/memory-distill.txt`:** Cập nhật kernel hiện trạng (duy trì $< 100\text{ dòng}$).

### 📌 LUẬT 3: Quản Lý Tài Liệu Module 1-1 Trong `docs/` (Module Documentation Governance)
- **Tên tệp chuẩn hóa trùng tên thư mục Module (1-to-1 Match):** Mọi tài liệu kỹ thuật của một module phải được đặt trong thư mục `docs/` với tên tệp trùng khớp $100\%$ với tên thư mục của module (`module-tools/<module_name>/` $\rightarrow$ `docs/<module_name>.md`).
- **Định tuyến tự động:** Khi cần tra cứu, fix bug hoặc nâng cấp module, Agent bắt buộc phải tìm trực tiếp tài liệu tại `docs/<module_name>.md` trước khi thao tác.

### 📌 LUẬT 4: Quản Trị Git Commit (Interactive Prompt in Vietnamese & Strict English Commits)
- **Chủ động đề xuất Commit:** Sau khi hoàn thành một nhiệm vụ, Agent không được âm thầm bỏ qua việc lưu trữ mã nguồn.
- **Bảng chọn Tiếng Việt (`ask_question`):** Nội dung câu hỏi và các tùy chọn viết bằng Tiếng Việt để người dùng dễ thao tác.
- **Nội Dung Commit Bằng Tiếng Anh ($100\%$ Strict English Conventional Commits):** Toàn bộ commit message bắt buộc viết bằng Tiếng Anh (ví dụ: `feat(scope): description`, `fix(scope): description`).

### 📌 LUẬT 5: Độc Tôn Kho Kỹ Năng Workspace (Single Skill Vault Invariant)
- Toàn bộ các AI Skills liên quan đến việc vận hành dự án bắt buộc $100\%$ phải nằm trong đúng kho chuẩn `.agents/skills/<skill_name>/` (chứa `SKILL.md`).
- Cấm tuyệt đối tạo thư mục skill tùy tiện ngoài root (như `skills/`, `.skills/` ngoài root).

### 📌 LUẬT 6: Kỷ Luật Root Clean 100% (Zero Root Clutter Invariant)
- Thư mục root của dự án phải luôn giữ trạng thái sạch sẽ tuyệt đối.
- Cấm để các file nháp `latest_memory.md`, `task.md`, script tạm thời ngoài thư mục root. Ký ức phiên đưa toàn bộ vào `brain4agent/memory/hot/`.
- **Ngoại lệ tường minh — Marker Phiên Bản Khung Não:** Root được phép có **ĐÚNG MỘT** file `brain4agent-v<x.y.z>.md` do `init_brain.js` tự sinh/quản lý (bản soi cho người, cho biết ngay ở root dự án đang chạy khung não phiên bản nào). Cấm sửa tay; cấm tồn tại 2 file marker trở lên — bump version thì script tự xoá bản cũ, sinh bản mới. Nguồn chân lý máy đọc là `brain4agent/memory/hot/state.json` → `brain_template_version`; file `.md` chỉ là bản dẫn xuất. Khác biệt tuyệt đối với version DỰ ÁN (`current_version`/`package.json`) — không trộn/ghi đè lẫn nhau.

### 📌 LUẬT 7: Tư Duy Phân Lập Lỗi 4 Tầng & Tự Phục Hồi Thích Ứng (Fault Isolation)
- **Tầng 1 (Hạ tầng / Mạng / Server):** 502, 504, timeout kết nối, rớt socket $\rightarrow$ Cơ chế Exponential Backoff & Retry.
- **Tầng 2 (DOM & Race Condition):** DOM render trễ, listener chưa bind $\rightarrow$ Wait for selector / MutationObserver.
- **Tầng 3 (Anti-bot / Rate Limit):** Cloudflare captcha, WAF $\rightarrow$ Nhận diện, hạ tốc độ hoặc yêu cầu xác minh an toàn.
- **Tầng 4 (Logic Code):** Sai thuật toán, type error $\rightarrow$ Sửa code theo Spec.

### 📌 LUẬT 8: Giám Sát Tác Vụ Ngầm & Heartbeat Tiết Kiệm Token
- Cấm Polling `view_file` liên tục theo chu kỳ ngắn (1-5s).
- Sử dụng Reactive Wakeup hoặc `schedule` heartbeat chu kỳ $\ge 45\text{s} - 60\text{s}$.

### 📌 LUẬT 9: Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)
- Root repo BẮT BUỘC đủ 2 file: `AGENTS.md` = nguồn chân lý DUY NHẤT chứa toàn bộ luật; `CLAUDE.md` = shim mỏng $\le 10$ dòng, chỉ 1 dòng `@AGENTS.md` + ghi chú ngắn, TUYỆT ĐỐI không chứa luật.
- Lý do: mỗi hãng agent đọc tên file khác nhau. Claude Code CHỈ auto-load `CLAUDE.md`, KHÔNG đọc `AGENTS.md`; Gemini/Codex và agent theo chuẩn `agents.md` đọc `AGENTS.md`. Hai điểm nạp, MỘT nguồn chân lý.
- Cấm: chép/nhân bản luật sang `CLAUDE.md` (sinh 2 nguồn chân lý lệch nhau); đổi tên `AGENTS.md`.
- Khi khởi tạo dự án MỚI hoặc chạy skill `.xay-dung-nao-bo`: PHẢI sinh ĐỦ CẢ HAI file.
- Mở rộng cho agent khác đọc tên file riêng (`GEMINI.md`, `.cursorrules`...): thêm shim mỏng trỏ về `AGENTS.md`, KHÔNG nhân bản luật. Giới hạn `@import`: tối đa 4 hop lồng nhau, file $\le 4\text{ MiB}$.
