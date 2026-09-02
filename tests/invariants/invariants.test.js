'use strict';
/**
 * invariants.test.js — phủ 11 BẤT BIẾN I1..I11 (TESTING-ACCEPTANCE §3) bằng HỘP ĐEN:
 * chạy engine như một tiến trình thật rồi soi cây thư mục kết quả.
 *
 * Tên mỗi ca bắt đầu bằng đúng mã `I<n>:` để grep được độ phủ:
 *   grep -o "I[0-9]\+:" tests/**\/*.test.js | sort -u
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { mkTmpRoot, convergingFixtures } = require('../helpers/tmp.js');
const { snapshotTree } = require('../helpers/tree.js');
const { runEngine, ENGINE_PATH } = require('../helpers/run.js');

const engine = require(ENGINE_PATH);
const V = engine.BRAIN_TEMPLATE_VERSION;
const STATE_REL = 'brain4agent/memory/hot/state.json';
const TODAY_REL = 'brain4agent/memory/hot/today.md';
const MARKER_RE = /^brain4agent-v(\d+\.\d+\.\d+)\.md$/;

const abs = (dir, rel) => path.join(dir, ...rel.split('/'));
const readUtf8 = (dir, rel) => fs.readFileSync(abs(dir, rel), 'utf8');

function withFixture(name, fn) {
  const tmp = mkTmpRoot(name);
  try { return fn(tmp.dir); } finally { tmp.cleanup(); }
}

test('I1: sau khi ghi, root có ĐÚNG MỘT marker và đó là marker phiên bản hiện tại', () => {
  withFixture('F03-legacy-v120', (dir) => {
    assert.deepEqual(fs.readdirSync(dir).filter((f) => MARKER_RE.test(f)), ['brain4agent-v1.2.0.md'],
      'tiền đề: fixture đang mang marker lỗi thời');

    const r = runEngine(ENGINE_PATH, [dir]);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(fs.readdirSync(dir).filter((f) => MARKER_RE.test(f)), [`brain4agent-v${V}.md`],
      'I1: marker cũ phải bị xoá, marker mới phải được tạo — KHÔNG được để 2 file');
  });
});

test('I2: state.json luôn UTF-8 không BOM, LF thuần, kết thúc bằng 0x0A', () => {
  for (const name of ['F03-legacy-v120', 'F07-bom-state', 'F01-blank']) {
    withFixture(name, (dir) => {
      assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
      const buf = fs.readFileSync(abs(dir, STATE_REL));
      assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), `${name}: I2 còn BOM`);
      assert.ok(!buf.includes(0x0d), `${name}: I2 state.json CẤM chứa CR`);
      assert.equal(buf[buf.length - 1], 0x0a, `${name}: I2 thiếu newline cuối`);
      assert.doesNotThrow(() => JSON.parse(buf.toString('utf8')));
    });
  }
});

test('I3: brain_template_version được đồng bộ; current_version (version DỰ ÁN) KHÔNG bị đụng', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const before = JSON.parse(readUtf8(dir, STATE_REL));
    assert.equal(before.brain_template_version, '1.2.0');
    assert.equal(before.current_version, '9.9.9', 'tiền đề: version dự án cố ý khác');

    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    const after = JSON.parse(readUtf8(dir, STATE_REL));
    assert.equal(after.brain_template_version, V, 'I3: version KHUNG phải được vá');
    assert.equal(after.current_version, '9.9.9', 'I3: version DỰ ÁN là của người dùng — CẤM ghi đè');
  });
});

test('I4: CLAUDE.md là shim ≤10 dòng, trỏ @AGENTS.md, và giữ nguyên nội dung người dùng đã có', () => {
  // Repo mới tinh ⇒ shim do engine sinh phải đúng chuẩn.
  withFixture('F01-blank', (dir) => {
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    const shim = readUtf8(dir, 'CLAUDE.md');
    assert.ok(shim.includes('@AGENTS.md'));
    assert.ok(shim.replace(/\n+$/, () => '').split('\n').length <= 10, 'I4: shim phải ≤10 dòng');
    assert.ok(!shim.includes('## 🛡️ 5. CÁC BỘ LUẬT'), 'I4: CẤM chép luật sang CLAUDE.md');
  });

  // Repo có CLAUDE.md nội dung riêng, thiếu import ⇒ chỉ được NỐI THÊM.
  withFixture('F02-standard-lf', (dir) => {
    const own = '# CLAUDE.md\n\nGhi chú riêng của tôi — CẤM xoá.\n';
    fs.writeFileSync(abs(dir, 'CLAUDE.md'), own);
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    const after = readUtf8(dir, 'CLAUDE.md');
    assert.ok(after.startsWith('# CLAUDE.md\n\nGhi chú riêng của tôi — CẤM xoá.'), 'I4: nội dung cũ là tiền tố');
    assert.ok(after.endsWith('@AGENTS.md\n'));
  });
});

test('I5: AGENTS.md sau khi vá có ĐỦ 6 khối marker, ruột ĐÚNG BẰNG thân luật hiện hành', () => {
  // Từ #10, "đủ luật" không còn đo bằng cách dò chuỗi token (cách đó cho âm tính giả:
  // token có thể nằm trong khối ``` hoặc trong một câu khác) mà đo bằng khối marker.
  for (const name of ['F03-legacy-v120', 'F05-crlf-agents', 'F08-dollar-agents', 'F09-legacy-v130', 'F01-blank']) {
    withFixture(name, (dir) => {
      assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0, name);
      const lines = engine.normalizeEol(readUtf8(dir, 'AGENTS.md')).split('\n');
      for (const blk of engine.RULE_BLOCKS) {
        const found = engine.findBlock(lines, blk.id);
        assert.notEqual(found, 'malformed', `${name}: I5 khối ${blk.id} hỏng mốc`);
        assert.ok(found, `${name}: I5 thiếu khối ${blk.id}`);
        assert.equal(found.inner, blk.body, `${name}: I5 ruột khối ${blk.id} lệch thân luật`);
      }
    });
  }
});

test('I6: mỗi luật CHỈ có một phát biểu — trùng lặp là việc của NGƯỜI, engine chỉ báo', () => {
  // Hội tụ được ⇒ đúng 1 phát biểu mỗi token luật.
  for (const name of ['F05-crlf-agents', 'F03-legacy-v120', 'F09-legacy-v130']) {
    withFixture(name, (dir) => {
      assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0, name);
      const agents = readUtf8(dir, 'AGENTS.md');
      for (const blk of engine.RULE_BLOCKS) {
        assert.equal(agents.split(blk.probe).length - 1, 1,
          `${name}: I6 luật ${blk.id} phải có ĐÚNG 1 phát biểu`);
      }
    });
  }

  // TQ5: engine KHÔNG tự gỡ bản thừa / khối luật cũ của người dùng — nó BÁO BRN-003
  // (mã 2, cần người) và để nguyên văn bản. Đây là hành vi ĐÚNG, không phải thiếu sót.
  for (const [name, probe] of [
    ['F04-old-planning-block', 'Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)'],
    ['F06-duplicate-law', '### J. Quy tắc Tương Thích Đa Agent']
  ]) {
    withFixture(name, (dir) => {
      const r = runEngine(ENGINE_PATH, [dir]);
      assert.equal(r.code, 2, `${name}: I6 hai phát biểu cùng sống ⇒ mã 2`);
      assert.ok(runEngine(ENGINE_PATH, ['--check', dir]).stdout.includes('BRN-003'));
      assert.ok(readUtf8(dir, 'AGENTS.md').includes(probe),
        `${name}: I6 engine CẤM tự xoá văn bản người dùng`);
    });
  }
});

test('I7: phân vùng đã có nội dung riêng KHÔNG bị template ghi đè', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const own = '# Roadmap riêng\n\n- Việc A đang làm dở\n';
    fs.writeFileSync(abs(dir, 'brain4agent/roadmap.md'), own);
    const beforeAll = snapshotTree(dir);

    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    assert.equal(readUtf8(dir, 'brain4agent/roadmap.md'), own, 'I7: dữ liệu người dùng CẤM bị ghi đè');

    // Các phân vùng khác vốn đã có cũng không được đụng.
    const afterAll = snapshotTree(dir);
    for (const rel of ['brain4agent/index.md', 'brain4agent/project-intro.md', 'brain4agent/changelog.md']) {
      assert.equal(afterAll[rel].sha256, beforeAll[rel].sha256, `I7: ${rel} bị ghi đè`);
    }
  });
});

test('I8: latest_memory.md ở root được di trú vào memory/hot/today.md rồi xoá khỏi root', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const legacy = '# Ký ức phiên trước\n\n- đã làm việc X\n';
    fs.writeFileSync(abs(dir, 'latest_memory.md'), legacy);
    fs.rmSync(abs(dir, TODAY_REL));

    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    assert.equal(fs.existsSync(abs(dir, 'latest_memory.md')), false, 'I8: Root Clean — phải xoá khỏi root');
    assert.equal(readUtf8(dir, TODAY_REL), legacy, 'I8: nội dung cũ phải được CHUYỂN, không phải vứt đi');
  });
});

test('I9: memory-distill.txt luôn có Bước 0 (.xay-dung-nao-bo) sau khi chạy', () => {
  withFixture('F03-legacy-v120', (dir) => {
    const kernel = abs(dir, 'brain4agent/memory-distill.txt');
    fs.writeFileSync(kernel, '# Kernel markdown thuần, không khuôn XML\n');
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    const after = fs.readFileSync(kernel, 'utf8');
    assert.ok(after.includes('xay-dung-nao-bo'), 'I9: Bước 0 phải được chèn');
    assert.ok(after.includes('# Kernel markdown thuần'), 'I9: CẤM xoá kernel cũ');
  });
});

test('I10: idempotent — lần chạy thứ 2 không đổi MỘT BYTE hay MỘT mtime nào trên toàn cây', async (t) => {
  for (const name of convergingFixtures()) {
    await t.test(name, () => {
      withFixture(name, (dir) => {
        const first = runEngine(ENGINE_PATH, [dir]);
        assert.equal(first.code, 0, `${name}: lần 1 phải hội tụ (stderr: ${first.stderr})`);
        // Ảnh chụp gồm sha256 + bytes + eol + bom + mtimeMs của TỪNG file.
        const afterFirst = snapshotTree(dir);

        const second = runEngine(ENGINE_PATH, [dir]);
        assert.equal(second.code, 0, `${name}: lần 2 phải exit 0`);
        assert.ok(second.stdout.includes('NÃO ĐÃ OK'), `${name}: lần 2 phải báo đã chuẩn`);
        assert.ok(!second.stdout.includes('HOÀN TẤT THÀNH CÔNG'), `${name}: lần 2 CẤM đi vào đường ghi`);

        const afterSecond = snapshotTree(dir);
        const touched = Object.keys(afterFirst).filter(
          (rel) => !afterSecond[rel]
            || afterSecond[rel].sha256 !== afterFirst[rel].sha256
            || afterSecond[rel].mtimeMs !== afterFirst[rel].mtimeMs
        );
        assert.deepEqual(touched, [], `${name}: I10 vi phạm — engine ghi lại ${touched.length} file ở lần 2`);
        assert.deepEqual(Object.keys(afterSecond).sort(), Object.keys(afterFirst).sort(),
          `${name}: I10 — lần 2 tạo/xoá file`);
      });
    });
  }
});

test('I11: thư mục hạ tầng bắt buộc (docs/, planning/, .agents/skills/, memory/hot/) luôn tồn tại sau khi ghi', () => {
  const REQUIRED_DIRS = ['docs', 'planning', '.agents/skills', 'brain4agent/memory/hot'];
  withFixture('F01-blank', (dir) => {
    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    for (const d of REQUIRED_DIRS) {
      assert.ok(fs.existsSync(abs(dir, d)), `I11: thiếu ${d}`);
    }
  });
  // Xoá docs/ khỏi một repo vốn chuẩn ⇒ engine phải phát hiện và tạo lại.
  withFixture('F02-standard-lf', (dir) => {
    fs.rmSync(abs(dir, 'docs'), { recursive: true, force: true });
    const chk = runEngine(ENGINE_PATH, ['--check', dir]);
    assert.equal(chk.code, 1, 'I11: thiếu docs/ phải bị bắt (v1.5.4 KHÔNG kiểm)');
    assert.ok(chk.stdout.includes('BRN-009'));

    assert.equal(runEngine(ENGINE_PATH, [dir]).code, 0);
    assert.ok(fs.existsSync(abs(dir, 'docs')), 'I11: docs/ phải được tạo lại');
  });
});
