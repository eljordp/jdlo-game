import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JDLO | The Game",
  description: "Play through the story of Jordan Lopez — from the beach to the boardroom. A Pokemon-style RPG portfolio experience.",
  openGraph: {
    title: "JDLO | The Game",
    description: "Play through the story of Jordan Lopez — from the beach to the boardroom.",
    url: "https://jdlo.online",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black">
        {children}
      </body>
    </html>
  );
}
