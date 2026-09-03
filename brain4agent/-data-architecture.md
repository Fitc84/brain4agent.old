# Master Data Architecture & Flow

Tài liệu thiết kế về cấu trúc phân vùng dữ liệu, cơ chế lưu trữ bền vững (Persistence Layer) và luồng luân chuyển tri thức của Brain Governance Hub.

---

## 1. Cấu Trúc Bộ Nhớ Đa Tầng (Multi-Tier Memory Stores)

```mermaid
flowchart TD
    subgraph HotZone["🔥 Hot Memory Layer (Dữ liệu phiên động)"]
        TodayLog["today.md (Human-readable Daily Session Log)"]
        StateJson["state.json (Machine-readable State Snapshot)"]
    end

    subgraph ArchiveZone["🧊 Archive Layer — Ký ức Lạnh (memory/archive/)"]
        ArchiveFiles["YYYY-MM-DD.md (nhật ký đã xoay khỏi today.md)"]
    end

    subgraph ColdZone["❄️ Cold Memory Layer (Tri thức bền vững)"]
        Distill["memory-distill.txt (Kernel < 100 dòng)"]
        IndexMap["index.md (Master Router & Codebase Map)"]
        Intro["project-intro.md (Bối cảnh & Tech Stack)"]
        Roadmap["roadmap.md (Active Tasks & Idea Vault)"]
        Changelog["changelog.md (Semantic Releases)"]
        Gotchas["-known-gotchas.md (Bẫy kỹ thuật & Bugs)"]
        DataArch["-data-architecture.md (Kiến trúc & Data Flow)"]
    end

    subgraph External["🌐 Global AI Config Ecosystem"]
        GlobalSkills["C:\\Users\\hoang\\.gemini\\config\\skills\\"]
    end

    HotZone -->|Script xoay ký ức (append-only)| ArchiveZone
    HotZone <--> ColdZone
    ColdZone -->|Deploy via scripts/deploy_skills.ps1| GlobalSkills
```

---

## 2. Ký Ức Lạnh (Cold Archive) — `memory/archive/`

Phân khu lưu trữ nhật ký phiên đã **xoay vòng** ra khỏi `memory/hot/today.md`, mỗi mục nhập là một file `YYYY-MM-DD.md`.

- **CHỈ script xoay ký ức được ghi** (append) vào phân khu này — **CẤM sửa tay**.
- **KHÔNG phải nguồn chân lý hiện trạng**: kernel `memory-distill.txt` và `index.md` mới là nguồn chân lý; `memory/archive/` chỉ để tra cứu lịch sử.
- Engine `init_brain.js` chỉ **tạo thư mục** `memory/archive/` khi thiếu (một trong 8 thư mục được `computePlan` dựng), **KHÔNG sinh `.gitkeep`** — thư mục rỗng không được git theo dõi là đặc tính sẵn có của git, không phải bẫy engine. Engine cũng KHÔNG quản lý/gọi script xoay ký ức.
- **File không đúng mẫu tên** `YYYY-MM-DD.md` (trừ `.gitkeep`) trong `memory/archive/` ⇒ `brain_doctor.js`/`init_brain.js` báo mã kiểm `BRN-017` (Warning, không tự sửa).

---

## 3. Cơ Chế Khối Marker Quản Trị Luật (`AGENTS.md`)

Từ khung não v1.4.0, engine quản lý **6 khối luật bắt buộc** trong `AGENTS.md` (`boot`, `cold-memory`, `spec-package`, `structural-extension`, `root-marker`, `dual-entry`) bằng cặp mốc HTML comment trọn một dòng:

```text
<!-- brain:rule:<id> -->
... nội dung do engine sinh, LÃNH ĐỊA ENGINE — cấm sửa tay ...
<!-- /brain:rule:<id> -->
```

- **Bên trong mốc** là do engine sinh và vá (`patchAgentsMd`) — người dùng **CẤM** sửa tay. Sửa tay ⇒ engine phát hiện trạng thái `edited`, **fail-closed** (không ghi byte nào cho khối đó), báo mã kiểm `BRN-016` (khối marker hỏng / vùng luật bị sửa tay) — cần người xử lý bằng cách khôi phục nội dung hoặc cắt-dán trọn khối sang vị trí khác trong file.
- **Ngoài mọi mốc** là lãnh địa của người dùng — nội dung `AGENTS.md` viết tay, engine không đụng tới.
- Mốc hở (mở mà không đóng, hoặc ≥2 mốc cùng `id`) cũng phân loại `malformed` ⇒ cùng cơ chế fail-closed và `BRN-016`.
- Chi tiết hàm/thuật toán: xem `docs/xay-dung-nao-bo.md` §5.3–5.4 và `planning/10_2026-09-02_va-bang-marker/specs/`.

---

## 4. Luồng Luân Chuyển Dữ Liệu Khi Deploy (Data Flow)

1. **Hub Source Files:**
   - `.xay-dung-nao-bo/` (SKILL.md, scripts/init_brain.js)
   - `.compact/` (SKILL.md)
2. **Safety Validation Gate:** Script `deploy_skills.ps1` kiểm tra tính nguyên vẹn của source code (không có nested duplicate, syntax hợp lệ).
3. **Deployment Target:** Sao chép nguyên khối sang `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo` và `.compact`.
4. **All Projects Execution:** Mọi dự án khác khi gọi `node C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js` sẽ tự động nhận được các luật vận hành mới nhất từ Hub!
