import type { Coordinates, CommuteTimes } from "@/types";
import { sleep } from "@/lib/async";

// Calculate the travel times for commute address
export async function routeMinutes(
  mode: "car" | "bike" | "foot",
  a: Coordinates,
  b: Coordinates,
): Promise<number> {
  const url = `https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/${a.longitude},${a.latitude};${b.longitude},${b.latitude}?overview=false`;
  const data = await (await fetch(url)).json();
  // The routing service reports duration in seconds; the app stores commute times in minutes.
  return Math.round(data.routes[0].duration / 60);
}

// Calculate car, bike, and walking times between home and commute addresses
export async function commuteMinutes(
  home: Coordinates,
  commute: Coordinates,
): Promise<CommuteTimes> {
  const car = await routeMinutes("car", home, commute);
  // Keep the mode requests spaced out instead of sending them as a burst.
  await sleep(1100);
  const bike = await routeMinutes("bike", home, commute);
  await sleep(1100);
  const walk = await routeMinutes("foot", home, commute);
  return { car, bike, walk };
}
