import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

type Hike = {
  name: string;
  type?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hours?: string;
  website?: string;
  phone?: string;
  source?: string;
  maps_link?: string;
};

@Injectable()
export class HikesService {
  list(): Hike[] {
    const csvPath = path.join(process.cwd(), 'data', 'birmingham_hikes_osm.csv');
    if (!fs.existsSync(csvPath)) {
      console.warn(`Hikes CSV not found at ${csvPath}`);
      return [];
    }

    const csv = fs.readFileSync(csvPath, 'utf8');
    const rows = this.parseCsv(csv);
    const header = rows.shift();
    if (!header) return [];

    const toObj = (values: string[]) => {
      const obj: Record<string, string> = {};
      header.forEach((h, i) => {
        obj[h] = values[i] ?? '';
      });
      return obj;
    };

    return rows.map((cols) => {
      const r = toObj(cols);
      return {
        name: r.name,
        type: r.type || undefined,
        address: r.address || undefined,
        latitude: r.latitude ? Number(r.latitude) : undefined,
        longitude: r.longitude ? Number(r.longitude) : undefined,
        hours: r.hours || undefined,
        website: r.website || undefined,
        phone: r.phone || undefined,
        source: r.source || undefined,
        maps_link: r.maps_link || undefined,
      };
    });
  }

  private parseCsv(text: string): string[][] {
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
}
