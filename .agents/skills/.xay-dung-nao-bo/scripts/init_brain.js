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

// LỚP VĂN BẢN (01-CONTRACTS §1) — chuẩn hoá khi ĐỌC, khôi phục EOL khi GHI.
// ĐÂY LÀ NƠI DUY NHẤT trong file được phép gọi fs.readFileSync / fs.writeFileSync
// lên nội dung văn bản. Mọi hàm thuần chỉ nhận văn bản đã chuẩn hoá LF.
function stripBom(s) {
    return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

function detectEol(raw) {
    let crlf = 0;
    let lf = 0;
    for (let i = 0; i < raw.length; i++) {
        if (raw.charCodeAt(i) === 10) {
            if (i > 0 && raw.charCodeAt(i - 1) === 13) crlf++;
            else lf++;
        }
    }
    if (crlf && lf) return 'mixed';
    if (crlf) return 'crlf';
    if (lf) return 'lf';
    return 'none';
}

// CR đơn độc KHÔNG phải EOL — giữ nguyên byte.
function normalizeEol(raw) {
    return raw.replace(/\r\n/g, () => '\n');
}

function restoreEol(lf, eol) {
    // Chap nhan ca dau vao con CRLF: neu chi thay /\n/ thi '\r\n' se thanh '\r\r\n'.
    return eol === 'crlf' ? lf.replace(/\r\n|\n/g, () => '\r\n') : lf;
}

function hasUtf8Bom(buf) {
    return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;
}

function detectEncoding(buf) {
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return 'utf16le';
    if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) return 'utf16be';
    if (hasUtf8Bom(buf)) return 'utf8-bom';
    try {
        new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch (e) {
        return 'invalid-utf8';
    }
    return 'utf8';
}

function textFileError(code, message) {
    return Object.assign(new Error(message), { name: 'TextFileError', code });
}

// readText(filePath) -> { text, eol, hadBom, bytes, encoding } | null (ENOENT)
function readText(filePath) {
    let buf;
    try {
        buf = fs.readFileSync(filePath);
    } catch (e) {
        if (e && e.code === 'ENOENT') return null;
        throw textFileError(e && e.code ? e.code : 'EIO', 'Khong doc duoc file: ' + (e && e.message));
    }
    const encoding = detectEncoding(buf);
    if (encoding === 'utf16le' || encoding === 'utf16be') throw textFileError('UTF16', 'File dang UTF-16 (' + encoding + ').');
    if (encoding === 'invalid-utf8') throw textFileError('INVALID_UTF8', 'File khong phai UTF-8 hop le.');
    const raw = stripBom(buf.toString('utf8'));
    return { text: normalizeEol(raw), eol: detectEol(raw), hadBom: encoding === 'utf8-bom', bytes: buf.length, encoding };
}

// writeText(filePath, lfText, eol) — KHÔNG BAO GIỜ ghi BOM; 'mixed'/'none' ghi như 'lf'.
function writeText(filePath, lfText, eol) {
    fs.writeFileSync(filePath, Buffer.from(restoreEol(lfText, eol), 'utf8'));
}

// LỚP RENDER — hàm THUẦN: không fs, không Date, không console, không process.
// Nội dung template chép NGUYÊN VĂN từ engine v1.5.4 (bất biến A8).
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

// LỚP VÁ THUẦN — chuỗi vào, chuỗi ra. Không fs, không Date, không console, không process.
// Mọi String.replace() ở đây dùng replacement là HÀM (sửa lỗi D3).
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
        throw Object.assign(new Error('state.json khong parse duoc: ' + e.message),
            { name: 'StateJsonError', code: 'STATE_JSON' });
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
            () => `## ⚡ 1. GIAO THỨC KHỞI ĐỘNG (Agent Startup Protocol)\n\nKhi bắt đầu bất kỳ phiên làm việc nào, Agent phải thực hiện tuần tự:\n\n1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy kiểm tra/đồng bộ não bộ qua skill \`.xay-dung-nao-bo\` (\`node C:\\\\Users\\\\hoang\\\\.gemini\\\\config\\\\skills\\\\.xay-dung-nao-bo\\\\scripts\\\\init_brain.js\`) để đảm bảo toàn bộ hệ thống Não Bộ luôn đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào.\n`
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

// BẢNG MÃ KIỂM TRA (01-CONTRACTS §8). WP1 điền các mã do engine kiểm (cột "Ai kiểm = E");
// BRN-014/BRN-015 là việc của doctor (WP4), KHÔNG khai ở đây.
const BRN = {
    'BRN-001': { level: 'blocker', title: 'Thiếu AGENTS.md ở root', fix: 'Chạy engine chế độ ghi tại repo' },
    'BRN-002': { level: 'error', title: 'AGENTS.md thiếu token mốc bắt buộc', fix: 'Chạy engine chế độ ghi' },
    'BRN-003': { level: 'error', title: 'AGENTS.md có hai phát biểu luật planning cùng sống', fix: 'Chạy engine chế độ ghi để gỡ khối cũ' },
    'BRN-004': { level: 'blocker', title: 'CLAUDE.md thiếu hoặc không chứa @AGENTS.md', fix: 'Chạy engine chế độ ghi' },
    'BRN-005': { level: 'warning', title: 'CLAUDE.md dài hơn 10 dòng (không còn là shim)', fix: 'Rút CLAUDE.md về shim ≤10 dòng, chuyển luật sang AGENTS.md' },
    'BRN-006': { level: 'error', title: 'Số marker brain4agent-v<x.y.z>.md ở root khác 1', fix: 'Chạy engine chế độ ghi' },
    'BRN-008': { level: 'blocker', title: 'Thiếu brain4agent/ hoặc thiếu phân vùng bắt buộc', fix: 'Chạy engine chế độ ghi' },
    'BRN-007': { level: 'error', title: 'Version trong tên marker khác state.json.brain_template_version', fix: 'Chạy engine chế độ ghi' },
    'BRN-009': { level: 'error', title: 'Thiếu thư mục hạ tầng bắt buộc', fix: 'Chạy engine chế độ ghi' },
    'BRN-010': { level: 'error', title: 'state.json.brain_template_version sai hoặc state.json không parse được', fix: 'Engine vá version; JSON hỏng ⇒ sửa tay' },
    'BRN-011': { level: 'warning', title: 'state.json không kết thúc bằng byte 0x0A', fix: 'Chạy engine chế độ ghi' },
    'BRN-012': { level: 'error', title: 'memory-distill.txt thiếu Bước 0, hoặc root còn latest_memory.md', fix: 'Chạy engine chế độ ghi' },
    'BRN-013': { level: 'warning', title: 'File có BOM UTF-8 / không phải UTF-8 hợp lệ', fix: 'Lưu lại file dạng UTF-8 không BOM' }
};

const BRAIN_MARKER_REGEX = /^brain4agent-v(\d+\.\d+\.\d+)\.md$/;

const SNAPSHOT_FILES = {
    agentsMd: 'AGENTS.md', claudeMd: 'CLAUDE.md', legacyLatest: 'latest_memory.md',
    stateJson: 'brain4agent/memory/hot/state.json', todayMd: 'brain4agent/memory/hot/today.md'
};

// collectSnapshot — LỚP I/O ĐỌC DUY NHẤT. Mỗi file được đọc ĐÚNG MỘT LẦN.
function collectSnapshot(rootDir) {
    let st = null;
    try { st = fs.statSync(rootDir); } catch (e) { st = null; }
    if (!st || !st.isDirectory()) {
        throw Object.assign(new Error('rootDir khong ton tai hoac khong phai thu muc: ' + rootDir),
            { name: 'RootError', code: 'EROOT' });
    }

    let rootEntries = [];
    try { rootEntries = fs.readdirSync(rootDir).sort(); } catch (e) { rootEntries = []; }

    const fileErrors = [];
    const present = {};
    const abs = (rel) => path.join(rootDir, ...rel.split('/'));
    const read = (rel) => {
        const p = abs(rel);
        present[rel] = fs.existsSync(p);
        if (!present[rel]) return null;
        try { return readText(p); } catch (e) {
            fileErrors.push({ rel, code: e.code || 'EIO', message: e.message });
            return null;
        }
    };

    const files = { brain: {} };
    for (const key of Object.keys(SNAPSHOT_FILES)) files[key] = read(SNAPSHOT_FILES[key]);
    for (const f of REQUIRED_FILES) files.brain[f] = read('brain4agent/' + f);
    files.distill = files.brain['memory-distill.txt'];

    const dirs = {
        brain: fs.existsSync(abs('brain4agent')), memory: fs.existsSync(abs('brain4agent/memory')),
        hot: fs.existsSync(abs('brain4agent/memory/hot')), planning: fs.existsSync(abs('planning')),
        agents: fs.existsSync(abs('.agents')), skills: fs.existsSync(abs('.agents/skills')),
        docs: fs.existsSync(abs('docs'))
    };

    return { rootLabel: path.basename(rootDir), rootEntries, dirs, files, present, fileErrors };
}

// diagnose — THUẦN. Sinh Finding theo 01-CONTRACTS §8 (cột "Ai kiểm = E").
// isStandard = mọi finding đều KHÔNG fixable và không ở mức blocker/error
// ⇒ warning không-fixable (BRN-005, BOM file ngoài state.json) KHÔNG kéo engine vào đường ghi.
function diagnose(s, templateVersion) {
    const findings = [];
    const add = (code, message, detail, opts) => {
        const meta = BRN[code];
        const o = opts || {};
        findings.push({
            code,
            level: o.level || meta.level,
            fixable: o.fixable === undefined ? true : o.fixable,
            message: message || meta.title,
            fix: o.fix || meta.fix,
            detail: detail || {}
        });
    };

    const isBrandNew = !s.dirs.brain;

    if (!s.dirs.brain) {
        add('BRN-008', 'Thiếu thư mục brain4agent/', { missing: REQUIRED_FILES.slice() });
    } else {
        const missingBrainFiles = REQUIRED_FILES.filter((f) => !s.present['brain4agent/' + f]);
        if (missingBrainFiles.length > 0) {
            add('BRN-008', 'Thiếu phân vùng bắt buộc trong brain4agent/', { missing: missingBrainFiles });
        }
    }

    const hasHotMemory = s.dirs.hot
        && s.present['brain4agent/memory/hot/state.json']
        && s.present['brain4agent/memory/hot/today.md'];
    const missingInfra = [];
    if (!hasHotMemory) missingInfra.push('brain4agent/memory/hot/');
    if (!s.dirs.planning) missingInfra.push('planning/');
    if (!s.dirs.skills) missingInfra.push('.agents/skills/');
    // I11: docs/ nằm trong targetDirs nhưng chẩn đoán v1.5.4 KHÔNG kiểm — bổ sung ở WP1.
    if (!s.dirs.docs) missingInfra.push('docs/');
    if (missingInfra.length > 0) add('BRN-009', 'Thiếu thư mục hạ tầng bắt buộc', { missing: missingInfra });

    if (!s.present['AGENTS.md']) {
        add('BRN-001');
    } else {
        const agentsText = s.files.agentsMd ? s.files.agentsMd.text : '';
        const missingTokens = [];
        if (!agentsText.includes('xay-dung-nao-bo')) missingTokens.push('xay-dung-nao-bo');
        if (!agentsText.includes('Marker Phiên Bản Khung Não')) missingTokens.push('Marker Phiên Bản Khung Não');
        if (!agentsText.includes('Dual Entry-Point Invariant')) missingTokens.push('Dual Entry-Point Invariant');
        // Token thứ 4 (01-CONTRACTS §8 BRN-002 / SPEC-P01 a.2 + P01-E3): thiếu luật
        // SPEC PACKAGE nghĩa là repo còn khối luật planning CŨ ⇒ engine PHẢI vá.
        if (!agentsText.includes('SPEC PACKAGE')) missingTokens.push('SPEC PACKAGE');
        if (missingTokens.length > 0) add('BRN-002', 'AGENTS.md thiếu token mốc bắt buộc', { missing: missingTokens });
        if (agentsText.includes('SPEC PACKAGE') && agentsText.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)')) {
            add('BRN-003');
        }
        // I6 (mới): ĐẾM số lần xuất hiện, không chỉ hỏi có/không. Token mốc lặp > 1 lần
        // nghĩa là hai phát biểu luật cùng sống — engine KHÔNG tự sửa (nội dung người dùng).
        const counts = {};
        for (const token of ['Dual Entry-Point Invariant', 'Marker Phiên Bản Khung Não', 'SPEC PACKAGE']) {
            const c = agentsText.split(token).length - 1;
            if (c > 1) counts[token] = c;
        }
        const dupTokens = Object.keys(counts);
        if (dupTokens.length > 0) {
            add('BRN-003',
                'AGENTS.md có token mốc lặp lại: ' + dupTokens.map((t) => t + ' ×' + counts[t]).join(', '),
                { counts },
                { fixable: false, fix: 'Soi tay AGENTS.md, gỡ bản thừa (engine KHÔNG tự sửa nội dung người dùng)' });
        }
    }

    const claudeText = s.files.claudeMd ? s.files.claudeMd.text : null;
    if (claudeText === null || !claudeText.includes('@AGENTS.md')) add('BRN-004');
    // I4 (mới): shim phải ≤10 dòng. KHÔNG fixable — engine CẤM cắt nội dung người dùng.
    if (claudeText !== null) {
        const claudeLines = claudeText.replace(/\n+$/, () => '').split('\n').length;
        if (claudeLines > 10) {
            add('BRN-005', 'CLAUDE.md dài ' + claudeLines + ' dòng (> 10) — rút về shim', { lines: claudeLines }, { fixable: false });
        }
    }

    const markerFiles = s.rootEntries.filter((f) => BRAIN_MARKER_REGEX.test(f));
    const expectedMarker = 'brain4agent-v' + templateVersion + '.md';
    if (!(markerFiles.length === 1 && markerFiles[0] === expectedMarker)) {
        add('BRN-006', 'Marker phiên bản khung não ở root không đúng chuẩn', { found: markerFiles, expected: expectedMarker });
    }

    // I3 (mới): state.json.brain_template_version. CẤM đụng current_version.
    let stateObj = null;
    if (s.files.stateJson) {
        let parseError = null;
        try { stateObj = JSON.parse(s.files.stateJson.text); } catch (e) { parseError = e.message; stateObj = null; }
        if (parseError !== null) {
            add('BRN-010', 'state.json không parse được: ' + parseError, { parse_error: parseError },
                { fixable: false, fix: 'Sửa tay state.json cho đúng JSON rồi chạy lại engine' });
        } else {
            const actual = (stateObj && typeof stateObj === 'object' && !Array.isArray(stateObj))
                ? stateObj.brain_template_version : undefined;
            if (actual !== templateVersion) {
                add('BRN-010',
                    'state.json.brain_template_version = ' + (actual === undefined ? '(thiếu)' : actual) + ', kỳ vọng ' + templateVersion,
                    { actual: actual === undefined ? null : actual, expected: templateVersion });
            }
        }
        if (!s.files.stateJson.text.endsWith('\n')) add('BRN-011');
    }

    // I1 (mới): đối chiếu marker ↔ state.json (v1.5.4 chỉ kiểm marker, KHÔNG đối chiếu).
    if (markerFiles.length === 1 && stateObj && typeof stateObj === 'object' && !Array.isArray(stateObj)) {
        const markerVersion = BRAIN_MARKER_REGEX.exec(markerFiles[0])[1];
        if (stateObj.brain_template_version !== markerVersion) {
            add('BRN-007',
                'Marker ' + markerFiles[0] + ' lệch state.json.brain_template_version = ' + stateObj.brain_template_version,
                { marker: markerVersion, state: stateObj.brain_template_version === undefined ? null : stateObj.brain_template_version });
        }
    }

    if (s.present['brain4agent/memory-distill.txt']
        && (!s.files.distill || !s.files.distill.text.includes('xay-dung-nao-bo'))) {
        add('BRN-012', 'memory-distill.txt thiếu Bước 0 (.xay-dung-nao-bo)', { which: 'distill' });
    }
    if (s.present['latest_memory.md']) {
        add('BRN-012', 'Root còn latest_memory.md (vi phạm Root Clean)', { which: 'latest_memory' });
    }

    // BRN-013: BOM / mã hoá. CHỈ state.json có BOM là fixable (engine ghi lại không BOM).
    const bomOthers = [];
    const scan = [['AGENTS.md', s.files.agentsMd], ['CLAUDE.md', s.files.claudeMd],
        ['brain4agent/memory/hot/today.md', s.files.todayMd]];
    for (const f of REQUIRED_FILES) scan.push(['brain4agent/' + f, s.files.brain[f]]);
    for (const pair of scan) {
        if (pair[1] && pair[1].hadBom) bomOthers.push({ rel: pair[0], encoding: 'utf8-bom' });
    }
    for (const fe of s.fileErrors) {
        if (fe.code === 'UTF16' || fe.code === 'INVALID_UTF8') bomOthers.push({ rel: fe.rel, encoding: fe.code });
    }
    if (s.files.stateJson && s.files.stateJson.hadBom) {
        add('BRN-013', 'state.json có BOM UTF-8 — engine sẽ ghi lại không BOM',
            { files: [{ rel: 'brain4agent/memory/hot/state.json', encoding: 'utf8-bom' }] });
    }
    if (bomOthers.length > 0) {
        add('BRN-013', 'File không đúng chuẩn UTF-8 không BOM: ' + bomOthers.map((x) => x.rel).join(', '),
            { files: bomOthers }, { fixable: false });
    }

    const isStandard = findings.every((f) => !f.fixable && f.level !== 'blocker' && f.level !== 'error');
    return { findings, isStandard, isBrandNew };
}

// formatFindings — THUẦN. Nhóm [tự sửa] trước, trong mỗi nhóm sort theo mã tăng dần.
function formatFindings(d) {
    const byCode = (a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
    const fixables = d.findings.filter((f) => f.fixable).sort(byCode);
    const manuals = d.findings.filter((f) => !f.fixable).sort(byCode);
    const parts = ['=== CHẨN ĐOÁN: CẦN NÂNG CẤP (' + fixables.length + ' lệch engine tự sửa · ' + manuals.length + ' việc cần người) ==='];
    for (const f of fixables.concat(manuals)) {
        parts.push(f.code + '  ' + f.level.padEnd(8) + ' ' + (f.fixable ? '[tự sửa]' : '[cần người]').padEnd(12) + f.message);
    }
    return parts.join('\n') + '\n';
}

// LỚP KẾ HOẠCH — computePlan THUẦN (không fs/Date/console/process), applyPlan I/O.
// Thứ tự ops BẤT BIẾN theo 01-CONTRACTS §2.3. Op 'log' chỉ in, không đụng đĩa.
// Thu tu BAT BIEN theo mang targetDirs cua v1.5.4.
const TARGET_DIRS = [
    ['brain4agent', 'brain'], ['brain4agent/memory', 'memory'], ['brain4agent/memory/hot', 'hot'],
    ['planning', 'planning'], ['.agents', 'agents'], ['.agents/skills', 'skills'], ['docs', 'docs']
];

function planCaseRenames(rootEntries) {
    const out = [];
    const has = (n) => rootEntries.indexOf(n) !== -1;
    if (has('DOCS') && !has('docs')) out.push({ from: 'DOCS', to: 'docs', via: 'temp_docs' });
    if (has('Plan') && !has('planning')) out.push({ from: 'Plan', to: 'planning', via: 'temp_plan' });
    return out;
}

function planMarkerOps(rootEntries, version) {
    const expected = `brain4agent-v${version}.md`;
    return {
        stale: rootEntries.filter((f) => BRAIN_MARKER_REGEX.test(f) && f !== expected),
        create: rootEntries.indexOf(expected) === -1
    };
}

function computePlan(s, version, now) {
    const ops = [];
    const notes = [];
    let stateJsonError = null;
    const say = (line) => ops.push({ op: 'log', stream: 'out', lines: [line] });
    const sayErr = (line) => ops.push({ op: 'log', stream: 'err', lines: [line] });
    const mixedWarn = (rel, eol) => (eol === 'mixed' ? [`⚠️ EOL trộn lẫn trong ${rel} — ghi lại theo LF (01-CONTRACTS §1.1).`] : []);

    if (!s.dirs.brain) say("⚡ [TRẠNG THÁI] Dự án mới tinh — Bắt đầu Khởi Tạo Trọn Gói Bộ Não V5.2...\n");
    else say("🔄 [TRẠNG THÁI] Phát hiện Não cũ / Chưa đồng bộ — Bắt đầu Tái Cấu Trúc & Migration...\n");

    // 1) Đổi tên thư mục viết hoa (qua tên trung gian — NTFS không phân biệt hoa/thường)
    const dirs = Object.assign({}, s.dirs);
    for (const r of planCaseRenames(s.rootEntries)) {
        const isDocs = r.to === 'docs';
        ops.push({
            op: 'rename',
            from: r.from,
            to: r.to,
            via: r.via,
            reason: 'chuan hoa ten thu muc viet thuong',
            logBefore: isDocs ? "🔄 Phát hiện thư mục DOCS (in hoa), tiến hành chuẩn hóa thành docs (viết thường)..." : "🔄 Phát hiện thư mục Plan (in hoa), tiến hành chuẩn hóa thành planning (viết thường)...",
            log: [isDocs ? "✅ Đã chuẩn hóa thư mục DOCS thành docs thành công." : "✅ Đã chuẩn hóa thư mục Plan thành planning thành công."],
            errLog: isDocs ? "⚠️ Không thể chuẩn hóa thư mục DOCS:" : "⚠️ Không thể chuẩn hóa thư mục Plan:"
        });
        if (isDocs) dirs.docs = true;
        else dirs.planning = true;
    }

    // 2) Tạo thư mục — ĐÚNG thứ tự targetDirs của v1.5.4
    for (const entry of TARGET_DIRS) {
        const rel = entry[0];
        if (!dirs[entry[1]]) {
            const relNative = rel.split('/').join(path.sep);
            ops.push({ op: 'mkdir', rel, reason: 'thu muc bat buoc', log: [`📁 Đã tạo thư mục: ${relNative}`] });
        }
    }

    // 3) Di trú latest_memory.md
    const todayRel = 'brain4agent/memory/hot/today.md';
    const hasLegacy = s.present['latest_memory.md'] === true;
    if (hasLegacy) {
        say("📦 Phát hiện latest_memory.md ở root -> Di dời vào brain4agent/memory/hot/...");
        if (!s.present[todayRel]) {
            const lg = s.files.legacyLatest;
            ops.push({ op: 'write', rel: todayRel, text: lg ? lg.text : '', eol: lg ? lg.eol : 'lf', create: true, reason: 'di tru latest_memory.md', log: [] });
        }
        ops.push({ op: 'delete', rel: 'latest_memory.md', reason: 'Root Clean', log: ["🗑️ Đã xóa latest_memory.md ở root để giữ chuẩn Root Clean 100%."] });
    }

    // 4) Bảy phân vùng brain4agent/
    const templates = renderTemplates(version, now);
    for (const filename of Object.keys(templates)) {
        const rel = 'brain4agent/' + filename;
        if (!s.present[rel]) {
            ops.push({ op: 'write', rel, text: templates[filename], eol: 'lf', create: true, reason: 'sinh phan vung chuan', log: [`✅ Đã tạo mới: brain4agent/${filename}`] });
        } else if (filename === 'memory-distill.txt') {
            const cur = s.files.distill;
            const res = patchDistill(cur.text);
            if (res.changed) {
                const lines = res.patches.map((p) => (p === 'step0' ? `🔄 Đã tự động vá Bước 0 (.xay-dung-nao-bo) vào brain4agent/memory-distill.txt` : `🔄 Kernel không theo khuôn <agent_startup_protocol> — đã chèn khối Bước 0 lên đầu brain4agent/memory-distill.txt (fallback).`));
                ops.push({ op: 'write', rel, text: res.content, eol: cur.eol, create: false, reason: 'va Buoc 0', log: lines.concat(mixedWarn(rel, cur.eol)) });
            } else {
                say(`📄 Đã có sẵn: brain4agent/${filename} (Giữ nguyên dữ liệu)`);
            }
        } else {
            say(`📄 Đã có sẵn: brain4agent/${filename} (Giữ nguyên dữ liệu)`);
        }
    }

    // 5) state.json — luôn ghi LF (bất biến I2)
    const stateRel = 'brain4agent/memory/hot/state.json';
    if (!s.present[stateRel]) {
        ops.push({ op: 'write', rel: stateRel, text: renderInitialState(version, now), eol: 'lf', create: true, reason: 'khoi tao state.json', log: ['✅ Đã tạo mới: memory/hot/state.json (kèm brain_template_version)'] });
    } else {
        try {
            const res = patchStateJson(s.files.stateJson.text, version);
            // hadBom: nội dung JSON có thể đã đúng nhưng file vẫn còn BOM ⇒ writeText ghi
            // lại KHÔNG BOM. Không có nhánh này thì BRN-013 (fixable) không bao giờ hội tụ.
            if (res.changed || s.files.stateJson.hadBom) {
                const lines = [];
                if (res.patches.indexOf('version') !== -1) lines.push(`🔄 Đã vá brain_template_version=${version} vào memory/hot/state.json (giữ nguyên các field khác).`);
                if (res.patches.indexOf('trailing-newline') !== -1) lines.push('🔄 Đã bổ sung newline cuối file cho memory/hot/state.json (chuẩn POSIX, sạch git diff).');
                if (s.files.stateJson.hadBom) lines.push('🔄 Đã ghi lại memory/hot/state.json dạng UTF-8 KHÔNG BOM.');
                ops.push({ op: 'write', rel: stateRel, text: res.content, eol: 'lf', create: false, reason: 'va brain_template_version', log: lines });
            } else {
                say('📄 Đã có sẵn: memory/hot/state.json (brain_template_version đúng chuẩn, giữ nguyên dữ liệu).');
            }
        } catch (e) {
            stateJsonError = e.message;
            sayErr('⚠️ Không thể vá brain_template_version vào state.json:' + ' ' + e.message);
        }
    }

    // 6) Marker phiên bản khung não
    const marker = planMarkerOps(s.rootEntries, version);
    for (const rel of marker.stale) {
        ops.push({ op: 'delete', rel, reason: 'marker loi thoi', tolerant: true, log: [`🗑️ Đã xoá marker phiên bản khung não lỗi thời: ${rel}`], errLog: `⚠️ Không thể xoá marker lỗi thời ${rel}:` });
    }
    const markerName = `brain4agent-v${version}.md`;
    if (marker.create) {
        ops.push({ op: 'write', rel: markerName, text: renderMarker(version, now), eol: 'lf', create: true, reason: 'marker dung phien ban', log: [`✅ Đã tạo mới marker phiên bản khung não: ${markerName}`] });
    } else {
        say(`📄 Đã có sẵn: ${markerName} (đúng chuẩn, giữ nguyên).`);
    }

    // 7) today.md (bỏ qua nếu vừa di trú từ latest_memory.md)
    if (!s.present[todayRel] && !hasLegacy) {
        ops.push({ op: 'write', rel: todayRel, text: renderTodayMd(now), eol: 'lf', create: true, reason: 'nhat ky phien', log: ['✅ Đã tạo mới: memory/hot/today.md'] });
    }

    // 8) AGENTS.md
    if (!s.present['AGENTS.md']) {
        ops.push({ op: 'write', rel: 'AGENTS.md', text: renderFullAgentsMd(), eol: 'lf', create: true, reason: 'sinh AGENTS.md chuan', log: ['✅ Đã tạo mới: AGENTS.md với ĐẦY ĐỦ CÁC BỘ LUẬT QUẢN TRỊ TINH HOA!'] });
    } else {
        const f = s.files.agentsMd;
        const res = patchAgentsMd(f.text, version);
        const lines = res.patches.map((p) => AGENTS_PATCH_LOGS[p]);
        if (res.changed) {
            ops.push({ op: 'write', rel: 'AGENTS.md', text: res.content, eol: f.eol, create: false, reason: 'va luat vao AGENTS.md', log: lines.concat(mixedWarn('AGENTS.md', f.eol)) });
        } else {
            for (const line of lines) say(line);
        }
        if (!res.patches.some((p) => p !== 'remove-legacy-planning')) say('📄 Đã có sẵn: AGENTS.md (đầy đủ luật, giữ nguyên).');
    }

    // 9) CLAUDE.md
    if (!s.present['CLAUDE.md']) {
        ops.push({ op: 'write', rel: 'CLAUDE.md', text: renderClaudeShim(), eol: 'lf', create: true, reason: 'sinh shim CLAUDE.md', log: ['✅ Đã tạo mới: CLAUDE.md (shim ≤10 dòng, trỏ @AGENTS.md — Dual Entry-Point Invariant).'] });
    } else {
        const f = s.files.claudeMd;
        const res = patchClaudeMd(f.text);
        if (res.changed) {
            ops.push({ op: 'write', rel: 'CLAUDE.md', text: res.content, eol: f.eol, create: false, reason: 'va @AGENTS.md', log: mixedWarn('CLAUDE.md', f.eol).concat(['🔄 Đã tự động vá dòng @AGENTS.md vào CLAUDE.md hiện có (giữ nguyên nội dung cũ).']) });
        } else {
            say('📄 Đã có sẵn: CLAUDE.md (đã trỏ @AGENTS.md, giữ nguyên).');
        }
    }

    return { ops, notes, stateJsonError };
}

// snapshotTextOf — tra TextFile gốc của một rel trong Snapshot (THUẦN, không fs).
function snapshotTextOf(s, rel) {
    if (rel === 'AGENTS.md') return s.files.agentsMd;
    if (rel === 'CLAUDE.md') return s.files.claudeMd;
    if (rel === 'latest_memory.md') return s.files.legacyLatest;
    if (rel === 'brain4agent/memory/hot/state.json') return s.files.stateJson;
    if (rel === 'brain4agent/memory/hot/today.md') return s.files.todayMd;
    if (rel.indexOf('brain4agent/') === 0) {
        const name = rel.slice('brain4agent/'.length);
        return Object.prototype.hasOwnProperty.call(s.files.brain, name) ? s.files.brain[name] : null;
    }
    return null;
}

// diffLines — LCS O(n·m) trên mảng dòng. AGENTS.md ≤ ~200 dòng nên đủ nhanh;
// CẤM kéo thư viện diff (bất biến 0-dependency).
function diffLines(oldLines, newLines) {
    const n = oldLines.length;
    const m = newLines.length;
    const lcs = [];
    for (let i = 0; i <= n; i++) lcs.push(new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            lcs[i][j] = oldLines[i] === newLines[j]
                ? lcs[i + 1][j + 1] + 1
                : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
        }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (oldLines[i] === newLines[j]) { out.push({ t: ' ', text: oldLines[i] }); i++; j++; }
        else if (lcs[i + 1][j] >= lcs[i][j + 1]) { out.push({ t: '-', text: oldLines[i] }); i++; }
        else { out.push({ t: '+', text: newLines[j] }); j++; }
    }
    while (i < n) { out.push({ t: '-', text: oldLines[i] }); i++; }
    while (j < m) { out.push({ t: '+', text: newLines[j] }); j++; }
    return out;
}

// Gom các đoạn thay đổi thành hunk unified với 3 dòng ngữ cảnh.
function toHunks(diff, context) {
    const changed = [];
    for (let k = 0; k < diff.length; k++) if (diff[k].t !== ' ') changed.push(k);
    if (changed.length === 0) return [];
    const ranges = [];
    let s = changed[0];
    let e = changed[0];
    for (const k of changed.slice(1)) {
        if (k - e <= context * 2) e = k;
        else { ranges.push([s, e]); s = k; e = k; }
    }
    ranges.push([s, e]);

    const hunks = [];
    let oldNo = 1;
    let newNo = 1;
    const oldAt = [];
    const newAt = [];
    for (const d of diff) {
        oldAt.push(oldNo);
        newAt.push(newNo);
        if (d.t !== '+') oldNo++;
        if (d.t !== '-') newNo++;
    }
    for (const r of ranges) {
        const from = Math.max(0, r[0] - context);
        const to = Math.min(diff.length - 1, r[1] + context);
        let oldCount = 0;
        let newCount = 0;
        const body = [];
        for (let k = from; k <= to; k++) {
            if (diff[k].t !== '+') oldCount++;
            if (diff[k].t !== '-') newCount++;
            body.push(diff[k].t + diff[k].text);
        }
        hunks.push('@@ -' + oldAt[from] + ',' + oldCount + ' +' + newAt[from] + ',' + newCount + ' @@');
        for (const line of body) hunks.push(line);
    }
    return hunks;
}

// renderDiff — THUẦN. Mô tả từng op sẽ thực hiện; file MỚI chỉ in số dòng (không
// đổ nguyên 150 dòng template ra màn hình — quy ước cố định SPEC-P01 a.4).
function renderDiff(plan, s) {
    const real = plan.ops.filter((op) => op.op !== 'log');
    const out = ['=== DRY-RUN: ' + real.length + ' thao tác sẽ thực hiện (không ghi) ==='];
    for (const op of real) {
        if (op.op === 'mkdir') {
            out.push('[mkdir]  ' + op.rel + '/');
        } else if (op.op === 'rename') {
            out.push('[rename] ' + op.from + ' -> ' + op.to + ' (qua ' + op.via + ')');
        } else if (op.op === 'delete') {
            out.push('[delete] ' + op.rel + '      # lý do: ' + op.reason);
        } else if (op.op === 'write') {
            const before = snapshotTextOf(s, op.rel);
            const newLines = op.text.split('\n');
            if (op.create || !before) {
                out.push('[write]  ' + op.rel + '  (mới, ' + newLines.length + ' dòng)  # lý do: ' + op.reason);
                continue;
            }
            const oldLines = before.text.split('\n');
            const diff = diffLines(oldLines, newLines);
            const plus = diff.filter((d) => d.t === '+').length;
            const minus = diff.filter((d) => d.t === '-').length;
            out.push('[write]  ' + op.rel + '  (eol=' + op.eol + ', +' + plus + ' dòng, -' + minus + ' dòng)  # lý do: ' + op.reason);
            out.push('--- a/' + op.rel);
            out.push('+++ b/' + op.rel);
            for (const line of toHunks(diff, 3)) out.push(line);
        }
    }
    return out.join('\n') + '\n';
}

// applyPlan — LỚP I/O GHI DUY NHẤT. Thi hành đúng thứ tự ops, không sắp xếp lại.
function applyPlan(rootDir, plan, log, errorLog) {
    const abs = (rel) => path.join(rootDir, ...rel.split('/'));
    let applied = 0;
    for (const op of plan.ops) {
        if (op.op === 'log') {
            for (const line of op.lines) (op.stream === 'err' ? errorLog : log)(line);
            continue;
        }
        if (op.op === 'rename') {
            try {
                log(op.logBefore);
                fs.renameSync(abs(op.from), abs(op.via));
                fs.renameSync(abs(op.via), abs(op.to));
                applied++;
            } catch (e) {
                errorLog(op.errLog + ' ' + e.message);
                continue;
            }
        } else if (op.op === 'mkdir') {
            fs.mkdirSync(abs(op.rel), { recursive: true });
            applied++;
        } else if (op.op === 'write') {
            writeText(abs(op.rel), op.text, op.eol);
            applied++;
        } else if (op.op === 'delete') {
            if (op.tolerant) {
                try {
                    fs.unlinkSync(abs(op.rel));
                    applied++;
                } catch (e) {
                    errorLog(op.errLog + ' ' + e.message);
                    continue;
                }
            } else {
                fs.unlinkSync(abs(op.rel));
                applied++;
            }
        } else {
            throw new TypeError('[brain-engine] op khong ho tro: ' + op.op);
        }
        for (const line of (op.log || [])) log(line);
    }
    return { applied };
}

// ĐIỂM VÀO LẬP TRÌNH — không process.exit, không console.*,
// không bắt exception của chính nó (main() là nơi DUY NHẤT bắt ⇒ mã 3).
// Phân loại mã thoát (01-CONTRACTS §6): xem exitCodeForDiagnosis().
const VALID_MODES = ['write', 'check', 'dry-run'];

// Mã thoát của nhánh CHỈ ĐỌC (--check/--dry-run):
//   2 nếu còn finding KHÔNG fixable ở mức error/blocker (người phải xử) — ưu tiên cao nhất
//   1 nếu có finding fixable (chế độ ghi SẼ sửa)
//   0 nếu chỉ còn warning không fixable
function exitCodeForDiagnosis(d) {
    if (d.findings.some((f) => !f.fixable && (f.level === 'error' || f.level === 'blocker'))) return 2;
    if (d.findings.some((f) => f.fixable)) return 1;
    return 0;
}

function runBrainEngine(opts) {
    const rootDir = opts.rootDir;
    const logger = opts.logger || function () {};
    const errorLogger = opts.errorLogger || function () {};
    const mode = opts.mode || 'write';
    const now = opts.now || new Date();
    const templateVersion = opts.templateVersion || BRAIN_TEMPLATE_VERSION;
    if (VALID_MODES.indexOf(mode) === -1) {
        throw new RangeError('[brain-engine] mode khong hop le: ' + mode);
    }
    const emitFindings = (d) => {
        const text = formatFindings(d);
        logger(text.replace(/\n$/, () => ''));
    };

    const snapshot = collectSnapshot(rootDir);
    const diagnosis = diagnose(snapshot, templateVersion);

    // File dự án không đọc được (UTF-16 / UTF-8 hỏng) là lỗi CỦA DỰ ÁN ⇒ 2, KHÔNG BAO GIỜ 3.
    if (snapshot.fileErrors.length > 0) {
        for (const fe of snapshot.fileErrors) {
            errorLogger('[brain-engine] Không đọc được ' + fe.rel + ' (' + fe.code + '): ' + fe.message);
        }
        return { exitCode: 2, diagnosis, plan: null, applied: 0, diagnosisAfter: null };
    }

    logger("\n===========================================================");
    logger("🧠 UNIVERSAL BRAIN GOVERNANCE ENGINE — CHUẨN ĐA TẦNG V5.2");
    logger("===========================================================");
    logger("📁 Project Root: " + rootDir + "\n");

    if (diagnosis.isStandard) {
        logger("🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!");
        logger("-----------------------------------------------------------");
        logger("✅ Thư mục brain4agent/ đầy đủ 7 phân vùng cố định.");
        logger("✅ Phân khu Hot Memory (brain4agent/memory/hot/) đang hoạt động.");
        logger("✅ Thư mục planning/ và .agents/skills/ chuẩn hoá.");
        logger("✅ Giao thức khởi động có Bước 0 (.xay-dung-nao-bo boot) trong AGENTS.md & memory-distill.txt.");
        logger("✅ Bất Biến Hai Điểm Nạp: AGENTS.md (nguồn chân lý) + CLAUDE.md (shim) đều tồn tại.");
        logger("✅ AGENTS.md chứa đủ Luật J (Dual Entry-Point Invariant) và Ngoại Lệ Marker (§5.G mục 3).");
        logger("✅ Marker Phiên Bản Khung Não: brain4agent-v" + templateVersion + ".md đúng chuẩn tại root.");
        logger("✅ Thư mục root sạch sẽ 100% (Root Clean Invariant).");
        logger("-----------------------------------------------------------");
        logger("👉 Trạng thái: NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM!\n");
        if (diagnosis.findings.length > 0) {
            logger("⚠️ Còn cảnh báo KHÔNG do engine sửa (cần người soi):");
            for (const f of diagnosis.findings) logger("   " + f.code + "  " + f.message + " — " + f.fix);
            logger("");
        }
        return { exitCode: 0, diagnosis, plan: null, applied: 0, diagnosisAfter: null };
    }

    const plan = computePlan(snapshot, templateVersion, now);

    // Nhánh CHỈ ĐỌC: TUYỆT ĐỐI không gọi applyPlan (không mkdir/write/unlink/rename).
    if (mode === 'check' || mode === 'dry-run') {
        emitFindings(diagnosis);
        if (mode === 'dry-run') logger('\n' + renderDiff(plan, snapshot).replace(/\n$/, () => ''));
        return { exitCode: exitCodeForDiagnosis(diagnosis), diagnosis, plan, applied: 0, diagnosisAfter: null };
    }

    const applyResult = applyPlan(rootDir, plan, logger, errorLogger);

    // Chẩn đoán LẠI sau khi ghi — giết lớp lỗi "vá hụt mà báo xong" (SPEC-P01 (b) BẮT BUỘC 7).
    const snapshotAfter = collectSnapshot(rootDir);
    const diagnosisAfter = diagnose(snapshotAfter, templateVersion);
    const converged = diagnosisAfter.isStandard && snapshotAfter.fileErrors.length === 0;

    if (!converged) {
        for (const fe of snapshotAfter.fileErrors) {
            errorLogger('[brain-engine] Không đọc được ' + fe.rel + ' (' + fe.code + '): ' + fe.message);
        }
        errorLogger('[brain-engine] KHÔNG HỘI TỤ sau khi ghi:');
        errorLogger(formatFindings(diagnosisAfter).replace(/\n$/, () => ''));
        return { exitCode: 2, diagnosis, plan, applied: applyResult.applied, diagnosisAfter };
    }

    logger("\n===========================================================");
    logger("✨ THIẾT LẬP & TÁI CẤU TRÚC NÃO BỘ V5.2 HOÀN TẤT THÀNH CÔNG!");
    logger("===========================================================\n");

    if (diagnosisAfter.findings.length > 0) {
        logger("⚠️ Còn cảnh báo KHÔNG do engine sửa (cần người soi):");
        for (const f of diagnosisAfter.findings) logger("   " + f.code + "  " + f.message + " — " + f.fix);
        logger("");
    }

    return { exitCode: 0, diagnosis, plan, applied: applyResult.applied, diagnosisAfter };
}

// VỎ CLI — nơi DUY NHẤT đọc process.argv/process.env và ghi ra stdout/stderr.
function usage() {
    return [
        'Universal Brain Governance Engine — engine ' + ENGINE_VERSION + ', khung não ' + BRAIN_TEMPLATE_VERSION,
        '',
        'Cách dùng:',
        '  node init_brain.js [rootDir] [--check | --dry-run]',
        '  node init_brain.js --version',
        '  node init_brain.js --help',
        '',
        'Đối số:',
        '  rootDir        Thư mục dự án cần dựng/đồng bộ não (mặc định: thư mục hiện tại).',
        '',
        'Cờ:',
        '  --check        CHỈ ĐỌC. Chẩn đoán và in bảng findings, KHÔNG ghi bất cứ thứ gì.',
        '  --dry-run      CHỈ ĐỌC. Như --check, kèm diff từng thao tác mà chế độ ghi sẽ làm.',
        '  --version      In một dòng "brain-engine <engine> template <khung>" rồi thoát.',
        '  --help         In trợ giúp này.',
        '',
        'Không cờ = CHẾ ĐỘ GHI (mặc định, dùng cho Bước 0 của Agent Startup Protocol).',
        '',
        'Mã thoát: 0 đạt chuẩn/hội tụ · 1 có lệch engine tự sửa được (--check/--dry-run)',
        '          2 cần người xử lý hoặc không hội tụ · 3 lỗi nội bộ engine · 64 dùng sai.',
        ''
    ].join('\n');
}

function parseArgs(argv) {
    const errors = [];
    const positionals = [];
    let wantsCheck = false;
    let wantsDryRun = false;
    let wantsVersion = false;
    let wantsHelp = false;

    for (const a of argv) {
        if (a === '--check') wantsCheck = true;
        else if (a === '--dry-run') wantsDryRun = true;
        else if (a === '--version') wantsVersion = true;
        else if (a === '--help') wantsHelp = true;
        else if (a.length > 1 && a.charAt(0) === '-') errors.push('Cờ không hợp lệ: ' + a);
        else positionals.push(a);
    }
    if (wantsCheck && wantsDryRun) errors.push('Không dùng đồng thời --check và --dry-run.');
    if (positionals.length > 1) errors.push('Chỉ nhận tối đa MỘT đối số vị trí (rootDir), nhận được ' + positionals.length + '.');

    let mode = 'write';
    if (wantsHelp) mode = 'help';
    else if (wantsVersion) mode = 'version';
    else if (wantsCheck) mode = 'check';
    else if (wantsDryRun) mode = 'dry-run';

    const rootDir = positionals[0] ? path.resolve(positionals[0]) : process.cwd();
    return { rootDir, mode, errors };
}

function main(argv, env, io) {
    const environ = env || {};
    let args;
    try {
        args = parseArgs(argv);
    } catch (e) {
        io.stderr('[brain-engine] LỖI NỘI BỘ: ' + ((e && e.stack) || e) + '\n');
        return 3;
    }
    if (args.errors.length > 0) {
        for (const err of args.errors) io.stderr('[brain-engine] ' + err + '\n');
        io.stderr(usage());
        return 64;
    }
    // --version / --help: KHÔNG đọc đĩa, KHÔNG in banner.
    if (args.mode === 'version') {
        io.stdout('brain-engine ' + ENGINE_VERSION + ' template ' + BRAIN_TEMPLATE_VERSION + '\n');
        return 0;
    }
    if (args.mode === 'help') {
        io.stdout(usage());
        return 0;
    }

    let now = new Date();
    if (environ.BRAIN_NOW) {
        now = new Date(environ.BRAIN_NOW);
        if (isNaN(now.getTime())) {
            io.stderr('[brain-engine] BRAIN_NOW không phải mốc thời gian hợp lệ: ' + environ.BRAIN_NOW + '\n');
            return 64;
        }
    }

    try {
        const r = runBrainEngine({
            rootDir: args.rootDir,
            mode: args.mode,
            now,
            logger: (line) => io.stdout(line + '\n'),
            errorLogger: (line) => io.stderr(line + '\n')
        });
        return r.exitCode;
    } catch (e) {
        // rootDir sai là DÙNG SAI (64), không phải lỗi engine (3).
        if (e && e.name === 'RootError') {
            io.stderr('[brain-engine] ' + e.message + '\n');
            io.stderr(usage());
            return 64;
        }
        io.stderr('[brain-engine] LỖI NỘI BỘ: ' + ((e && e.stack) || e) + '\n');
        return 3;
    }
}

module.exports = {
    BRAIN_TEMPLATE_VERSION,
    ENGINE_VERSION,
    REQUIRED_FILES,
    stripBom,
    detectEol,
    normalizeEol,
    restoreEol,
    hasUtf8Bom,
    detectEncoding,
    readText,
    writeText,
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
    BRN,
    collectSnapshot,
    diagnose,
    formatFindings,
    renderDiff,
    planCaseRenames,
    planMarkerOps,
    computePlan,
    applyPlan,
    runBrainEngine,
    exitCodeForDiagnosis,
    usage,
    parseArgs,
    main
};

if (require.main === module) {
    process.exitCode = main(process.argv.slice(2), process.env, {
        stdout: (s) => process.stdout.write(s),
        stderr: (s) => process.stderr.write(s)
    });
}
