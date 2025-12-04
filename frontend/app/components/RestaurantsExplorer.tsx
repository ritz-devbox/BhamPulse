"use client";

import { useMemo, useState } from "react";
import RestaurantCard from "./RestaurantCard";

type Restaurant = {
  id?: number | string;
  name: string;
  address?: string;
  cuisine?: string;
  categories?: string;
  website?: string;
  maps_link?: string;
  rating?: number;
  priceLevel?: number;
};

type Props = {
  restaurants: Restaurant[] | any;
};

function rawCuisine(item: Restaurant): string {
  if (item.cuisine) return item.cuisine;
  if (item.categories) {
    const first = item.categories.split(",").map((c) => c.trim())[0];
    return first || "Other";
  }
  return "Other";
}

function cuisineToRegion(cuisine: string): string {
  const c = cuisine.toLowerCase();
  const has = (needle: string) => c.includes(needle);

  if (has("thai") || has("chinese") || has("sushi") || has("japanese") || has("korean") || has("vietnam") || has("ramen") || has("pho") || has("asian") || has("indian")) {
    return "Asian";
  }
  if (has("mexic") || has("latin") || has("taco") || has("tex") || has("brazil") || has("peru")) {
    return "Latin / Mexican";
  }
  if (has("mediterranean") || has("middle") || has("greek") || has("turkish") || has("lebanese") || has("halal") || has("shawarma") || has("kebab")) {
    return "Mediterranean / Middle Eastern";
  }
  if (has("italian") || has("pizza") || has("pasta") || has("french") || has("europe")) {
    return "European";
  }
  if (has("africa") || has("ethiop") || has("niger") || has("ghana") || has("senegal")) {
    return "African";
  }
  if (has("american") || has("bbq") || has("barbecue") || has("burger") || has("wings") || has("steak") || has("diner")) {
    return "American";
  }
  return "Other";
}

export default function RestaurantsExplorer({ restaurants }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All");

  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];

  const regions = useMemo(() => {
    const set = new Set<string>();
    safeRestaurants.forEach((r) => set.add(cuisineToRegion(rawCuisine(r))));
    return ["All", ...Array.from(set).sort()];
  }, [safeRestaurants]);

  const grouped = useMemo(() => {
    const filtered = safeRestaurants.filter((r) => {
      const region = cuisineToRegion(rawCuisine(r));
      const matchText =
        r.name?.toLowerCase().includes(query.toLowerCase()) ||
        r.address?.toLowerCase().includes(query.toLowerCase()) ||
        rawCuisine(r).toLowerCase().includes(query.toLowerCase()) ||
        region.toLowerCase().includes(query.toLowerCase());

      const matchCuisine =
        selectedCuisine === "All" ||
        region.toLowerCase() === selectedCuisine.toLowerCase();

      return matchText && matchCuisine;
    });

    const map = new Map<string, Restaurant[]>();
    filtered.forEach((r) => {
      const key = cuisineToRegion(rawCuisine(r));
      map.set(key, [...(map.get(key) ?? []), r]);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cuisine, items]) => ({ cuisine, items }));
  }, [safeRestaurants, query, selectedCuisine]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-900/60 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">
                Birmingham Bites
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Explore restaurants by vibe, cuisine, or name.
              </h1>
              <p className="mt-2 text-slate-400">
                Instant search + optional cuisine filter.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, address, cuisine..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 pr-10 text-base text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>
              </div>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-800/60 px-4 py-3 text-base text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 md:w-56"
              >
                <option value="All">All regions</option>
                {regions
                  .filter((c) => c !== "All")
                  .map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {grouped.map(({ cuisine, items }) => (
            <section key={cuisine}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-fuchsia-400" />
                  <h2 className="text-xl font-semibold text-white">
                    {cuisine} <span className="text-slate-500">({items.length})</span>
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <RestaurantCard key={`${item.id ?? item.name}`} item={item} />
                ))}
              </div>
            </section>
          ))}

          {grouped.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
              No restaurants match that search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
