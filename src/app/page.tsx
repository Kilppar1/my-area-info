import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logo.svg"
          alt="My Area Info logo"
          width={200}
          height={40}
          priority
        />
        <div className={styles.intro}>
          <h1>Imagine this is My Area Info!</h1>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/logo.svg"
              alt="My Area Info logomark"
              width={16}
              height={14}
            />
            Explore area
          </a>
        </div>
      </main>
    </div>
  );
}
