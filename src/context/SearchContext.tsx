"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Address,
  CommuteTimes,
  Criteria,
  CriterionResult,
  Place,
} from "@/types";

type SearchData = {
  homeInput: string;
  commuteInput: string;
  criteriaInput: string;
  homeAddresses: Address[];
  commuteAddresses: Address[];
  verifiedHomeId: string | null;
  verifiedCommuteId: string | null;
  criteriaList: Criteria[];
  searchRange: number | null;
  results: CriterionResult[];
  favorites: Place[];
  commuteTimes: CommuteTimes | null;
  resultsRelevant: boolean;
};

type SearchContextType = {
  searchData: SearchData;
  setSearchData: React.Dispatch<React.SetStateAction<SearchData>>;
  loading: boolean;
  importVersion: number;
  setImportVersion: React.Dispatch<React.SetStateAction<number>>;
};

const defaultSearchData: SearchData = {
  homeInput: "",
  commuteInput: "",
  criteriaInput: "",
  homeAddresses: [],
  commuteAddresses: [],
  verifiedHomeId: null,
  verifiedCommuteId: null,
  criteriaList: [],
  searchRange: null,
  results: [],
  favorites: [],
  commuteTimes: null,
  resultsRelevant: false,
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchData, setSearchData] = useState<SearchData>(defaultSearchData);
  const [loading, setLoading] = useState(true);
  // Counter for imports
  const [importVersion, setImportVersion] = useState(0);
  // Load saved search when the app starts
  useEffect(() => {
    const savedSearch = sessionStorage.getItem("searchData");
    if (savedSearch) {
      try {
        const parsedSearch = JSON.parse(savedSearch);
        setSearchData({
          ...defaultSearchData,
          ...parsedSearch,
          favorites: parsedSearch.favorites ?? [],
        });
      } catch (error) {
        console.error("Failed to load saved search: ", error);
      }
    }
    setLoading(false);
  }, []);
  // Save search whenever it changes
  useEffect(() => {
    if (!loading) {
      sessionStorage.setItem("searchData", JSON.stringify(searchData));
    }
  }, [searchData, loading]);
  return (
    <SearchContext.Provider
      value={{
        searchData,
        setSearchData,
        loading,
        importVersion,
        setImportVersion,
      }}
    >
      {" "}
      {children}{" "}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used inside a SearchProvider");
  }
  return context;
}
