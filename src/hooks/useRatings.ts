"use client";

import { useEffect, useState } from "react";
import type { Place } from "@/types";

export type PlaceRating = {
  rating: number;
  amount: number;
};

type RatingResponse = PlaceRating & {
  id: string;
};

// Load and submit ratings for the places currently in the results list
export function useRatings(places: Place[]) {
  const [ratings, setRatings] = useState<Record<string, PlaceRating>>({});
  const ids = [
    ...new Set(places.flatMap((place) => (place.osmKey ? [place.osmKey] : []))),
  ].sort();
  const idsParam = ids.join(",");

  useEffect(() => {
    // Fetch all visible reviews with one request when the OSM key changes
    if (!idsParam) return;

    const controller = new AbortController();

    async function fetchRatings() {
      try {
        const response = await fetch(
          `/api/reviews?ids=${encodeURIComponent(idsParam)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Review request failed: ${response.status}`);
        }

        const data: RatingResponse[] = await response.json();
        setRatings(
          Object.fromEntries(
            data.map(({ id, rating, amount }) => [id, { rating, amount }]),
          ),
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load place reviews:", error);
      }
    }

    void fetchRatings();
    return () => controller.abort();
  }, [idsParam]);

  // Submit user review and update displayed review correctly
  async function submitRating(place: Place, stars: number) {
    if (!place.osmKey) {
      throw new Error("Cannot submit a review for a place without an OSM key.");
    }

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: place.osmKey,
        name: place.name,
        lat: place.coordinates.latitude,
        lon: place.coordinates.longitude,
        stars,
      }),
    });
    if (!response.ok) {
      throw new Error(`Review request failed: ${response.status}`);
    }

    const data: RatingResponse = await response.json();
    setRatings((previous) => ({
      ...previous,
      [data.id]: { rating: data.rating, amount: data.amount },
    }));
  }

  return { ratings, submitRating };
}
