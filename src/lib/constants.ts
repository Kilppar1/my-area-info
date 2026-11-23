// First color is the commute address, the rest are for the criteria
export const criteriaColors = [
  "#ff8a3d",
  "#f87171",
  "#4ade80",
  "#60a5fa",
  "#c084fc",
  "#facc15",
];

// List of suggested searches matching the search aliases
export const suggestedSearches = [
  "School",
  "Restaurant",
  "Grocery store",
  "Park",
  "Museum",
  "Bus stop",
  "Gym",
  "Bar",
  "Hotel",
  "Café",
  "Pharmacy",
];

// Alternative search terms for each criterion (max 2 because searches are slow)
export const searchAliases: Record<string, string[]> = {
  school: ["school"],
  restaurant: ["restaurant"],
  "grocery store": ["supermarket"],
  park: ["park"],
  museum: ["museum"],
  "bus stop": ["bus stop"],
  gym: ["fitness centre"],
  bar: ["bar"],
  hotel: ["hotel"],
  café: ["cafe"],
  pharmacy: ["pharmacy"],
};

// Different radiuses for Nominatim before max range
export const searchSteps = [1, 5, 10];
