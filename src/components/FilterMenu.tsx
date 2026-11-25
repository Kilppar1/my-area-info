"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// An item shown in the filter menu
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
  const menuRef = useRef<HTMLDivElement>(null);

  // The filter menu is closed if clicking elsewhere
  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("touchstart", handleOutsideClick, true);
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`filter-menu ${open ? "filter-menu-open" : ""}`}
    >
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
