import { fetchHikes } from "../../lib/api";
import RestaurantsExplorer from "../components/RestaurantsExplorer";

export default async function HikesPage() {
  const list = await fetchHikes();
  const hikes = Array.isArray(list) ? list : [];
  // Reuse explorer UI; "cuisine" field maps to "type" for grouping
  const normalized = hikes.map((h) => ({
    ...h,
    cuisine: h.type,
  }));
  return <RestaurantsExplorer restaurants={normalized} />;
}
