const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const brainDir = path.join(rootDir, 'brain4agent');
const hotDir = path.join(brainDir, 'memory', 'hot');
const planningDir = path.join(rootDir, 'planning');
const agentsDir = path.join(rootDir, '.agents');
const skillsDir = path.join(agentsDir, 'skills');
const docsDir = path.join(rootDir, 'docs');

const directories = [
    brainDir,
    path.join(brainDir, 'memory'),
    hotDir,
    planningDir,
    agentsDir,
    skillsDir,
    docsDir
];

for (const dir of directories) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`📁 Directory already exists: ${dir}`);
    }
}

const templates = {
    'memory-distill.txt': `<kernel_instructions>
<role>Bạn là Senior Developer/System Architect của dự án này. Nhiệm vụ: giữ kiến trúc sạch, code chuẩn, hiệu năng cao, không thừa logic.</role>

<agent_startup_protocol>
1. Đọc \`brain4agent/memory-distill.txt\` trước khi sửa code.
2. Định tuyến tài liệu: Tra cứu \`brain4agent/index.md\` để lấy bối cảnh. Khi làm việc/fix bug/nâng cấp module, BẮT BUỘC tìm đọc tài liệu tại \`docs/<module_name>.md\` trước.
3. Luôn đối chiếu code thực tế trong repo trước khi tin memory/docs.
4. Sửa tối thiểu, đúng kiến trúc.
5. [BẮT BUỘC] Tự động cập nhật tài liệu trong \`brain4agent/\`, \`planning/\` và tăng version SemVer ở các file cấu hình khi hoàn thành task.
</agent_startup_protocol>

<project_foundation>
- Tech Stack: [Cập nhật công nghệ chính]
- Data/State: [Cập nhật lưu trữ dữ liệu chính]
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
├── AGENTS.md                         # [QUY TẮC TỐI THƯỢNG] Nạp tự động khi khởi động phiên làm việc
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
- [x] **Khởi tạo Bộ Nhớ Não Bộ Chuẩn (v1.0.0):** Thiết lập cấu trúc Đa Tầng brain4agent V5.0 và quy chuẩn quản trị AGENTS.md.
`,

    'changelog.md': `# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của dự án.

## [v1.0.0] - ${new Date().toISOString().split('T')[0]}: Initial Project Scaffolding
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

for (const [filename, content] of Object.entries(templates)) {
    const filePath = path.join(brainDir, filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Created brain4agent/${filename}`);
    } else {
        console.log(`📄 File brain4agent/${filename} already exists. Skipped.`);
    }
}

// Generate hot memory files
const stateJsonPath = path.join(hotDir, 'state.json');
if (!fs.existsSync(stateJsonPath)) {
    const initialState = {
        "current_version": "1.0.0",
        "system_status": "initialized",
        "last_verification": {
            "timestamp": new Date().toISOString(),
            "grade": "Grade A Initialized"
        },
        "active_plans_completed": 0
    };
    fs.writeFileSync(stateJsonPath, JSON.stringify(initialState, null, 2), 'utf8');
    console.log('✅ Created memory/hot/state.json');
}

const todayMdPath = path.join(hotDir, 'today.md');
if (!fs.existsSync(todayMdPath)) {
    fs.writeFileSync(todayMdPath, `# 📅 Nhật Ký Làm Việc Ngày ${new Date().toLocaleDateString('vi-VN')} (Session Memory Log)\n\n> Cập nhật lúc: \`${new Date().toISOString()}\` | Phiên bản: \`v1.0.0\`\n\n---\n\n## 🎯 Thành Tựu Khởi Tạo:\n- Khởi tạo thành công cấu trúc dự án và bộ nhớ Đa Tầng brain4agent V5.0.\n`, 'utf8');
    console.log('✅ Created memory/hot/today.md');
}

// Generate root AGENTS.md if missing
const agentsMdPath = path.join(rootDir, 'AGENTS.md');
if (!fs.existsSync(agentsMdPath)) {
    const agentsMdContent = `# AGENTS.md — Quy Tắc Quản Trị & Giao Thức Khởi Động Cho AI Agent

Tệp này là kim chỉ nam tối thượng của dự án. Mọi AI Agent khi bước vào workspace này **BẮT BUỘC** phải tuân thủ nghiêm ngặt các quy tắc và giao thức dưới đây.

---

## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)

Khi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:

1. **Bước 1 (Bắt buộc đầu tiên):** Mở và đọc tệp [\`brain4agent/memory-distill.txt\`](file:///brain4agent/memory-distill.txt) để nắm bắt kernel hiện trạng, tech stack và quy tắc bất biến.
2. **Bước 2 (Định tuyến thông minh & Đọc Codebase Map):** Đọc [\`brain4agent/index.md\`](file:///brain4agent/index.md) để nắm toàn bộ Codebase Map, khu vực kế hoạch [\`planning/\`](file:///planning) và các Entry Points.
3. **Bước 3 (Kiểm chứng mã nguồn):** Luôn đối chiếu code thực tế trong repo trước khi tin tưởng tuyệt đối vào tài liệu cũ.

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

## 📋 3. QUY CHUẨN QUẢN TRỊ KẾ HOẠCH NÂNG CẤP (\`planning/\`)

Mọi đề xuất nâng cấp tính năng lớn, tái cấu trúc hoặc thêm module mới phải được quản lý tập trung trong thư mục **[\`planning/\`](file:///planning)** tại root repository:
- **Định dạng chuẩn:** \`planning/[STT]_[YYYY-MM-DD]_[Ten-Ngan-Kebab-Case]/\`
- **Quy tắc STT:** 2 chữ số (\`01\`, \`02\`, ..., \`99\`) tăng dần theo thời gian thực tế.
- **Checklist thực thi:** Nhúng trực tiếp Checklist vào file kế hoạch để tracking tiến độ; không dùng file nháp IDE.

---

## 🏷️ 4. QUY CHUẨN ĐÁNH SỐ PHIÊN BẢN (Semantic Versioning Standard)

Dự án áp dụng chuẩn **SemVer 2.0.0 (\`MAJOR.MINOR.PATCH\`)**:
- Cập nhật đồng bộ số phiên bản tại tất cả các file cấu hình (\`package.json\`, \`pyproject.toml\`, \`Cargo.toml\`, \`tauri.conf.json\`...).
- Ghi nhận mục phát hành mới vào [\`brain4agent/changelog.md\`](file:///brain4agent/changelog.md).
`;
    fs.writeFileSync(agentsMdPath, agentsMdContent, 'utf8');
    console.log('✅ Created root AGENTS.md');
}

console.log('✨ brain4agent V5.0 Multi-Tier Architecture setup complete!');
