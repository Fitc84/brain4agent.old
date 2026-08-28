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

    HotZone <--> ColdZone
    ColdZone -->|Deploy via scripts/deploy_skills.ps1| GlobalSkills
```

---

## 2. Luồng Luân Chuyển Dữ Liệu Khi Deploy (Data Flow)

1. **Hub Source Files:**
   - `.xay-dung-nao-bo/` (SKILL.md, scripts/init_brain.js)
   - `.compact/` (SKILL.md)
2. **Safety Validation Gate:** Script `deploy_skills.ps1` kiểm tra tính nguyên vẹn của source code (không có nested duplicate, syntax hợp lệ).
3. **Deployment Target:** Sao chép nguyên khối sang `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo` và `.compact`.
4. **All Projects Execution:** Mọi dự án khác khi gọi `node C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js` sẽ tự động nhận được các luật vận hành mới nhất từ Hub!
