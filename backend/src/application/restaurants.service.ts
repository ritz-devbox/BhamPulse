import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { PrismaService } from '../database/prisma.service';
import { GoogleRepository } from '../infrastructure/google/google.repository';
import { RestaurantMapper } from '../infrastructure/mappers/restaurant.mapper';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly google: GoogleRepository,
    private readonly prisma: PrismaService
  ) {}

  async syncRestaurants() {
    const result = await this.google.searchRestaurantsInBirmingham();

    for (const item of result.results) {
      const details = await this.google.getRestaurantDetails(item.place_id);
      const mapped = RestaurantMapper.fromGooglePlace(item, details.result);

      await this.prisma.restaurant.upsert({
        where: { googlePlaceId: item.place_id },
        update: {
          ...mapped
        },
        create: {
          ...mapped
        }
      });
    }

    return { success: true };
  }

  async listRestaurants() {
    const csvPath = path.join(process.cwd(), 'data', 'birmingham_restaurants_osm.csv');

    if (!fs.existsSync(csvPath)) {
      console.warn(`CSV not found at ${csvPath}`);
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

    const parsed = rows.map((cols) => {
      const r = toObj(cols);
      return {
        name: r.name,
        address: r.address || undefined,
        latitude: r.latitude ? Number(r.latitude) : undefined,
        longitude: r.longitude ? Number(r.longitude) : undefined,
        rating: undefined,
        priceLevel: undefined,
        categories: r.cuisine || undefined,
        cuisine: r.cuisine || undefined,
        googlePlaceId: undefined,
        website: r.website || undefined,
        menuUrl: undefined,
        photoUrl: undefined,
        maps_link: r.maps_link || undefined,
        source: r.source || undefined,
        hours: r.hours || undefined,
        phone: r.phone || undefined,
      } as any;
    });

    // Debug: log fallback count
    console.log(`Serving ${parsed.length} restaurants from CSV fallback via ${csvPath}`);
    return parsed;
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
