const fs = require('fs');
const path = require('path');

// Phiên bản khung não (brain4agent template) — DUY NHẤT MỘT NƠI khai báo.
// Mọi chỗ khác trong script này đọc từ hằng số này, KHÔNG hardcode rải rác.
// Đây là version của KHUNG (template engine), khác với version DỰ ÁN (package.json/current_version).
const BRAIN_TEMPLATE_VERSION = '1.3.0';

// Phiên bản ENGINE (mã nguồn công cụ) — KHÁC BRAIN_TEMPLATE_VERSION (phiên bản KHUNG não).
const ENGINE_VERSION = '1.6.0';

const REQUIRED_FILES = [
    'memory-distill.txt',
    'index.md',
    'project-intro.md',
    'roadmap.md',
    'changelog.md',
    '-known-gotchas.md',
    '-data-architecture.md'
];

// -------------------------------------------------------------------------
// LỚP RENDER — hàm THUẦN: không fs, không Date, không console, không process.
// Nội dung template chép NGUYÊN VĂN từ engine v1.5.4 (bất biến A8).
// -------------------------------------------------------------------------
function renderTemplates(version, now) {
const templates = {
    'memory-distill.txt': `<kernel_instructions>
<role>Bạn là Senior Developer/System Architect của dự án này. Nhiệm vụ: giữ kiến trúc sạch, code chuẩn, hiệu năng cao, không thừa logic.</role>

<agent_startup_protocol>
0. [BẮT BUỘC TIÊN QUYẾT] Chạy đồng bộ/boot não bộ qua skill \`.xay-dung-nao-bo\` (\`node C:\\Users\\hoang\\.gemini\\config\\skills\\.xay-dung-nao-bo\\scripts\\init_brain.js\`) để đảm bảo não luôn cập nhật chuẩn mới nhất.
1. Đọc \`brain4agent/memory-distill.txt\` trước khi sửa code.
2. Định tuyến tài liệu: Tra cứu \`brain4agent/index.md\` để lấy bối cảnh. Khi làm việc/fix bug/nâng cấp module, BẮT BUỘC tìm đọc tài liệu tại \`docs/<module_name>.md\` trước.
3. Luôn đối chiếu code thực tế trong repo trước khi tin memory/docs.
4. Sửa tối thiểu, đúng kiến trúc, tuân thủ nghiêm ngặt Spec-First.
5. [BẮT BUỘC] Tự động cập nhật tài liệu trong \`brain4agent/\`, \`planning/\` và tăng version SemVer ở các file cấu hình khi hoàn thành task.
</agent_startup_protocol>

<project_foundation>
- Tech Stack: [Cập nhật công nghệ chính của dự án]
- Data/State: [Cập nhật cơ chế lưu trữ dữ liệu chính]
- Planning & RFCs: Thư mục \`planning/\` lưu trữ các bản kế hoạch theo định dạng \`[STT]_[YYYY-MM-DD]_[Ten-Ngan]\` (25-35 ký tự, cố định path).
</project_foundation>

<brain_file_roles>
- \`memory-distill.txt\`: kernel hiện trạng, đọc đầu tiên.
- \`memory/hot/\`: \`today.md\` (nhật ký phiên) & \`state.json\` (máy trạng thái).
- \`index.md\`: router tài liệu, codebase map & entry points toàn diện.
- \`project-intro.md\`: tổng quan chung về dự án.
- \`roadmap.md\`: To-do list, định hướng tính năng và Kho Ý Tưởng (Idea Vault).
- \`changelog.md\`: decision/history, ghi nhận các mốc Semantic Releases.
- \`-known-gotchas.md\`: Tổng hợp các lỗi khó, lưu ý dị biệt.
- \`-data-architecture.md\`: Kiến trúc Database và Flow dữ liệu.
</brain_file_roles>

<memory_management>
- Source of Truth: 1. Code hiện tại -> 2. Docs commit -> 3. \`memory-distill.txt\` -> 4. \`changelog.md\`.
- SemVer 2.0.0: Tự động phân loại MAJOR (vX.0.0), MINOR (vx.Y.0), PATCH (vx.y.Z) và đồng bộ file cấu hình.
- \`memory-distill.txt\` là kernel hiện trạng, luôn < 100 dòng, ghi đè thay vì append.
- Tự giác đồng bộ tài liệu ngay khi hoàn thành task, không đợi user nhắc.
- Không dùng file nháp task.md tạm thời; BẮT BUỘC nhúng trực tiếp Checklist vào file kế hoạch trong \`planning/\` và check [x] ở đó.
- Toàn bộ skill dự án bắt buộc 100% nằm trong \`.agents/skills/<name>/\` (Single Skill Vault Invariant).
- BẮT BUỘC dùng bảng hỏi bằng Tiếng Việt (\`ask_question\`) để tương tác; commit message 100% Tiếng Anh (Conventional Commits).
- Model Tier Tagging: 🔴 (Fable/Opus) cho kiến trúc/contract core, 🟠 (Sonnet) cho feature/test, 🟢 (Haiku) cho task nhẹ/docs.
- Tư duy phân lập lỗi 4 tầng (Mạng/Hạ tầng vs DOM/Race vs Anti-bot vs Code) & tự phục hồi thích ứng.
</memory_management>
</kernel_instructions>
`,

    'index.md': `# Project Index Map & Navigation Router

Tệp này là **Bản Đồ Chỉ Mục Trung Tâm (Master Index Map)** của dự án. Mọi AI Agent sử dụng tệp này để định tuyến tài liệu và nắm bắt toàn bộ bản đồ cấu trúc mã nguồn, luồng giao tiếp và các điểm vào (Entry Points).

---

## 🧭 1. ĐIỀU HƯỚNG TÀI LIỆU & KẾ HOẠCH (Documentation & Planning Router)

Khi nhận nhiệm vụ, Agent tra cứu bảng này để đọc **chính xác** tài liệu chuyên sâu liên quan:

| Lĩnh vực / Nhiệm vụ | Tài liệu chuyên trách | Nội dung chính |
| :--- | :--- | :--- |
| **Ký ức nóng phiên gần nhất** | [\`memory/hot/today.md\`](file:///brain4agent/memory/hot/today.md) & [\`state.json\`](file:///brain4agent/memory/hot/state.json) | Trạng thái máy (JSON), nhật ký làm việc theo phiên và kết quả benchmark gần nhất. |
| **Khởi động / Quy tắc chung** | [\`memory-distill.txt\`](file:///brain4agent/memory-distill.txt) | Kernel hiện trạng, Startup Protocol, Tech stack cốt lõi. |
| **Tổng quan dự án** | [\`project-intro.md\`](file:///brain4agent/project-intro.md) | Mục tiêu, kiến trúc tổng thể. |
| **Kế hoạch nâng cấp & RFCs** | [\`planning/\`](file:///planning) | Thư mục chứa các bản kế hoạch theo chuẩn \`[STT]_[YYYY-MM-DD]_[Ten-Ngan]\`. |
| **Lỗi khó / Cạm bẫy / Gotchas** | [\`-known-gotchas.md\`](file:///brain4agent/-known-gotchas.md) | Tổng hợp các bẫy kỹ thuật và lỗi dị biệt đã gặp. |
| **Kiến trúc dữ liệu & Data Flow** | [\`-data-architecture.md\`](file:///brain4agent/-data-architecture.md) | Cấu trúc dữ liệu, cơ chế lưu trữ và State Flow. |
| **Lộ trình nâng cấp & Ý tưởng** | [\`roadmap.md\`](file:///brain4agent/roadmap.md) | Active tasks, Kho Ý Tưởng (Idea Vault) và các mốc đã hoàn thành. |
| **Lịch sử cập nhật** | [\`changelog.md\`](file:///brain4agent/changelog.md) | Lịch sử Semantic Releases (vX.Y.Z). |
| **Tài liệu kỹ thuật module** | [\`docs/\`](file:///docs) | Thư mục chứa tài liệu chuyên trách 1-1 cho từng module. |

---

### 🛠️ 1.2. Bảng Định Tuyến Kỹ Năng Chuyên Dụng (Workspace Skills Router - \`.agents/skills/\`)

| STT | Tên Skill (\`.agents/skills/\`) | File Quy Chuẩn (\`SKILL.md\`) | Vai Trò & Chức Năng Cốt Lõi |
| :---: | :--- | :--- | :--- |
| **1** | \`sample-skill\` | \`SKILL.md\` | Kỹ năng mẫu cho workspace. |

---

## 🗺️ 2. BẢN ĐỒ CẤU TRÚC MÃ NGUỒN (Codebase Directory Map)

\`\`\`text
project-root/
├── AGENTS.md                         # [QUY TẮC TỐI THƯỢNG] Nguồn chân lý DUY NHẤT (Gemini/Codex đọc trực tiếp)
├── CLAUDE.md                         # [SHIM] Điểm nạp tự động của Claude Code — chỉ chứa @AGENTS.md
├── brain4agent-v${version}.md   # [MARKER] Phiên bản khung não — soi nhanh ở root
├── README.md                         # Tài liệu giới thiệu và hướng dẫn build dự án
├── brain4agent/                      # [BỘ NHỚ DỰ ÁN] Single Source of Truth
│   ├── memory/hot/                   # [HOT MEMORY] Ký ức nóng phiên (today.md, state.json)
│   ├── memory-distill.txt            # [KERNEL] Bản cô đọng tối thượng (< 100 dòng)
│   ├── index.md                      # [ROUTER] Master Index Map & Codebase Navigation
│   ├── roadmap.md                    # [ROADMAP] Tiến độ, Active tasks & Idea Vault
│   ├── changelog.md                  # [CHANGELOG] Lịch sử Semantic Releases
│   ├── -known-gotchas.md             # [GOTCHAS] Tổng hợp lỗi dị biệt & bẫy kỹ thuật
│   ├── -data-architecture.md         # [DATA ARCH] Kiến trúc dữ liệu & Data Flow
│   └── project-intro.md              # [INTRO] Tổng quan dự án & Tech stack
├── planning/                         # [QUẢN LÝ KẾ HOẠCH NÂNG CẤP] Chứa các bản kế hoạch RFCs
├── .agents/skills/                   # [WORKSPACE SKILLS] Kỹ năng chuyên dụng cục bộ dự án
└── docs/                             # [MODULE DOCS] Tài liệu kỹ thuật chi tiết
\`\`\`
`,

    'project-intro.md': `# Giới Thiệu Dự Án (Project Overview)

## 1. Mục tiêu (Goals & Objectives)
[Mô tả mục tiêu nghiệp vụ chính của sản phẩm]

## 2. Công nghệ cốt lõi (Tech Stack)
- **Frontend / Desktop / Web:** [Framework chính]
- **Backend / Engine:** [Ngôn ngữ / Framework]
- **Data Persistence:** [Cơ sở dữ liệu / JSON / Storage]
`,

    'roadmap.md': `# Roadmap & Active Tasks

File này chứa danh sách các tính năng, mục tiêu sắp tới và tình trạng công việc hiện tại.

## Mục tiêu hiện tại (Active)
- [ ] Khởi tạo nền tảng dự án và hoàn thiện các module ban đầu.

## Tương lai (Upcoming)
- [ ] Mở rộng tính năng và tối ưu hiệu năng.

## 💡 Kho Ý Tưởng & Backlog (Idea Vault)
*Nơi lưu trữ các ý tưởng hay, kiến trúc mở rộng chưa ưu tiên làm ngay nhưng cần giữ lại để tham khảo.*
- [ ] Ý tưởng mở rộng 1

## Đã hoàn thành (Done)
- [x] **Khởi tạo Bộ Nhớ Não Bộ Chuẩn (v1.0.0):** Thiết lập cấu trúc Đa Tầng brain4agent V5.2 và quy chuẩn quản trị AGENTS.md.
`,

    'changelog.md': `# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của dự án.

## [v1.0.0] - ${now.toISOString().split('T')[0]}: Initial Project Scaffolding
### Added
- Khởi tạo kiến trúc dự án và thiết lập hệ thống Bộ Nhớ Não Bộ \`brain4agent/\` Đa Tầng thế hệ mới.
`,

    '-known-gotchas.md': `# Known Gotchas & Bugs

Tổng hợp các lỗi khó, các lưu ý dị biệt hoặc cách workaround đặc thù của dự án này để AI không dẫm lại vết xe đổ.

## Môi trường & Config
- (Chưa có - Cập nhật ngay khi phát hiện bug khó).
`,

    '-data-architecture.md': `# Master Data Architecture & Flow

Tài liệu thiết kế về cấu trúc dữ liệu, cơ chế lưu trữ bền vững (Persistence Layer) và luồng luân chuyển dữ liệu đa tầng.

## 1. Các Tầng Lưu Trữ (Data Persistence Stores)
- [Mô tả các nguồn lưu trữ dữ liệu chính]

## 2. Schema & Data Flow
- [Mô tả cấu trúc Schema và luồng xử lý]
`
};
    return templates;
}

function renderInitialState(version, now) {
    const initialState = {
        "current_version": "1.0.0",
        "brain_template_version": version,
        "system_status": "initialized",
        "last_verification": {
            "timestamp": now.toISOString(),
            "grade": "Grade A Initialized"
        },
        "active_plans_completed": 0
    };
    return JSON.stringify(initialState, null, 2) + '\n';
}

function renderMarker(version, now) {
    const syncDate = now.toISOString().split('T')[0];
    return `# brain4agent v${version}

Bộ khung Não Bộ Đa Tầng sinh ra cấu trúc \`brain4agent/\` của dự án này.

- **Phiên bản khung não:** v${version}
- **Nguồn chân lý (máy đọc):** \`brain4agent/memory/hot/state.json\` → \`brain_template_version\`
- **Ngày đồng bộ:** ${syncDate}
- **Luật quản trị:** \`AGENTS.md\` (nguồn chân lý) · \`CLAUDE.md\` (shim auto-load Claude Code)

> File này do \`init_brain.js\` quản lý — tên file mang version để nhìn thấy ngay ở root.
> KHÔNG sửa tay: bump version thì script xoá bản cũ \`brain4agent-v*.md\` và sinh bản mới.
> Version dự án (khác với version khung não) nằm ở \`VERSION\` / \`package.json\`.
`;
}

function renderTodayMd(now) {
    return `# 📅 Nhật Ký Làm Việc Ngày ${now.toLocaleDateString('vi-VN')} (Session Memory Log)\n\n> Cập nhật lúc: \`${now.toISOString()}\` | Phiên bản: \`v1.0.0\`\n\n---\n\n## 🎯 Thành Tựu Khởi Tạo:\n- Khởi tạo thành công cấu trúc dự án và bộ nhớ Đa Tầng brain4agent V5.2.\n`;
}

function renderClaudeShim() {
    return `# CLAUDE.md — Điểm nạp tự động cho Claude Code

Claude Code CHỈ tự động nạp \`CLAUDE.md\`, không nạp \`AGENTS.md\`. File này chỉ để import luật
tối thượng của dự án, giữ **\`AGENTS.md\` là nguồn chân lý DUY NHẤT**.

**Sửa luật thì sửa trong \`AGENTS.md\`, KHÔNG chép nội dung vào đây.**

@AGENTS.md
`;
}

function renderFullAgentsMd() {
    return `# AGENTS.md — Quy Tắc Quản Trị & Giao Thức Khởi Động Cho AI Agent

Tệp này là kim chỉ nam tối thượng của dự án. Mọi AI Agent khi bước vào workspace này **BẮT BUỘC** phải tuân thủ nghiêm ngặt các quy tắc và giao thức dưới đây.

---

## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)

Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:

1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy kiểm tra/đồng bộ não bộ qua skill \`.xay-dung-nao-bo\` (\`node C:\\Users\\hoang\\.gemini\\config\\skills\\.xay-dung-nao-bo\\scripts\\init_brain.js\`) để đảm bảo toàn bộ hệ thống Não Bộ luôn đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào.
2. **Bước 1 (Đọc Kernel Hiện Trạng):** Mở và đọc tệp [\`brain4agent/memory-distill.txt\`](file:///brain4agent/memory-distill.txt) để nắm bắt kernel hiện trạng, tech stack và quy tắc bất biến.
3. **Bước 2 (Định tuyến thông minh & Đọc Codebase Map):** Đọc [\`brain4agent/index.md\`](file:///brain4agent/index.md) để:
   - Nắm toàn bộ **Bản đồ cấu trúc mã nguồn (Codebase Map)**, khu vực kế hoạch [\`planning/\`](file:///planning) và các Entry Points.
   - Xác định chính xác tài liệu chuyên trách liên quan đến tác vụ đang được giao tại [\`docs/\`](file:///docs).
4. **Bước 3 (Kiểm chứng mã nguồn):** Luôn đối chiếu code thực tế trong repo trước khi tin tưởng tuyệt đối vào tài liệu cũ.

---

## 🧠 2. MA TRẬN PHÂN VÙNG NÃO BỘ BẤT BIẾN (Brain Partitioning Matrix)

Bộ nhớ dự án trong \`brain4agent/\` được tổ chức theo kiến trúc **Đa tầng (Hot/Cold Memory)** gồm **7 phân vùng chức năng cố định** và **Phân khu Ký ức Nóng (\`memory/hot/\`)**. Tuyệt đối **KHÔNG TỰ Ý TẠO THÊM FILE TÙY TIỆN NGOÀI ROOT HAY TRONG \`brain4agent/\`**:

| Tên File / Thư Mục | Vai trò đơn nhất (Single Responsibility) | Khi nào cần đọc / cập nhật? |
| :--- | :--- | :--- |
| **\`memory/hot/\`** (\`today.md\`, \`state.json\`) | **Ký ức nóng phiên gần nhất**. Trạng thái máy (JSON) & nhật ký phiên làm việc trong ngày. | Đọc khi cần nắm bắt nhanh bối cảnh phiên trước; Cập nhật vào cuối mỗi phiên làm việc. |
| **\`memory-distill.txt\`** | **Kernel hiện trạng** (< 100 dòng). Bản cô đọng cao cấp nhất về tech stack, vai trò và protocol. | Đọc đầu tiên mọi phiên làm việc; Cập nhật khi đổi kiến trúc nền tảng. |
| **\`index.md\`** | **Master Index Map & Router**. Chứa Bản đồ Codebase, Luồng giao tiếp, Bảng Entry Points & Router tài liệu. | Đọc ở Bước 2 để định tuyến; Cập nhật khi thêm thư mục/module/entry point mới. |
| **\`project-intro.md\`** | **Tổng quan dự án**. Mục tiêu nghiệp vụ, tech stack, triết lý thiết kế. | Đọc khi cần hiểu bối cảnh tổng quan của sản phẩm. |
| **\`-data-architecture.md\`** | **Cơ sở dữ liệu & Data Flow**. Cấu trúc DB, cơ chế lưu trữ và State Flow. | Đọc/Cập nhật khi thao tác lưu trữ, đồng bộ dữ liệu. |
| **\`-known-gotchas.md\`** | **Bẫy kỹ thuật & Bugs**. Tổng hợp lỗi khó và các lưu ý dị biệt. | Đọc khi gặp lỗi lạ; Cập nhật ngay khi giải quyết xong một bug dị biệt. |
| **\`roadmap.md\`** | **Tiến độ, Nhiệm vụ & Kho Ý Tưởng**. Danh sách Active tasks, Idea Vault (Backlog) và việc đã hoàn thành. | Đọc/Cập nhật khi bắt đầu/hoàn thành tính năng hoặc nảy ra ý tưởng mới. |
| **\`changelog.md\`** | **Lịch sử quyết định & Semantic Releases**. Ghi nhận các quyết định thay đổi kiến trúc và các mốc phiên bản \`vX.Y.Z\`. | Cập nhật sau mỗi đợt nâng cấp hoặc phát hành phiên bản mới. |

---

## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (\`planning/\`) — SPEC-FIRST BẮT BUỘC

Mọi đề xuất nâng cấp tính năng lớn, tái cấu trúc hoặc thêm module mới phải được quản lý tập trung trong thư mục **[\`planning/\`](file:///planning)** tại root repository:

1. **Quy tắc đặt tên thư mục kế hoạch:**
   - **Định dạng chuẩn:** \`planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/\` *(Ví dụ: \`planning/01_2026-08-28_ui-native-v02/\`)*.
   - **Quy tắc STT:** 2 chữ số (\`01\`, \`02\`, ..., \`99\`) tăng dần theo thời gian thực tế.
   - **Quy tắc tên ngắn (2-3 từ):** Giữ độ dài thư mục trong khoảng 25 - 35 ký tự.
   - **Cố định đường dẫn (Path Invariant):** Không đổi tên thư mục khi hoàn thành.
2. **BẮT BUỘC DẠNG SPEC PACKAGE — CẤM PLAN PHẲNG/MỎNG (luật chốt 2026-09-01):**
   Một kế hoạch KHÔNG được là một file \`plan.md\` dồn hết mọi thứ. Bắt buộc tách thành **bộ SPEC nhiều file**, mỗi file là MỘT hợp đồng độc lập:
   \`\`\`text
   planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan]/
   ├── plan.md                          # HỒ SƠ kế hoạch (KHÔNG chứa thiết kế — xem mục 2.3)
   └── specs/                           # Bản thiết kế chi tiết (Spec-First)
       ├── 00-ARCHITECTURE.md           # Mục tiêu, Non-goals, Bất biến kiến trúc, Router thứ tự đọc
       ├── 01-CONTRACTS.md              # Contracts, Types, Schema/DDL bất biến
       ├── SPEC-Pxx-[Name].md           # Đặc tả từng mảng/bước thực thi cụ thể
       ├── OPERATIONS.md                # Deploy, runbook, thứ tự bắt buộc, rollback
       └── TESTING-ACCEPTANCE.md        # Ma trận test + bằng chứng nghiệm thu + Exit Gates
   \`\`\`
   - **2.1. Bộ SPEC tối thiểu:** phải phủ đủ 4 mảng — (a) kiến trúc & bất biến, (b) contract dữ liệu/API/module, (c) vận hành-deploy-rollback, (d) kiểm thử-nghiệm thu. Dự án lớn tách thêm SPEC theo từng tính năng.
   - **2.2. Mỗi file SPEC BẮT BUỘC có:** contract chính xác (chữ ký hàm/endpoint/schema, không mô tả chung chung); luật **BẮT BUỘC / CẤM** tường minh, kể cả **"vùng cấm"** (điều đã cân nhắc và quyết định KHÔNG làm, kèm lý do — chống việc agent sau "sửa lại cho tốt hơn"); bảng phân loại lỗi + hành vi bắt buộc của caller cho từng loại; số đo/bằng chứng nghiệm thu thật (không chỉ "test xanh").
   - **2.3. \`plan.md\` CHỈ được chứa:** Metadata Header (mục 3); **Nhật ký quyết định có mốc thời gian** — kèm mục **"Quyết định bị thay thế"** (không xoá lịch sử, không để hai phát biểu ngược nhau cùng sống); phân công Work Packages + Model Tier; checklist thực thi; bảng trỏ sang các file SPEC. **CẤM nhét thiết kế chi tiết vào \`plan.md\`.**
   - **2.4. Exit Gates phải đánh dấu theo môi trường** (vd \`✅ local / ⬜ server\`) — kế hoạch chỉ được đóng khi mọi gate của môi trường thật chuyển ✅.
   - **2.5. NGOẠI LỆ DUY NHẤT:** hotfix/patch nhỏ (\`PATCH\` SemVer, ≤1 ngày công) được phép chỉ có \`plan.md\`, nhưng vẫn đủ Metadata + nhật ký quyết định + checklist. Mọi đợt \`MINOR\`/\`MAJOR\` bắt buộc đủ bộ SPEC.
   - **2.6. Package cũ dạng phẳng** (file \`NN-*.md\` nằm thẳng trong thư mục kế hoạch, không có \`specs/\`) được GIỮ NGUYÊN theo Path Invariant — không đổi cấu trúc để tránh gãy tham chiếu; chỉ áp cấu trúc chuẩn cho kế hoạch MỚI.
3. **Quy tắc Phân Tầng Mô Hình (Model Tiering Tagging):**
   - 🔴 **Tier Đỏ (Strongest):** Thiết kế kiến trúc nền tảng, Data Contracts, Security (Ưu tiên mô hình mạnh nhất như Claude 3.7 / Opus / GPT-4.5).
   - 🟠 **Tier Cam (Standard):** Viết logic tính năng chính, xử lý luồng, Unit tests (Mô hình cân bằng như Sonnet).
   - 🟢 **Tier Xanh (Fast/Cheap):** Tác vụ nhẹ, viết docs, fix chính tả, format code (Mô hình nhanh như Haiku / Flash).
4. **Vòng đời Kế hoạch (Planning Lifecycle):**
   - **Khởi tạo:** Dựng ĐỦ bộ SPEC (mục 2) + nhúng Checklist thực thi vào \`plan.md\` và chờ duyệt.
   - **Thực thi:** Tự động check \`[x]\` vào checklist ngay trong file kế hoạch (không dùng file nháp IDE).
   - **Cổng Nghiệm Thu (Acceptance Gate):** Chạy kiểm tra bắt buộc (\`typecheck\`, \`lint\`, \`test\`) trước khi hoàn tất.
   - **Nghiệm thu (Sign-off):** Cập nhật trạng thái \`✅ ĐÃ HOÀN THÀNH\`, ghi thời gian hoàn tất chính xác đến từng giây.
   - **Đồng bộ não bộ & tăng phiên bản:** Đưa task vào \`Done\` trong \`roadmap.md\`, ghi \`changelog.md\`, và tăng số phiên bản ở tất cả các file cấu hình.

---

## 🏷️ 4. QUY CHUẨN ĐÁNH SỐ PHIÊN BẢN (Semantic Versioning Standard)

Dự án áp dụng chuẩn **SemVer 2.0.0 (\`MAJOR.MINOR.PATCH\`)**:
1. **Phân loại tự động:**
   - **\`MAJOR\` (vX.0.0):** Thay đổi kiến trúc nền tảng, Breaking Changes.
   - **\`MINOR\` (vx.Y.0):** Thêm tính năng mới, module vệ tinh mới, nâng cấp hệ thống giữ tương thích ngược.
   - **\`PATCH\` (vx.y.Z):** Sửa lỗi nhỏ, hotfix, tối ưu hiệu năng hoặc tinh chỉnh tài liệu.
2. **Đồng bộ phiên bản (Single Source of Version Truth):**
   - Cập nhật đồng thời tại tất cả các file cấu hình của dự án (\`package.json\`, \`pyproject.toml\`, \`Cargo.toml\`, \`tauri.conf.json\`...).
   - Ghi nhận mục phát hành mới vào [\`brain4agent/changelog.md\`](file:///brain4agent/changelog.md).

---

## 🛡️ 5. CÁC BỘ LUẬT VẬN HÀNH & ĐỒNG BỘ BẤT BIẾN (Core Governance Invariants)

### A. Quy tắc Quản Trị Bộ Nhớ & Chống Mất Trí Nhớ (Continuous Memory Sync)
1. **Tự động cập nhật đồng thì (Proactive Sync):** Khi hoàn thành một tính năng mới, giải quyết một bug khó, thay đổi API hoặc mốc kiến trúc, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT NGAY** vào phân vùng tương ứng trong \`brain4agent/\` trước khi hoàn tất phiên làm việc. Tuyệt đối không chờ người dùng nhắc nhở.
2. **Cập nhật đúng phân vùng:**
   - Bug mới / Gotchas mới $\\rightarrow$ [\`-known-gotchas.md\`](file:///brain4agent/-known-gotchas.md).
   - Thêm module / thay đổi cấu trúc code $\\rightarrow$ [\`index.md\`](file:///brain4agent/index.md).
   - Hoàn thành tính năng $\\rightarrow$ [\`roadmap.md\`](file:///brain4agent/roadmap.md).
   - Ý tưởng, giải pháp mở rộng chưa làm ngay $\\rightarrow$ Tự động nạp vào **Kho Ý Tưởng (Idea Vault)** trong [\`roadmap.md\`](file:///brain4agent/roadmap.md).
   - Quyết định kiến trúc lớn $\\rightarrow$ [\`changelog.md\`](file:///brain4agent/changelog.md).
3. **Kernel tinh gọn:** File \`brain4agent/memory-distill.txt\` luôn giữ vai trò là bản cô đọng cao cấp nhất, duy trì dưới 100 dòng.
4. **Không tạo file ngoài phân vùng:** Cấm tự ý tạo file tài liệu tùy tiện trong \`brain4agent/\` ngoài 8 phân vùng chuẩn.

### B. Quy Chuẩn Tự Động Đồng Bộ Tài Liệu Khi Thay Đổi Cấu Trúc / Hoàn Thành Kế Hoạch (Mandatory Sync Cascade)
1. **Bắt Buộc Tự Động Rà Soát (Zero-Manual-Reminder):** Khi hoàn thành một Kế hoạch (\`planning/\`) hoặc thay đổi API, CLI, cấu trúc code, Agent **BẮT BUỘC PHẢI TỰ ĐỘNG CẬP NHẬT ĐỒNG THÌ NGAY LẬP TỨC** theo **Ma Trận Đồng Bộ 6 Điểm**:
   - **Tài liệu Kỹ thuật Module (\`docs/<module_name>.md\`):** Cập nhật chi tiết kỹ thuật, bảng tham số CLI/API, giải thuật mới.
   - **Bản Đồ Chỉ Mục Não Bộ (\`brain4agent/index.md\`):** Cập nhật Bản Đồ Cấu Trúc Mã Nguồn (Mục 2) và Router (Mục 1).
   - **Lộ Trình Dự Án (\`brain4agent/roadmap.md\`):** Chuyển task sang mục \`Done\`, ghi nhận mốc phát hành, nạp ý tưởng mới vào \`Idea Vault\`.
   - **Lịch Sử Phiên Bản (\`brain4agent/changelog.md\`):** Ghi nhận mục phát hành phiên bản mới theo chuẩn SemVer 2.0.0.
   - **Ký Ức Nóng (\`brain4agent/memory/hot/\`):** Ghi nhận nhật ký phiên (\`today.md\`) và benchmark thực chiến (\`state.json\`).
   - **Kernel Hiện Trạng (\`brain4agent/memory-distill.txt\`):** Cập nhật ngắn gọn vào kernel (duy trì $< 100\\text{ dòng}$).

### C. Quy tắc Quản Lý Tài Liệu Module 1-1 Trong \`docs/\`
1. **Tên tệp chuẩn hóa trùng tên thư mục Module (1-to-1 Match):** Mọi tài liệu kỹ thuật của một module phải được đặt trong thư mục \`docs/\` với tên tệp **trùng khớp 100% với tên thư mục của module** (\`module-tools/<module_name>/\` $\\rightarrow$ \`docs/<module_name>.md\`).
2. **Định tuyến tự động:** Khi cần tra cứu, fix bug hoặc nâng cấp module, Agent bắt buộc phải tìm trực tiếp tài liệu tại \`docs/<module_name>.md\` trước khi thao tác.

### D. Quy tắc Quản Trị Mã Nguồn (Git Commit Prompt & Strict English Standard)
1. **Chủ động đề xuất Commit:** Sau khi hoàn thành một nhiệm vụ, Agent **không được âm thầm bỏ qua** việc lưu trữ mã nguồn.
2. **Hiển thị bảng chọn bằng Tiếng Việt (\`ask_question\`):** Agent BẮT BUỘC phải dùng công cụ \`ask_question\` với nội dung câu hỏi và các tùy chọn viết bằng **Tiếng Việt** để người dùng dễ đọc và thao tác.
3. **Nội Dung Commit Bằng Tiếng Anh (Strict English Commit Messages):** Toàn bộ nội dung Git Commit Messages khi được tạo ra BẮT BUỘC 100% phải được soạn thảo hoàn toàn bằng **Tiếng Anh (English)** theo chuẩn Conventional Commits (ví dụ: \`feat(module): description\`, \`fix(module): description\`).

### E. Tư Duy Phân Lập Lỗi & Tự Phục Hồi Thích Ứng (Fault Isolation & Recovery Mindset)
1. **Phân lập căn nguyên 4 tầng (Root Cause Isolation):**
   - **Tầng 1 (Hạ tầng / Mạng / Server):** Máy chủ đích nghẽn, CDN rớt kết nối, mã lỗi mạng (502/504/Code 113).
   - **Tầng 2 (DOM & Race Condition):** DOM render chậm, script thư viện chưa bind listener, element đang animation.
   - **Tầng 3 (Anti-bot / Rate-Limit):** Bị chặn IP, quá giới hạn request, phát hiện fingerprint.
   - **Tầng 4 (Thuật toán & Logic Code):** Sai selector, logic xử lý chưa tối ưu.
2. **Tự phục hồi thích ứng:** Tự động retry và khắc phục lỗi Tầng 1/2 trước khi báo lỗi ra ngoài.

### F. Quy tắc Độc Tôn Kho Kỹ Năng Workspace (Single Skill Vault Invariant)
1. TOÀN BỘ các AI Skills liên quan đến việc vận hành dự án **BẮT BUỘC 100% PHẢI NẰM TRONG ĐÚNG KHO CHUẨN** \`.agents/skills/<skill_name>/\` (chứa \`SKILL.md\`).
2. **CẤM TUYỆT ĐỐI** tạo thư mục skill tùy tiện tại root workspace (như \`skills/\`, \`.skills/\` ngoài root).

### G. Quy tắc Kỷ Luật Root Clean 100% (Zero Root Clutter Invariant)
1. Thư mục root của dự án phải luôn giữ trạng thái sạch sẽ tuyệt đối.
2. **CẤM** tạo các file nháp tạm thời (\`latest_memory.md\`, \`task.md\`, script test tạm) trực tiếp ngoài root. Ký ức phiên đưa toàn bộ vào \`brain4agent/memory/hot/\`.
3. **NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não:** Root được phép có **ĐÚNG MỘT** file \`brain4agent-v<x.y.z>.md\` (vd \`brain4agent-v1.2.0.md\`) do \`init_brain.js\` tự sinh và quản lý — đây là bản soi CHO NGƯỜI để nhìn thấy ngay ở root dự án đang chạy khung não phiên bản nào. **CẤM sửa tay** file này; **CẤM để tồn tại 2 file marker** trở lên (bump version thì script tự xoá bản cũ, sinh bản mới). Nguồn chân lý MÁY ĐỌC là \`brain4agent/memory/hot/state.json\` → field \`brain_template_version\`; file \`.md\` chỉ là bản dẫn xuất, KHÔNG được coi là nguồn chân lý. Field này khác với version DỰ ÁN (\`current_version\` trong \`state.json\`, hoặc \`package.json\`) — tuyệt đối không trộn/ghi đè lẫn nhau.

### H. Quy tắc Giám Sát Tác Vụ Ngầm & Heartbeat Tiết Kiệm Token
1. **Cấm Polling File Log liên tục theo giây:** Tuyệt đối **CẤM** gọi vòng lặp \`view_file\` lên các tệp log liên tục theo chu kỳ ngắn (1-5s).
2. **Cơ chế Reactive Wakeup:** Để hệ thống tự đánh thức khi task ngầm hoàn tất; nếu cần heartbeat dùng \`schedule\` với chu kỳ $\\ge 45\\text{s} - 60\\text{s}$.

### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)
1. Root repo BẮT BUỘC đủ 2 file: \`AGENTS.md\` = nguồn chân lý DUY NHẤT chứa toàn bộ luật; \`CLAUDE.md\` = shim mỏng ≤10 dòng, chỉ 1 dòng \`@AGENTS.md\` + ghi chú ngắn, TUYỆT ĐỐI không chứa luật.
2. Lý do: mỗi hãng agent đọc tên file khác nhau. Claude Code CHỈ auto-load \`CLAUDE.md\`; Gemini/Codex và agent theo chuẩn \`agents.md\` đọc \`AGENTS.md\`. Hai điểm nạp, MỘT nguồn chân lý.
3. CẤM: (a) chép/nhân bản luật sang \`CLAUDE.md\` → sinh 2 nguồn chân lý lệch nhau; (b) đổi tên \`AGENTS.md\` (các tài liệu trong repo + agent khác tham chiếu đúng tên này).
4. Khi khởi tạo dự án MỚI hoặc chạy skill \`xay-dung-nao-bo\`: PHẢI sinh ĐỦ CẢ HAI file, không sinh mỗi một cái.
5. Mở rộng: agent mới đọc tên file riêng (\`GEMINI.md\`, \`.cursorrules\`) → thêm shim mỏng trỏ về \`AGENTS.md\`, KHÔNG nhân bản luật.
6. Giới hạn \`@import\`: tối đa 4 hop lồng nhau, file ≤4 MiB mới được nạp.
7. Cách kiểm: sửa luật KHÔNG cần đụng \`CLAUDE.md\`; \`CLAUDE.md\` phình >10 dòng hoặc chứa câu luật là vi phạm. Kiểm nạp thật bằng \`/context\` ở phiên MỚI.
`;
}

// -------------------------------------------------------------------------
// LỚP VÁ THUẦN — chuỗi vào, chuỗi ra. Không fs, không Date, không console, không process.
// Mọi String.replace() ở đây dùng replacement là HÀM (sửa lỗi D3).
// -------------------------------------------------------------------------
const AGENTS_PATCH_LOGS = {
    'step0': '🔄 Đã tự động vá Bước 0 (.xay-dung-nao-bo) vào AGENTS.md tại root.',
    'marker-exception': '🔄 Đã tự động vá ngoại lệ "Marker Phiên Bản Khung Não" (§5.G mục 3) vào AGENTS.md hiện có.',
    'law-j': '🔄 Đã tự động vá Luật J (Dual Entry-Point Invariant) vào AGENTS.md hiện có.',
    'spec-package': '🔄 Đã tự động vá luật SPEC PACKAGE (CẤM plan phẳng) vào AGENTS.md hiện có.',
    'remove-legacy-planning': '🧹 Đã gỡ khối luật planning CŨ còn sót cạnh khối SPEC PACKAGE (chống hai nguồn chân lý).'
};

function patchDistill(content) {
    const patches = [];
    let patchedDistill = content;
    if (!content.includes('xay-dung-nao-bo')) {
                const step0Line = `0. [BẮT BUỘC TIÊN QUYẾT] Chạy đồng bộ/boot não bộ qua skill \`.xay-dung-nao-bo\` (\`node C:\\\\Users\\\\hoang\\\\.gemini\\\\config\\\\skills\\\\.xay-dung-nao-bo\\\\scripts\\\\init_brain.js\`) để đảm bảo não luôn cập nhật chuẩn mới nhất.`;
        if (/<agent_startup_protocol>/i.test(content)) {
            patchedDistill = content.replace(
                /<agent_startup_protocol>/i,
                () => `<agent_startup_protocol>\n${step0Line}`
            );
            patches.push('step0');
        } else {
            // Fallback: kernel cũ KHÔNG theo khuôn XML (markdown thuần) — regex trên sẽ trượt và
            // ghi lại y nguyên file, sinh log báo-vá-nhưng-không-vá. Chèn khối giao thức lên ĐẦU file.
            patchedDistill = `<agent_startup_protocol>\n${step0Line}\n</agent_startup_protocol>\n\n${content}`;
            patches.push('step0-fallback');
        }
    }
    return { content: patchedDistill, patches, changed: patches.length > 0 };
}

function patchStateJson(lfText, version) {
    const patches = [];
    let currentState;
    try {
        currentState = JSON.parse(lfText);
    } catch (e) {
        const err = new Error('state.json khong parse duoc: ' + e.message);
        err.name = 'StateJsonError';
        err.code = 'STATE_JSON';
        throw err;
    }
    const needsVersionPatch = currentState.brain_template_version !== version;
    const needsNewlineFix = !lfText.endsWith('\n');
    if (needsVersionPatch) patches.push('version');
    if (needsNewlineFix) patches.push('trailing-newline');
    if (patches.length === 0) {
        return { content: lfText, patches, changed: false };
    }
    currentState.brain_template_version = version;
    return { content: JSON.stringify(currentState, null, 2) + '\n', patches, changed: true };
}

function patchAgentsMd(content, version) {
    let currentAgentsMd = content;
    const patches = [];

    // Vá Bước 0 (Boot Não) nếu thiếu
    if (!currentAgentsMd.includes('xay-dung-nao-bo')) {
        currentAgentsMd = currentAgentsMd.replace(
            /## ⚡ 1\. GIAO THỨC KHỞI ĐỘNG \(Agent Startup Protocol\)\s*\n\s*Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:\s*\n/i,
            () =>`## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)\n\nKhi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:\n\n1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy kiểm tra/đồng bộ não bộ qua skill \`.xay-dung-nao-bo\` (\`node C:\\\\Users\\\\hoang\\\\.gemini\\\\config\\\\skills\\\\.xay-dung-nao-bo\\\\scripts\\\\init_brain.js\`) để đảm bảo toàn bộ hệ thống Não Bộ luôn đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào.\n`
        );
        patches.push('step0');
    }

    // Vá Ngoại Lệ Root Clean §5.G mục 3 (Marker Phiên Bản Khung Não) nếu AGENTS.md CŨ chưa có.
    // Dò bằng chuỗi ổn định 'Marker Phiên Bản Khung Não' (không dò theo số dòng/thứ tự mục).
    if (!currentAgentsMd.includes('Marker Phiên Bản Khung Não')) {
        const rootMarkerExceptionText = `3. **NGOẠI LỆ TƯỜNG MINH — Marker Phiên Bản Khung Não:** Root được phép có **ĐÚNG MỘT** file \`brain4agent-v<x.y.z>.md\` (vd \`brain4agent-v${version}.md\`) do \`init_brain.js\` tự sinh và quản lý — đây là bản soi CHO NGƯỜI để nhìn thấy ngay ở root dự án đang chạy khung não phiên bản nào. **CẤM sửa tay** file này; **CẤM để tồn tại 2 file marker** trở lên (bump version thì script tự xoá bản cũ, sinh bản mới). Nguồn chân lý MÁY ĐỌC là \`brain4agent/memory/hot/state.json\` → field \`brain_template_version\`; file \`.md\` chỉ là bản dẫn xuất, KHÔNG được coi là nguồn chân lý. Field này khác với version DỰ ÁN (\`current_version\` trong \`state.json\`, hoặc \`package.json\`) — tuyệt đối không trộn/ghi đè lẫn nhau.`;
        const gSectionMatch = currentAgentsMd.match(/### G\.[^\n]*\n[\s\S]*?(?=\n### |\n## |$)/);
        if (gSectionMatch) {
            const originalSection = gSectionMatch[0];
            const patchedSection = originalSection.replace(/\s*$/, '') + '\n' + rootMarkerExceptionText + '\n';
            currentAgentsMd = currentAgentsMd.replace(originalSection, () => patchedSection);
        } else {
            // Fallback: AGENTS.md không theo đúng cấu trúc chuẩn §5.G -> phụ lục cuối file, vẫn dò được qua includes() lần sau.
            currentAgentsMd = currentAgentsMd.replace(/\s*$/, '') + `\n\n---\n\n## 🛡️ [PHỤ LỤC TỰ ĐỘNG VÁ] Ngoại Lệ Root Clean — Marker Phiên Bản Khung Não\n\n${rootMarkerExceptionText}\n`;
        }
        patches.push('marker-exception');
    }

    // Vá Luật J — Dual Entry-Point Invariant nếu AGENTS.md CŨ chưa có (dự án init trước khi Luật J
    // ra đời ở v1.1.0 nhưng AGENTS.md không được vá lại — cùng lớp lỗi với marker exception ở trên).
    if (!currentAgentsMd.includes('Dual Entry-Point Invariant')) {
        const dualEntryPointLawText = `### J. Quy tắc Tương Thích Đa Agent — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant)
1. Root repo BẮT BUỘC đủ 2 file: \`AGENTS.md\` = nguồn chân lý DUY NHẤT chứa toàn bộ luật; \`CLAUDE.md\` = shim mỏng ≤10 dòng, chỉ 1 dòng \`@AGENTS.md\` + ghi chú ngắn, TUYỆT ĐỐI không chứa luật.
2. Lý do: mỗi hãng agent đọc tên file khác nhau. Claude Code CHỈ auto-load \`CLAUDE.md\`; Gemini/Codex và agent theo chuẩn \`agents.md\` đọc \`AGENTS.md\`. Hai điểm nạp, MỘT nguồn chân lý.
3. CẤM: (a) chép/nhân bản luật sang \`CLAUDE.md\` → sinh 2 nguồn chân lý lệch nhau; (b) đổi tên \`AGENTS.md\` (các tài liệu trong repo + agent khác tham chiếu đúng tên này).
4. Khi khởi tạo dự án MỚI hoặc chạy skill \`xay-dung-nao-bo\`: PHẢI sinh ĐỦ CẢ HAI file, không sinh mỗi một cái.
5. Mở rộng: agent mới đọc tên file riêng (\`GEMINI.md\`, \`.cursorrules\`) → thêm shim mỏng trỏ về \`AGENTS.md\`, KHÔNG nhân bản luật.
6. Giới hạn \`@import\`: tối đa 4 hop lồng nhau, file ≤4 MiB mới được nạp.
7. Cách kiểm: sửa luật KHÔNG cần đụng \`CLAUDE.md\`; \`CLAUDE.md\` phình >10 dòng hoặc chứa câu luật là vi phạm. Kiểm nạp thật bằng \`/context\` ở phiên MỚI.`;
        const hSectionMatch = currentAgentsMd.match(/### H\.[^\n]*\n[\s\S]*?(?=\n### |\n## |$)/);
        if (hSectionMatch) {
            const originalSection = hSectionMatch[0];
            const patchedSection = originalSection.replace(/\s*$/, '') + '\n\n' + dualEntryPointLawText + '\n';
            currentAgentsMd = currentAgentsMd.replace(originalSection, () => patchedSection);
        } else {
            // Fallback: không tìm thấy section H theo cấu trúc chuẩn -> phụ lục cuối file.
            currentAgentsMd = currentAgentsMd.replace(/\s*$/, '') + `\n\n---\n\n${dualEntryPointLawText}\n`;
        }
        patches.push('law-j');
    }

    // Vá luật SPEC PACKAGE (§3 mục 2) nếu AGENTS.md CŨ chưa có — dự án init trước 2026-09-01 vẫn
    // dùng luật planning cũ (cho phép plan phẳng). Dò bằng chuỗi ổn định 'SPEC PACKAGE'.
    if (!currentAgentsMd.includes('SPEC PACKAGE')) {
        const specPackageRuleText = `2. **BẮT BUỘC DẠNG SPEC PACKAGE — CẤM PLAN PHẲNG/MỎNG (luật chốt 2026-09-01):**
   Một kế hoạch KHÔNG được là một file \`plan.md\` dồn hết mọi thứ. Bắt buộc tách thành **bộ SPEC nhiều file**, mỗi file là MỘT hợp đồng độc lập:
   \`\`\`text
   planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan]/
   ├── plan.md                          # HỒ SƠ kế hoạch (KHÔNG chứa thiết kế — xem mục 2.3)
   └── specs/                           # Bản thiết kế chi tiết (Spec-First)
       ├── 00-ARCHITECTURE.md           # Mục tiêu, Non-goals, Bất biến kiến trúc, Router thứ tự đọc
       ├── 01-CONTRACTS.md              # Contracts, Types, Schema/DDL bất biến
       ├── SPEC-Pxx-[Name].md           # Đặc tả từng mảng/bước thực thi cụ thể
       ├── OPERATIONS.md                # Deploy, runbook, thứ tự bắt buộc, rollback
       └── TESTING-ACCEPTANCE.md        # Ma trận test + bằng chứng nghiệm thu + Exit Gates
   \`\`\`
   - **2.1. Bộ SPEC tối thiểu:** phải phủ đủ 4 mảng — (a) kiến trúc & bất biến, (b) contract dữ liệu/API/module, (c) vận hành-deploy-rollback, (d) kiểm thử-nghiệm thu. Dự án lớn tách thêm SPEC theo từng tính năng.
   - **2.2. Mỗi file SPEC BẮT BUỘC có:** contract chính xác (chữ ký hàm/endpoint/schema, không mô tả chung chung); luật **BẮT BUỘC / CẤM** tường minh, kể cả **"vùng cấm"** (điều đã cân nhắc và quyết định KHÔNG làm, kèm lý do — chống việc agent sau "sửa lại cho tốt hơn"); bảng phân loại lỗi + hành vi bắt buộc của caller cho từng loại; số đo/bằng chứng nghiệm thu thật (không chỉ "test xanh").
   - **2.3. \`plan.md\` CHỈ được chứa:** Metadata Header (mục 3); **Nhật ký quyết định có mốc thời gian** — kèm mục **"Quyết định bị thay thế"** (không xoá lịch sử, không để hai phát biểu ngược nhau cùng sống); phân công Work Packages + Model Tier; checklist thực thi; bảng trỏ sang các file SPEC. **CẤM nhét thiết kế chi tiết vào \`plan.md\`.**
   - **2.4. Exit Gates phải đánh dấu theo môi trường** (vd \`✅ local / ⬜ server\`) — kế hoạch chỉ được đóng khi mọi gate của môi trường thật chuyển ✅.
   - **2.5. NGOẠI LỆ DUY NHẤT:** hotfix/patch nhỏ (\`PATCH\` SemVer, ≤1 ngày công) được phép chỉ có \`plan.md\`, nhưng vẫn đủ Metadata + nhật ký quyết định + checklist. Mọi đợt \`MINOR\`/\`MAJOR\` bắt buộc đủ bộ SPEC.
   - **2.6. Package cũ dạng phẳng** (file \`NN-*.md\` nằm thẳng trong thư mục kế hoạch, không có \`specs/\`) được GIỮ NGUYÊN theo Path Invariant — không đổi cấu trúc để tránh gãy tham chiếu; chỉ áp cấu trúc chuẩn cho kế hoạch MỚI.`;
        // Ưu tiên thay khối "Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)" cũ; không có thì chèn
        // ngay sau tiêu đề §3; không thấy §3 thì phụ lục cuối file (lần sau includes() vẫn dò được).
        const oldStructureBlock = currentAgentsMd.match(
            /2\. \*\*Cấu trúc Thư mục Kế hoạch Chuẩn \(Spec-First\):\*\*\r?\n(?:.*\r?\n)*?   ```\r?\n/
        );
        if (oldStructureBlock) {
            currentAgentsMd = currentAgentsMd.replace(oldStructureBlock[0], () => specPackageRuleText + '\n');
        } else {
            const planningHeading = currentAgentsMd.match(/## 📋 3\.[^\r\n]*\r?\n/);
            if (planningHeading) {
                const at = currentAgentsMd.indexOf(planningHeading[0]) + planningHeading[0].length;
                currentAgentsMd = currentAgentsMd.slice(0, at) + '\n' + specPackageRuleText + '\n' + currentAgentsMd.slice(at);
            } else {
                currentAgentsMd = currentAgentsMd.replace(/\s*$/, '') +
                    '\n\n---\n\n## 📋 [PHỤ LỤC TỰ ĐỘNG VÁ] Quản Trị Kế Hoạch — SPEC PACKAGE bắt buộc\n\n' + specPackageRuleText + '\n';
            }
        }
        patches.push('spec-package');
    } else {
        // Dọn tàn dư: bản vá đời trước dùng regex chỉ khớp LF nên trên file CRLF nó rơi vào nhánh
        // CHÈN THÊM thay vì THAY THẾ, để lại khối luật planning CŨ nằm cạnh khối SPEC PACKAGE mới
        // => hai phát biểu ngược nhau cùng sống. Gỡ khối cũ đi, giữ khối mới.
        const legacyStructureBlock = currentAgentsMd.match(
            /2\. \*\*Cấu trúc Thư mục Kế hoạch Chuẩn \(Spec-First\):\*\*\r?\n(?:.*\r?\n)*?   ```\r?\n/
        );
        if (legacyStructureBlock) {
            currentAgentsMd = currentAgentsMd.replace(legacyStructureBlock[0], '');
            patches.push('remove-legacy-planning');
        }
    }

    return { content: currentAgentsMd, patches, changed: patches.length > 0 };
}

function patchClaudeMd(content) {
    const patches = [];
    let patchedClaudeMd = content;
    if (!content.includes('@AGENTS.md')) {
        // Vá thêm dòng import, giữ nguyên nội dung người dùng đã viết thêm (không ghi đè).
        patchedClaudeMd = content.replace(/\s*$/, '') + '\n\n@AGENTS.md\n';
        patches.push('import');
    }
    return { content: patchedClaudeMd, patches, changed: patches.length > 0 };
}

// -------------------------------------------------------------------------
// ĐIỂM VÀO LẬP TRÌNH — không process.exit, không console.*,
// không bắt exception của chính nó (main() là nơi duy nhất bắt).
// -------------------------------------------------------------------------
function runBrainEngine(opts) {
    const rootDir = opts.rootDir;
    const logger = opts.logger || function () {};
    const errorLogger = opts.errorLogger || function () {};
    const mode = opts.mode || 'write';
    const now = opts.now || new Date();
    const templateVersion = opts.templateVersion || BRAIN_TEMPLATE_VERSION;
    let stateJsonBroken = false;
    if (mode !== 'write') {
        throw new RangeError('[brain-engine] mode ' + mode + ' chua duoc hien thuc (WP1).');
    }

const brainDir = path.join(rootDir, 'brain4agent');
const hotDir = path.join(brainDir, 'memory', 'hot');
const planningDir = path.join(rootDir, 'planning');
const agentsDir = path.join(rootDir, '.agents');
const skillsDir = path.join(agentsDir, 'skills');
const docsDir = path.join(rootDir, 'docs');
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
const claudeMdPath = path.join(rootDir, 'CLAUDE.md');
const legacyLatestMemory = path.join(rootDir, 'latest_memory.md');

logger("\n===========================================================");
logger("🧠 UNIVERSAL BRAIN GOVERNANCE ENGINE — CHUẨN ĐA TẦNG V5.2");
logger("===========================================================");
logger(`📁 Project Root: ${rootDir}\n`);

// -------------------------------------------------------------------------
// 1. TỰ ĐỘNG CHẨN ĐOÁN TRẠNG THÁI NÃO BỘ (SMART DIAGNOSTIC)
// -------------------------------------------------------------------------

const hasBrainDir = fs.existsSync(brainDir);
const hasHotMemory = fs.existsSync(hotDir) && fs.existsSync(path.join(hotDir, 'state.json')) && fs.existsSync(path.join(hotDir, 'today.md'));
const hasPlanning = fs.existsSync(planningDir);
const hasAgentsMd = fs.existsSync(agentsMdPath);
const hasSkillsVault = fs.existsSync(skillsDir);
const hasLegacyLatest = fs.existsSync(legacyLatestMemory);

// Kiểm tra shim CLAUDE.md — Claude Code CHỈ auto-load CLAUDE.md, không đọc AGENTS.md,
// nên mọi dự án bắt buộc phải có shim này trỏ về AGENTS.md (Dual Entry-Point Invariant, mục J).
let hasClaudeMd = false;
if (fs.existsSync(claudeMdPath)) {
    const claudeMdContent = fs.readFileSync(claudeMdPath, 'utf8');
    hasClaudeMd = claudeMdContent.includes('@AGENTS.md');
}

// Kiểm tra xem AGENTS.md và memory-distill.txt đã được cập nhật Bước 0 (Boot Não) chưa
let hasStep0InAgentsMd = false;
// Kiểm tra AGENTS.md ĐÃ TỒN TẠI đã có ngoại lệ §5.G (marker phiên bản khung não) và
// Luật J (Dual Entry-Point Invariant) chưa — dò bằng chuỗi ổn định (không dò theo số dòng),
// vì các luật này có thể được thêm vào SAU KHI dự án đã init lần đầu (giống lỗ hổng Luật J v1.1.0).
let hasRootMarkerException = false;
let hasDualEntryPointLawInAgentsMd = false;
if (hasAgentsMd) {
    const agentsContent = fs.readFileSync(agentsMdPath, 'utf8');
    hasStep0InAgentsMd = agentsContent.includes('xay-dung-nao-bo');
    hasRootMarkerException = agentsContent.includes('Marker Phiên Bản Khung Não');
    hasDualEntryPointLawInAgentsMd = agentsContent.includes('Dual Entry-Point Invariant');
}

let hasStep0InDistill = false;
const distillPath = path.join(brainDir, 'memory-distill.txt');
if (fs.existsSync(distillPath)) {
    const distillContent = fs.readFileSync(distillPath, 'utf8');
    hasStep0InDistill = distillContent.includes('xay-dung-nao-bo');
}

let missingBrainFiles = [];
if (hasBrainDir) {
    missingBrainFiles = REQUIRED_FILES.filter(f => !fs.existsSync(path.join(brainDir, f)));
}

// Kiểm tra Marker Phiên Bản Khung Não ở root (brain4agent-v<version>.md) — bản soi cho người,
// dẫn xuất từ nguồn chân lý máy đọc brain4agent/memory/hot/state.json -> brain_template_version.
const brainMarkerRegex = /^brain4agent-v(\d+\.\d+\.\d+)\.md$/;
let rootFilesForMarker = [];
try {
    rootFilesForMarker = fs.readdirSync(rootDir);
} catch (e) {
    rootFilesForMarker = [];
}
const existingMarkerFiles = rootFilesForMarker.filter(f => brainMarkerRegex.test(f));
const currentMarkerFileName = `brain4agent-v${BRAIN_TEMPLATE_VERSION}.md`;
const hasBrainVersionMarker = existingMarkerFiles.length === 1 && existingMarkerFiles[0] === currentMarkerFileName;

// state.json phải kết thúc bằng newline (chuẩn POSIX) — tránh vết "\ No newline at end of file"
// xuất hiện vĩnh viễn trong mọi git diff về sau của file này.
let hasStateJsonTrailingNewline = true;
const stateJsonDiagPath = path.join(hotDir, 'state.json');
if (fs.existsSync(stateJsonDiagPath)) {
    hasStateJsonTrailingNewline = fs.readFileSync(stateJsonDiagPath, 'utf8').endsWith('\n');
}

const isBrandNew = !hasBrainDir;
// Chẩn đoán: AGENTS.md KHÔNG được chứa đồng thời khối luật planning CŨ và khối SPEC PACKAGE mới.
// Bản vá đời trước dùng regex chỉ khớp LF nên trên file CRLF nó CHÈN THÊM thay vì THAY THẾ,
// để lại hai phát biểu ngược nhau cùng sống (vi phạm "một nguồn chân lý").
let hasNoDuplicatePlanningLaw = true;
if (hasAgentsMd) {
    const agentsMdDiag = fs.readFileSync(agentsMdPath, 'utf8');
    hasNoDuplicatePlanningLaw = !(agentsMdDiag.includes('SPEC PACKAGE') && agentsMdDiag.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'));
}
const isFullyStandard = hasBrainDir && hasHotMemory && hasPlanning && hasAgentsMd && hasClaudeMd && hasSkillsVault && !hasLegacyLatest && missingBrainFiles.length === 0 && hasStep0InAgentsMd && hasStep0InDistill && hasBrainVersionMarker && hasRootMarkerException && hasDualEntryPointLawInAgentsMd && hasStateJsonTrailingNewline && hasNoDuplicatePlanningLaw;

if (isFullyStandard) {
    logger("🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!");
    logger("-----------------------------------------------------------");
    logger("✅ Thư mục brain4agent/ đầy đủ 7 phân vùng cố định.");
    logger("✅ Phân khu Hot Memory (brain4agent/memory/hot/) đang hoạt động.");
    logger("✅ Thư mục planning/ và .agents/skills/ chuẩn hoá.");
    logger("✅ Giao thức khởi động có Bước 0 (.xay-dung-nao-bo boot) trong AGENTS.md & memory-distill.txt.");
    logger("✅ Bất Biến Hai Điểm Nạp: AGENTS.md (nguồn chân lý) + CLAUDE.md (shim) đều tồn tại.");
    logger("✅ AGENTS.md chứa đủ Luật J (Dual Entry-Point Invariant) và Ngoại Lệ Marker (§5.G mục 3).");
    logger(`✅ Marker Phiên Bản Khung Não: brain4agent-v${BRAIN_TEMPLATE_VERSION}.md đúng chuẩn tại root.`);
    logger("✅ Thư mục root sạch sẽ 100% (Root Clean Invariant).");
    logger("-----------------------------------------------------------");
    logger("👉 Trạng thái: NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM!\n");
    return { exitCode: 0, diagnosis: null, plan: null, applied: 0, diagnosisAfter: null };
}

// -------------------------------------------------------------------------
// 2. KÍCH HOẠT TẠO MỚI HOẶC TÁI CẤU TRÚC / MIGRATION (BUILD / REFACTOR)
// -------------------------------------------------------------------------
if (isBrandNew) {
    logger("⚡ [TRẠNG THÁI] Dự án mới tinh — Bắt đầu Khởi Tạo Trọn Gói Bộ Não V5.2...\n");
} else {
    logger("🔄 [TRẠNG THÁI] Phát hiện Não cũ / Chưa đồng bộ — Bắt đầu Tái Cấu Trúc & Migration...\n");
}

// Auto-standardize legacy uppercase DOCS directory to lowercase docs
try {
    const rootFiles = fs.readdirSync(rootDir);
    if (rootFiles.includes('DOCS') && !rootFiles.includes('docs')) {
        logger("🔄 Phát hiện thư mục DOCS (in hoa), tiến hành chuẩn hóa thành docs (viết thường)...");
        const uppercaseDocsDir = path.join(rootDir, 'DOCS');
        const tempDocsDir = path.join(rootDir, 'temp_docs');
        fs.renameSync(uppercaseDocsDir, tempDocsDir);
        fs.renameSync(tempDocsDir, docsDir);
        logger("✅ Đã chuẩn hóa thư mục DOCS thành docs thành công.");
    }
} catch (e) {
    errorLogger("⚠️ Không thể chuẩn hóa thư mục DOCS:" + ' ' + e.message);
}

// Auto-standardize legacy uppercase Plan directory to lowercase planning
try {
    const rootFiles = fs.readdirSync(rootDir);
    if (rootFiles.includes('Plan') && !rootFiles.includes('planning')) {
        logger("🔄 Phát hiện thư mục Plan (in hoa), tiến hành chuẩn hóa thành planning (viết thường)...");
        const uppercasePlanDir = path.join(rootDir, 'Plan');
        const tempPlanDir = path.join(rootDir, 'temp_plan');
        fs.renameSync(uppercasePlanDir, tempPlanDir);
        fs.renameSync(tempPlanDir, planningDir);
        logger("✅ Đã chuẩn hóa thư mục Plan thành planning thành công.");
    }
} catch (e) {
    errorLogger("⚠️ Không thể chuẩn hóa thư mục Plan:" + ' ' + e.message);
}

// Ensure directories
const targetDirs = [brainDir, path.join(brainDir, 'memory'), hotDir, planningDir, agentsDir, skillsDir, docsDir];
for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger(`📁 Đã tạo thư mục: ${path.relative(rootDir, dir) || '.'}`);
    }
}

// Handle legacy latest_memory.md migration if exists
if (hasLegacyLatest) {
    logger("📦 Phát hiện latest_memory.md ở root -> Di dời vào brain4agent/memory/hot/...");
    const legacyContent = fs.readFileSync(legacyLatestMemory, 'utf8');
    const todayPath = path.join(hotDir, 'today.md');
    if (!fs.existsSync(todayPath)) {
        fs.writeFileSync(todayPath, legacyContent, 'utf8');
    }
    fs.unlinkSync(legacyLatestMemory);
    logger("🗑️ Đã xóa latest_memory.md ở root để giữ chuẩn Root Clean 100%.");
}

// Templates definition
const templates = renderTemplates(templateVersion, now);

for (const [filename, content] of Object.entries(templates)) {
    const filePath = path.join(brainDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
        logger(`✅ Đã tạo mới: brain4agent/${filename}`);
    } else {
        // Tự động vá Bước 0 vào memory-distill.txt nếu thiếu
        if (filename === 'memory-distill.txt') {
            const currentDistill = fs.readFileSync(filePath, 'utf8');
            const distillResult = patchDistill(currentDistill);
            if (distillResult.changed) {
                for (const patchName of distillResult.patches) {
                    if (patchName === 'step0') {
                        logger(`🔄 Đã tự động vá Bước 0 (.xay-dung-nao-bo) vào brain4agent/memory-distill.txt`);
                    } else {
                        logger(`🔄 Kernel không theo khuôn <agent_startup_protocol> — đã chèn khối Bước 0 lên đầu brain4agent/memory-distill.txt (fallback).`);
                    }
                }
                fs.writeFileSync(filePath, distillResult.content, 'utf8');
            } else {
                logger(`📄 Đã có sẵn: brain4agent/${filename} (Giữ nguyên dữ liệu)`);
            }
        } else {
            logger(`📄 Đã có sẵn: brain4agent/${filename} (Giữ nguyên dữ liệu)`);
        }
    }
}

// Hot memory files
const stateJsonPath = path.join(hotDir, 'state.json');
if (!fs.existsSync(stateJsonPath)) {
    fs.writeFileSync(stateJsonPath, renderInitialState(templateVersion, now), 'utf8');
    logger('✅ Đã tạo mới: memory/hot/state.json (kèm brain_template_version)');
} else {
    // Vá brain_template_version vào state.json đã có, KHÔNG đụng các field khác (vd current_version
    // là version DỰ ÁN — khái niệm khác, tuyệt đối không trộn/ghi đè lên nhau).
    try {
        const currentStateRaw = fs.readFileSync(stateJsonPath, 'utf8');
        const stateResult = patchStateJson(currentStateRaw, templateVersion);
        if (stateResult.changed) {
            fs.writeFileSync(stateJsonPath, stateResult.content, 'utf8');
            if (stateResult.patches.includes('version')) {
                logger(`🔄 Đã vá brain_template_version=${templateVersion} vào memory/hot/state.json (giữ nguyên các field khác).`);
            }
            if (stateResult.patches.includes('trailing-newline')) {
                logger('🔄 Đã bổ sung newline cuối file cho memory/hot/state.json (chuẩn POSIX, sạch git diff).');
            }
        } else {
            logger('📄 Đã có sẵn: memory/hot/state.json (brain_template_version đúng chuẩn, giữ nguyên dữ liệu).');
        }
    } catch (e) {
        stateJsonBroken = true;
        errorLogger('⚠️ Không thể vá brain_template_version vào state.json:' + ' ' + e.message);
    }
}

// -------------------------------------------------------------------------
// Marker Phiên Bản Khung Não ở root — brain4agent-v<version>.md (bản soi cho người).
// CƯỠNG CHẾ ĐÚNG MỘT FILE: xoá mọi bản marker khác version trước khi ghi bản đúng.
// Idempotent: nếu bản đúng version đã tồn tại thì không ghi lại.
// -------------------------------------------------------------------------
const brainMarkerPath = path.join(rootDir, currentMarkerFileName);
let rootFilesForMarkerWrite = [];
try {
    rootFilesForMarkerWrite = fs.readdirSync(rootDir);
} catch (e) {
    rootFilesForMarkerWrite = [];
}
const staleMarkerFiles = rootFilesForMarkerWrite.filter(f => brainMarkerRegex.test(f) && f !== currentMarkerFileName);
for (const staleFile of staleMarkerFiles) {
    try {
        fs.unlinkSync(path.join(rootDir, staleFile));
        logger(`🗑️ Đã xoá marker phiên bản khung não lỗi thời: ${staleFile}`);
    } catch (e) {
        errorLogger(`⚠️ Không thể xoá marker lỗi thời ${staleFile}:` + ' ' + e.message);
    }
}

if (!fs.existsSync(brainMarkerPath)) {
    fs.writeFileSync(brainMarkerPath, renderMarker(templateVersion, now), 'utf8');
    logger(`✅ Đã tạo mới marker phiên bản khung não: ${currentMarkerFileName}`);
} else {
    logger(`📄 Đã có sẵn: ${currentMarkerFileName} (đúng chuẩn, giữ nguyên).`);
}

const todayMdPath = path.join(hotDir, 'today.md');
if (!fs.existsSync(todayMdPath)) {
    fs.writeFileSync(todayMdPath, renderTodayMd(now), 'utf8');
    logger('✅ Đã tạo mới: memory/hot/today.md');
}

// Root AGENTS.md Full Governance Template
const fullAgentsMdContent = renderFullAgentsMd();

// Ghi hoặc cập nhật AGENTS.md
if (!fs.existsSync(agentsMdPath)) {
    fs.writeFileSync(agentsMdPath, fullAgentsMdContent, 'utf8');
    logger('✅ Đã tạo mới: AGENTS.md với ĐẦY ĐỦ CÁC BỘ LUẬT QUẢN TRỊ TINH HOA!');
} else {
    const originalAgentsMd = fs.readFileSync(agentsMdPath, 'utf8');
    const agentsResult = patchAgentsMd(originalAgentsMd, templateVersion);
    for (const patchName of agentsResult.patches) {
        logger(AGENTS_PATCH_LOGS[patchName]);
    }
    if (agentsResult.changed) {
        fs.writeFileSync(agentsMdPath, agentsResult.content, 'utf8');
    }
    if (!agentsResult.patches.some((p) => p !== 'remove-legacy-planning')) {
        logger('📄 Đã có sẵn: AGENTS.md (đầy đủ luật, giữ nguyên).');
    }
}

// -------------------------------------------------------------------------
// Ghi hoặc vá CLAUDE.md — Shim mỏng cho Claude Code (Dual Entry-Point Invariant, luật J)
// Claude Code CHỈ tự động nạp CLAUDE.md, không nạp AGENTS.md. Shim này CHỈ import
// AGENTS.md, KHÔNG BAO GIỜ được chứa luật trực tiếp (giữ AGENTS.md là nguồn chân lý DUY NHẤT).
// -------------------------------------------------------------------------
const claudeMdShimContent = renderClaudeShim();

if (!fs.existsSync(claudeMdPath)) {
    fs.writeFileSync(claudeMdPath, claudeMdShimContent, 'utf8');
    logger('✅ Đã tạo mới: CLAUDE.md (shim ≤10 dòng, trỏ @AGENTS.md — Dual Entry-Point Invariant).');
} else {
    const currentClaudeMd = fs.readFileSync(claudeMdPath, 'utf8');
    const claudeResult = patchClaudeMd(currentClaudeMd);
    if (claudeResult.changed) {
        fs.writeFileSync(claudeMdPath, claudeResult.content, 'utf8');
        logger('🔄 Đã tự động vá dòng @AGENTS.md vào CLAUDE.md hiện có (giữ nguyên nội dung cũ).');
    } else {
        logger('📄 Đã có sẵn: CLAUDE.md (đã trỏ @AGENTS.md, giữ nguyên).');
    }
}

logger("\n===========================================================");
logger("✨ THIẾT LẬP & TÁI CẤU TRÚC NÃO BỘ V5.2 HOÀN TẤT THÀNH CÔNG!");
logger("===========================================================\n");

    return { exitCode: 0, diagnosis: null, plan: null, applied: 0, diagnosisAfter: null };
}

// -------------------------------------------------------------------------
// VỎ CLI — nơi DUY NHẤT có process.exit / process.argv / ghi ra stdout-stderr.
// -------------------------------------------------------------------------
function parseArgs(argv) {
    // WP6 chỉ parse rootDir; các cờ --check/--dry-run/--version/--help là việc của WP1.
    const rootDir = argv[0] ? path.resolve(argv[0]) : process.cwd();
    return { rootDir, mode: 'write', errors: [] };
}

function main(argv, env, io) {
    try {
        const args = parseArgs(argv);
        const r = runBrainEngine({
            rootDir: args.rootDir,
            mode: args.mode,
            logger: (line) => io.stdout(line + '\n'),
            errorLogger: (line) => io.stderr(line + '\n')
        });
        return r.exitCode;
    } catch (e) {
        io.stderr('[brain-engine] ' + ((e && e.stack) || e) + '\n');
        return 3;
    }
}

module.exports = {
    BRAIN_TEMPLATE_VERSION,
    ENGINE_VERSION,
    REQUIRED_FILES,
    renderTemplates,
    renderInitialState,
    renderMarker,
    renderTodayMd,
    renderClaudeShim,
    renderFullAgentsMd,
    patchDistill,
    patchStateJson,
    patchAgentsMd,
    patchClaudeMd,
    runBrainEngine,
    parseArgs,
    main
};

if (require.main === module) {
    process.exitCode = main(process.argv.slice(2), process.env, {
        stdout: (s) => process.stdout.write(s),
        stderr: (s) => process.stderr.write(s)
    });
}
