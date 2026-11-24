"use client";

import Image from "next/image";
import type { Ref } from "react";
import type { CommuteTimes } from "@/types";
import { formatDistance } from "@/lib/geocoding";

type CommuteCategoryProps = {
  address: string;
  commuteDistance: number | null;
  commuteTimes: CommuteTimes | null;
  active: boolean;
  selected: boolean;
  transitDirectionsUrl: string | null;
  color: string;
  categoryRef: Ref<HTMLElement>;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
};

// Format the commute time into days, hours, and minutes
function formatCommuteTime(minutes: number): string {
  if (minutes <= 60) return `${minutes} min`;

  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;
  const parts: string[] = [];

  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} min`);

  return parts.join(" ");
}

export default function CommuteCategory({
  address,
  commuteDistance,
  commuteTimes,
  active,
  selected,
  transitDirectionsUrl,
  color,
  categoryRef,
  onSelect,
  onHover,
}: CommuteCategoryProps) {
  return (
    <section
      ref={categoryRef}
      className={`result-category commute-category${active ? " selected" : ""}`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="category-header">
        <h3 className="category-title">
          <button
            type="button"
            className="commute-select-button"
            aria-label={`Highlight commute to ${address} on the map`}
            aria-pressed={selected}
            onClick={onSelect}
          >
            Commute to: {address}
          </button>
        </h3>
        {commuteDistance !== null && (
          <p className="commute-distance">
            Distance {formatDistance(commuteDistance)}
          </p>
        )}
        <span className="dot" style={{ background: color }} />
      </div>
      <div className="commute-options">
        {commuteTimes && (
          <div className="commute-option">
            <Image src="/car.svg" alt="Car" width={48} height={48} />
            <span>{formatCommuteTime(commuteTimes.car)}</span>
          </div>
        )}
        {transitDirectionsUrl && (
          <a
            className="commute-option commute-option-link"
            href={transitDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View public transport directions to ${address} in Google Maps`}
          >
            <Image src="/bus.svg" alt="" width={48} height={48} />
            <span>Google Maps</span>
          </a>
        )}
        {commuteTimes && (
          <>
            <div className="commute-option">
              <Image src="/bike.svg" alt="Bike" width={48} height={48} />
              <span>{formatCommuteTime(commuteTimes.bike)}</span>
            </div>
            <div className="commute-option">
              <Image src="/walking.svg" alt="Walking" width={48} height={48} />
              <span>{formatCommuteTime(commuteTimes.walk)}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
