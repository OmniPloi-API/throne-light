import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AudioToggle } from "@/components/shared";
import { LanguageProvider } from "@/components/shared/LanguageProvider";
import { ModalProvider } from "@/components/shared/GlobalModal";
import ServiceWorkerRegistration from "@/components/reader/ServiceWorkerRegistration";
import FeedbackWidget from "@/components/shared/FeedbackWidget";
import PageViewTracker from "@/components/shared/PageViewTracker";
import { Suspense } from "react";

// Sharp, high-end Serif for headers
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Clean, spaced-out Sans-Serif for body
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

// Elegant display font for special headings
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Throne Light Publishing | Awakening Royalty Through Revelation",
  description: "The Crowded Bed & The Empty Throne by Eolles. A prophetic scroll for women who are done competing for a man's attention and ready to reclaim their crown.",
  keywords: ["Eolles", "The Crowded Bed", "The Empty Throne", "Throne Light Publishing", "women empowerment", "sovereignty", "prophetic", "spiritual awakening"],
  authors: [{ name: "Eolles" }],
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    title: "Throne Light Publishing",
    description: "We don't distribute books. We deliver divine revelation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Throne Light" />
        <link rel="apple-touch-icon" href="/images/Light-of-Eolles-Crown.png" />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} ${cormorant.variable} antialiased bg-onyx text-parchment`}
      >
        {/* Noise texture overlay for premium feel */}
        <div className="noise-overlay" aria-hidden="true" />
        <ServiceWorkerRegistration />
        <ModalProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
            {children}
            {/* Global audio control so soundtrack persists across pages */}
            <AudioToggle />
            {/* Partner feedback widget for testing */}
            <FeedbackWidget />
          </LanguageProvider>
        </ModalProvider>
      </body>
    </html>
  );
}
