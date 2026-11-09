"use client";

import { useState } from "react";
import Image from "next/image";

type FilterItem = { name: string; color: string };

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
          {items.map(({ name, color }) => (
            <li key={name}>
              <button
                type="button"
                className={hidden.has(name) ? "criteria-filtered-off" : ""}
                onClick={() => onToggle(name)}
              >
                <span className="dot" style={{ background: color }} />
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
