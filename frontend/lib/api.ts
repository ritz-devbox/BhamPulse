export async function fetchRestaurants() {
  const res = await fetch("http://localhost:3000/restaurants", {
    cache: "no-store"
  });

  return res.json();
}
