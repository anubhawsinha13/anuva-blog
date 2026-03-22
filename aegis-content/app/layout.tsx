import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Aegis Labs — AI tips & LLM insights", template: "%s · Aegis Labs" },
  description:
    "Stay sharp on AI engineering: practical LLM explainers, interactive demos, and reader-driven tips.",
  metadataBase: new URL("https://aegis-labs.pro"),
  openGraph: { siteName: "Aegis Labs", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="absolute left-[-10000px] top-auto w-px h-px overflow-hidden focus:left-4 focus:top-4 focus:w-auto focus:h-auto focus:p-3 focus:z-[100] focus:bg-[var(--accent)] focus:text-white focus:rounded-md focus:overflow-visible"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
