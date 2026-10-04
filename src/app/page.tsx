"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/context/SearchContext";
import type { SubmitEvent } from "react";

export default function Home() {
  const router = useRouter();
  const { setSearchData } = useSearch();
  const [address, setAddress] = useState("");
  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchData({ address });
    router.push("/results");
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
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
        />

        <button type="submit" className="btn btn-primary">
          Explore area
        </button>
      </form>
    </main>
  );
}
