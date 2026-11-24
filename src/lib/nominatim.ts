import type { Address, Coordinates, NominatimResult, Place } from "@/types";
import { searchAliases, searchSteps } from "@/lib/constants";
import { distanceMeters } from "@/lib/geo";
import { sleep } from "@/lib/async";

// Serialize Nominatim requests and track the last request time
let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimRequestAt = 0;

// Nominatim requests are restricted by 1.1s cap in between due to nominatim policy
function fetchNominatim(url: string): Promise<Response> {
  const request = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, 1100 - (Date.now() - lastNominatimRequestAt));
    if (waitMs > 0) await sleep(waitMs);

    lastNominatimRequestAt = Date.now();
    return fetch(url);
  });

  nominatimQueue = request.then(
    () => undefined,
    () => undefined,
  );
  return request;
}

// Convert an address search into max 3 matching addresses with coordinates
export async function nominatimSearchAddresses(
  query: string,
): Promise<Address[]> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=1&layer=address&q=" +
    encodeURIComponent(query);
  const res = await fetchNominatim(url);
  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}`);
  }

  // Process the results
  const results: NominatimResult[] = await res.json();
  const addresses = results.map((item) => {
    const a = item.address;
    const street = [a?.road, a?.house_number].filter(Boolean).join(" ");
    const city = a?.city ?? a?.town ?? a?.village;
    const area = [a?.postcode, city].filter(Boolean).join(" ");
    const shortAddress = [street, area].filter(Boolean).join(", ");

    return {
      id: String(item.place_id), // Nominatim's place ID -> address ID

      // If address details are incomplete, use the first parts of the full address
      address:
        shortAddress || item.display_name.split(",").slice(0, 3).join(","),
      // Convert [lat, lon] strings into numbers
      coordinates: {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      },
    };
  });

  // Remove duplicate addresses
  return addresses.filter(
    (address, i) =>
      addresses.findIndex((other) => other.address === address.address) === i,
  );
}

// Search Nominatim sequentially with the defined searchSteps
export async function searchInSteps(
  criteria: string,
  color: string,
  home: Coordinates,
  maxKm: number,
): Promise<Place[]> {
  // Use the predefined search radiuses < max radius
  const radius = [...searchSteps.filter((km) => km < maxKm), maxKm];
  let found: Place[] = []; // found results stored here

  // Try each radius in order
  for (let i = 0; i < radius.length; i++) {
    found = await nominatimSearchCriteria(criteria, color, home, radius[i]);
    if (found.length >= 3) break; // stop when 3 places are found
  }

  return found;
}

// Search Nominatim around a home address and return up to the 3 closest places
async function nominatimSearchCriteria(
  criteria: string,
  color: string,
  home: Coordinates,
  radiusKm: number,
): Promise<Place[]> {
  // Create the search box and transform km to degree approximately
  const latOffset = radiusKm / 111;
  const lonOffset =
    radiusKm / (111 * Math.cos((home.latitude * Math.PI) / 180));
  // Create a search box around home address: left, top, right, bottom
  const searchBoxArea = [
    home.longitude - lonOffset,
    home.latitude + latOffset,
    home.longitude + lonOffset,
    home.latitude - latOffset,
  ].join(",");

  const searchWords = searchAliases[criteria.toLowerCase()] ?? [criteria];
  const allPlaces = new Map<string, Place>(); // store all places with Map to avoid duplicates

  // Search each term separately
  for (let w = 0; w < searchWords.length; w++) {
    // Request 20 matches in the bounding box, nominatim responds always with the most relevant results, not closest
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=20&bounded=1" +
      `&viewbox=${searchBoxArea}&q=${encodeURIComponent(searchWords[w])}`;

    console.log("Nominatim url:", url);
    // Send the request and read results
    const res = await fetchNominatim(url);
    if (!res.ok) {
      throw new Error(`Nominatim ${res.status}`);
    }
    const results: NominatimResult[] = await res.json();
    console.log(`Nominatim result for ${searchWords[w]}:`, results);

    // Convert results into places
    for (const item of results) {
      const position: Coordinates = {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
      const name = item.name || item.display_name.split(",")[0];

      // Unique ID (criteria-name-rounded_position) gets rid of duplicates.
      // Rounded position is in the range 50-100m
      const id = `${criteria}-${name}-${position.latitude.toFixed(3)}-${position.longitude.toFixed(3)}`;

      // Setting an existing ID again replaces the earlier entry (no duplicates)
      allPlaces.set(id, {
        id,
        name,
        coordinates: position,
        color,
        distance: distanceMeters(home, position),
      });
    }
  }

  // Filter by radius, sort by distance and return 3 closest places
  return [...allPlaces.values()]
    .filter((place) => (place.distance ?? 0) <= radiusKm * 1000)
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    .slice(0, 3);
}
