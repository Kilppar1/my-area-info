"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";
import type { Address, Criteria } from "@/types";
import { nominatimSearchAddresses } from "@/lib/geocoding";

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
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
  const [criteriaInput, setCriteriaInput] = useState("");
  const [searchRange, setSearchRange] = useState("5"); // Default search range 5 km

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

  const getAdresses = async (addressGiven: string, addressType: string) => {
    if (addressType === "home") setVerifiedHomeId(null);
    if (addressType === "commute") setVerifiedCommuteId(null);
    if (!addressGiven.trim()) return;

    let addresses: Address[] = [];
    try {
      addresses = await nominatimSearchAddresses(addressGiven);
    } catch (err) {
      console.error("Failed to find addresses:", err);
    }

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
    if (
      criteriaTrimmed &&
      criteriaList.length < 5 &&
      !criteriaList.some((criteria) => criteria.criteria === criteriaTrimmed)
    ) {
      setCriteriaList((prev) => [
        ...prev,
        { criteria: criteriaTrimmed, ratingsEnabled: false },
      ]);
      if (criteriaInput === criteria) setCriteriaInput("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (criteriaList.some((criteria) => criteria.criteria === suggestion)) {
      removeCriteria(suggestion);
    } else handleAdd(suggestion);
  };

  const removeCriteria = (criteria: string) => {
    setCriteriaList((prev) =>
      prev.filter((currentCriteria) => currentCriteria.criteria !== criteria),
    );
  };

  const toggleRatings = (criteria: string) => {
    setCriteriaList((previous) =>
      previous.map((prev) =>
        prev.criteria === criteria
          ? { ...prev, ratingsEnabled: !prev.ratingsEnabled }
          : prev,
      ),
    );
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9.,]/g, "");
    value = value.replace(/,/g, ".");
    const separatorIndex = value.indexOf(".");
    if (separatorIndex !== -1) {
      value =
        value.slice(0, separatorIndex + 1) +
        value
          .slice(separatorIndex + 1)
          .replace(/\./g, "")
          .slice(0, 1);
      if (value.startsWith(".")) {
        value = `0${value}`;
      }
    }
    setSearchRange(value);
  };

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchData({
      homeAddresses,
      commuteAddresses,
      verifiedHomeId,
      verifiedCommuteId,
      criteriaList,
      searchRange: searchRange.trim() === "" ? null : Number(searchRange),
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
    setSearchRange("5");
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
        <fieldset className="form-field">
          <div className="form-legend-field">
            <span className="form-number">1</span>
            <legend className="form-legend">Enter your address</legend>
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
            <button
              type="button"
              onClick={() => verifyAddress(address.id, "home")}
              className="form-address-list"
              key={address.id}
            >
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
                <span className="verification-box"></span>
              )}
              <span>{address.address}</span>
            </button>
          ))}
        </fieldset>
        <fieldset className="form-field" disabled={!verifiedHomeId}>
          <div className="form-legend-field">
            <span className="form-number form-number-even">2</span>
            <legend className="form-legend">Add search criteria </legend>
            <span className="form-legend-counter">
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
                onClick={() => handleSuggestionClick(search)}
                className={
                  !criteriaList.some((criteria) => criteria.criteria === search)
                    ? "suggestion-box"
                    : "suggestion-box suggestion-box-added"
                }
              >
                {!criteriaList.some(
                  (criteria) => criteria.criteria === search,
                ) ? (
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
            <div className="form-criteria-list" key={criteria.criteria}>
              <span>{criteria.criteria}</span>
              <div className="criteria-properties">
                <button
                  type="button"
                  onClick={() => toggleRatings(criteria.criteria)}
                  aria-label="Toggle ratings for criteria"
                  className="criteria-ratings"
                >
                  <span className="criteria-rating-box">
                    {criteria.ratingsEnabled && (
                      <Image
                        src="/rating-tick.svg"
                        alt="ticked ratings"
                        height={12}
                        width={12}
                      />
                    )}
                  </span>
                  <span>Ratings</span>
                </button>

                <button
                  type="button"
                  className="criteria-trash"
                  onClick={() => removeCriteria(criteria.criteria)}
                  aria-label="Remove criteria"
                >
                  <Image
                    src="/trash-can.svg"
                    alt="remove criteria"
                    height={24}
                    width={24}
                  />
                </button>
              </div>
            </div>
          ))}
        </fieldset>
        <fieldset className="form-field" disabled={!verifiedHomeId}>
          <div className="form-legend-field">
            <span className="form-number form-number">3</span>
            <legend className="form-legend">Add overall information</legend>
          </div>
          <p>
            Type an optional address to calculate commuting time to work or
            similar
          </p>
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
            <button
              type="button"
              onClick={() => verifyAddress(address.id, "commute")}
              className="form-address-list"
              key={address.id}
            >
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
                <span className="verification-box"></span>
              )}
              <span>{address.address}</span>
            </button>
          ))}
          <div className="searchrange-field">
            <label htmlFor="search-range">Max. search range:</label>
            <input
              id="search-range"
              type="text"
              inputMode="decimal"
              value={searchRange}
              onChange={handleRangeChange}
              className="searchrange-box"
            ></input>
            <span>km</span>
          </div>
        </fieldset>
        <div className="form-buttons">
          <button type="button" className="btn btn-clear" onClick={handleClear}>
            Clear search
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!verifiedHomeId || !Number(searchRange)} // The search needs to have an address and search range
          >
            Explore area
          </button>
        </div>
      </form>
    </main>
  );
}
