"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type RatingPopupProps = {
  onClose: () => void;
  onSubmit: (stars: number) => Promise<void>;
};

// The rating pop up that lets users send their own reviews
export default function RatingPopup({ onClose, onSubmit }: RatingPopupProps) {
  const [stars, setStars] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submitRating() {
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit(stars);
      onClose();
    } catch (submitError) {
      console.error("Failed to submit place review:", submitError);
      setError("Could not submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="rating-popup-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="rating-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="rating-popup-title" className="rating-popup-title">
          Rate this place
        </h2>
        <div className="rating-popup-hearts">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="rating-popup-heart"
              aria-label={`${value} ${value === 1 ? "heart" : "hearts"}`}
              aria-pressed={stars === value}
              disabled={isSubmitting}
              onClick={(event) => {
                event.stopPropagation();
                setStars(stars === value ? 0 : value);
              }}
            >
              <Image
                src={value <= stars ? "/heart-fill.svg" : "/heart-no-fill.svg"}
                alt=""
                width={30}
                height={30}
              />
            </button>
          ))}
        </div>
        {error && (
          <p className="rating-popup-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          className="rating-popup-submit"
          disabled={isSubmitting}
          onClick={(event) => {
            event.stopPropagation();
            void submitRating();
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </section>
    </div>,
    document.body,
  );
}
