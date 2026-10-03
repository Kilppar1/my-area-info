import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Image
        src="/logo.svg"
        alt="My Area Info logo"
        width={200}
        height={40}
        priority
      />
      <div>
        <h1>Imagine this is My Area Info!</h1>
      </div>
      <div>
        <a
          className="btn btn-primary"
          href="https://asunnot.oikotie.fi"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore area
        </a>
      </div>
    </main>
  );
}
