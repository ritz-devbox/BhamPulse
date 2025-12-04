type Props = {
  item: {
    name: string;
    address?: string;
    cuisine?: string;
    type?: string;
    categories?: string;
    website?: string;
    maps_link?: string;
    priceLevel?: number;
    rating?: number;
    latitude?: number;
    longitude?: number;
  };
};

const priceSymbols = (level?: number) =>
  level && level > 0 ? "$".repeat(Math.min(level, 5)) : "–";

function regionFromCuisine(cuisine: string): string {
  const c = cuisine.toLowerCase();
  const has = (needle: string) => c.includes(needle);
  if (
    has("thai") ||
    has("chinese") ||
    has("sushi") ||
    has("japanese") ||
    has("korean") ||
    has("vietnam") ||
    has("ramen") ||
    has("pho") ||
    has("asian") ||
    has("indian")
  ) {
    return "Asian";
  }
  if (has("mexic") || has("latin") || has("taco") || has("tex") || has("brazil") || has("peru")) {
    return "Latin / Mexican";
  }
  if (
    has("mediterranean") ||
    has("middle") ||
    has("greek") ||
    has("turkish") ||
    has("lebanese") ||
    has("halal") ||
    has("shawarma") ||
    has("kebab")
  ) {
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

export default function RestaurantCard({ item }: Props) {
  const cuisine =
    item.cuisine ||
    item.type || // for hikes
    item.categories?.split(",").map((c) => c.trim())[0] ||
    "Cuisine";

  const region = regionFromCuisine(cuisine);
  const locationText =
    item.address ||
    [item.latitude, item.longitude]
      .filter((v) => v !== undefined && v !== null)
      .join(", ");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-900/40 backdrop-blur transition hover:-translate-y-1 hover:border-indigo-400/80 hover:shadow-indigo-900/40">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 blur-3xl transition group-hover:from-indigo-500/30 group-hover:to-fuchsia-500/20" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{item.name}</h3>
            {locationText && (
              <p className="text-sm text-slate-400">{locationText}</p>
            )}
          </div>
          <div className="rounded-full border border-slate-800 bg-slate-800/80 px-3 py-1 text-xs text-indigo-100">
            {region}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full bg-slate-800/80 px-2 py-1">
            {priceSymbols(item.priceLevel)}
          </span>
          {item.rating ? (
            <span className="rounded-full bg-slate-800/80 px-2 py-1">
              ★ {item.rating.toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="flex gap-3 text-sm">
          {item.website && (
            <a
              href={item.website}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-200 transition hover:text-indigo-100 hover:underline"
            >
              Website ↗
            </a>
          )}
          {item.maps_link && (
            <a
              href={item.maps_link}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-200 transition hover:text-indigo-100 hover:underline"
            >
              Maps ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
