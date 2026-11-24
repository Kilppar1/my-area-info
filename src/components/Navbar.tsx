"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import { useRef } from "react";

// Display navigation controls and import or export the current search
export default function Navbar() {
  const pathname = usePathname();
  const { searchData, setSearchData, loading, setImportVersion } = useSearch();
  const verifiedHomeAddress = searchData.homeAddresses.find(
    ({ id }) => id === searchData.verifiedHomeId,
  )?.address;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create and download a JSON file with the relevant search data. As the results may change, they are not included
  function handleExport() {
    const json = JSON.stringify(
      searchData,
      (key, value) =>
        key === "results" ||
        key === "resultsRelevant" ||
        key === "favorites" ||
        key === "commuteTimes"
          ? undefined
          : value,
      2,
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "my-search.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  // Import a file and check that it is JSON
  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const importedSearch = JSON.parse(text);

      setSearchData({
        ...searchData,
        ...importedSearch,
        favorites: importedSearch.favorites ?? [],
        results: [],
        resultsRelevant: false,
      });
      setImportVersion((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to import search:", error);
      alert("Invalid JSON file.");
    }

    event.target.value = "";
  }

  const titleSubtitle = {
    "/results": {
      title: (
        <>
          Results near{" "}
          <span className="navbar-address">{verifiedHomeAddress}</span>
        </>
      ),
      subtitle: loading
        ? "Loading your neighbourhood..."
        : "Explore the neighbourhood",
    },
  }[pathname] ?? {
    title: "My Area Info",
    subtitle: "Explore the neighbourhood",
  };

  return (
    <header className="navbar">
      {/*The left part of navigation bar including brand information*/}
      <Link href="/" className="navbar-section">
        <Image src="/logo.svg" alt="logo" width={48} height={48} />
        <span className="navbar-brand">
          <span className="navbar-brand-title">{titleSubtitle.title}</span>
          <span className="navbar-brand-subtitle">
            {titleSubtitle.subtitle}
          </span>
        </span>
      </Link>

      <div className="navbar-section">
        {/*The navigation bar responds to where the user currently is*/}
        {/*Check if user is on the homepage to show about or back button*/}
        {pathname === "/" ? (
          <Link href="/about" className="btn btn-primary">
            About the page
          </Link>
        ) : (
          <Link href="/" className="btn btn-primary">
            <Image src="/undo.svg" alt="undo" width={24} height={24} />
            Back to search
          </Link>
        )}

        {/*Check if user is on the homepage to show import button*/}
        {pathname === "/" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              Import search
              <Image src="/import.svg" alt="import" width={24} height={24} />
            </button>
          </>
        )}

        {/*Check if user is on the homepage to show export button*/}
        {pathname === "/results" && (
          <button onClick={handleExport} className="btn btn-primary">
            Export search
            <Image src="/export.svg" alt="export" width={24} height={24} />
          </button>
        )}
      </div>
    </header>
  );
}
