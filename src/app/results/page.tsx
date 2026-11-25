"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { Place } from "@/types";
import { useSearch } from "@/context/SearchContext";
import { distanceMeters } from "@/lib/geocoding";
import Image from "next/image";
import FilterMenu from "@/components/FilterMenu";
import { criteriaColors } from "@/lib/constants";
import { useSearchResults } from "@/hooks/useSearchResults";
import { useRatings } from "@/hooks/useRatings";
import PlaceCard from "@/components/results/PlaceCard";
import CommuteCategory from "@/components/results/CommuteCategory";

// The map needs to be loaded in the browser
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
});

// Render the search results
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
    favorites,
    commuteTimes: savedCommuteTimes,
    resultsRelevant,
    hiddenResultFilters,
    resultsListExpanded: listExpanded,
  } = searchData;

  // States for list expanded and hidden criteria:
  const hidden = new Set(hiddenResultFilters);
  const favoritesOnly = !hidden.has("Favourites");

  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedCommute, setSelectedCommute] = useState(false);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [hoveredCommute, setHoveredCommute] = useState(false);
  const placeCardRefs = useRef(new Map<string, HTMLDivElement>());
  const commuteCategoryRef = useRef<HTMLElement | null>(null);
  const activePlaceId =
    hoveredPlaceId ?? (hoveredCommute ? null : selectedPlaceId);
  const activeCommute = !hoveredPlaceId && (hoveredCommute || selectedCommute);

  // Find the verified home and commute addresses and get the maximum search range that the user has set
  const homeAddress = homeAddresses.find(({ id }) => id === verifiedHomeId);
  const commuteAddress = commuteAddresses.find(
    ({ id }) => id === verifiedCommuteId,
  );
  const maxRadius = searchRange!;
  const { results, commuteTimes } = useSearchResults({
    homeAddress,
    commuteAddress,
    criteriaList,
    maxRadius,
    resultsRelevant,
    savedResults,
    savedCommuteTimes,
    setSearchData,
  });

  useEffect(() => {
    const scrollTarget = activeCommute
      ? commuteCategoryRef.current
      : activePlaceId
        ? placeCardRefs.current.get(activePlaceId)
        : null;
    if (!scrollTarget) return;

    scrollTarget.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
    });
  }, [activePlaceId, activeCommute]);

  const visibleResults = favoritesOnly
    ? []
    : results.filter((result) => !hidden.has(result.criteria)); // filter away hidden ones
  const places = favoritesOnly
    ? favorites
    : visibleResults.flatMap((result) => result.places);
  const { ratings, submitRating } = useRatings(places);

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
  const visibleCommute =
    favoritesOnly || hidden.has("Commute address") ? null : commute;
  const commuteDistance =
    home?.coordinates && commute?.coordinates
      ? distanceMeters(home.coordinates, commute.coordinates)
      : null;
  const transitDirectionsUrl =
    home?.coordinates && commute?.coordinates
      ? `https://www.google.com/maps/dir/?api=1&origin=${home.coordinates.latitude},${home.coordinates.longitude}&destination=${commute.coordinates.latitude},${commute.coordinates.longitude}&travelmode=transit&transit_mode=bus`
      : null;

  // Change the visibility of the certain criteria
  function toggleCriterion(criteria: string) {
    setSearchData((previous) => {
      const next = new Set(previous.hiddenResultFilters);
      if (next.has(criteria)) {
        next.delete(criteria);
      } else {
        next.add(criteria);
      }
      return { ...previous, hiddenResultFilters: [...next] };
    });
  }

  // Toggle selection of a place card or map marker
  function toggleSelectedPlace(placeId: string) {
    setSelectedCommute(false);
    const nextPlaceId = selectedPlaceId === placeId ? null : placeId;
    setSelectedPlaceId(nextPlaceId);
    setHoveredPlaceId(null);
    setHoveredCommute(false);
  }

  // Toggle selection of the commute marker
  function toggleSelectedCommute() {
    setSelectedPlaceId(null);
    const nextSelectedCommute = !selectedCommute;
    setSelectedCommute(nextSelectedCommute);
    setHoveredPlaceId(null);
    setHoveredCommute(false);
  }

  // Clear place and commute selection
  function clearSelectedPlace() {
    setSelectedPlaceId(null);
    setSelectedCommute(false);
    setHoveredPlaceId(null);
    setHoveredCommute(false);
  }

  // Set the currently hovered place
  function hoverPlace(placeId: string | null) {
    setHoveredPlaceId(placeId);
    if (placeId) setHoveredCommute(false);
  }

  // Set whether the commute marker is hovered
  function hoverCommute(isHovered: boolean) {
    setHoveredCommute(isHovered);
    if (isHovered) setHoveredPlaceId(null);
  }

  // Clear selection when the results list background is clicked
  function handleResultsListClick(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest(".commute-option")) {
      clearSelectedPlace();
      return;
    }

    if (
      target.closest(
        ".place-card, .commute-select-button, .category-header, button, a",
      )
    ) {
      return;
    }

    clearSelectedPlace();
  }

  // Favourite or unfavourite places from the results list
  function toggleFavorite(place: (typeof favorites)[number]) {
    setSearchData((previous) => ({
      ...previous,
      favorites: previous.favorites.some(({ id }) => id === place.id)
        ? previous.favorites.filter(({ id }) => id !== place.id)
        : [...previous.favorites, place],
    }));
  }

  return (
    <main className={`results-page ${listExpanded ? "list-expanded" : ""}`}>
      <div className="results-list" onClick={handleResultsListClick}>
        {/* A message is shown if someone opens the results page directly without actually doing a search */}
        {!home ? (
          <p>No search found. Create one from the search page.</p>
        ) : (
          <>
            {commuteAddress &&
              !favoritesOnly &&
              !hidden.has("Commute address") && ( // Show the commute if it exists
                <CommuteCategory
                  address={commuteAddress.address}
                  commuteDistance={commuteDistance}
                  commuteTimes={commuteTimes}
                  active={activeCommute}
                  selected={selectedCommute}
                  transitDirectionsUrl={transitDirectionsUrl}
                  color={criteriaColors[0]}
                  categoryRef={commuteCategoryRef}
                  onSelect={toggleSelectedCommute}
                  onHover={hoverCommute}
                />
              )}
            {favoritesOnly ? (
              <section className="result-category">
                <div className="category-header">
                  <h3>Favourites</h3>
                </div>
                {favorites.length === 0 ? (
                  <p>No favourites saved.</p>
                ) : (
                  <div className="place-cards">
                    {favorites.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        rating={place.osmKey ? ratings[place.osmKey] : undefined}
                        onRate={submitRating}
                        isFavorite={true}
                        isSelected={activePlaceId === place.id}
                        isExplicitlySelected={selectedPlaceId === place.id}
                        onSelect={toggleSelectedPlace}
                        onHover={hoverPlace}
                        onToggleFavorite={toggleFavorite}
                        onCardRef={(placeId, card) => {
                          if (card) placeCardRefs.current.set(placeId, card);
                          else placeCardRefs.current.delete(placeId);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              visibleResults.map(({ criteria, places: foundPlaces }) => (
                <section className="result-category" key={criteria}>
                  <div className="category-header">
                    <h3>{criteria}</h3>
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
                  </div>
                  {foundPlaces.length === 0 ? (
                    <p>No results found.</p>
                  ) : (
                    <div className="place-cards">
                      {foundPlaces.map((place) => (
                        <PlaceCard
                          key={place.id}
                          place={place}
                          rating={place.osmKey ? ratings[place.osmKey] : undefined}
                          showRating={
                            criteriaList.find(
                              (item) => item.criteria === criteria,
                            )?.ratingsEnabled ?? true
                          }
                          onRate={submitRating}
                          isFavorite={favorites.some(
                            ({ id }) => id === place.id,
                          )}
                          isSelected={activePlaceId === place.id}
                          isExplicitlySelected={selectedPlaceId === place.id}
                          onSelect={toggleSelectedPlace}
                          onHover={hoverPlace}
                          onToggleFavorite={toggleFavorite}
                          onCardRef={(placeId, card) => {
                            if (card) placeCardRefs.current.set(placeId, card);
                            else placeCardRefs.current.delete(placeId);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))
            )}
          </>
        )}
      </div>

      {/* Map and controls */}
      <div className="results-map-wrapper">
        {/* Show the map when a valid home exists */}
        {home && (
          <ResultsMap
            home={home}
            commute={visibleCommute}
            commuteDistance={visibleCommute ? commuteDistance : null}
            places={places}
            layout={listExpanded}
            activePlaceId={activePlaceId}
            activeCommute={activeCommute}
            onPlaceSelect={toggleSelectedPlace}
            onPlaceHover={hoverPlace}
            onCommuteSelect={() => toggleSelectedCommute()}
            onCommuteHover={hoverCommute}
            onClearSelection={clearSelectedPlace}
          />
        )}
        {/* The filter menu component */}
        <FilterMenu
          items={[
            { name: "Favourites", isFavorites: true },
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
          onClick={() =>
            setSearchData((previous) => ({
              ...previous,
              resultsListExpanded: !previous.resultsListExpanded,
            }))
          }
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
