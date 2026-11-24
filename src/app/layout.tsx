import type { Metadata } from "next";
import { Lora, Lato } from "next/font/google";
import Navbar from "@/components/Navbar";
import { SearchProvider } from "@/context/SearchContext";
import "./styles/globals.css";

// Configure the fonts
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400"],
});

// Metadata for all pages
export const metadata: Metadata = {
  title: "My Area Info",
  description: "Explore the neighbourhood",
};

// Shared page layout
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lora.variable} ${lato.variable}`}>
      <body>
        <SearchProvider>
          <Navbar /> {children}
        </SearchProvider>
      </body>
    </html>
  );
}
