import { Instrument_Serif } from "next/font/google";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export default function ProfileGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} pf-root`}>
      <style>{`html:has(.pf-root), html:has(.pf-root) body { background: #07080c; color: #f4f1ea; }`}</style>
      {children}
    </div>
  );
}
