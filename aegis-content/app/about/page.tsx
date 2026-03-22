import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-bold text-[var(--fg)] mb-6">About Aegis Labs</h1>
      <div className="prose max-w-none text-[var(--fg-muted)]">
        <p>
          Aegis Labs publishes practical writing on AI systems, large language models, and how teams ship
          agentic tooling safely. Many posts include live simulations you can manipulate—not just static
          diagrams.
        </p>
        <p>
          This site is designed to feel more like a <strong className="text-[var(--fg)]">tip-driven publication</strong>{" "}
          than a brochure: readers send topic ideas, subscribe for updates, and optionally chip in to keep
          the project sustainable.
        </p>
        <p>
          For consulting and paid engagements, see the separate business site when it&apos;s linked from here—or
          email us from the footer.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/blog/" className="text-sm font-medium text-[var(--accent)] hover:underline">
          Read the blog →
        </Link>
        <Link href="/submit-tip/" className="text-sm font-medium text-[var(--accent)] hover:underline">
          Send a tip →
        </Link>
      </div>
    </div>
  );
}
