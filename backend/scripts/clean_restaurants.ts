import fs from 'fs';
import path from 'path';

type Row = Record<string, string>;

const INPUT_PATH = path.join(
  __dirname,
  '..',
  'data',
  'birmingham_restaurants_osm.csv',
);
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'data',
  'birmingham_restaurants_osm.cleaned.csv',
);

function parseCsv(text: string): string[][] {
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
  return rows;
}

function toRowsWithHeader(table: string[][]): { header: string[]; rows: Row[] } {
  const [header, ...data] = table;
  const rows: Row[] = data.map((cols) => {
    const obj: Row = {};
    header.forEach((h, idx) => {
      obj[h] = cols[idx]?.trim() ?? '';
    });
    return obj;
  });
  return { header, rows };
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
  return name
    .toLowerCase()
    .replace(/[’‘']/g, "'")
    .replace(/[^a-z0-9]/g, '');
}

function normalizeNameTokens(name: string): string {
  const fillers = new Set([
    'restaurant',
    'grill',
    'kitchen',
    'bar',
    'cafe',
    'caf',
    'eatery',
    'diner',
    'house',
    'co',
    'company',
    'joint',
    'spot',
    'pub',
    'bistro',
    // cuisine descriptors to collapse variants like "Silver Coin" vs "Silver Coin Indian Grill"
    'indian',
    'thai',
    'chinese',
    'japanese',
    'sushi',
    'pizza',
    'bbq',
    'barbeque',
    'seafood',
    'steak',
    'steakhouse',
    'kebab',
    'kabab',
    'mediterranean',
    'mexican',
    'latin',
    'american',
    'asian',
    'fusion',
    'taqueria',
    'cantina',
    'pizzeria',
    'smokehouse',
    'taproom',
    'korean',
    'biryani',
    'biryanis',
    'cuisine',
  ]);

  const tokens = name
    .toLowerCase()
    .replace(/[’‘']/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !fillers.has(t));

  if (tokens.length === 0) return normalizeName(name);
  return tokens.join('');
}

function normalizeAddress(address: string): string {
  const replacements: [RegExp, string][] = [
    [/\bstreet\b/g, 'st'],
    [/\bavenue\b/g, 'ave'],
    [/\broad\b/g, 'rd'],
    [/\bdrive\b/g, 'dr'],
    [/\bboulevard\b/g, 'blvd'],
    [/\bhighway\b/g, 'hwy'],
    [/\bnorth\b/g, 'n'],
    [/\bsouth\b/g, 's'],
    [/\beast\b/g, 'e'],
    [/\bwest\b/g, 'w'],
  ];

  let out = address.toLowerCase();
  replacements.forEach(([pattern, repl]) => {
    out = out.replace(pattern, repl);
  });

  return out.replace(/[^a-z0-9]/g, '');
}

function infoScore(row: Row): number {
  let score = 0;
  const keys = [
    'address',
    'latitude',
    'longitude',
    'hours',
    'website',
    'phone',
    'cuisine',
    'maps_link',
    'source',
  ];
  keys.forEach((k) => {
    if (row[k]) score += 1;
  });
  return score;
}

function mergeRows(rows: Row[]): Row[] {
  // Group by normalized tokenized name (one record per consolidated name)
  const nameGroups = new Map<string, Row[]>();
  rows.forEach((r) => {
    const key = normalizeNameTokens(r.name || '') || normalizeName(r.name || '');
    const list = nameGroups.get(key) ?? [];
    list.push(r);
    nameGroups.set(key, list);
  });

  const merged: Row[] = [];

  for (const groupRows of nameGroups.values()) {
    // pick the most informative row as base
    let best = groupRows[0];
    let bestScore = infoScore(best);
    groupRows.forEach((r) => {
      const score = infoScore(r);
      if (score > bestScore) {
        best = r;
        bestScore = score;
      }
    });

    const mergedRow: Row = { ...best };

    // Fill missing fields from any other record with the same name
    groupRows.forEach((r) => {
      Object.keys(r).forEach((f) => {
        if (!mergedRow[f] && r[f]) mergedRow[f] = r[f];
      });
    });

    merged.push(mergedRow);
  }

  // Sort for stable output
  return merged.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

function main() {
  const csv = fs.readFileSync(INPUT_PATH, 'utf8');
  const table = parseCsv(csv);
  const { header, rows } = toRowsWithHeader(table);

  const cleaned = mergeRows(rows);
  const out = serializeCsv(cleaned, header);
  fs.writeFileSync(OUTPUT_PATH, out, 'utf8');
  console.log(
    `Deduped ${rows.length} -> ${cleaned.length} rows in ${OUTPUT_PATH}`,
  );
}

main();
