"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";
import type { Address, Criteria } from "@/types";
import { nominatimSearchAddresses } from "@/lib/geocoding";
import { suggestedSearches } from "@/lib/constants";
import {
  addressInputSchema,
  criteriaInputSchema,
  searchRangeSchema,
} from "@/schemas/searchSchema";

// Render and manage the search form
export default function Home() {
  // Get variable values from searchdata or use default values if needed
  const router = useRouter();
  const { searchData, setSearchData, loading, importVersion } = useSearch();
  const [formInitialized, setFormInitialized] = useState(false);
  const hasInitializedSave = useRef(false);
  const hasSearchChanged = useRef(false);
  const previousImportVersion = useRef(importVersion);
  const [homeInput, setHomeInput] = useState(searchData.homeInput ?? "");
  const [commuteInput, setCommuteInput] = useState(
    searchData.commuteInput ?? "",
  );
  const [homeAddresses, setHomeAddresses] = useState<Address[]>(
    searchData.homeAddresses ?? [],
  );
  const [commuteAddresses, setCommuteAddresses] = useState<Address[]>(
    searchData.commuteAddresses ?? [],
  );
  const [verifiedHomeId, setVerifiedHomeId] = useState<string | null>(
    searchData.verifiedHomeId ?? null,
  );
  const [verifiedCommuteId, setVerifiedCommuteId] = useState<string | null>(
    searchData.verifiedCommuteId ?? null,
  );
  const [criteriaList, setCriteriaList] = useState<Criteria[]>(
    searchData.criteriaList ?? [],
  );
  const [criteriaInput, setCriteriaInput] = useState(
    searchData.criteriaInput ?? "",
  );
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [spellingSuggestions, setSpellingSuggestions] = useState<
    Record<string, string>
  >({});
  const [checkingSpelling, setCheckingSpelling] = useState(false);
  const [searchRange, setSearchRange] = useState(
    searchData.searchRange?.toString() ?? "5",
  ); // Default search range 5 km
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Restore saved form values after sessionStorage has loaded
  useEffect(() => {
    if (
      !loading &&
      (!formInitialized || importVersion !== previousImportVersion.current)
    ) {
      if (importVersion !== previousImportVersion.current) {
        hasSearchChanged.current = true;
        previousImportVersion.current = importVersion;
      }
      setFormInitialized(true);
      setHomeInput(searchData.homeInput ?? "");
      setCommuteInput(searchData.commuteInput ?? "");
      setHomeAddresses(searchData.homeAddresses ?? []);
      setCommuteAddresses(searchData.commuteAddresses ?? []);
      setVerifiedHomeId(searchData.verifiedHomeId ?? null);
      setVerifiedCommuteId(searchData.verifiedCommuteId ?? null);
      setCriteriaList(searchData.criteriaList ?? []);
      setCriteriaInput(searchData.criteriaInput ?? "");
      setSearchRange(searchData.searchRange?.toString() ?? "5");
    }
  }, [loading, formInitialized, searchData, importVersion]);

  // Set values to searchData if something changes on the page
  useEffect(() => {
    if (!formInitialized) return;
    if (!hasInitializedSave.current) {
      hasInitializedSave.current = true;
      return;
    }
    setSearchData((previous) => ({
      ...previous,
      homeInput,
      commuteInput,
      homeAddresses,
      commuteAddresses,
      verifiedHomeId,
      verifiedCommuteId,
      criteriaList,
      criteriaInput,
      searchRange: searchRange.trim() === "" ? null : Number(searchRange),
      resultsRelevant: false,
    }));
  }, [
    formInitialized,
    homeInput,
    commuteInput,
    homeAddresses,
    commuteAddresses,
    verifiedHomeId,
    verifiedCommuteId,
    criteriaList,
    criteriaInput,
    searchRange,
    setSearchData,
  ]);

  // State for errors with fidning the address
  const [addressError, setAddressError] = useState<{
    type: "home" | "commute";
    message: string;
  } | null>(null);

  // When addresses are searched, nullify verified address and set the list of addresses to be listed to the user. If only one is found, set that as verified
  const getAddresses = async (
    addressGiven: string,
    addressType: "home" | "commute",
  ) => {
    hasSearchChanged.current = true;
    setAddressError(null);
    if (addressType === "home") setVerifiedHomeId(null);
    if (addressType === "commute") setVerifiedCommuteId(null);
    // Validate address before sending it to geocoding
    const validation = addressInputSchema.safeParse(addressGiven);

    if (!validation.success) {
      setAddressError({
        type: addressType,
        message: validation.error.issues[0].message,
      });
      return;
    }

    let addresses: Address[] = [];
    try {
      addresses = await nominatimSearchAddresses(validation.data);
      if (addresses.length === 0) {
        setAddressError({ type: addressType, message: "No addresses found." });
      }
    } catch (err) {
      console.error("Failed to find addresses:", err);
      setAddressError({
        type: addressType,
        message: "Address search failed. Please try again.",
      });
    }

    if (addresses.length === 1) {
      if (addressType === "home") setVerifiedHomeId(addresses[0].id);
      if (addressType === "commute") setVerifiedCommuteId(addresses[0].id);
    }
    if (addressType === "home") setHomeAddresses(addresses);
    if (addressType === "commute") setCommuteAddresses(addresses);
  };

  // Set specific address as the verified address
  const verifyAddress = (id: string, addressType: "home" | "commute") => {
    hasSearchChanged.current = true;
    if (addressType === "home") setVerifiedHomeId(id);
    if (addressType === "commute") setVerifiedCommuteId(id);
  };

  // Request spellchecking
  const checkSpelling = async (word: string): Promise<string | null> => {
    try {
      const response = await fetch("/api/spellcheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word }),
      });

      if (!response.ok) return null;

      const data: { suggestion: string | null } = await response.json();

      return data.suggestion;
    } catch (error) {
      console.error("Spellcheck request failed:", error);
      return null;
    }
  };

  // Add a search criteria to the list of search criterias selected. Max search criterias is 5 and the same criteria cannot be added twice.
  const handleAdd = async (criteria: string = criteriaInput) => {
    const validation = criteriaInputSchema.safeParse(criteria);
    if (!validation.success) {
      setCriteriaError(validation.error.issues[0].message);
      return;
    }
    setCriteriaError(null);
    const criteriaTrimmed = validation.data;
    if (
      criteriaList.length < 5 &&
      !criteriaList.some(
        (item) => item.criteria.toLowerCase() === criteriaTrimmed.toLowerCase(),
      )
    ) {
      hasSearchChanged.current = true;
      setCriteriaList((prev) => [
        ...prev,
        { criteria: criteriaTrimmed, ratingsEnabled: true },
      ]);
      if (criteriaInput === criteria) setCriteriaInput("");
    }
    setCheckingSpelling(true);
    try {
      const suggestion = await checkSpelling(criteriaTrimmed);

      if (suggestion) {
        setSpellingSuggestions((prev) => ({
          ...prev,
          [criteriaTrimmed]: suggestion,
        }));
      }
    } finally {
      setCheckingSpelling(false);
    }
  };

  // Handling the correction of a word
  const correctSpelling = (original: string, corrected: string) => {
    hasSearchChanged.current = true;

    setCriteriaList((prev) => {
      const alreadyExists = prev.some(
        (item) =>
          item.criteria.toLowerCase() === corrected.toLowerCase() &&
          item.criteria !== original,
      );

      if (alreadyExists) {
        return prev.filter((item) => item.criteria !== original);
      }

      return prev.map((item) =>
        item.criteria === original ? { ...item, criteria: corrected } : item,
      );
    });

    setSpellingSuggestions((prev) => {
      const updated = { ...prev };
      delete updated[original];
      return updated;
    });
  };

  // Add or remove criteria to/from the selected criterias when predefiend suggestions are clicked
  const handleSuggestionClick = (suggestion: string) => {
    if (criteriaList.some((criteria) => criteria.criteria === suggestion)) {
      removeCriteria(suggestion);
    } else handleAdd(suggestion);
  };

  // Remove search criteria from the list of selected criterias
  const removeCriteria = (criteria: string) => {
    hasSearchChanged.current = true;
    setCriteriaList((prev) =>
      prev.filter((currentCriteria) => currentCriteria.criteria !== criteria),
    );
  };

  // Change the ratingsEnabled for the criteria, when the function is called
  const toggleRatings = (criteria: string) => {
    hasSearchChanged.current = true;
    setCriteriaList((previous) =>
      previous.map((prev) =>
        prev.criteria === criteria
          ? { ...prev, ratingsEnabled: !prev.ratingsEnabled }
          : prev,
      ),
    );
  };

  // Force the input to range to be digits. Use "." as the decimal point and automatically change "," to "."during the input. Allow only one digit after decimal point
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRangeError(null);
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

  // Prevent default behaviour and move to results page
  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = searchRangeSchema.safeParse(searchRange);
    if (!validation.success) {
      setRangeError(validation.error.issues[0].message);
      return;
    }

    setRangeError(null);
    if (!verifiedHomeId) {
      return;
    }
    if (hasSearchChanged.current) {
      setSearchData((previous) => ({
        ...previous,
        favorites: [],
        hiddenResultFilters: ["Favourites"],
      }));
      hasSearchChanged.current = false;
    }
    router.push("/results");
  }

  // Clear the page
  function handleClear() {
    hasSearchChanged.current = true;
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

  // Enter can be used to submit the inputs
  const handleEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };
  // Display the introductory heading and description above the search form
  return (
    <main>
      <div className="intro-text-section">
        <h1>Explore the neighbourhood. Find your place.</h1>

        <p>
          Discover what life could look like in a new area. Search for nearby
          amenities, explore your surroundings and compare neighbourhoods based
          on what matters most to you.
        </p>

        <p>
          Whether buying or renting, make a more informed decision about your
          next home.
        </p>
      </div>
      {loading ? (
        <p>Loading form...</p>
      ) : (
        <form
          onSubmit={handleSearch}
          onChange={() => {
            hasSearchChanged.current = true;
          }}
        >
          <fieldset className="form-field">
            <div className="form-legend-field">
              <span className="form-number">1</span>
              <legend className="form-legend">Enter your address</legend>
            </div>
            <div className="form-field-input">
              <input
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                onKeyDown={(e) =>
                  handleEnter(e, () => getAddresses(homeInput, "home"))
                }
                placeholder="e.g. Maarintie 8, 02150 Espoo..."
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => getAddresses(homeInput, "home")}
              >
                Verify
              </button>
            </div>
            {addressError?.type === "home" ? (
              <span className="form-address-error">{addressError.message}</span>
            ) : (
              !verifiedHomeId && (
                <span className="form-address-verification">
                  Verify your address to enable search criteria
                </span>
              )
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
                onChange={(e) => {
                  setCriteriaInput(e.target.value);
                  setCriteriaError(null);
                }}
                onKeyDown={(e) => handleEnter(e, handleAdd)}
                placeholder="Type a name of a place or type of a place..."
              />
              <button
                type="button"
                onClick={() => handleAdd()}
                className="btn btn-secondary"
                disabled={checkingSpelling}
              >
                {checkingSpelling ? "Checking..." : "Add"}
              </button>
            </div>
            {criteriaError && (
              <span className="form-address-error">{criteriaError}</span>
            )}
            <div className="suggested-searches">
              {suggestedSearches.map((search) => (
                <button
                  key={search}
                  type="button"
                  onClick={() => handleSuggestionClick(search)}
                  className={
                    !criteriaList.some(
                      (criteria) => criteria.criteria === search,
                    )
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

                {spellingSuggestions[criteria.criteria] && (
                  <span className="spelling-suggestion">
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={() =>
                        correctSpelling(
                          criteria.criteria,
                          spellingSuggestions[criteria.criteria],
                        )
                      }
                    >
                      {spellingSuggestions[criteria.criteria]}
                    </button>
                    ?
                  </span>
                )}

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
                onKeyDown={(e) =>
                  handleEnter(e, () => getAddresses(commuteInput, "commute"))
                }
                placeholder="e.g. Maarintie 8, 02150 Espoo..."
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => getAddresses(commuteInput, "commute")}
              >
                Verify
              </button>
            </div>
            {addressError?.type === "commute" ? (
              <span className="form-address-error">{addressError.message}</span>
            ) : (
              !verifiedCommuteId &&
              commuteAddresses.length > 0 && (
                <span className="form-address-verification">
                  Select your commute address to include it to the search
                </span>
              )
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
            {rangeError && (
              <span className="form-address-error">{rangeError}</span>
            )}
          </fieldset>
          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-clear"
              onClick={handleClear}
            >
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
      )}
    </main>
  );
}
