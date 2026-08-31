# Project Index Map & Navigation Router

Tệp này là **Bản Đồ Chỉ Mục Trung Tâm (Master Index Map)** của Brain Governance Hub. Mọi AI Agent sử dụng tệp này để định tuyến tài liệu và nắm bắt toàn bộ bản đồ cấu trúc mã nguồn, luồng triển khai và các điểm vào (Entry Points).

---

## 🧭 1. ĐIỀU HƯỚNG TÀI LIỆU & KẾ HOẠCH (Documentation & Planning Router)

Khi nhận nhiệm vụ, Agent tra cứu bảng này để đọc **chính xác** tài liệu chuyên sâu liên quan:

| Lĩnh vực / Nhiệm vụ | Tài liệu chuyên trách | Nội dung chính |
| :--- | :--- | :--- |
| **Chỉ dẫn Agent từ A-Z (Zero-Config)** | [`docs/UNIVERSAL_AGENT_GUIDE.md`](file:///docs/UNIVERSAL_AGENT_GUIDE.md) | Cẩm nang trọn gói từ A-Z hướng dẫn mọi AI Agent tự động xử lý và vận hành. |
| **Ký ức nóng phiên gần nhất** | [`memory/hot/today.md`](file:///brain4agent/memory/hot/today.md) & [`state.json`](file:///brain4agent/memory/hot/state.json) | Trạng thái máy (JSON), nhật ký làm việc theo phiên và kết quả benchmark gần nhất. |
| **Khởi động / Quy tắc chung** | [`memory-distill.txt`](file:///brain4agent/memory-distill.txt) | Kernel hiện trạng, Startup Protocol, Tech stack cốt lõi. |
| **Hiến pháp Quản trị V5.2** | [`CORE_GOVERNANCE_RULES.md`](file:///CORE_GOVERNANCE_RULES.md) | Bộ luật bất biến toàn diện: Startup Protocol, Spec-First, Model Tiering, Sync Cascade. |
| **Tổng quan dự án** | [`project-intro.md`](file:///brain4agent/project-intro.md) | Mục tiêu Hub, kiến trúc tổng thể. |
| **Kế hoạch nâng cấp & RFCs** | [`planning/`](file:///planning) | Thư mục chứa các bản kế hoạch theo chuẩn `[STT]_[YYYY-MM-DD]_[Ten-Ngan]`. |
| **Lỗi khó / Cạm bẫy / Gotchas** | [`-known-gotchas.md`](file:///brain4agent/-known-gotchas.md) | Tổng hợp các bẫy kỹ thuật và lỗi dị biệt đã gặp. |
| **Kiến trúc dữ liệu & Data Flow** | [`-data-architecture.md`](file:///brain4agent/-data-architecture.md) | Cấu trúc phân vùng Não bộ, luồng deploy sang Global AI Skills. |
| **Lộ trình nâng cấp & Ý tưởng** | [`roadmap.md`](file:///brain4agent/roadmap.md) | Active tasks, Kho Ý Tưởng (Idea Vault) và các mốc đã hoàn thành. |
| **Lịch sử cập nhật** | [`changelog.md`](file:///brain4agent/changelog.md) | Lịch sử Semantic Releases (vX.Y.Z). |
| **Tài liệu kỹ thuật module** | [`docs/`](file:///docs) | Thư mục chứa tài liệu chuyên trách 1-1 cho từng module. |

---

### 🛠️ 1.2. Bảng Định Tuyến Kỹ Năng Chuẩn Hóa ([`.agents/skills/`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.agents/skills))

| STT | Kỹ Năng / Module | Vị Trí Mã Nguồn | File Quy Chuẩn | Vai Trò & Chức Năng Cốt Lõi |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `.xay-dung-nao-bo` | [`.agents/skills/.xay-dung-nao-bo/`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.agents/skills/.xay-dung-nao-bo) | [`SKILL.md`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.agents/skills/.xay-dung-nao-bo/SKILL.md) | Universal Brain Engine V5.2: Tự chẩn đoán, khởi tạo hoặc migration não bộ 1-click. |
| **2** | `.compact` | [`.agents/skills/.compact/`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.agents/skills/.compact) | [`SKILL.md`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/.agents/skills/.compact/SKILL.md) | Thu gọn ngữ cảnh vào Hot Memory (`today.md` & `state.json`), bảo đảm Root Clean 100%. |
| **3** | `deploy_skills.ps1` | [`scripts/deploy_skills.ps1`](file:///D:/Data/Repositories/.My-Repositories/brain4agent.old/scripts/deploy_skills.ps1) | - | Script tự động kiểm tra an toàn và deploy sang Global AI Skills & Claude Code Commands. |

---

### 🏷️ 1.3. Marker Phiên Bản Khung Não (Brain Version Marker)

| Thành phần | Vị trí | Vai trò |
| :--- | :--- | :--- |
| **Nguồn chân lý (máy đọc)** | [`memory/hot/state.json`](file:///brain4agent/memory/hot/state.json) → `brain_template_version` | Giá trị version khung não thực sự được tin cậy. Tách bạch với `current_version` (version DỰ ÁN). |
| **Bản soi (cho người)** | `brain4agent-v<x.y.z>.md` ở root | Do `init_brain.js` tự sinh/xoá — nhìn thấy ngay version khung não ở root, không sửa tay. |

---

## 🗺️ 2. BẢN ĐỒ CẤU TRÚC MÃ NGUỒN (Codebase Directory Map)

```text
brain4agent/
├── package.json                      # [VERSION TRUTH] Phiên bản v1.2.0
├── AGENTS.md                         # [QUY TẮC TỐI THƯỢNG] Nguồn chân lý DUY NHẤT (Gemini/Codex đọc trực tiếp)
├── CLAUDE.md                         # [SHIM] Điểm nạp tự động của Claude Code — chỉ chứa @AGENTS.md
├── brain4agent-v1.2.0.md             # [MARKER] Phiên bản khung não — soi nhanh ở root
├── README.md                         # [TỔNG QUAN] Bản đồ trung tâm quản lý và hướng dẫn vận hành
├── CORE_GOVERNANCE_RULES.md          # [HIẾN PHÁP CHUẨN] Bộ luật vận hành bất biến toàn diện
├── brain4agent/                      # [BỘ NHỚ WORKSPACE] Single Source of Truth của Hub
│   ├── memory/hot/                   # [HOT MEMORY] Ký ức nóng phiên (today.md, state.json — chứa brain_template_version)
│   ├── memory-distill.txt            # [KERNEL] Bản cô đọng tối thượng (< 100 dòng)
│   ├── index.md                      # [ROUTER] Master Index Map & Codebase Navigation
│   ├── roadmap.md                    # [ROADMAP] Tiến độ, Active tasks & Idea Vault
│   ├── changelog.md                  # [CHANGELOG] Lịch sử Semantic Releases
│   ├── -known-gotchas.md             # [GOTCHAS] Tổng hợp lỗi dị biệt & bẫy kỹ thuật
│   ├── -data-architecture.md         # [DATA ARCH] Kiến trúc dữ liệu & Data Flow
│   └── project-intro.md              # [INTRO] Tổng quan Hub & Tech stack
├── planning/                         # [QUẢN LÝ KẾ HOẠCH] Chứa các bản kế hoạch RFCs
│   ├── 01_2026-08-28_modernize-hub-v52/
│   ├── 02_2026-08-31_dual-entry-point-claude-shim/
│   └── 03_2026-08-31_brain-version-marker/
├── .agents/skills/                   # [SINGLE SKILL VAULT] Kho kỹ năng chuẩn hóa 100%
│   ├── .xay-dung-nao-bo/             # Universal Brain Engine
│   │   ├── SKILL.md
│   │   └── scripts/init_brain.js
│   └── .compact/                     # Skill nén ngữ cảnh đa tầng
│       └── SKILL.md
├── archive/                          # [LƯU TRỮ LỊCH SỬ] Các phiên bản cũ để tra cứu
│   └── legacy-skills/                # (.brain-build, .update-brain)
├── docs/                             # [MODULE DOCS] Tài liệu kỹ thuật chi tiết
│   ├── UNIVERSAL_AGENT_GUIDE.md      # [A-Z GUIDE] Cẩm nang vận hành toàn diện cho AI Agent
│   ├── BRAIN_ARCHITECTURE_GUIDE.md
│   └── MODULE_DOCUMENTATION_SPEC.md
└── scripts/
    └── deploy_skills.ps1             # [DEPLOY SCRIPT] Script đồng bộ an toàn sang Global AI Skills
```
