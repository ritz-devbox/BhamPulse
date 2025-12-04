import axios from 'axios';
import fs from 'fs';
import path from 'path';
import https from 'https';

type Row = Record<string, string>;

const INPUT = path.join(__dirname, '..', 'data', 'birmingham_restaurants_osm.csv');
const OUTPUT = INPUT;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

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

async function reverseGeocode(lat: string, lon: string): Promise<string> {
  const res = await axios.get(NOMINATIM_URL, {
    params: {
      format: 'jsonv2',
      lat,
      lon,
      addressdetails: 1,
    },
    headers: {
      'User-Agent': 'BhamPulse/1.0 (contact: local-script)',
    },
    httpsAgent,
    timeout: 15000,
    maxRedirects: 3,
  });

  const addr = res.data?.display_name;
  return addr || '';
}

async function main() {
  const text = fs.readFileSync(INPUT, 'utf8');
  const { header, rows } = parseCsv(text);

  let updated = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.address) continue;
    if (!r.latitude || !r.longitude) continue;

    try {
      const address = await reverseGeocode(r.latitude, r.longitude);
      if (address) {
        r.address = address;
        updated++;
        console.log(`Filled address for ${r.name}: ${address}`);
      }
    } catch (err) {
      console.warn(`Failed to reverse geocode ${r.name}`, err?.message || err);
    }

    // Simple throttle to avoid hammering Nominatim
    await new Promise((res) => setTimeout(res, 300));
  }

  console.log(`Updated ${updated} addresses.`);
  const out = serializeCsv(rows, header);
  fs.writeFileSync(OUTPUT, out, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
