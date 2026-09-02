# AGENTS.md — Quy Tắc Quản Trị & Giao Thức Khởi Động Cho AI Agent

Tệp này là kim chỉ nam tối thượng của dự án. Mọi AI Agent khi bước vào workspace này **BẮT BUỘC** phải tuân thủ nghiêm ngặt các quy tắc và giao thức dưới đây.

Đoạn riêng #1: dự án này có quy ước bổ sung ngoài khung, agent phải đọc kèm.

---

## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)

Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:

1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy kiểm tra/đồng bộ não bộ qua skill `.xay-dung-nao-bo` (`node {{BRAIN_GLOBAL_SCRIPT}}`) để đảm bảo toàn bộ hệ thống Não Bộ luôn đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào.
2. **Bước 1 (Đọc Kernel Hiện Trạng):** Mở và đọc tệp [`brain4agent/memory-distill.txt`](file:///brain4agent/memory-distill.txt) để nắm bắt kernel hiện trạng, tech stack và quy tắc bất biến.
3. **Bước 2 (Định tuyến thông minh & Đọc Codebase Map):** Đọc [`brain4agent/index.md`](file:///brain4agent/index.md) để:
   - Nắm toàn bộ **Bản đồ cấu trúc mã nguồn (Codebase Map)**, khu vực kế hoạch [`planning/`](file:///planning) và các Entry Points.
   - Xác định chính xác tài liệu chuyên trách liên quan đến tác vụ đang được giao tại [`docs/`](file:///docs).
4. **Bước 3 (Kiểm chứng mã nguồn):** Luôn đối chiếu code thực tế trong repo trước khi tin tưởng tuyệt đối vào tài liệu cũ.

---

## 🧠 2. MA TRẬN PHÂN VÙNG NÃO BỘ BẤT BIẾN (Brain Partitioning Matrix)

Bộ nhớ dự án trong `brain4agent/` được tổ chức theo kiến trúc **Đa tầng (Hot/Cold Memory)** gồm **7 phân vùng chức năng cố định** và **Phân khu Ký ức Nóng (`memory/hot/`)**. Tuyệt đối **KHÔNG TỰ Ý TẠO THÊM FILE TÙY TIỆN NGOÀI ROOT HAY TRONG `brain4agent/`**:

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

## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (`planning/`) — SPEC-FIRST BẮT BUỘC

Mọi đề xuất nâng cấp tính năng lớn, tái cấu trúc hoặc thêm module mới phải được quản lý tập trung trong thư mục **[`planning/`](file:///planning)** tại root repository:

1. **Quy tắc đặt tên thư mục kế hoạch:**
   - **Định dạng chuẩn:** `planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/` *(Ví dụ: `planning/01_2026-08-28_ui-native-v02/`)*.
   - **Quy tắc STT:** 2 chữ số (`01`, `02`, ..., `99`) tăng dần theo thời gian thực tế.
   - **Quy tắc tên ngắn (2-3 từ):** Giữ độ dài thư mục trong khoảng 25 - 35 ký tự.
   - **Cố định đường dẫn (Path Invariant):** Không đổi tên thư mục khi hoàn thành.
2. **BẮT BUỘC DẠNG SPEC PACKAGE — CẤM PLAN PHẲNG/MỎNG (luật chốt 2026-09-01):**
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
3. **Quy tắc Phân Tầng Mô Hình (Model Tiering Tagging):**
   - 🔴 **Tier Đỏ (Strongest):** Thiết kế kiến trúc nền tảng, Data Contracts, Security (Ưu tiên mô hình mạnh nhất như Claude 3.7 / Opus / GPT-4.5).
   - 🟠 **Tier Cam (Standard):** Viết logic tính năng chính, xử lý luồng, Unit tests (Mô hình cân bằng như Sonnet).
   - 🟢 **Tier Xanh (Fast/Cheap):** Tác vụ nhẹ, viết docs, fix chính tả, format code (Mô hình nhanh như Haiku / Flash).
4. **Vòng đời Kế hoạch (Planning Lifecycle):**
   - **Khởi tạo:** Dựng ĐỦ bộ SPEC (mục 2) + nhúng Checklist thực thi vào `plan.md` và chờ duyệt.
   - **Thực thi:** Tự động check `[x]` vào checklist ngay trong file kế hoạch (không dùng file nháp IDE).
   - **Cổng Nghiệm Thu (Acceptance Gate):** Chạy kiểm tra bắt buộc (`typecheck`, `lint`, `test`) trước khi hoàn tất.
   - **Nghiệm thu (Sign-off):** Cập nhật trạng thái `✅ ĐÃ HOÀN THÀNH`, ghi thời gian hoàn tất chính xác đến từng giây.
   - **Đồng bộ não bộ & tăng phiên bản:** Đưa task vào `Done` trong `roadmap.md`, ghi `changelog.md`, và tăng số phiên bản ở tất cả các file cấu hình.

---

## 🏷️ 4. QUY CHUẨN ĐÁNH SỐ PHIÊN BẢN (Semantic Versioning Standard)

Dự án áp dụng chuẩn **SemVer 2.0.0 (`MAJOR.MINOR.PATCH`)**:
1. **Phân loại tự động:**
   - **`MAJOR` (vX.0.0):** Thay đổi kiến trúc nền tảng, Breaking Changes.
   - **`MINOR` (vx.Y.0):** Thêm tính năng mới, module vệ tinh mới, nâng cấp hệ thống giữ tương thích ngược.
   - **`PATCH` (vx.y.Z):** Sửa lỗi nhỏ, hotfix, tối ưu hiệu năng hoặc tinh chỉnh tài liệu.
2. **Đồng bộ phiên bản (Single Source of Version Truth):**
   - Cập nhật đồng thời tại tất cả các file cấu hình của dự án (`package.json`, `pyproject.toml`, `Cargo.toml`, `tauri.conf.json`...).
   - Ghi nhận mục phát hành mới vào [`brain4agent/changelog.md`](file:///brain4agent/changelog.md).
3. **Bảng quy ước riêng của dự án (ngoài khung):**

| Nhánh | Ai duyệt | Ghi chú |
| :--- | :--- | :--- |
| `main` | chủ dự án | chỉ nhận merge đã review |
| `feat/*` | tác giả | xoá sau khi merge |

Đoạn riêng #2: bảng trên là dữ liệu của người, engine CẤM đụng.

---

## 🛡️ 5. CÁC BỘ LUẬT VẬN HÀNH & ĐỒNG BỘ BẤT BIẾN (Core Governance Invariants)

### A. Quy tắc Quản Trị Bộ Nhớ & Chống Mất Trí Nhớ (Continuous Memory Sync)
1. **Tự động cập nhật đồng thì (Proactive Sync):** Khi hoàn thành một tính năng mới, giải quyết một bug khó, thay đổi API hoặc mốc kiến trúc, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT NGAY** vào phân vùng tương ứng trong `brain4agent/` trước khi hoàn tất phiên làm việc. Tuyệt đối không chờ người dùng nhắc nhở.
2. **Cập nhật đúng phân vùng:**
   - Bug mới / Gotchas mới $\rightarrow$ [`-known-gotchas.md`](file:///brain4agent/-known-gotchas.md).
   - Thêm module / thay đổi cấu trúc code $\rightarrow$ [`index.md`](file:///brain4agent/index.md).
   - Hoàn thành tính năng $\rightarrow$ [`roadmap.md`](file:///brain4agent/roadmap.md).
   - Ý tưởng, giải pháp mở rộng chưa làm ngay $\rightarrow$ Tự động nạp vào **Kho Ý Tưởng (Idea Vault)** trong [`roadmap.md`](file:///brain4agent/roadmap.md).
   - Quyết định kiến trúc lớn $\rightarrow$ [`changelog.md`](file:///brain4agent/changelog.md).
3. **Kernel tinh gọn:** File `brain4agent/memory-distill.txt` luôn giữ vai trò là bản cô đọng cao cấp nhất, duy trì dưới 100 dòng.
4. **Không tạo file ngoài phân vùng:** Cấm tự ý tạo file tài liệu tùy tiện trong `brain4agent/` ngoài 8 phân vùng chuẩn.

### B. Quy Chuẩn Tự Động Đồng Bộ Tài Liệu Khi Thay Đổi Cấu Trúc / Hoàn Thành Kế Hoạch (Mandatory Sync Cascade)
1. **Bắt Buộc Tự Động Rà Soát (Zero-Manual-Reminder):** Khi hoàn thành một Kế hoạch (`planning/`) hoặc thay đổi API, CLI, cấu trúc code, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT ĐỒNG THÌ NGAY LẬP TỨC** theo **Ma Trận Đồng Bộ 6 Điểm**:
   - **Tài liệu Kỹ thuật Module (`docs/<module_name>.md`):** Cập nhật chi tiết kỹ thuật, bảng tham số CLI/API, giải thuật mới.
   - **Bản Đồ Chỉ Mục Não Bộ (`brain4agent/index.md`):** Cập nhật Bản Đồ Cấu Trúc Mã Nguồn (Mục 2) và Router (Mục 1).
   - **Lộ Trình Dự Án (`brain4agent/roadmap.md`):** Chuyển task sang mục `Done`, ghi nhận mốc phát hành, nạp ý tưởng mới vào `Idea Vault`.
   - **Lịch Sử Phiên Bản (`brain4agent/changelog.md`):** Ghi nhận mục phát hành phiên bản mới theo chuẩn SemVer 2.0.0.
   - **Ký Ức Nóng (`brain4agent/memory/hot/`):** Ghi nhận nhật ký phiên (`today.md`) và benchmark thực chiến (`state.json`).
   - **Kernel Hiện Trạng (`brain4agent/memory-distill.txt`):** Cập nhật ngắn gọn vào kernel (duy trì $< 100\text{ dòng}$).

### C. Quy tắc Quản Lý Tài Liệu Module 1-1 Trong `docs/`
1. **Tên tệp chuẩn hóa trùng tên thư mục Module (1-to-1 Match):** Mọi tài liệu kỹ thuật của một module phải được đặt trong thư mục `docs/` với tên tệp **trùng khớp 100% với tên thư mục của module** (`module-tools/<module_name>/` $\rightarrow$ `docs/<module_name>.md`).
2. **Định tuyến tự động:** Khi cần tra cứu, fix bug hoặc nâng cấp module, Agent bắt buộc phải tìm trực tiếp tài liệu tại `docs/<module_name>.md` trước khi thao tác.

### D. Quy tắc Quản Trị Mã Nguồn (Git Commit Prompt & Strict English Standard)
1. **Chủ động đề xuất Commit:** Sau khi hoàn thành một nhiệm vụ, Agent **không được âm thầm bỏ qua** việc lưu trữ mã nguồn.
2. **Hiển thị bảng chọn bằng Tiếng Việt (`ask_question`):** Agent BẮT BUỘC phải dùng công cụ `ask_question` với nội dung câu hỏi và các tùy chọn viết bằng **Tiếng Việt** để người dùng dễ đọc và thao tác.
3. **Nội Dung Commit Bằng Tiếng Anh (Strict English Commit Messages):** Toàn bộ nội dung Git Commit Messages khi được tạo ra BẮT BUỘC 100% phải được soạn thảo hoàn toàn bằng **Tiếng Anh (English)** theo chuẩn Conventional Commits (ví dụ: `feat(module): description`, `fix(module): description`).

### E. Tư Duy Phân Lập Lỗi & Tự Phục Hồi Thích Ứng (Fault Isolation & Recovery Mindset)
1. **Phân lập căn nguyên 4 tầng (Root Cause Isolation):**
   - **Tầng 1 (Hạ tầng / Mạng / Server):** Máy chủ đích nghẽn, CDN rớt kết nối, mã lỗi mạng (502/504/Code 113).
   - **Tầng 2 (DOM & Race Condition):** DOM render chậm, script thư viện chưa bind listener, element đang animation.
   - **Tầng 3 (Anti-bot / Rate-Limit):** Bị chặn IP, quá giới hạn request, phát hiện fingerprint.
   - **Tầng 4 (Thuật toán & Logic Code):** Sai selector, logic xử lý chưa tối ưu.
2. **Tự phục hồi thích ứng:** Tự động retry và khắc phục lỗi Tầng 1/2 trước khi báo lỗi ra ngoài.

### F. Quy tắc Độc Tôn Kho Kỹ Năng Workspace (Single Skill Vault Invariant)
1. TOÀN BỘ các AI Skills liên quan đến việc vận hành dự án **BẮT BUỘC 100% PHẢI NẰM TRONG ĐÚNG KHO CHUẨN** `.agents/skills/<skill_name>/` (chứa `SKILL.md`).
2. **CẤM TUYỆT ĐỐI** tạo thư mục skill tùy tiện tại root workspace (như `skills/`, `.skills/` ngoài root).

### G. Quy tắc Kỷ Luật Root Clean 100% (Zero Root Clutter Invariant)
1. Thư mục root của dự án phải luôn giữ trạng thái sạch sẽ tuyệt đối.
2. **CẤM** tạo các file nháp tạm thời (`latest_memory.md`, `task.md`, script test tạm) trực tiếp ngoài root. Ký ức phiên đưa toàn bộ vào `brain4agent/memory/hot/`.
3. **NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não:** Root được phép có **ĐÚNG MỘT** file `brain4agent-v<x.y.z>.md` (vd `brain4agent-v1.2.0.md`) do `init_brain.js` tự sinh và quản lý — đây là bản soi CHO NGƯỜI để nhìn thấy ngay ở root dự án đang chạy khung não phiên bản nào. **CẤM sửa tay** file này; **CẤM để tồn tại 2 file marker** trở lên (bump version thì script tự xoá bản cũ, sinh bản mới). Nguồn chân lý MÁY ĐỌC là `brain4agent/memory/hot/state.json` → field `brain_template_version`; file `.md` chỉ là bản dẫn xuất, KHÔNG được coi là nguồn chân lý. Field này khác với version DỰ ÁN (`current_version` trong `state.json`, hoặc `package.json`) — tuyệt đối không trộn/ghi đè lẫn nhau.

### H. Quy tắc Giám Sát Tác Vụ Ngầm & Heartbeat Tiết Kiệm Token
1. **Cấm Polling File Log liên tục theo giây:** Tuyệt đối **CẤM** gọi vòng lặp `view_file` lên các tệp log liên tục theo chu kỳ ngắn (1-5s).
2. **Cơ chế Reactive Wakeup:** Để hệ thống tự đánh thức khi task ngầm hoàn tất; nếu cần heartbeat dùng `schedule` với chu kỳ $\ge 45\text{s} - 60\text{s}$.

### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)
1. Root repo BẮT BUỘC đủ 2 file: `AGENTS.md` = nguồn chân lý DUY NHẤT chứa toàn bộ luật; `CLAUDE.md` = shim mỏng ≤10 dòng, chỉ 1 dòng `@AGENTS.md` + ghi chú ngắn, TUYỆT ĐỐI không chứa luật. (ghi chú riêng)
2. Lý do: mỗi hãng agent đọc tên file khác nhau. Claude Code CHỈ auto-load `CLAUDE.md`; Gemini/Codex và agent theo chuẩn `agents.md` đọc `AGENTS.md`. Hai điểm nạp, MỘT nguồn chân lý.
3. CẤM: (a) chép/nhân bản luật sang `CLAUDE.md` → sinh 2 nguồn chân lý lệch nhau; (b) đổi tên `AGENTS.md` (các tài liệu trong repo + agent khác tham chiếu đúng tên này).
4. Khi khởi tạo dự án MỚI hoặc chạy skill `xay-dung-nao-bo`: PHẢI sinh ĐỦ CẢ HAI file, không sinh mỗi một cái.
5. Mở rộng: agent mới đọc tên file riêng (`GEMINI.md`, `.cursorrules`) → thêm shim mỏng trỏ về `AGENTS.md`, KHÔNG nhân bản luật.
6. Giới hạn `@import`: tối đa 4 hop lồng nhau, file ≤4 MiB mới được nạp.
7. Cách kiểm: sửa luật KHÔNG cần đụng `CLAUDE.md`; `CLAUDE.md` phình >10 dòng hoặc chứa câu luật là vi phạm. Kiểm nạp thật bằng `/context` ở phiên MỚI.

---

## 📎 Ghi chú riêng cuối file

Đoạn riêng #3: ví dụ minh hoạ cú pháp mốc — dòng dưới đây THỤT LỀ nên KHÔNG phải
là mốc thật (bất biến M-1: mốc phải chiếm trọn một dòng).

```text
   <!-- brain:rule:boot -->
   …thân luật do engine quản lý…
   <!-- /brain:rule:boot -->
```
