"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      {/*The left part of navigation bar including brand information*/}
      <Link href="/" className="navbar-section">
        <Image src="/logo.svg" alt="logo" width={48} height={48} />
        <span className="navbar-brand">
          <span className="navbar-brand-title">My Area Info</span>
          <span className="navbar-brand-subtitle">
            Explore the neighbourhood
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
          <Link href="" className="btn btn-primary">
            Import search
            <Image src="/import.svg" alt="import" width={24} height={24} />
          </Link>
        )}

        {/*Check if user is on the homepage to show export button*/}
        {pathname === "/results" && (
          <Link href="" className="btn btn-primary">
            Export search
            <Image src="/export.svg" alt="export" width={24} height={24} />
          </Link>
        )}
      </div>
    </header>
  );
}
