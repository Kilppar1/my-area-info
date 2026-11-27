"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import { useEffect, useRef, useState } from "react";
import { searchDataSchema } from "@/schemas/searchSchema";

// Display navigation controls and import or export the current search
export default function Navbar() {
  const pathname = usePathname();
  const { searchData, setSearchData, loading, setImportVersion } = useSearch();
  const verifiedHomeAddress = searchData.homeAddresses.find(
    ({ id }) => id === searchData.verifiedHomeId,
  )?.address;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hidden, setHidden] = useState(false);

  // Hide the navbar when scrolling down and show it again when scrolling up
  useEffect(() => {
    setHidden(false);
    let lastY = window.scrollY;

    function handleScroll() {
      const y = window.scrollY;

      // Always show near the top of the page
      if (y < 80) {
        setHidden(false);
        lastY = y;
        return;
      }

      // Ignore tiny movements
      if (Math.abs(y - lastY) < 8) return;

      setHidden(y > lastY);
      lastY = y;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

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
      const validation = searchDataSchema.safeParse(importedSearch);

      if (!validation.success) {
        alert(
          "Invalid search file. The file data does not match the expected format.",
        );
        return;
      }
      const importedData = validation.data;
      const verifiedHomeId = importedData.homeAddresses.some(
        (address) => address.id === importedData.verifiedHomeId,
      )
        ? importedData.verifiedHomeId
        : null;
      const verifiedCommuteId = importedData.commuteAddresses.some(
        (address) => address.id === importedData.verifiedCommuteId,
      )
        ? importedData.verifiedCommuteId
        : null;
      setSearchData((previous) => ({
        ...previous,
        ...validation.data,
        verifiedHomeId,
        verifiedCommuteId,
        commuteTimes: null,
        favorites: [],
        results: [],
        resultsRelevant: false,
      }));
      setImportVersion((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to import search:", error);
      alert("Invalid JSON file.");
    } finally {
      event.target.value = "";
    }
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
    <header className={`navbar ${hidden ? "navbar-hidden" : ""}`}>
      {/*The left part of navigation bar including brand information*/}
      <div className="navbar-section">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={48} height={48} />
        </Link>
        <span className="navbar-brand">
          <span className="navbar-brand-title">{titleSubtitle.title}</span>
          <span className="navbar-brand-subtitle">
            {titleSubtitle.subtitle}
          </span>
        </span>
      </div>

      <div className="navbar-section">
        {/*The navigation bar responds to where the user currently is*/}
        {/*Check if user is on the homepage to show about or back button*/}
        {pathname === "/" ? (
          <Link href="/about" className="btn btn-primary">
            About
          </Link>
        ) : (
          <Link href="/" className="btn btn-primary">
            <Image src="/undo.svg" alt="undo" width={24} height={24} />
            Back
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
              Load
              <Image src="/import.svg" alt="import" width={24} height={24} />
            </button>
          </>
        )}

        {/*Check if user is on the homepage to show export button*/}
        {pathname === "/results" && (
          <button onClick={handleExport} className="btn btn-primary">
            Save
            <Image src="/export.svg" alt="export" width={24} height={24} />
          </button>
        )}
      </div>
    </header>
  );
}
