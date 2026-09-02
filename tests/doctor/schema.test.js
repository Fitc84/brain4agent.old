'use strict';
/**
 * P04-E2 — `fleet-report.json` hợp lệ theo JSON Schema của 01-CONTRACTS §7.
 *
 * Validator TỐI GIẢN viết tay (bất biến "0 dependency"): chỉ hiện thực đúng phần
 * schema mà hợp đồng dùng — required / additionalProperties:false / type / enum /
 * const / pattern / minimum / minItems / $ref. Cố ý KHÔNG làm validator tổng quát.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { runDoctor } = require('../helpers/run.js');
const { buildFleet } = require('./make-fleet.js');

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['schema_version', 'generated_at', 'tool', 'expected_template_version', 'roots', 'summary', 'exit_code', 'repos'],
  properties: {
    schema_version: { const: 1 },
    generated_at: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}' },
    tool: {
      type: 'object', additionalProperties: false,
      required: ['name', 'engine_version', 'template_version', 'node', 'git_enabled'],
      properties: {
        name: { const: 'brain-doctor' },
        engine_version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        template_version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        node: { type: 'string' },
        git_enabled: { type: 'boolean' }
      }
    },
    expected_template_version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    roots: {
      type: 'array', minItems: 1,
      items: {
        type: 'object', additionalProperties: false, required: ['index', 'label', 'kind'],
        properties: {
          index: { type: 'integer', minimum: 0 },
          label: { type: 'string' },
          kind: { enum: ['root', 'repo'] }
        }
      }
    },
    summary: {
      type: 'object', additionalProperties: false,
      required: ['candidates', 'clean', 'warning', 'error', 'blocker', 'scan_error', 'skipped', 'duration_ms'],
      properties: {
        candidates: { type: 'integer', minimum: 0 }, clean: { type: 'integer', minimum: 0 },
        warning: { type: 'integer', minimum: 0 }, error: { type: 'integer', minimum: 0 },
        blocker: { type: 'integer', minimum: 0 }, scan_error: { type: 'integer', minimum: 0 },
        skipped: { type: 'integer', minimum: 0 }, duration_ms: { type: 'integer', minimum: 0 }
      }
    },
    exit_code: { enum: [0, 1, 2] },
    repos: { type: 'array', items: { $ref: 'repo' } }
  }
};

const DEFS = {
  repo: {
    type: 'object', additionalProperties: false,
    required: ['name', 'root_index', 'status', 'git', 'template_version', 'marker_version', 'findings', 'duration_ms'],
    properties: {
      name: { type: 'string', minLength: 1 },
      root_index: { type: 'integer', minimum: 0 },
      status: { enum: ['CLEAN', 'WARNING', 'ERROR', 'BLOCKER', 'SCAN_ERROR', 'SKIPPED'] },
      skip_reason: { enum: ['excluded', 'not-a-repo'] },
      git: {
        type: 'object', additionalProperties: false, required: ['kind', 'head'],
        properties: {
          kind: { enum: ['dir', 'file', 'none', 'unknown'] },
          head: { enum: ['ok', 'unborn', 'broken', 'timeout', 'skipped', 'unknown'] },
          detail: { type: 'string' }
        }
      },
      template_version: { type: ['string', 'null'] },
      marker_version: { type: ['string', 'null'] },
      findings: { type: 'array', items: { $ref: 'finding' } },
      scan_error: { type: 'string' },
      duration_ms: { type: 'integer', minimum: 0 }
    }
  },
  finding: {
    type: 'object', additionalProperties: false,
    required: ['code', 'level', 'message', 'fix'],
    properties: {
      code: { type: 'string', pattern: '^BRN-0(0[1-9]|1[0-5])$' },
      level: { enum: ['blocker', 'error', 'warning'] },
      message: { type: 'string' },
      fix: { type: 'string' },
      detail: { type: 'object' }
    }
  }
};

function typeOk(v, t) {
  if (Array.isArray(t)) return t.some((x) => typeOk(v, x));
  if (t === 'null') return v === null;
  if (t === 'array') return Array.isArray(v);
  if (t === 'integer') return Number.isInteger(v);
  if (t === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v);
  return typeof v === t;
}

function validate(value, schema, at, errors) {
  const s = schema.$ref ? DEFS[schema.$ref] : schema;
  if ('const' in s && value !== s.const) errors.push(at + ': phải bằng ' + JSON.stringify(s.const));
  if (s.enum && s.enum.indexOf(value) === -1) errors.push(at + ': không thuộc enum ' + JSON.stringify(s.enum));
  if (s.type && !typeOk(value, s.type)) { errors.push(at + ': sai kiểu, cần ' + s.type); return; }
  if (s.pattern && !new RegExp(s.pattern).test(String(value))) errors.push(at + ': không khớp ' + s.pattern);
  if (s.minLength !== undefined && String(value).length < s.minLength) errors.push(at + ': quá ngắn');
  if (s.minimum !== undefined && value < s.minimum) errors.push(at + ': < ' + s.minimum);
  if (s.minItems !== undefined && value.length < s.minItems) errors.push(at + ': cần ≥' + s.minItems + ' phần tử');
  if (s.items && Array.isArray(value)) value.forEach((v, i) => validate(v, s.items, at + '[' + i + ']', errors));
  if (s.properties) {
    for (const k of (s.required || [])) if (!(k in value)) errors.push(at + ': thiếu field bắt buộc `' + k + '`');
    for (const k of Object.keys(value)) {
      if (!s.properties[k]) {
        if (s.additionalProperties === false) errors.push(at + ': field lạ `' + k + '` (additionalProperties:false)');
        continue;
      }
      validate(value[k], s.properties[k], at + '.' + k, errors);
    }
  }
}

test('P04-E2 · fleet-report.json hợp lệ theo schema §7 và exit_code khớp mã thoát thật', () => {
  const f = buildFleet({ withGit: true });
  try {
    const out = path.join(f.base, 'fleet-report.json');
    const r = runDoctor(['--root', f.fleet, '--json', out]);

    const raw = fs.readFileSync(out);
    assert.ok(!(raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf), 'báo cáo CẤM có BOM');
    assert.equal(raw[raw.length - 1], 0x0a, 'báo cáo phải kết thúc bằng byte 0x0A');
    assert.ok(!raw.includes(0x0d), 'báo cáo phải là LF thuần');

    const report = JSON.parse(raw.toString('utf8'));
    const errors = [];
    validate(report, SCHEMA, '$', errors);
    assert.deepEqual(errors, [], 'báo cáo không hợp lệ theo schema §7');

    assert.equal(report.exit_code, r.code, 'exit_code trong file PHẢI bằng mã thoát tiến trình');
    assert.equal(report.exit_code, 2);
  } finally { f.cleanup(); }
});

test('P04-E2b · status suy từ findings đúng luật §7 với mọi repo', () => {
  const f = buildFleet({ withGit: true });
  try {
    const report = JSON.parse(runDoctor(['--root', f.fleet, '--format', 'json']).stdout);
    for (const repo of report.repos) {
      if (repo.status === 'SKIPPED' || repo.status === 'SCAN_ERROR') continue;
      const lv = repo.findings.map((x) => x.level);
      const want = lv.includes('blocker') ? 'BLOCKER'
        : lv.includes('error') ? 'ERROR'
          : lv.includes('warning') ? 'WARNING' : 'CLEAN';
      assert.equal(repo.status, want, repo.name + ': status không suy đúng từ findings');
    }
  } finally { f.cleanup(); }
});

test('P04-E2c · --format json ra stdout giống hệt nội dung file --json (trừ mốc thời gian)', () => {
  const f = buildFleet({ withGit: false });
  try {
    const out = path.join(f.base, 'r.json');
    const stdoutReport = JSON.parse(runDoctor(['--root', f.fleet, '--no-git', '--format', 'json']).stdout);
    runDoctor(['--root', f.fleet, '--no-git', '--json', out]);
    const fileReport = JSON.parse(fs.readFileSync(out, 'utf8'));

    const strip = (r) => {
      const c = JSON.parse(JSON.stringify(r));
      delete c.generated_at;
      delete c.summary.duration_ms;
      for (const x of c.repos) delete x.duration_ms;
      return c;
    };
    assert.deepEqual(strip(stdoutReport), strip(fileReport));
  } finally { f.cleanup(); }
});
