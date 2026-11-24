"use client";

import { useEffect, useState } from "react";
import type { Address, CommuteTimes, Criteria, CriterionResult } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import type { SearchData } from "@/context/SearchContext";
import { criteriaColors } from "@/lib/constants";
import { commuteMinutes, searchInSteps } from "@/lib/geocoding";

type UseSearchResultsOptions = {
  homeAddress: Address | undefined;
  commuteAddress: Address | undefined;
  criteriaList: Criteria[];
  maxRadius: number;
  resultsRelevant: boolean;
  savedResults: CriterionResult[];
  savedCommuteTimes: CommuteTimes | null;
  setSearchData: Dispatch<SetStateAction<SearchData>>;
};

export function useSearchResults({
  homeAddress,
  commuteAddress,
  criteriaList,
  maxRadius,
  resultsRelevant,
  savedResults,
  savedCommuteTimes,
  setSearchData,
}: UseSearchResultsOptions) {
  const [results, setResults] = useState<CriterionResult[]>([]);
  const [commuteTimes, setCommuteTimes] = useState<CommuteTimes | null>(null);

  useEffect(() => {
    // Reuse saved results if they are still relevant
    if (resultsRelevant) return;

    // Do not search if no valid coordinates were found
    if (!homeAddress?.coordinates) return;
    const coordinates = homeAddress.coordinates;
    const commuteCoordinates = commuteAddress?.coordinates;

    let cancelled = false; // ability to cancel a seach
    // This flag prevents stale results from being applied; it does not abort in-flight requests.

    async function loadPlaces() {
      setResults([]); // clear results
      setCommuteTimes(null);

      // Fetch the commute times at the same time (different server than Nominatim)
      const commutePromise = commuteCoordinates
        ? commuteMinutes(coordinates, commuteCoordinates).catch((err) => {
            console.error("Failed to fetch commute times:", err);
            return null;
          })
        : Promise.resolve(null);
      commutePromise.then((times) => {
        if (!cancelled) setCommuteTimes(times);
      });

      // Search each criterion separately
      const all: CriterionResult[] = [];
      for (let i = 0; i < criteriaList.length; i++) {
        try {
          // Actual search happens in geocoding
          const found = await searchInSteps(
            criteriaList[i].criteria,
            criteriaColors[i + 1], // Index 0 is reserved for the commute marker.
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
      }

      const times = await commutePromise;
      if (!cancelled) {
        setSearchData((previous) => ({
          ...previous,
          results: all,
          commuteTimes: times,
          resultsRelevant: true,
        }));
      }
    }

    loadPlaces(); // start search

    // Clean up function when a new search happens
    return () => {
      cancelled = true; // old search is terminated
      // The in-flight network requests may finish, but their results are ignored.
    };
  }, [
    homeAddress,
    commuteAddress,
    criteriaList,
    maxRadius,
    resultsRelevant,
    savedResults,
    savedCommuteTimes,
    setSearchData,
  ]); // if any of these change the effect is run again

  return {
    results: resultsRelevant ? savedResults : results,
    commuteTimes: resultsRelevant ? savedCommuteTimes : commuteTimes,
  };
}
