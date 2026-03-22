import type { Metadata } from "next";
import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Support",
  description: "Help keep Aegis Labs articles and interactive demos going.",
};

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-bold text-[var(--fg)] mb-4">Support the work</h1>
      <p className="text-[var(--fg-muted)] mb-8">
        Hosting, interactive demos, and long-form technical writing add up. If this site saved you time or
        helped your team, here are simple ways to say thanks—each one genuinely helps with motivation and
        costs.
      </p>

      <div className="space-y-6">
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <h2 className="font-semibold text-[var(--fg)]">1. Send a tip (content)</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-2">
            Ideas for posts are as valuable as money.{" "}
            <Link href="/submit-tip/" className="text-[var(--accent)] hover:underline">
              Submit a topic →
            </Link>
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <h2 className="font-semibold text-[var(--fg)]">2. Share with your team</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-2">
            A short Slack message or internal newsletter mention goes further than you think.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
          <h2 className="font-semibold text-[var(--fg)]">3. Financial tip (optional)</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-2">
            When you add embedded Stripe or Buy Me a Coffee, link it here. For now, you can invoice or use
            a personal payment link and mention it in this paragraph.
          </p>
          <p className="text-sm text-[var(--fg-muted)] mt-2">
            Email for custom arrangements:{" "}
            <a href={`mailto:${SITE_EMAIL}`} className="text-[var(--accent)] hover:underline">
              {SITE_EMAIL}
            </a>
          </p>
        </div>
      </div>

      <p className="mt-10 text-xs text-[var(--fg-subtle)]">
        This page is the &ldquo;CodeCut-style&rdquo; motivation layer: visible support + reader participation,
        not only a paywall.
      </p>
    </div>
  );
}
