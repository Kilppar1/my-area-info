"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Place, CriterionResult } from "@/types";
import { useSearch } from "@/context/SearchContext";
import { searchInSteps, sleep } from "@/lib/geocoding";

// The map needs to be loaded in the browser
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
});

// First color is the home address, the rest are for the criteria
const criteriaColors = [
  "#ff8a3d",
  "#f87171",
  "#4ade80",
  "#60a5fa",
  "#c084fc",
  "#facc15",
];

export default function ResultsPage() {
  const { searchData, setLoading } = useSearch();
  const { homeAddresses, verifiedHomeId, criteriaList, searchRange } =
    searchData;

  // Find the verified home address and get the maximum search range that the user has set
  const homeAddress = homeAddresses.find(({ id }) => id === verifiedHomeId);
  const maxRadius = searchRange!;

  // Create the home marker if the address has valid coordinates
  const home: Place | null = homeAddress?.coordinates
    ? {
        id: homeAddress.id,
        coordinates: homeAddress.coordinates,
        color: criteriaColors[0],
        name: homeAddress.address,
      }
    : null;

  // Results for the search criteria
  const [results, setResults] = useState<CriterionResult[]>([]);
  const places = results.flatMap((result) => result.places);

  useEffect(() => {
    // Do not search if no valid coordinates were found
    if (!homeAddress?.coordinates) return;
    const coordinates = homeAddress.coordinates;

    let cancelled = false; // ability to cancel a seach

    async function loadPlaces() {
      setLoading(true); // show loading indicator for the user
      setResults([]); // clear results

      // Search each criterion separately
      const all: CriterionResult[] = [];
      for (let i = 0; i < criteriaList.length; i++) {
        try {
          // Actual search happens in geocoding
          const found = await searchInSteps(
            criteriaList[i].criteria,
            criteriaColors[i + 1], // +1 because 0 is home icon color
            coordinates,
            maxRadius,
          );

          if (cancelled) return; // stop if search was cancelled

          // Save the results for each criteria
          all.push({ criteria: criteriaList[i].criteria, places: found });
          setResults([...all]);
        } catch (err) {
          console.error(`Failed to fetch ${criteriaList[i].criteria}:`, err);
        }

        // We must wait between API calls because Nominatim allows 1 request per second
        await sleep(1100);
      }

      setLoading(false); // Hide the loading indicator when search is done
    }

    loadPlaces(); // start search

    // Clean up function when a new search happens
    return () => {
      cancelled = true; // old search is terminated
      setLoading(false);
    };
  }, [homeAddress, criteriaList, maxRadius, setLoading]); // if any of these change the effect is run again

  return (
    <main className="results-page">
      <div className="results-list">
        {/* A message is shown if someone opens the results page directly without actually doing a search */}
        {!home ? (
          <p>No search found. Create one from the search page.</p>
        ) : (
          // Results are shown with criteria groups
          results.map(({ criteria, places: foundPlaces }) => (
            <div key={criteria}>
              <h3>{criteria}</h3>
              {foundPlaces.length === 0 ? (
                <p>No results found.</p>
              ) : (
                // List all places under criteria
                <ul>
                  {foundPlaces.map((place) => (
                    <li key={place.id}>
                      {place.name} ({Math.round(place.distance ?? 0)} m)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      <div className="results-map-wrapper">
        {/* Show the map when a valid home exists */}
        {home && <ResultsMap home={home} places={places} />}
      </div>
    </main>
  );
}
