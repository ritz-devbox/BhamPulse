# BhamPulse Backend

API and data scripts that power BhamPulse. Built with NestJS + Prisma.

## Prerequisites
- Node 20+ and npm
- SQLite (bundled with Prisma) or your configured database
- `.env` populated from `.env.example`

## Setup
```bash
npm install
npx prisma generate
```

## Run
```bash
# dev with reload
npm run start:dev

# production build + run
npm run build
npm run start:prod
```

## Tests
```bash
npm test
```

## Data: Birmingham restaurants (OSM)
Script pulls restaurant data from OpenStreetMap's Overpass API and writes CSV.
```bash
cd backend
npx ts-node scripts/fetch_birmingham_restaurants.ts
```
Output: `data/birmingham_restaurants_osm.csv` with name, address, lat, lon, hours, website, phone, cuisine, OSM source link, and a Google Maps search link.

Merge an external sheet (e.g., `BirminghamRestaurants.csv`) while removing unneeded columns and avoiding duplicates:
```bash
npx ts-node scripts/merge_restaurants.ts
```
It normalizes on name + address and fills missing website/phone/cuisine/maps link when provided.

## Useful npm scripts
- `npm run lint` – lint and fix
- `npm run format` – prettier format
- `npm run test:e2e` – e2e tests

## Tech stack
- NestJS, TypeScript, Prisma
- Axios for HTTP
- Winston for logging

## Notes
- OpenStreetMap data is ODbL licensed; ensure downstream attribution.
- Adjust Overpass bounds or filters in `scripts/fetch_birmingham_restaurants.ts` as needed.
