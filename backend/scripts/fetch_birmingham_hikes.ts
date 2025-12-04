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

type HikeRow = {
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  website: string;
  phone: string;
  hours: string;
  source: string;
  maps_link: string;
};

// Using HTTP to avoid TLS interception issues.
const OVERPASS_URL = 'http://overpass-api.de/api/interpreter';

// Bounding box roughly covering Birmingham metro
const BBOX = '(33.3,-87.1,33.8,-86.55)';

const QUERY = `
[out:json][timeout:180];
(
  node["leisure"="park"]${BBOX};
  way["leisure"="park"]${BBOX};

  node["leisure"="nature_reserve"]${BBOX};
  way["leisure"="nature_reserve"]${BBOX};

  node["leisure"="trailhead"]${BBOX};
  way["leisure"="trailhead"]${BBOX};

  node["tourism"="viewpoint"]${BBOX};
  way["tourism"="viewpoint"]${BBOX};

  relation["route"="hiking"]${BBOX};
);
out center tags;
`;

const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  'data',
  'birmingham_hikes_osm.csv',
);

function escapeCsv(value: string): string {
  if (value === undefined || value === null) return '';
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function toAddress(tags: Record<string, string> = {}): string {
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ');
}

type LatLon = { lat: number; lon: number };

function coords(el: OsmElement): LatLon | null {
  if (el.lat !== undefined && el.lon !== undefined) return { lat: el.lat, lon: el.lon };
  if (el.center) return el.center;
  return null;
}

function mapsLink(c: LatLon | null, name?: string): string {
  if (!c) return '';
  const query = name ? `${name} ${c.lat},${c.lon}` : `${c.lat},${c.lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function categorize(tags: Record<string, string> = {}): string {
  if (tags['route'] === 'hiking') return 'Hiking Route';
  if (tags['leisure'] === 'trailhead') return 'Trailhead';
  if (tags['tourism'] === 'viewpoint') return 'Viewpoint';
  if (tags['leisure'] === 'nature_reserve') return 'Nature Reserve';
  if (tags['leisure'] === 'park') return 'Park';
  return tags['leisure'] || tags['tourism'] || 'Outdoor';
}

async function fetchHikes(): Promise<HikeRow[]> {
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
      const c = coords(el);
      const name = tags.name || tags.ref || categorize(tags);
      if (!name || !c) return null;
      return {
        name,
        type: categorize(tags),
        address: toAddress(tags),
        latitude: c.lat.toString(),
        longitude: c.lon.toString(),
        website:
          tags.website ||
          tags['contact:website'] ||
          tags.url ||
          tags['contact:url'] ||
          '',
        phone: tags.phone || tags['contact:phone'] || '',
        hours: tags.opening_hours || '',
        source: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        maps_link: mapsLink(c, name),
      } as HikeRow;
    })
    .filter((x): x is HikeRow => Boolean(x));
}

function toCsv(rows: HikeRow[]): string {
  const header = [
    'name',
    'type',
    'address',
    'latitude',
    'longitude',
    'hours',
    'website',
    'phone',
    'source',
    'maps_link',
  ];
  return [
    header.join(','),
    ...rows.map((r) =>
      header.map((h) => escapeCsv((r as Record<string, string>)[h] ?? '')).join(','),
    ),
  ].join('\n');
}

async function main() {
  const rows = await fetchHikes();
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, toCsv(rows), 'utf8');
  console.log(`Wrote ${rows.length} hikes to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Failed to fetch hikes', err);
  process.exit(1);
});
