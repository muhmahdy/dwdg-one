// Looks for personal data that must not sit in the database in plain text (spec section 3.4): identity numbers (NIK, NPWP,
// passport), bank account numbers, salaries, identity documents, and, less serious but still personal, e-mail addresses,
// phone numbers and street addresses. Pure functions over records; used by check-personal-data.mjs and its tests.
//
// A finding names WHERE the data is (table, record id, path inside the record) and WHAT KIND it is. It never contains the value:
// the report itself must be safe to paste into a chat or an issue.

/** Field names that say what the value is, whatever it holds. [pattern, kind, severity] */
const KEY_PATTERNS = [
  [/^(nik|no_?ktp|ktp|nomor_?ktp|nik_?ktp)$/i, 'identity number (NIK/KTP)', 'high'],
  [/npwp/i, 'tax number (NPWP)', 'high'],
  [/passport|paspor/i, 'passport', 'high'],
  [/^(ssn|nric)$/i, 'identity number', 'high'],
  [/rekening|norek|account_?(no|num|number)|^iban$|swift|no_?rek/i, 'bank account', 'high'],
  [/salary|gaji|upah|payroll|honor(arium)?$|stipend|take_?home/i, 'pay', 'high'],
  [/scan_?(ktp|id|identity|paspor)|identity_?(doc|card|scan)|ktp_?(scan|file|url)/i, 'identity document', 'high'],
  [/birth|lahir|^dob$/i, 'date or place of birth', 'medium'],
  [/(^|_)(address|alamat)(_|$)/i, 'street address', 'medium'],
  [/phone|telepon|telp|whatsapp|^wa$|^hp$|no_?hp/i, 'phone number', 'medium'],
  [/e-?mail/i, 'e-mail address', 'medium'],
];

/** Value shapes that give the data away whatever the field is called. [pattern, kind, severity] */
const VALUE_PATTERNS = [
  [/(^|\D)\d{16}(\D|$)/, 'a 16-digit number (looks like a NIK)', 'high'],
  [/\b\d{2}\.\d{3}\.\d{3}\.\d-\d{3}\.\d{3}\b/, 'a tax number (NPWP)', 'high'],
  [/\b(bca|bni|bri|mandiri|bsi|cimb|permata|jago|seabank|dana|ovo|gopay|shopeepay)\b[^\n]{0,20}\d{6,}/i, 'a bank or wallet account number', 'high'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, 'an e-mail address', 'medium'],
  [/(\+62|\b62|\b0)8\d{8,11}\b/, 'a phone number', 'medium'],
  // after the phone number: a phone number is also a long number, and the more exact name wins
  [/(^|\D)\d{10,15}(\D|$)/, 'a long number (could be an account number)', 'medium'],
  [/(drive\.google\.com|docs\.google\.com\/(?:document|spreadsheets)|dropbox\.com|1drv\.ms)\S*/i, 'a link to a shared file (check it is not an identity scan or a payslip)', 'low'],
  [/\b(ktp|kartu tanda penduduk|paspor|passport|slip gaji|payslip)\b/i, 'words that suggest an identity document or pay slip', 'low'],
];

const ORDER = {high: 3, medium: 2, low: 1};

/** Walks a record and returns what looks personal: [{path, kind, severity, by}]. `by` says whether the field name or the value gave it away. */
export function scanDoc(doc, base = '') {
  const found = [];
  const walk = (value, path, key) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) { value.forEach((v, i) => walk(v, `${path}[${i}]`, key)); return; }
    if (typeof value === 'object') { for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, k); return; }
    const hasContent = typeof value === 'string' ? value.trim() !== '' : typeof value === 'number';
    if (!hasContent) return; // an empty field named "phone" holds nothing
    const byKey = key ? KEY_PATTERNS.find(([re]) => re.test(key)) : undefined;
    if (byKey) found.push({path, kind: byKey[1], severity: byKey[2], by: 'field name'});
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value);
      // ids, dates and times are digits too: skip ISO dates and stamps before looking for long numbers
      const plain = text.replace(/\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?\b/g, '');
      const byValue = VALUE_PATTERNS.find(([re]) => re.test(plain));
      if (byValue && !(byKey && ORDER[byKey[2]] >= ORDER[byValue[2]])) found.push({path, kind: byValue[1], severity: byValue[2], by: 'value'});
    }
  };
  walk(doc, base, '');
  return found;
}

export const severityRank = s => ORDER[s] ?? 0;

/** Scans rows `{table: [{id, doc}]}` for the named tables. */
export function scanRows(rowsByTable, tables) {
  const findings = [];
  for (const table of tables) {
    for (const r of rowsByTable[table] ?? []) for (const f of scanDoc(r.doc)) findings.push({table, id: r.id, ...f});
  }
  return findings.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.table.localeCompare(b.table) || a.id.localeCompare(b.id));
}

/** Who holds authority over a division's data: the people with a global role and the leads of the division. Ids and roles only. */
export function authorityOver(people, division) {
  const active = people.filter(p => (p.status ?? 'active') === 'active');
  const global = active.filter(p => ['president', 'vp', 'board'].includes(p.role) || p.admin).map(p => ({id: p.id, role: p.admin ? `${p.role}+admin` : p.role, via: 'global'}));
  const leads = active.filter(p => p.div === division && ['director', 'codirector'].includes(p.role) && !p.admin).map(p => ({id: p.id, role: p.role, via: division}));
  return [...global, ...leads];
}
