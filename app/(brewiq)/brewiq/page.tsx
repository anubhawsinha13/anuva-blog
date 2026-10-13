import type { Metadata } from "next";
import BrewIQApp from "@/components/brewiq/BrewIQApp";
import "./brewiq.css";

export const metadata: Metadata = {
  title: "BrewIQ Full Control",
  description:
    "A coffee command bench: equipment-aware recipes, live phase timer, bag freshness, and a coach that changes one lever at a time.",
};

export default function BrewIQPage() {
  return <BrewIQApp />;
}
