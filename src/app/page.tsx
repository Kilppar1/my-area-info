"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";
import type { Address, Criteria } from "@/types";
import { nominatimSearchAddresses } from "@/lib/geocoding";
import { suggestedSearches } from "@/lib/constants";

export default function Home() {
  // Get variable values from searchdata or use default values if needed
  const router = useRouter();
  const { searchData, setSearchData, loading, importVersion } = useSearch();
  const [formInitialized, setFormInitialized] = useState(false);
  const hasInitializedSave = useRef(false);
  const hasSearchChanged = useRef(false);
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
  const [searchRange, setSearchRange] = useState(
    searchData.searchRange?.toString() ?? "5",
  ); // Default search range 5 km

  // Restore saved form values after sessionStorage has loaded
  useEffect(() => {
    console.log("Imported version after", importVersion);
    console.log("Loading", loading);
    console.log("formInitialized", formInitialized);
    if (!loading && (!formInitialized || importVersion > 0)) {
      console.log("Going through...");
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
    setSearchData({
      ...searchData,
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
    });
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
  const getAdresses = async (
    addressGiven: string,
    addressType: "home" | "commute",
  ) => {
    hasSearchChanged.current = true;
    setAddressError(null);
    if (addressType === "home") setVerifiedHomeId(null);
    if (addressType === "commute") setVerifiedCommuteId(null);
    if (!addressGiven.trim()) return;

    let addresses: Address[] = [];
    try {
      addresses = await nominatimSearchAddresses(addressGiven);
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

  // Add a search criteria to the list of search criterias selected. Max search criterias is 5 and the same criteria cannot be added twice.
  const handleAdd = (criteria: string = criteriaInput) => {
    const criteriaTrimmed = criteria.trim();
    if (
      criteriaTrimmed &&
      criteriaList.length < 5 &&
      !criteriaList.some((criteria) => criteria.criteria === criteriaTrimmed)
    ) {
      hasSearchChanged.current = true;
      setCriteriaList((prev) => [
        ...prev,
        { criteria: criteriaTrimmed, ratingsEnabled: false },
      ]);
      if (criteriaInput === criteria) setCriteriaInput("");
    }
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

  // Enter can be used in the inputs
  const handleEnter = (
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <main>
      <p>
        One paragraph text about the service. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
        et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
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
                  handleEnter(e, () => getAdresses(homeInput, "home"))
                }
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
                onChange={(e) => setCriteriaInput(e.target.value)}
                onKeyDown={(e) => handleEnter(e, handleAdd)}
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
                  handleEnter(e, () => getAdresses(commuteInput, "commute"))
                }
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
