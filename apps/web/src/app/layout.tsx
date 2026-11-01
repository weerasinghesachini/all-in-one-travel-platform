import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wayfarer | The whole trip, together",
  description: "Plan rides, stays, rentals, dining and island itineraries in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
