import axios from 'axios';
import fs from 'fs';
import path from 'path';

type OsmElement = {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type RestaurantRow = {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  hours: string;
  website: string;
  phone: string;
  cuisine: string;
  source: string;
  maps_link: string;
};

// Using HTTP to avoid corporate TLS interception issues.
const OVERPASS_URL = 'http://overpass-api.de/api/interpreter';

// Query all OSM features tagged as restaurants inside Birmingham, Alabama city limits.
const QUERY = `
[out:json][timeout:180];
(
  node["amenity"="restaurant"](33.3,-87.1,33.8,-86.55);
  way["amenity"="restaurant"](33.3,-87.1,33.8,-86.55);
  relation["amenity"="restaurant"](33.3,-87.1,33.8,-86.55);
);
out center tags;
`;

const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'data',
  'birmingham_restaurants_osm.csv',
);

function escapeCsv(value: string): string {
  if (value === undefined || value === null) return '';
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function buildAddress(tags: Record<string, string> = {}): string {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ');
}

function pickWebsite(tags: Record<string, string> = {}): string {
  return (
    tags.website ||
    tags['contact:website'] ||
    tags.url ||
    tags['contact:url'] ||
    ''
  );
}

function pickPhone(tags: Record<string, string> = {}): string {
  return tags.phone || tags['contact:phone'] || '';
}

function buildMapsLink(coords?: LatLon | null, name?: string): string {
  if (!coords) return '';
  const query = name
    ? encodeURIComponent(`${name} ${coords.lat},${coords.lon}`)
    : `${coords.lat},${coords.lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

type LatLon = { lat: number; lon: number };

function elementLatLon(el: OsmElement): LatLon | null {
  if (el.lat !== undefined && el.lon !== undefined) {
    return { lat: el.lat, lon: el.lon };
  }
  if (el.center) return el.center;
  return null;
}

const STRICT_BOUNDS = {
  minLat: 33.35,
  maxLat: 33.7,
  minLon: -86.95,
  maxLon: -86.6,
};

function isInBirmingham(
  tags: Record<string, string> = {},
  coords?: LatLon | null,
): boolean {
  const city = tags['addr:city'];
  if (city) return city.toLowerCase() === 'birmingham';

  if (!coords) return false;
  const { lat, lon } = coords;
  return (
    lat >= STRICT_BOUNDS.minLat &&
    lat <= STRICT_BOUNDS.maxLat &&
    lon >= STRICT_BOUNDS.minLon &&
    lon <= STRICT_BOUNDS.maxLon
  );
}

async function fetchRestaurants(): Promise<RestaurantRow[]> {
  const response = await axios.post(
    OVERPASS_URL,
    `data=${encodeURIComponent(QUERY)}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 180_000,
    },
  );

  const elements: OsmElement[] = response.data?.elements ?? [];

  return elements
    .map((el) => {
      const tags = el.tags ?? {};
      const coords = elementLatLon(el);
      if (!isInBirmingham(tags, coords)) return null;
      const name = tags.name ?? '';
      if (!name || !coords) return null;

      const row: RestaurantRow = {
        name,
        address: buildAddress(tags),
        latitude: coords.lat.toString(),
        longitude: coords.lon.toString(),
        hours: tags.opening_hours ?? '',
        website: pickWebsite(tags),
        phone: pickPhone(tags),
        cuisine: tags.cuisine ?? '',
        source: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        maps_link: buildMapsLink(coords, name),
      };

      return row;
    })
    .filter((row): row is RestaurantRow => Boolean(row));
}

function toCsv(rows: RestaurantRow[]): string {
  const header = [
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

  const lines = [
    header.join(','),
    ...rows.map((row) =>
      header
        .map((key) => escapeCsv((row as Record<string, string>)[key] ?? ''))
        .join(','),
    ),
  ];

  return lines.join('\n');
}

async function main() {
  const rows = await fetchRestaurants();
  const csv = toCsv(rows);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, csv, 'utf8');

  console.log(`Wrote ${rows.length} restaurants to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Failed to fetch restaurants', err);
  process.exit(1);
});
