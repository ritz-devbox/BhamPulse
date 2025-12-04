import fs from 'fs';
import path from 'path';

type Row = Record<string, string>;

const INPUT = path.join(__dirname, '..', 'data', 'birmingham_hikes_osm.csv');
const OUTPUT = INPUT;

function parseCsv(text: string): { header: string[]; rows: Row[] } {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (ch === '\r') continue;

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  row.push(field);
  if (row.length > 1 || row[0]) rows.push(row);

  const [header, ...data] = rows;
  const objects: Row[] = data.map((cols) => {
    const obj: Row = {};
    header.forEach((h, i) => {
      obj[h] = cols[i] ?? '';
    });
    return obj;
  });
  return { header, rows: objects };
}

function serializeCsv(rows: Row[], header: string[]): string {
  const escape = (value: string) => {
    if (value === undefined || value === null) return '';
    const needsQuotes = /[",\n]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [
    header.join(','),
    ...rows.map((row) => header.map((h) => escape(row[h] ?? '')).join(',')),
  ];
  return lines.join('\n');
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[’‘']/g, "'").replace(/[^a-z0-9]/g, '');
}

function infoScore(row: Row): number {
  let score = 0;
  ['address', 'website', 'phone', 'hours', 'latitude', 'longitude'].forEach(
    (k) => {
      if (row[k]) score += 1;
    },
  );
  return score;
}

function merge(rows: Row[]): Row[] {
  const groups = new Map<string, Row[]>();
  rows.forEach((r) => {
    const key = normalizeName(r.name || '');
    groups.set(key, [...(groups.get(key) ?? []), r]);
  });

  const merged: Row[] = [];
  for (const list of groups.values()) {
    let best = list[0];
    let bestScore = infoScore(best);
    list.forEach((r) => {
      const s = infoScore(r);
      if (s > bestScore) {
        best = r;
        bestScore = s;
      }
    });
    const mergedRow: Row = { ...best };
    list.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (!mergedRow[k] && r[k]) mergedRow[k] = r[k];
      });
    });
    merged.push(mergedRow);
  }

  return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function main() {
  const text = fs.readFileSync(INPUT, 'utf8');
  const { header, rows } = parseCsv(text);
  const cleaned = merge(rows);
  fs.writeFileSync(OUTPUT, serializeCsv(cleaned, header), 'utf8');
  console.log(`Deduped ${rows.length} -> ${cleaned.length} hikes`);
}

main();
