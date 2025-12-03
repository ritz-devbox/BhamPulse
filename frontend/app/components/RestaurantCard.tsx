export default function RestaurantCard({ item }) {
  return (
    <div className="border p-4 rounded-xl shadow-sm bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold">{item.name}</h2>
      <p className="text-gray-600">{item.address}</p>

      <div className="mt-2 text-sm">
        <span className="font-medium">Cuisine:</span> {item.categories}
      </div>

      <div className="mt-2">
        <span className="font-medium">Price:</span> {item.priceLevel ? '£'.repeat(item.priceLevel) : 'N/A'}
      </div>

      {item.website && (
        <a href={item.website} target="_blank" className="mt-3 text-blue-600 block">
          Website →
        </a>
      )}
    </div>
  );
}
