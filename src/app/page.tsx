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
  const [commuteAddress, setCommuteAddress] = useState("");
  const [criteria, setCriteria] = useState("");
  const [searchRange, SetSearchRange] = useState(0);
  const [addressVerified, setAddressVerified] = useState(false);

  const verifyAddress = () => {
    setAddressVerified(true);
  };

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchData({ address, commuteAddress, criteria, searchRange });
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={verifyAddress}
            >
              Verify
            </button>
          </div>
          {!addressVerified && (
            <span className="form-address-verification">
              Verify your address to enable search criteria
            </span>
          )}
          {addressVerified && (
            <div className="form-address-verified">
              <span className="verification-tick">
                <svg
                  width="28"
                  height="23"
                  viewBox="0 0 28 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.34375 14.7816C1.34375 14.7816 4.03125 14.7816 7.61458 21.0525C7.61458 21.0525 17.5741 4.62883 26.4271 1.34412"
                    stroke="currentColor"
                    strokeWidth="2.6875"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{address}</span>
            </div>
          )}
        </div>
        <div className="form-field">
          <div className="form-field-label">
            <span className="form-number form-number-even">2</span>
            <label className="form-label">Add search criteria</label>
          </div>
          <div className="form-field-input">
            <input
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Type a name of a place or type of a place..."
            />
            <button type="button" className="btn btn-secondary">
              Add
            </button>
          </div>
        </div>
        <div className="form-field">
          <div className="form-field-label">
            <span className="form-number form-number">3</span>
            <label className="form-label">Add overall information</label>
          </div>
          <div className="form-field-input">
            <input
              value={commuteAddress}
              onChange={(e) => setCommuteAddress(e.target.value)}
              placeholder="e.g. Maarintie 8, 02150 Espoo..."
            />
            <button type="button" className="btn btn-primary">
              Verify
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
