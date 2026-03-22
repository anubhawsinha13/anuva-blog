import Link from "next/link";
import { SITE_EMAIL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24 bg-[var(--bg-secondary)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <p className="font-bold text-[var(--fg)]">Aegis Labs</p>
            <p className="text-sm text-[var(--fg-muted)] mt-2 max-w-sm">
              Practical AI &amp; LLM insights—interactive explainers, engineering notes, and reader-driven topics.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href={`mailto:${SITE_EMAIL}`} className="text-[var(--accent)] hover:underline">
              {SITE_EMAIL}
            </a>
            <Link href="/submit-tip/" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
              Send a tip or topic idea
            </Link>
            <Link href="/support/" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
              Support the work
            </Link>
            <Link href="/privacy/" className="text-[var(--fg-muted)] hover:text-[var(--accent)]">
              Privacy
            </Link>
          </div>
        </div>
        <p className="text-xs text-[var(--fg-subtle)] mt-10 pt-8 border-t border-[var(--border)]">
          © {new Date().getFullYear()} Aegis Labs. Reader tips &amp; support help keep new articles coming.
        </p>
      </div>
    </footer>
  );
}
