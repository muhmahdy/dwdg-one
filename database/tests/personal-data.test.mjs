// Checks of the personal-data scan (scripts/database/check-personal-data.mjs): it finds what it should, by field name and by the
// shape of the value, ignores what is not personal, and never repeats a value in its report.
//   node --test database/tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {authorityOver, scanDoc, scanRows} from '../../scripts/database/lib/personal-data.mjs';

const CLI = fileURLToPath(new URL('../../scripts/database/check-personal-data.mjs', import.meta.url));
const SEED = fileURLToPath(new URL('../seeds/demo-workspace.json', import.meta.url));
const kinds = doc => scanDoc(doc).map(f => `${f.severity}:${f.path}:${f.kind}`);

test('finds identity numbers, tax numbers, accounts and pay by what the field is called', () => {
  assert.deepEqual(kinds({nik: '3201234567890001'}).filter(k => k.includes('identity number (NIK/KTP)')), ['high:nik:identity number (NIK/KTP)']);
  assert.ok(kinds({npwp: '12.345.678.9-012.345'}).some(k => k.startsWith('high:npwp')));
  assert.ok(kinds({passport: 'A1234567'}).some(k => k.startsWith('high:passport')));
  assert.ok(kinds({rekening: '0123456789'}).some(k => k.includes('bank account')));
  assert.ok(kinds({account_number: 'x'}).some(k => k.includes('bank account')));
  assert.ok(kinds({gaji: 2500000}).some(k => k.startsWith('high:gaji:pay')));
  assert.ok(kinds({salary: '3jt'}).some(k => k.includes(':pay')));
  assert.ok(kinds({scan_ktp: 'https://x/y.png'}).some(k => k.includes('identity document')));
  assert.ok(kinds({email: 'a@b.co'}).some(k => k.startsWith('medium:email')));
  assert.ok(kinds({phone: '0812'}).some(k => k.includes('phone number')));
  assert.ok(kinds({alamat: 'Jl. Kaliurang'}).some(k => k.includes('street address')));
  assert.ok(kinds({birth_date: '2004-01-02'}).some(k => k.includes('birth')));
});

test('finds them by the shape of the value too, wherever they are hidden', () => {
  assert.ok(kinds({note: 'NIK saya 3201234567890001 ya'}).some(k => k.startsWith('high:note:a 16-digit number')));
  assert.ok(kinds({note: 'NPWP 12.345.678.9-012.345'}).some(k => k.startsWith('high:note:a tax number')));
  assert.ok(kinds({note: 'transfer ke BCA 1234567890'}).some(k => k.startsWith('high:note:a bank or wallet account number')));
  assert.ok(kinds({note: 'hubungi 081234567890'}).some(k => k.startsWith('medium:note:a phone number')));
  assert.ok(kinds({note: 'tulis ke eka@example.org'}).some(k => k.startsWith('medium:note:an e-mail address')));
  assert.ok(kinds({deep: {list: [{x: 'rek 12345678901234'}]}}).some(k => k.startsWith('medium:deep.list[0].x:a long number')));
  assert.ok(kinds({evidence: 'https://drive.google.com/file/d/abc'}).some(k => k.startsWith('low:evidence')));
  assert.ok(kinds({note: 'lampiran slip gaji bulan ini'}).some(k => k.startsWith('low:note')));
});

test('does not cry wolf over ids, dates, times, money amounts, empty fields or ordinary text', () => {
  const clean = {id: 'lgl-hms-pks', title: 'Cooperation agreement with Himpunan', created: '2026-10-05T09:30', due: '2026-10-19', amount: 1250000, count: 12, stage: 'review', owner: 'mahdy',
    phone: '', email: null, address: '   ', note: 'Reviewed on 2026-10-05 at 10:15; two clauses changed.', url: 'https://example.org/page'};
  assert.deepEqual(scanDoc(clean), []);
});

test('reports where and what, never the value', () => {
  const secret = '3201234567890001';
  const findings = scanRows({hr_notices: [{id: 'n1', doc: {id: 'n1', nik: secret, note: `again ${secret}`}}]}, ['hr_notices']);
  assert.ok(findings.length >= 2);
  assert.ok(!JSON.stringify(findings).includes(secret));
  assert.deepEqual(Object.keys(findings[0]).sort(), ['by', 'id', 'kind', 'path', 'severity', 'table']);
});

test('lists the most serious findings first, and only the tables asked for', () => {
  const rows = {
    hr_notices: [{id: 'a', doc: {link: 'https://drive.google.com/x', nik: '3201234567890001'}}],
    tasks: [{id: 't', doc: {nik: '3201234567890001'}}],
  };
  const out = scanRows(rows, ['hr_notices']);
  assert.deepEqual(out.map(f => f.severity), ['high', 'low']);
  assert.ok(out.every(f => f.table === 'hr_notices'));
});

test('authority over a division: the global roles plus that division\'s directors and co-directors, active people only', () => {
  const people = [
    {id: 'pres', role: 'president', div: null}, {id: 'vp', role: 'vp'}, {id: 'brd', role: 'board'},
    {id: 'adm', role: 'director', div: 'sng', admin: true},
    {id: 'd_hr', role: 'director', div: 'hr'}, {id: 'c_hr', role: 'codirector', div: 'hr'}, {id: 'm_hr', role: 'member', div: 'hr'},
    {id: 'd_fnl', role: 'director', div: 'fnl'}, {id: 'gone', role: 'director', div: 'hr', status: 'former'},
  ];
  assert.deepEqual(authorityOver(people, 'hr').map(p => p.id), ['pres', 'vp', 'brd', 'adm', 'd_hr', 'c_hr']);
  assert.deepEqual(authorityOver(people, 'fnl').map(p => p.id), ['pres', 'vp', 'brd', 'adm', 'd_fnl']);
});

test('the demo workspace has nothing personal in HR and FnL beyond links to files', () => {
  const run = spawnSync('node', [CLI, '--demo', '--fail-on', 'none'], {encoding: 'utf8'});
  assert.equal(run.status, 0, run.stdout + run.stderr);
  const lines = run.stdout.split('\n').filter(l => /^(HIGH|MEDIUM|LOW)\s/.test(l));
  assert.ok(lines.length > 0, 'the demo has links to files, so there is something to see');
  assert.deepEqual(lines.filter(l => !l.startsWith('LOW')), []);
  assert.match(run.stdout, /Scanned \d+ records in 16 tables/);
});

test('the command fails on a workspace with a NIK in it, passes with --fail-on none, and fails when too many hold authority', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dwdg-pii-'));
  try {
    const db = JSON.parse(readFileSync(SEED, 'utf8'));
    db.hr.notices[0].outcome = 'NIK 3201234567890001';
    writeFileSync(join(dir, 'planted.json'), JSON.stringify(db));
    const strict = spawnSync('node', [CLI, '--input', join(dir, 'planted.json')], {encoding: 'utf8'});
    assert.equal(strict.status, 1);
    assert.match(strict.stdout, /HIGH\s+hr_notices/);
    assert.ok(!strict.stdout.includes('3201234567890001'));
    assert.equal(spawnSync('node', [CLI, '--input', join(dir, 'planted.json'), '--fail-on', 'none'], {encoding: 'utf8'}).status, 0);
    const crowded = spawnSync('node', [CLI, '--demo', '--max-authority', '3'], {encoding: 'utf8'});
    assert.equal(crowded.status, 1);
    assert.match(crowded.stdout, /more than 3/);
    assert.equal(spawnSync('node', [CLI], {encoding: 'utf8'}).status, 1); // no input given
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
