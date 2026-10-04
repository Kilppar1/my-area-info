"use client";

import { useSearch } from "@/context/SearchContext";

export default function ResultsPage() {
  const { searchData } = useSearch();

  return (
    <main>
      <h1>Results</h1>
      <p>{searchData.address}</p>
    </main>
  );
}
