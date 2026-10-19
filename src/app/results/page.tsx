"use client";

import dynamic from "next/dynamic";
import { useSearch } from "@/context/SearchContext";

// The map needs to be loaded in the browser
const ResultsMap = dynamic(() => import("@/components/ResultsMap"), {
  ssr: false,
});

export default function ResultsPage() {
  const { searchData } = useSearch();
  const verifiedHomeAddress = searchData.homeAddresses.find(
    ({ id }) => id === searchData.verifiedHomeId,
  )?.address;

  return (
    <main className="results-page">
      <div className="results-list">
        <p>{verifiedHomeAddress}</p>
        <p>{searchData.criteriaList}</p>
      </div>
      <div className="results-map-wrapper">
        <ResultsMap />
      </div>
    </main>
  );
}
