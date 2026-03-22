import type { Metadata } from "next";
import { TIP_MAILTO, SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Send a tip",
  description: "Suggest a topic or share a tip for future Aegis Labs articles.",
};

export default function SubmitTipPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-bold text-[var(--fg)] mb-4">Send a tip or topic idea</h1>
      <p className="text-[var(--fg-muted)] mb-8">
        The best posts here started as reader questions: guardrails for agents, context windows, prompt
        patterns, production LLM failures. Tell us what you&apos;re wrestling with—we read every message.
      </p>
      <ul className="list-disc pl-5 text-sm text-[var(--fg-muted)] space-y-2 mb-8">
        <li>A concrete problem you hit at work (no confidential data, please)</li>
        <li>A myth or buzzword you want debunked with a demo</li>
        <li>A tool or paper you think deserves a grounded explainer</li>
      </ul>
      <a
        href={TIP_MAILTO}
        className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white font-semibold text-sm bg-[var(--accent)] hover:opacity-90 transition-opacity"
      >
        Open email to {SITE_EMAIL}
      </a>
      <p className="mt-6 text-xs text-[var(--fg-subtle)]">
        Prefer a form later? You can swap this page for a Google Form, Tally, or Formspree embed without
        changing the rest of the site.
      </p>
    </div>
  );
}
