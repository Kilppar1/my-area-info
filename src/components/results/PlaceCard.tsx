"use client";

import Image from "next/image";
import type { Place } from "@/types";
import { formatDistance } from "@/lib/geocoding";

type PlaceCardProps = {
  place: Place;
  isFavorite: boolean;
  isSelected: boolean;
  isExplicitlySelected: boolean;
  onSelect: (placeId: string) => void;
  onHover: (placeId: string | null) => void;
  onToggleFavorite: (place: Place) => void;
  onCardRef: (placeId: string, card: HTMLDivElement | null) => void;
};

// Render result cards with favourite or unfavourite option
export default function PlaceCard({
  place,
  isFavorite,
  isSelected,
  isExplicitlySelected,
  onSelect,
  onHover,
  onToggleFavorite,
  onCardRef,
}: PlaceCardProps) {
  return (
    <div
      className={`place-card${isSelected ? " selected" : ""}`}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      ref={(card) => onCardRef(place.id, card)}
    >
      <button
        type="button"
        className="place-card-select"
        aria-label={`Highlight ${place.name} on the map`}
        aria-pressed={isExplicitlySelected}
        onClick={() => onSelect(place.id)}
      >
        <span className="place-name">{place.name}</span>
        <span className="place-distance">
          {formatDistance(place.distance ?? 0)}
        </span>
      </button>
      <div className="place-heading">
        <button
          type="button"
          className="favorite-button"
          aria-label={`${isFavorite ? "Remove" : "Add"} ${place.name} ${isFavorite ? "from" : "to"} favourites`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(place)}
        >
          <Image
            src={isFavorite ? "/Star-fill.svg" : "/Star.svg"}
            alt="Favourite"
            width={24}
            height={23}
          />
        </button>
      </div>
    </div>
  );
}
