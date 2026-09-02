'use strict';
// brain-doctor — quét độ lệch toàn hệ sinh thái brain4agent. CHỈ ĐỌC.
// Hợp đồng: planning/09_.../specs/SPEC-P04-brain-doctor.md + 01-CONTRACTS §4, §6, §7, §8.
//
// BẤT BIẾN CỦA FILE NÀY:
//   1. CHỈ ĐỌC tuyệt đối. Ngoại lệ DUY NHẤT: một lời gọi `writeText` để ghi báo cáo
//      khi người dùng chỉ định tường minh `--json <file>`.
//   2. "Thế nào là chuẩn" cho BRN-001..013 do `diagnose()` của engine quyết định.
//      Doctor CẤM tự định nghĩa lại. Doctor chỉ bổ sung BRN-014/BRN-015 (cột D của §8).
//   3. I/O bị chặn cứng: mỗi repo chỉ đọc thư mục gốc + brain4agent/ + memory/hot/,
//      cộng đúng 1 lời gọi stat cho mỗi mục con cấp 1. KHÔNG đi sâu hơn cấp 1.
//   4. Mã thoát 3 CHỈ phát sinh từ `catch` bao ngoài cùng của main().
//      Lỗi khi quét MỘT repo => repo đó SCAN_ERROR, vòng quét đi tiếp.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const engine = require('./init_brain.js');
const {
    BRAIN_TEMPLATE_VERSION, ENGINE_VERSION,
    collectSnapshot, diagnose, writeText, BRN
} = engine;

const TOOL_NAME = 'brain-doctor';
const SCHEMA_VERSION = 1;
const DEFAULT_GIT_TIMEOUT = 5000;
const REPO_COL = 38;
const MARKER_RE = /^brain4agent-v(\d+\.\d+\.\d+)\.md$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

// Hai mã CHỈ doctor kiểm (§8 cột "Ai kiểm" = D). Engine không biết chúng: đây là
// quan sát về CẤU TRÚC KHO, không phải về chuẩn khung não => không vi phạm bất biến 2.
const DOCTOR_BRN = {
    'BRN-014': {
        level: 'warning',
        title: 'Thư mục con cấp 1 có .git riêng (repo lồng repo)',
        fix: 'Quyết định: gitignore / submodule / gỡ tầng — do người'
    },
    'BRN-015': {
        level: 'warning',
        title: 'Git bất thường (.git là file / HEAD chưa sinh / ref hỏng / timeout)',
        fix: 'KHÔNG suy ra repo hỏng; soi tay .git/refs khi cần'
    }
};

// ---------------------------------------------------------------------------
// Tiện ích thuần
// ---------------------------------------------------------------------------

// Cắt chuỗi theo CODE POINT (không theo byte) — tên tiếng Việt có dấu không bị cắt vỡ.
function padTrim(s, width) {
    const cps = Array.from(String(s));
    if (cps.length > width) return cps.slice(0, width - 1).join('') + '…';
    return cps.join('') + ' '.repeat(width - cps.length);
}

// A9: báo cáo và stdout CẤM chứa đường dẫn tuyệt đối. Dùng split/join thay cho
// replace() để không dính luật "$-pattern" của 01-CONTRACTS §2.2.
function scrub(text, secrets) {
    let out = String(text === undefined || text === null ? '' : text);
    for (const s of secrets) {
        if (s) out = out.split(s).join('<root>');
    }
    return out.split('\\').join('/');
}

function sortViet(a, b) {
    try { return a.localeCompare(b, 'vi', { numeric: true }); } catch (e) { return a < b ? -1 : a > b ? 1 : 0; }
}

function statusFromFindings(findings) {
    if (findings.some((f) => f.level === 'blocker')) return 'BLOCKER';
    if (findings.some((f) => f.level === 'error')) return 'ERROR';
    if (findings.some((f) => f.level === 'warning')) return 'WARNING';
    return 'CLEAN';
}

// ---------------------------------------------------------------------------
// Lớp git — mảng đối số, shell:false, timeout. Không bao giờ nội suy chuỗi lệnh
// (bẫy E.6: tên thư mục có dấu cách / tiếng Việt có dấu).
// ---------------------------------------------------------------------------

function runGit(repoDir, args, timeout) {
    const r = spawnSync('git', ['-C', repoDir].concat(args), {
        timeout,
        encoding: 'utf8',
        windowsHide: true,
        shell: false,
        env: Object.assign({}, process.env, { LC_ALL: 'C', GIT_TERMINAL_PROMPT: '0' })
    });
    if (r.error && r.error.code === 'ENOENT') return { status: 127, stdout: '', stderr: 'git not found' };
    return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

// Bẫy E.5: MỘT ref hỏng khiến các lệnh duyệt toàn bộ đối tượng chết fatal — không
// được suy ra "repo hỏng" từ đó. Chỉ dùng 3 lệnh rẻ, đọc-metadata dưới đây.
function probeGit(repoDir, kind, timeout) {
    const detail = [];
    let head = 'ok';

    const inside = runGit(repoDir, ['rev-parse', '--is-inside-work-tree'], timeout);
    if (inside.status === null) {
        return { head: 'timeout', detail: 'rev-parse --is-inside-work-tree timeout', stderr: '' };
    }

    const verify = runGit(repoDir, ['rev-parse', '--verify', '--quiet', 'HEAD'], timeout);
    if (verify.status === null) return { head: 'timeout', detail: 'rev-parse HEAD timeout', stderr: '' };
    if (verify.status !== 0) { head = 'unborn'; detail.push('HEAD chưa sinh (0 commit)'); }

    const refs = runGit(repoDir, ['for-each-ref', '--count=1', '--format=%(objectname)', 'refs/heads'], timeout);
    if (refs.status === null) return { head: 'timeout', detail: 'for-each-ref timeout', stderr: '' };
    const refErr = String(refs.stderr || '');
    if (refs.status !== 0 || /bad ref|broken/i.test(refErr)) {
        head = 'broken';
        detail.push('ref hỏng');
    }

    if (kind === 'file') detail.push('gitdir-file (worktree/submodule)');
    return { head, detail: detail.join(' · '), stderr: refErr.trim() };
}

// ---------------------------------------------------------------------------
// Quét
// ---------------------------------------------------------------------------

// Bẫy E.2: `.git` có thể là FILE (liên kết worktree/submodule), không chỉ thư mục.
function gitKind(repoDir) {
    try {
        const st = fs.statSync(path.join(repoDir, '.git'));
        if (st.isDirectory()) return 'dir';
        if (st.isFile()) return 'file';
        return 'unknown';
    } catch (e) {
        if (e && e.code === 'ENOENT') return 'none';
        return 'unknown';
    }
}

function isCandidate(repoDir, kind) {
    if (kind !== 'none') return true;
    if (fs.existsSync(path.join(repoDir, 'AGENTS.md'))) return true;
    if (fs.existsSync(path.join(repoDir, 'brain4agent'))) return true;
    return false;
}

// BRN-013 của doctor = TOÀN TẬP (12 file). Engine phát BRN-013 làm 2 finding rời
// (state.json fixable / phần còn lại không fixable) — gộp lại thành MỘT dòng để in.
function mergeBom013(findings) {
    const bom = findings.filter((f) => f.code === 'BRN-013');
    if (bom.length < 2) return findings;
    const files = [];
    for (const f of bom) for (const x of ((f.detail && f.detail.files) || [])) files.push(x);
    files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
    const merged = {
        code: 'BRN-013',
        level: 'warning',
        message: 'File không đúng chuẩn UTF-8 không BOM: ' + files.map((x) => x.rel).join(', '),
        fix: BRN['BRN-013'].fix,
        detail: { files }
    };
    return findings.filter((f) => f.code !== 'BRN-013').concat([merged]);
}

// BRN-014: ĐÚNG MỘT lời gọi stat cho mỗi mục con cấp 1. Bẫy E.7 — đi sâu hơn cấp 1
// làm thời gian quét nổ theo cấp số nhân (số đo E: quét toàn cây treo quá 5 phút).
function findNestedGit(repoDir) {
    const nested = [];
    let entries = [];
    try { entries = fs.readdirSync(repoDir, { withFileTypes: true }); } catch (e) { return nested; }
    for (const ent of entries) {
        if (!ent.isDirectory()) continue;
        if (ent.name === '.git' || ent.name === 'node_modules') continue;
        if (gitKind(path.join(repoDir, ent.name)) !== 'none') nested.push(ent.name);
    }
    return nested.sort(sortViet);
}

function scanRepo(repoDir, name, rootIndex, kind, opts) {
    const t0 = Date.now();
    const rec = {
        name,
        root_index: rootIndex,
        status: 'CLEAN',
        git: { kind, head: opts.noGit ? 'skipped' : 'unknown' },
        template_version: null,
        marker_version: null,
        findings: [],
        duration_ms: 0
    };

    try {
        // 1-2. MỘT nguồn chân lý về "chuẩn": snapshot + diagnose của engine.
        const snap = collectSnapshot(repoDir);
        const diag = diagnose(snap, opts.expectTemplate);
        let findings = diag.findings.map((f) => ({
            code: f.code, level: f.level, message: f.message, fix: f.fix, detail: f.detail || {}
        }));
        findings = mergeBom013(findings);

        // Phiên bản quan sát được (chỉ để BÁO CÁO, không dùng để suy ra chuẩn).
        if (snap.files.stateJson) {
            try {
                const obj = JSON.parse(snap.files.stateJson.text);
                if (obj && typeof obj === 'object' && !Array.isArray(obj)
                    && typeof obj.brain_template_version === 'string') {
                    rec.template_version = obj.brain_template_version;
                }
            } catch (e) { rec.template_version = null; }
        }
        const markers = snap.rootEntries.filter((f) => MARKER_RE.test(f));
        if (markers.length === 1) rec.marker_version = MARKER_RE.exec(markers[0])[1];

        // 4. BRN-014
        const nested = findNestedGit(repoDir);
        if (nested.length > 0) {
            findings.push({
                code: 'BRN-014',
                level: DOCTOR_BRN['BRN-014'].level,
                message: 'Thư mục con cấp 1 có .git riêng: ' + nested.join(', '),
                fix: DOCTOR_BRN['BRN-014'].fix,
                detail: { dirs: nested }
            });
        }

        // 5. BRN-015
        if (opts.noGit || kind === 'none') {
            rec.git.head = 'skipped';
        } else {
            const g = probeGit(repoDir, kind, opts.gitTimeout);
            rec.git.head = g.head;
            if (g.detail) rec.git.detail = scrub(g.detail, opts.secrets);
            if (g.head !== 'ok' || kind === 'file') {
                findings.push({
                    code: 'BRN-015',
                    level: DOCTOR_BRN['BRN-015'].level,
                    message: 'Git bất thường: ' + (g.detail || g.head),
                    fix: DOCTOR_BRN['BRN-015'].fix,
                    detail: { head: g.head, stderr: scrub(g.stderr, opts.secrets) }
                });
            }
        }

        findings.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
        rec.findings = findings;
        rec.status = statusFromFindings(findings);
    } catch (e) {
        // 6. Lỗi quét MỘT repo KHÔNG dừng vòng quét và KHÔNG bao giờ thành mã thoát 3.
        rec.status = 'SCAN_ERROR';
        rec.findings = [];
        rec.scan_error = scrub(((e && e.code) ? e.code + ' ' : '') + ((e && e.message) || String(e)), opts.secrets);
    }

    rec.duration_ms = Date.now() - t0;
    return rec;
}

function scanRoot(rootDir, rootIndex, opts, out) {
    // Bẫy E.1: KHÔNG lọc mục bắt đầu bằng '.' — thư mục ẩn vẫn là repo thật.
    const entries = fs.readdirSync(rootDir, { withFileTypes: true });
    entries.sort((a, b) => sortViet(a.name, b.name));

    for (const ent of entries) {
        if (!ent.isDirectory() && !ent.isSymbolicLink()) continue;
        const name = ent.name;
        const repoDir = path.join(rootDir, name);

        if (opts.exclude.has(name)) {
            out.push({
                name, root_index: rootIndex, status: 'SKIPPED', skip_reason: 'excluded',
                git: { kind: 'unknown', head: 'unknown' },
                template_version: null, marker_version: null, findings: [], duration_ms: 0
            });
            continue;
        }

        const kind = gitKind(repoDir);
        if (!isCandidate(repoDir, kind)) {
            out.push({
                name, root_index: rootIndex, status: 'SKIPPED', skip_reason: 'not-a-repo',
                git: { kind, head: 'skipped' },
                template_version: null, marker_version: null, findings: [], duration_ms: 0
            });
            continue;
        }

        out.push(scanRepo(repoDir, name, rootIndex, kind, opts));
    }
}

// ---------------------------------------------------------------------------
// Trình bày
// ---------------------------------------------------------------------------

function findingTag(f) {
    if (f.code === 'BRN-005' && f.detail && f.detail.lines) return 'BRN-005(' + f.detail.lines + ')';
    if (f.code === 'BRN-013' && f.detail && Array.isArray(f.detail.files)) {
        return 'BRN-013(' + f.detail.files.map((x) => path.basename(x.rel) + ':' + x.encoding).join(', ') + ')';
    }
    if (f.code === 'BRN-014') return 'BRN-014(sub)';
    if (f.code === 'BRN-015') {
        const h = (f.detail && f.detail.head) || '';
        return 'BRN-015(' + (h === 'ok' ? 'gitdir-file' : h) + ')';
    }
    return f.code;
}

function renderTable(report) {
    const lines = [];
    lines.push(TOOL_NAME + ' ' + report.tool.engine_version
        + ' · template kỳ vọng ' + report.expected_template_version
        + ' · git: ' + (report.tool.git_enabled ? 'on' : 'off')
        + ' · roots: ' + report.roots.length);
    lines.push(padTrim('REPO', REPO_COL) + ' ' + padTrim('GIT', 10) + ' ' + padTrim('STATUS', 11) + 'FINDINGS');

    for (const r of report.repos) {
        const git = (r.status === 'SKIPPED' && r.skip_reason === 'excluded')
            ? '-/-'
            : r.git.kind + '/' + (r.git.head === 'skipped' ? '-' : r.git.head);
        const col = r.status === 'SKIPPED'
            ? (r.skip_reason || '-')
            : r.status === 'SCAN_ERROR'
                ? (r.scan_error || 'scan error')
                : (r.findings.length ? r.findings.map(findingTag).join(' ') : '-');
        lines.push(padTrim(r.name, REPO_COL) + ' ' + padTrim(git, 10) + ' ' + padTrim(r.status, 11) + col);
    }

    for (const r of report.repos) {
        if (r.status === 'CLEAN' || r.status === 'SKIPPED') continue;
        lines.push('');
        lines.push(r.name);
        if (r.scan_error) lines.push('  SCAN_ERROR      ' + r.scan_error);
        for (const f of r.findings) {
            lines.push('  ' + f.code + ' ' + f.level.padEnd(8) + ' ' + f.message + ' · fix: ' + f.fix);
        }
    }

    const s = report.summary;
    lines.push('');
    lines.push('SUMMARY candidates=' + s.candidates + ' clean=' + s.clean + ' warning=' + s.warning
        + ' error=' + s.error + ' blocker=' + s.blocker + ' scan_error=' + s.scan_error
        + ' skipped=' + s.skipped + ' duration_ms=' + s.duration_ms + ' exit=' + report.exit_code);
    return lines.join('\n') + '\n';
}

function renderQuiet(report) {
    const s = report.summary;
    return 'SUMMARY candidates=' + s.candidates + ' clean=' + s.clean + ' warning=' + s.warning
        + ' error=' + s.error + ' blocker=' + s.blocker + ' scan_error=' + s.scan_error
        + ' skipped=' + s.skipped + ' duration_ms=' + s.duration_ms + ' exit=' + report.exit_code + '\n';
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage() {
    return [
        '',
        TOOL_NAME + ' ' + ENGINE_VERSION + ' — quét độ lệch khung não toàn hệ sinh thái (CHỈ ĐỌC).',
        '',
        'Cách dùng:',
        '  node brain_doctor.js --root <kho> [--root <kho>...] [cờ]',
        '  node brain_doctor.js --repo <dir> [--repo <dir>...] [cờ]',
        '',
        'Cờ:',
        '  --root <kho>              Thư mục CHỨA các repo; mỗi mục con cấp 1 là một ứng viên.',
        '  --repo <dir>              Quét đúng một thư mục như một repo.',
        '  --exclude <tên>           Bỏ qua mục con trùng TÊN (lặp được).',
        '  --json <file>             Ghi fleet-report.json (thư mục cha phải tồn tại).',
        '  --format table|json|quiet Kiểu xuất ra stdout (mặc định: table).',
        '  --expect-template <x.y.z> Phiên bản khung não kỳ vọng (mặc định: ' + BRAIN_TEMPLATE_VERSION + ').',
        '  --no-git                  Không chạy lệnh git nào; BRN-015 = skipped.',
        '  --git-timeout <ms>        Timeout mỗi lệnh git (mặc định: ' + DEFAULT_GIT_TIMEOUT + ').',
        '  --version / --help',
        '',
        'CHỈ ĐỌC: công cụ này KHÔNG có chế độ sửa. Nó chỉ đề xuất cách sửa dạng chữ.',
        '',
        'Mã thoát: 0 tất cả sạch · 1 chỉ có cảnh báo · 2 có BLOCKER/ERROR/SCAN_ERROR',
        '          3 doctor tự lỗi · 64 dùng sai cờ.',
        ''
    ].join('\n');
}

function parseArgs(argv) {
    const a = {
        roots: [], repos: [], exclude: [], jsonPath: null, format: 'table',
        expectTemplate: BRAIN_TEMPLATE_VERSION, noGit: false,
        gitTimeout: DEFAULT_GIT_TIMEOUT, mode: 'scan', errors: []
    };
    const need = (i, flag) => {
        if (i + 1 >= argv.length) { a.errors.push('Cờ ' + flag + ' cần một giá trị.'); return null; }
        return argv[i + 1];
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--root') { const v = need(i, arg); if (v !== null) { a.roots.push(v); i++; } }
        else if (arg === '--repo') { const v = need(i, arg); if (v !== null) { a.repos.push(v); i++; } }
        else if (arg === '--exclude') { const v = need(i, arg); if (v !== null) { a.exclude.push(v); i++; } }
        else if (arg === '--json') { const v = need(i, arg); if (v !== null) { a.jsonPath = v; i++; } }
        else if (arg === '--format') {
            const v = need(i, arg);
            if (v !== null) {
                if (['table', 'json', 'quiet'].indexOf(v) === -1) a.errors.push('--format chỉ nhận table|json|quiet, nhận được: ' + v);
                else a.format = v;
                i++;
            }
        } else if (arg === '--expect-template') {
            const v = need(i, arg);
            if (v !== null) {
                if (!SEMVER_RE.test(v)) a.errors.push('--expect-template phải dạng x.y.z, nhận được: ' + v);
                else a.expectTemplate = v;
                i++;
            }
        } else if (arg === '--no-git') a.noGit = true;
        else if (arg === '--git-timeout') {
            const v = need(i, arg);
            if (v !== null) {
                const n = Number(v);
                if (!Number.isInteger(n) || n <= 0) a.errors.push('--git-timeout phải là số nguyên dương (ms), nhận được: ' + v);
                else a.gitTimeout = n;
                i++;
            }
        } else if (arg === '--version') a.mode = 'version';
        else if (arg === '--help') a.mode = 'help';
        else a.errors.push('Đối số không hợp lệ: ' + arg);
    }

    if (a.mode === 'scan' && a.roots.length === 0 && a.repos.length === 0) {
        a.errors.push('Bắt buộc có ít nhất một --root hoặc --repo.');
    }
    return a;
}

function main(argv, env, io) {
    let args;
    try {
        args = parseArgs(argv);
    } catch (e) {
        io.stderr('[' + TOOL_NAME + '] LỖI NỘI BỘ: ' + ((e && e.stack) || e) + '\n');
        return 3;
    }
    if (args.errors.length > 0) {
        for (const err of args.errors) io.stderr('[' + TOOL_NAME + '] ' + err + '\n');
        io.stderr(usage());
        return 64;
    }
    if (args.mode === 'version') {
        io.stdout(TOOL_NAME + ' ' + ENGINE_VERSION + ' template ' + BRAIN_TEMPLATE_VERSION + '\n');
        return 0;
    }
    if (args.mode === 'help') { io.stdout(usage()); return 0; }

    try {
        const t0 = Date.now();
        const targets = args.roots.map((p) => ({ dir: path.resolve(p), kind: 'root' }))
            .concat(args.repos.map((p) => ({ dir: path.resolve(p), kind: 'repo' })));

        // Root không tồn tại là lỗi CỦA DOCTOR (mã 3), không phải lỗi của repo nào.
        for (const t of targets) {
            let st = null;
            try { st = fs.statSync(t.dir); } catch (e) { st = null; }
            if (!st || !st.isDirectory()) {
                io.stderr('[' + TOOL_NAME + '] root không tồn tại: ' + path.basename(t.dir) + '\n');
                return 3;
            }
        }

        const opts = {
            exclude: new Set(args.exclude),
            expectTemplate: args.expectTemplate,
            noGit: args.noGit,
            gitTimeout: args.gitTimeout,
            secrets: targets.map((t) => t.dir).concat(targets.map((t) => t.dir.split('\\').join('/')))
        };

        const repos = [];
        targets.forEach((t, idx) => {
            if (t.kind === 'root') scanRoot(t.dir, idx, opts, repos);
            else repos.push(scanRepo(t.dir, path.basename(t.dir), idx, gitKind(t.dir), opts));
        });

        const count = (s) => repos.filter((r) => r.status === s).length;
        const summary = {
            candidates: repos.length,
            clean: count('CLEAN'),
            warning: count('WARNING'),
            error: count('ERROR'),
            blocker: count('BLOCKER'),
            scan_error: count('SCAN_ERROR'),
            skipped: count('SKIPPED'),
            duration_ms: Date.now() - t0
        };

        let exitCode = 0;
        if (summary.blocker > 0 || summary.error > 0 || summary.scan_error > 0) exitCode = 2;
        else if (summary.warning > 0) exitCode = 1;

        const report = {
            schema_version: SCHEMA_VERSION,
            generated_at: new Date().toISOString(),
            tool: {
                name: TOOL_NAME,
                engine_version: ENGINE_VERSION,
                template_version: BRAIN_TEMPLATE_VERSION,
                node: process.version,
                git_enabled: !args.noGit
            },
            expected_template_version: args.expectTemplate,
            roots: targets.map((t, idx) => ({ index: idx, label: path.basename(t.dir), kind: t.kind })),
            summary,
            exit_code: exitCode,
            repos
        };

        if (args.format === 'json') io.stdout(JSON.stringify(report, null, 2) + '\n');
        else if (args.format === 'quiet') io.stdout(renderQuiet(report));
        else io.stdout(renderTable(report));

        if (args.jsonPath) {
            // NGOẠI LỆ CHỈ-ĐỌC DUY NHẤT của file này: đích do người dùng chỉ định tường minh.
            try {
                writeText(path.resolve(args.jsonPath), JSON.stringify(report, null, 2) + '\n', 'lf');
            } catch (e) {
                // A9: chỉ nêu TÊN file + mã lỗi; thông điệp gốc của Node nhúng đường dẫn tuyệt đối.
                io.stderr('[' + TOOL_NAME + '] không ghi được báo cáo: ' + path.basename(args.jsonPath)
                    + ' (' + ((e && e.code) || 'EIO') + ' — kiểm tra thư mục cha đã tồn tại chưa)\n');
                return 3;
            }
        }
        return exitCode;
    } catch (e) {
        io.stderr('[' + TOOL_NAME + '] LỖI NỘI BỘ: ' + ((e && e.stack) || e) + '\n');
        return 3;
    }
}

module.exports = {
    TOOL_NAME, SCHEMA_VERSION, DOCTOR_BRN, DEFAULT_GIT_TIMEOUT,
    padTrim, scrub, sortViet, statusFromFindings, gitKind, isCandidate,
    mergeBom013, findNestedGit, probeGit, scanRepo, scanRoot,
    findingTag, renderTable, renderQuiet, usage, parseArgs, main
};

if (require.main === module) {
    process.exitCode = main(process.argv.slice(2), process.env, {
        stdout: (s) => process.stdout.write(s),
        stderr: (s) => process.stderr.write(s)
    });
}
