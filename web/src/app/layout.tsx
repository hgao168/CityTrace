import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://citytrace.movenova.ai"),
  title: "CityTrace · Amsterdam",
  description:
    "A city day-tour experience combining curated highlights, a timeline, and a live route map.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CityTrace · Amsterdam",
    description:
      "Follow Amsterdam's canals through a story-led day tour.",
    url: "https://citytrace.movenova.ai",
    siteName: "CityTrace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>{children}</body>
    </html>
  );
}
