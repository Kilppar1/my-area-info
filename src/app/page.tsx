"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";
import type { Address } from "@/types";

export default function Home() {
  const router = useRouter();
  const { setSearchData } = useSearch();
  const [homeInput, setHomeInput] = useState("");
  const [commuteInput, setCommuteInput] = useState("");
  const [homeAddresses, setHomeAddresses] = useState<Address[]>([]);
  const [commuteAddresses, setCommuteAddresses] = useState<Address[]>([]);
  const [verifiedHomeId, setVerifiedHomeId] = useState<string | null>(null);

  const [verifiedCommuteId, setVerifiedCommuteId] = useState<string | null>(
    null,
  );
  const [criteriaList, setCriteriaList] = useState<string[]>([]);
  const [criteriaInput, setCriteriaInput] = useState("");
  const [searchRange, SetSearchRange] = useState<number | null>(null);

  const suggestedSearches = [
    "School",
    "Restaurant",
    "Grocery store",
    "Park",
    "Museum",
    "Bus stop",
    "Gym",
    "Bar",
    "Hotel",
    "Café",
    "Pharmacy",
  ];

  const getAdresses = (addressGiven: string, addressType: string) => {
    if (addressType === "home") setVerifiedHomeId(null);
    if (addressType === "commute") setVerifiedCommuteId(null);
    // hard coded mock results
    const addresses: Address[] = [
      {
        id: "a1",
        address: addressGiven,
        coordinates: {
          latitude: 60.18726082373336,
          longitude: 24.81914059805439,
        },
      },
      {
        id: "a2",
        address: "Maarintie 8, 02150 Espoo",
        coordinates: {
          latitude: 60.18726082373336,
          longitude: 24.81914059805439,
        },
      },
      {
        id: "a3",
        address: "Konemiehentie 2, 02150 Espoo",
        coordinates: {
          latitude: 60.187081124375624,
          longitude: 24.82132945387877,
        },
      },
    ];
    if (addresses.length === 1) {
      if (addressType === "home") setVerifiedHomeId(addresses[0].id);
      if (addressType === "commute") setVerifiedCommuteId(addresses[0].id);
    }
    if (addressType === "home") setHomeAddresses(addresses);
    if (addressType === "commute") setCommuteAddresses(addresses);
  };

  const verifyAddress = (id: string, addressType: "home" | "commute") => {
    if (addressType === "home") setVerifiedHomeId(id);
    if (addressType === "commute") setVerifiedCommuteId(id);
  };

  const handleAdd = (criteria: string = criteriaInput) => {
    const criteriaTrimmed = criteria.trim();
    if (criteriaTrimmed) {
      if (
        criteriaList.includes(criteriaTrimmed) &&
        criteriaInput !== criteria
      ) {
        setCriteriaList((prev) =>
          prev.filter((currentCriteria) => currentCriteria !== criteriaTrimmed),
        );
      } else if (
        criteriaList.length < 5 &&
        !criteriaList.includes(criteriaTrimmed)
      ) {
        setCriteriaList((prev) => [...prev, criteriaTrimmed]);
        if (criteriaInput === criteria) setCriteriaInput("");
      }
    }
  };

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchData({
      homeAddresses,
      commuteAddresses,
      verifiedHomeId,
      verifiedCommuteId,
      criteriaList,
      searchRange,
    });
    router.push("/results");
  }

  function handleClear() {
    // Clear inputs
    setHomeInput("");
    setCommuteInput("");
    setCriteriaInput("");
    // Clear address and criteria lists and other data given
    setHomeAddresses([]);
    setCommuteAddresses([]);
    setCriteriaList([]);
    SetSearchRange(null);
    // Clear verified addresses
    setVerifiedHomeId(null);
    setVerifiedCommuteId(null);
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
              value={homeInput}
              onChange={(e) => setHomeInput(e.target.value)}
              placeholder="e.g. Maarintie 8, 02150 Espoo..."
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => getAdresses(homeInput, "home")}
            >
              Verify
            </button>
          </div>
          {!verifiedHomeId && (
            <span className="form-address-verification">
              Verify your address to enable search criteria
            </span>
          )}
          {homeAddresses.map((address) => (
            <div className="form-address-list" key={address.id}>
              {verifiedHomeId === address.id ? (
                <span className="verification-tick">
                  <Image
                    src="/verification-tick.svg"
                    alt="verification tick"
                    height={18}
                    width={18}
                  />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => verifyAddress(address.id, "home")}
                  className="verification-box"
                ></button>
              )}
              <span>{address.address}</span>
            </div>
          ))}
        </div>
        <fieldset className="form-field" disabled={!verifiedHomeId}>
          <div className="form-field-label">
            <span className="form-number form-number-even">2</span>
            <span className="form-label">Add search criteria </span>
            <span className="form-label-counter">
              ({criteriaList.length}/5)
            </span>
          </div>
          <div className="form-field-input">
            <input
              value={criteriaInput}
              onChange={(e) => setCriteriaInput(e.target.value)}
              placeholder="Type a name of a place or type of a place..."
            />
            <button
              type="button"
              onClick={() => handleAdd()}
              className="btn btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="suggested-searches">
            {suggestedSearches.map((search) => (
              <button
                key={search}
                type="button"
                onClick={() => handleAdd(search)}
                className={
                  !criteriaList.includes(search)
                    ? "suggestion-box"
                    : "suggestion-box suggestion-box-added"
                }
              >
                {!criteriaList.includes(search) ? (
                  <span>+</span>
                ) : (
                  <span className="verification-tick">
                    <Image
                      src="/verification-tick.svg"
                      alt="verification tick"
                      height={14}
                      width={14}
                    />
                  </span>
                )}
                <span>{search}</span>
              </button>
            ))}
          </div>
          {criteriaList.map((criteria) => (
            <div className="form-criteria-list" key={criteria}>
              <span>{criteria}</span>
              <div className="criteria-properties">
                <div className="criteria-ratings">
                  <span className="criteria-rating-box">
                    <Image
                      src="/rating-tick.svg"
                      alt="ticked ratings"
                      height={12}
                      width={12}
                    />
                  </span>
                  <span>Ratings</span>
                </div>

                <span className="criteria-trash">
                  <Image
                    src="/trash-can.svg"
                    alt="remove criteria"
                    height={24}
                    width={24}
                  />
                </span>
              </div>
            </div>
          ))}
        </fieldset>
        <fieldset className="form-field" disabled={!verifiedHomeId}>
          <div className="form-field-label">
            <span className="form-number form-number">3</span>
            <label className="form-label">Add overall information</label>
          </div>
          <div className="form-field-input">
            <input
              value={commuteInput}
              onChange={(e) => setCommuteInput(e.target.value)}
              placeholder="e.g. Maarintie 8, 02150 Espoo..."
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => getAdresses(commuteInput, "commute")}
            >
              Verify
            </button>
          </div>
          {!verifiedCommuteId && commuteAddresses.length > 0 && (
            <span className="form-address-verification">
              Select your commute address to include it to the search
            </span>
          )}
          {commuteAddresses.map((address) => (
            <div className="form-address-list" key={address.id}>
              {verifiedCommuteId === address.id ? (
                <span className="verification-tick">
                  <Image
                    src="/verification-tick.svg"
                    alt="verification tick"
                    height={18}
                    width={18}
                  />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => verifyAddress(address.id, "commute")}
                  className="verification-box"
                ></button>
              )}
              <span>{address.address}</span>
            </div>
          ))}
        </fieldset>
        <div className="form-buttons">
          <button type="button" className="btn btn-clear" onClick={handleClear}>
            Clear search
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!verifiedHomeId}
          >
            Explore area
          </button>
        </div>
      </form>
    </main>
  );
}
