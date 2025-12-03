import { fetchRestaurants } from "../../lib/api";
import RestaurantCard from "../components/RestaurantCard";

export default async function RestaurantsPage() {
  const list = await fetchRestaurants();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8">
      {list.map((item) => (
        <RestaurantCard key={item.id} item={item} />
      ))}
    </div>
  );
}
