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
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black">
        {children}
      </body>
    </html>
  );
}
