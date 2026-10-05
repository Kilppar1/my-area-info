"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";

export default function Home() {
  const router = useRouter();
  const { setSearchData } = useSearch();
  const [address, setAddress] = useState("");
  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchData({ address });
    router.push("/results");
  }

  return (
    <main>
      <p>
        One paragraph text about the service. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <form onSubmit={handleSearch}>
        <div className="form-field">
          <div className="form-field-label">
            <span className="form-number">1</span>
            <label className="form-label">Enter your address</label>
          </div>
          <div className="form-field-input">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Maarintie 8, 02150 Espoo..."
            />
            <button type="button" className="btn btn-primary">
              Verify
            </button>
          </div>
        </div>
        <div className="form-field">
          <div className="form-field-label">
            <span className="form-number form-number-even">2</span>
            <label className="form-label">Add search criteria</label>
          </div>
          <div className="form-field-input">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Maarintie 8, 02150 Espoo..."
            />
            <button type="button" className="btn btn-secondary">
              Add
            </button>
          </div>
        </div>
        <div className="form-buttons">
          <button type="button" className="btn btn-clear">
            Clear search
          </button>
          <button type="submit" className="btn btn-primary">
            Explore area
          </button>
        </div>
      </form>
    </main>
  );
}
