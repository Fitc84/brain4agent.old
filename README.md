# 🧠 TRUNG TÂM NGHIÊN CỨU, PHÁT TRIỂN & BUILD NÃO BỘ (BRAIN GOVERNANCE HUB V5.2)

Thư mục này (`D:\Data\Repositories\.My-Repositories\brain4agent.old`) là **Tổng Hành Dinh Quản Lý & Nâng Cấp Não Bộ (Single Source of Truth for Brain Development & AI Governance)**. Mọi nghiên cứu, tối ưu thuật toán, nâng cấp luật vận hành và phát triển bộ skill lõi (`.xay-dung-nao-bo`, `.compact`) sẽ được hoàn thiện tập trung tại đây trước khi deploy ra toàn bộ hệ sinh thái.

---

## 🎯 1. VAI TRÒ VÀ TRÁCH NHIỆM CỦA TRUNG TÂM NÀY

1. **Vườn Ươm Kiến Trúc Não Bộ (Architecture Incubator):**
   - Nghiên cứu và hoàn thiện mô hình bộ nhớ AI Đa Tầng (Multi-Tier Hot/Cold Memory Architecture V5.2).
   - Tối ưu hóa dung lượng token và tốc độ phục hồi ngữ cảnh của Agent qua Hot Memory (`today.md` & `state.json`).
2. **Quản Lý & Phát Triển Bộ Hiến Pháp Vận Hành (`CORE_GOVERNANCE_RULES.md`):**
   - Nơi lưu trữ, cập nhật và tinh chỉnh các quy tắc quản trị bất biến (Startup Protocol Bước 0, Spec-First Planning, Model Tiering 🔴/🟠/🟢, Ma trận Đồng bộ 6 điểm, Single Skill Vault, Root Clean 100%...).
3. **Mã Nguồn Gốc Của Bộ Kỹ Năng Não Bộ Chuẩn Toàn Cầu:**
   - Thư mục [`.xay-dung-nao-bo/`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.xay-dung-nao-bo) là source code gốc của Universal Brain Engine V5.2 (tự chẩn đoán, khởi tạo hoặc migration 1-click).
   - Thư mục [`.compact/`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.compact) là source code gốc của Skill nén ngữ cảnh đa tầng bảo đảm Root Clean 100%.
4. **Triển Khai Đồng Bộ Ra Toàn Bộ Hệ Thống (Auto-Deployment):**
   - Cung cấp script tự động deploy mã nguồn skill mới nhất từ đây sang thư mục Global Config của AI (`C:\Users\hoang\.gemini\config\skills\`).

---

## 🚀 2. QUY TRÌNH PHÁT TRIỂN & TRIỂN KHAI NÃO BỘ (WORKFLOW)

```mermaid
flowchart TD
    Idea[💡 Ý tưởng / Nâng cấp Não mới] --> EditHub[🛠️ Chỉnh sửa mã nguồn trong Brain Hub]
    EditHub --> UpdateRules[📜 Cập nhật CORE_GOVERNANCE_RULES.md & init_brain.js]
    UpdateRules --> TestLocal[🧪 Chẩn đoán & Kiểm thử cục bộ]
    TestLocal --> Deploy[🚀 Chạy deploy_skills.ps1]
    Deploy --> GlobalConfig[🌐 Global AI Skills - C:\\Users\\hoang\\.gemini\\config\\skills\\]
    GlobalConfig --> AllProjects[🎯 Áp dụng tự động cho MỌI DỰ ÁN qua lệnh /.xay-dung-nao-bo]
```

### Lệnh Triển Khai Nhanh:
Mỗi khi bạn sửa đổi hoặc nâng cấp code trong thư mục này, chỉ cần chạy:
```powershell
powershell -ExecutionPolicy Bypass -File "scripts\deploy_skills.ps1"
```
Toàn bộ thay đổi sẽ được kiểm tra an toàn và deploy ngay lập tức sang Global AI Config!

---

## 📁 3. CẤU TRÚC THƯ MỤC TRUNG TÂM

```text
brain4agent.old/
├── AGENTS.md                         # [QUY TẮC TỐI THƯỢNG] Nạp tự động khi khởi động phiên
├── README.md                         # [TỔNG QUAN] Bản đồ trung tâm quản lý và hướng dẫn vận hành
├── CORE_GOVERNANCE_RULES.md          # [HIẾN PHÁP CHUẨN] Bộ luật vận hành bất biến toàn diện V5.2
├── brain4agent/                      # [BỘ NHỚ WORKSPACE] Single Source of Truth của Hub
│   ├── memory/hot/                   # [HOT MEMORY] Ký ức nóng phiên (today.md, state.json)
│   ├── memory-distill.txt            # [KERNEL] Bản cô đọng tối thượng (< 100 dòng)
│   ├── index.md                      # [ROUTER] Master Index Map & Codebase Navigation
│   ├── roadmap.md                    # [ROADMAP] Tiến độ, Active tasks & Idea Vault
│   ├── changelog.md                  # [CHANGELOG] Lịch sử Semantic Releases
│   ├── -known-gotchas.md             # [GOTCHAS] Tổng hợp lỗi dị biệt & bẫy kỹ thuật
│   ├── -data-architecture.md         # [DATA ARCH] Kiến trúc dữ liệu & Data Flow
│   └── project-intro.md              # [INTRO] Tổng quan Hub & Tech stack
├── planning/                         # [QUẢN LÝ KẾ HOẠCH] Chứa các bản kế hoạch RFCs
│   └── 01_2026-08-28_modernize-hub-v52/
├── .agents/skills/                   # [WORKSPACE SKILLS] Kho kỹ năng chuyên dụng cục bộ
├── .xay-dung-nao-bo/                 # [MÃ NGUỒN GỐC ENGINE] Universal Brain Engine V5.2
│   ├── SKILL.md                      # Hướng dẫn và định nghĩa Skill
│   └── scripts/init_brain.js         # Script chẩn đoán, build và auto-patch não bộ
├── .compact/                         # [MÃ NGUỒN GỐC COMPACT] Skill nén ngữ cảnh đa tầng V5.2
│   └── SKILL.md
├── archive/                          # [LƯU TRỮ LỊCH SỬ] Các phiên bản cũ để tra cứu
│   └── legacy-skills/                # (.brain-build, .update-brain)
├── docs/                             # [MODULE DOCS] Tài liệu kỹ thuật chi tiết
└── scripts/
    └── deploy_skills.ps1             # [DEPLOY SCRIPT] Script đồng bộ an toàn sang Global AI Skills
```
