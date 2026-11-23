"use client";

import { useState } from "react";
import Image from "next/image";

type FilterItem = {
  name: string;
  color?: string;
  isFavorites?: boolean;
};

// Filter menu shows the criteria and favourites as categories that the user can switch on or off
export default function FilterMenu({
  items,
  hidden,
  onToggle,
}: {
  items: FilterItem[];
  hidden: Set<string>;
  onToggle: (name: string) => void;
}) {
  // The state for open and closed filter menu
  const [open, setOpen] = useState(false);

  return (
    <div className={`filter-menu ${open ? "filter-menu-open" : ""}`}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setOpen((open) => !open)}
      >
        <Image
          src={open ? "/filter-no-fill.svg" : "/filter-fill.svg"}
          alt={open ? "Hide map layers" : "Show map layers"}
          width={40}
          height={40}
        />
      </button>

      {open && (
        <ul className="filter-list">
          {items.map(({ name, color, isFavorites }) => (
            <li key={name}>
              <button
                type="button"
                className={hidden.has(name) ? "criteria-filtered-off" : ""}
                onClick={() => onToggle(name)}
              >
                {isFavorites ? (
                  <Image
                    src={hidden.has(name) ? "/Star.svg" : "/Star-fill.svg"}
                    alt=""
                    width={20}
                    height={20}
                  />
                ) : (
                  <span className="dot" style={{ background: color }} />
                )}
                {name}
              </button>
              {isFavorites && (
                <div className="filter-section-spacer" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
