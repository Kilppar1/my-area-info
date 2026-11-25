"use client";

import Image from "next/image";
import { useState } from "react";
import type { Place } from "@/types";
import { formatDistance } from "@/lib/geocoding";
import RatingPopup from "@/components/results/RatingPopup";

type PlaceRating = {
  rating: number;
  amount: number;
};

type PlaceCardProps = {
  place: Place;
  rating?: PlaceRating;
  showRating?: boolean;
  onRate: (place: Place, stars: number) => Promise<void>;
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
  rating,
  showRating = true,
  onRate,
  isFavorite,
  isSelected,
  isExplicitlySelected,
  onSelect,
  onHover,
  onToggleFavorite,
  onCardRef,
}: PlaceCardProps) {
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  return (
    <div
      className={`place-card${isSelected ? " selected" : ""}`}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      ref={(card) => onCardRef(place.id, card)}
    >
      <button
        type="button"
        className={`place-card-select${
          place.osmKey && showRating ? " has-rating" : ""
        }`}
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
      {showRating && place.osmKey && (
        <button
          type="button"
          className={`rating-button${rating?.amount ? " rated" : ""}`}
          aria-label={
            rating?.amount
              ? `Rated ${rating.rating.toFixed(1).replace(".", ",")} out of 5. Add a review for ${place.name}`
              : `No reviews yet. Add a review for ${place.name}`
          }
          onClick={(event) => {
            event.stopPropagation();
            setIsRatingOpen(true);
          }}
        >
          <span>
            {rating?.amount
              ? `Rated ${rating.rating.toFixed(1).replace(".", ",")}/5`
              : "No reviews yet"}
          </span>
          <Image
            src={rating?.amount ? "/heart-fill.svg" : "/heart-no-fill.svg"}
            alt=""
            width={24}
            height={24}
          />
        </button>
      )}
      {isRatingOpen && showRating && place.osmKey && (
        <RatingPopup
          onClose={() => setIsRatingOpen(false)}
          onSubmit={(stars) => onRate(place, stars)}
        />
      )}
    </div>
  );
}
