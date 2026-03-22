import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-2">Privacy</h1>
      <p className="text-xs text-[var(--fg-subtle)] mb-8">Last updated: March 2026</p>
      <div className="text-sm text-[var(--fg-muted)] space-y-4 leading-relaxed">
        <p>
          This publication site aims to collect as little data as possible. Reading articles does not require
          an account.
        </p>
        <p>
          If you email us (subscribe, tips, support), your message is handled by your email provider and ours.
          We use it only to respond or to add you to a mailing list if you explicitly ask.
        </p>
        <p>
          When you add a newsletter provider or payment buttons, update this page to name those services (e.g.
          Buttondown, Stripe) and link to their privacy policies.
        </p>
      </div>
    </div>
  );
}
