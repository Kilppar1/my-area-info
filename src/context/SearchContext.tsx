"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type SearchData = {
  address: string;
};

type SearchContextType = {
  searchData: SearchData;
  setSearchData: (data: SearchData) => void;
};

const defaultSearchData: SearchData = { address: "" };

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchData, setSearchData] = useState<SearchData>(defaultSearchData);
  // Load saved search when the app starts
  useEffect(() => {
    const savedSearch = sessionStorage.getItem("searchData");
    if (savedSearch) {
      setSearchData(JSON.parse(savedSearch));
    }
  }, []);
  // Save search whenever it changes
  useEffect(() => {
    sessionStorage.setItem("searchData", JSON.stringify(searchData));
  }, [searchData]);
  return (
    <SearchContext.Provider value={{ searchData, setSearchData }}>
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
