"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Place, CriterionResult, CommuteTimes } from "@/types";
import { useSearch } from "@/context/SearchContext";
import {
  distanceMeters,
  searchInSteps,
  sleep,
  commuteMinutes,
  formatDistance,
} from "@/lib/geocoding";
import Image from "next/image";
import FilterMenu from "@/components/FilterMenu";
import { criteriaColors } from "@/lib/constants";

// The map needs to be loaded in the browser
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
});

export default function ResultsPage() {
  const { searchData, setSearchData } = useSearch();
  const {
    homeAddresses,
    verifiedHomeId,
    commuteAddresses,
    verifiedCommuteId,
    criteriaList,
    searchRange,
    results: savedResults,
    commuteTimes: savedCommuteTimes,
    resultsRelevant,
  } = searchData;

  // States for list expanded and hidden criteria:
  const [listExpanded, setListExpanded] = useState(false);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  // State for loading
  const [loading, setLoading] = useState(false);

  // Results for the search criteria
  const [results, setResults] = useState<CriterionResult[]>([]);
  const visibleResults = results.filter(
    (result) => !hidden.has(result.criteria),
  ); // filter away hidden ones
  const places = visibleResults.flatMap((result) => result.places);

  // State for the commute times
  const [commuteTimes, setCommuteTimes] = useState<CommuteTimes | null>(null);

  // Find the verified home and commute addresses and get the maximum search range that the user has set
  const homeAddress = homeAddresses.find(({ id }) => id === verifiedHomeId);
  const commuteAddress = commuteAddresses.find(
    ({ id }) => id === verifiedCommuteId,
  );
  const maxRadius = searchRange!;

  // Create the home marker if the address has valid coordinates
  const home: Pick<Place, "coordinates" | "name"> | null =
    homeAddress?.coordinates
      ? {
          coordinates: homeAddress.coordinates,
          name: homeAddress.address,
        }
      : null;

  // Create the commute marker if the address has valid coordinates
  const commute: Pick<Place, "coordinates" | "name"> | null =
    commuteAddress?.coordinates
      ? {
          coordinates: commuteAddress.coordinates,
          name: commuteAddress.address,
        }
      : null;
  const commuteDistance =
    home?.coordinates && commute?.coordinates
      ? distanceMeters(home.coordinates, commute.coordinates)
      : null;

  // Change the visibility of the certain criteria
  function toggleCriterion(criteria: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(criteria)) {
        next.delete(criteria);
      } else {
        next.add(criteria);
      }
      return next;
    });
  }

  useEffect(() => {
    // Reuse saved results if they are still relevant
    if (resultsRelevant) {
      setResults(savedResults);
      setCommuteTimes(savedCommuteTimes);
      setLoading(false);
      return;
    }

    // Do not search if no valid coordinates were found
    if (!homeAddress?.coordinates) return;
    const coordinates = homeAddress.coordinates;
    const commuteCoordinates = commuteAddress?.coordinates;

    let cancelled = false; // ability to cancel a seach

    async function loadPlaces() {
      setLoading(true); // show loading indicator for the user
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
            criteriaColors[i + 1], // +1 because color 0 is for commute
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

      const times = await commutePromise;
      if (!cancelled) {
        setSearchData({
          ...searchData,
          results: all,
          commuteTimes: times,
          resultsRelevant: true,
        });
        setLoading(false); // Hide the loading indicator when search is done
      }
    }

    loadPlaces(); // start search

    // Clean up function when a new search happens
    return () => {
      cancelled = true; // old search is terminated
      setLoading(false);
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

  return (
    <main className={`results-page ${listExpanded ? "list-expanded" : ""}`}>
      <div className="results-list">
        {/* A message is shown if someone opens the results page directly without actually doing a search */}
        {!home ? (
          <p>No search found. Create one from the search page.</p>
        ) : (
          <>
            {commuteAddress &&
              !hidden.has("Commute address") && ( // Show the commute if it exists
                <div>
                  <h3>
                    Commute address
                    <span
                      className="dot"
                      style={{ background: criteriaColors[0] }}
                    />
                  </h3>
                  <div className="place-cards">
                    <div className="place-card commute-card">
                      <p className="place-name">{commuteAddress.address}</p>
                      {commuteDistance !== null && (
                        <p className="place-distance">
                          {formatDistance(commuteDistance)}
                        </p>
                      )}
                      {commuteTimes && (
                        <p className="place-distance">
                          <Image
                            src="/car.svg"
                            alt="Car"
                            width={20}
                            height={20}
                          />{" "}
                          {commuteTimes.car} min{" "}
                          <Image
                            src="/bike.svg"
                            alt="Bike"
                            width={20}
                            height={20}
                          />{" "}
                          {commuteTimes.bike} min{" "}
                          <Image
                            src="/walking.svg"
                            alt="Walking"
                            width={20}
                            height={20}
                          />{" "}
                          {commuteTimes.walk} min
                        </p>
                      )}
                      {home && commute && (
                        <a
                          className="route-link"
                          href={`https://www.google.com/maps/dir/?api=1&origin=${home.coordinates.latitude},${home.coordinates.longitude}&destination=${commute.coordinates.latitude},${commute.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            {visibleResults.map(({ criteria, places: foundPlaces }) => (
              <div key={criteria}>
                <h3>
                  {criteria}
                  <span
                    className="dot"
                    style={{
                      background:
                        criteriaColors[
                          criteriaList.findIndex(
                            (c) => c.criteria === criteria,
                          ) + 1
                        ],
                    }}
                  />
                </h3>
                {foundPlaces.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  // Show each place as a card (styled in results.css)
                  <div className="place-cards">
                    {foundPlaces.map((place) => (
                      <div key={place.id} className="place-card">
                        <p className="place-name">{place.name}</p>
                        <p className="place-distance">
                          {formatDistance(place.distance ?? 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Map and controls */}
      <div className="results-map-wrapper">
        {/* Show the map when a valid home exists */}
        {home && (
          <ResultsMap
            home={home}
            commute={hidden.has("Commute address") ? null : commute}
            places={places}
            layout={listExpanded}
          />
        )}
        {/* The filter menu component */}
        <FilterMenu
          items={[
            ...(commuteAddress
              ? [{ name: "Commute address", color: criteriaColors[0] }]
              : []),
            ...criteriaList.map((c, i) => ({
              name: c.criteria,
              color: criteriaColors[i + 1],
            })),
          ]}
          hidden={hidden}
          onToggle={toggleCriterion}
        />
        {/* The layout toggle to switch between view modes */}
        <button
          type="button"
          className="icon-button layout-toggle"
          onClick={() => setListExpanded((prev) => !prev)}
        >
          <Image
            src={
              listExpanded
                ? "/panel-left-open-no-fill.svg"
                : "/panel-left-open-fill.svg"
            }
            alt={listExpanded ? "Show wide map" : "Show wide list"}
            width={50}
            height={50}
          />
        </button>
      </div>
    </main>
  );
}
