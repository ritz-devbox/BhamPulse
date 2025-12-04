import { fetchRestaurants } from "../../lib/api";
import RestaurantsExplorer from "../components/RestaurantsExplorer";

export default async function RestaurantsPage() {
  const list = await fetchRestaurants();
  const restaurants = Array.isArray(list) ? list : [];
  return <RestaurantsExplorer restaurants={restaurants} />;
}
