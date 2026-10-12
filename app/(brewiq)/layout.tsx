import { Instrument_Serif, IBM_Plex_Sans } from "next/font/google";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bq-display",
});

const sans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-bq-sans",
});

export default function BrewIQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bq-root ${display.variable} ${sans.variable}`}>
      <style>{`html:has(.bq-root), html:has(.bq-root) body { background: #100c09; color: #f4ebe0; }`}</style>
      {children}
    </div>
  );
}
