import fs from 'fs';
import path from 'path';

type Row = Record<string, string>;

const EXISTING_PATH = path.join(
  __dirname,
  '..',
  'data',
  'birmingham_restaurants_osm.csv',
);
const SHEET_PATH = path.join(__dirname, '..', '..', 'BirminghamRestaurants.csv');

const OUTPUT_PATH = EXISTING_PATH;

const OUTPUT_HEADER = [
  'name',
  'address',
  'latitude',
  'longitude',
  'hours',
  'website',
  'phone',
  'cuisine',
  'source',
  'maps_link',
];

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
        i++; // skip escaped quote
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

    if (ch === '\r') {
      continue;
    }

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

function normalizeKey(name: string, address?: string): string {
  const n = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const a = (address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${n}|${a}`;
}

function escapeCsv(value: string): string {
  if (value === undefined || value === null) return '';
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function serializeCsv(rows: Row[], header: string[]): string {
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      header.map((h) => escapeCsv(row[h] ?? '')).join(','),
    ),
  ];
  return lines.join('\n');
}

function mapsLinkFromNameAddress(name: string, address?: string): string {
  const query = [name, address].filter(Boolean).join(' ');
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mergeRows(existing: Row[], additions: Row[]): Row[] {
  const map = new Map<string, Row>();

  for (const row of existing) {
    const key = normalizeKey(row.name, row.address);
    map.set(key, { ...row });
  }

  for (const add of additions) {
    const name = add.name?.trim();
    if (!name) continue;
    const address = add.address?.trim();
    const key = normalizeKey(name, address);
    const current = map.get(key);

    const website = add.website?.trim() ?? '';
    const phone = add.phone?.trim() ?? '';
    const cuisine = add.cuisine?.trim() ?? '';
    const mapsLink =
      add.maps_link?.trim() ||
      mapsLinkFromNameAddress(name, address);

    if (current) {
      current.address = current.address || address || '';
      current.website = current.website || website;
      current.phone = current.phone || phone;
      current.cuisine = current.cuisine || cuisine;
      current.maps_link = current.maps_link || mapsLink;
      continue;
    }

    map.set(key, {
      name,
      address: address || '',
      latitude: '',
      longitude: '',
      hours: '',
      website,
      phone,
      cuisine,
      source: 'BirminghamRestaurants.csv',
      maps_link: mapsLink,
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  );
}

function main() {
  const existingCsv = fs.readFileSync(EXISTING_PATH, 'utf8');
  const sheetCsv = fs.readFileSync(SHEET_PATH, 'utf8');

  const existingTable = parseCsv(existingCsv);
  const sheetTable = parseCsv(sheetCsv);

  const { rows: existingRows } = toRowsWithHeader(existingTable);

  const { rows: sheetRows } = toRowsWithHeader(sheetTable);
  const sheetNormalized = sheetRows.map((row) => ({
    name: row['Name'] ?? '',
    address: row['Physical Address'] ?? '',
    website: row['Website'] ?? '',
    phone: row['Phone'] ?? '',
    cuisine: row['Cuisine'] ?? '',
    maps_link: '',
  }));

  const merged = mergeRows(existingRows, sheetNormalized);
  const csvOut = serializeCsv(merged, OUTPUT_HEADER);
  fs.writeFileSync(OUTPUT_PATH, csvOut, 'utf8');
  console.log(`Merged ${merged.length} unique restaurants into ${OUTPUT_PATH}`);
}

main();
