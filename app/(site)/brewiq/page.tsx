import type { Metadata } from "next";
import BrewStudio from "@/components/brewiq/BrewStudio";

export const metadata: Metadata = {
  title: "BrewIQ Full Control —Dial In Every Brew",
  description:
    "BrewIQ Full Control: dose, ratio, temperature, grind, bloom, pours and timer with live TDS, extraction, caffeine math. Save recipes and log tastings.",
};

export default function BrewIQPage() {
  return <BrewStudio />;
}
