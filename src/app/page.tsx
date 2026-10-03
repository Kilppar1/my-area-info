import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        <p>
          One paragraph text about the service. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <Link href="/results" className="btn btn-primary">
          Explore area
        </Link>
      </div>
    </main>
  );
}
