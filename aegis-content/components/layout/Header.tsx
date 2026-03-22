"use client";

import { useState } from "react";
import Link from "next/link";

const nav = [
  { href: "/blog/", label: "Blog" },
  { href: "/submit-tip/", label: "Send a tip" },
  { href: "/support/", label: "Support" },
  { href: "/about/", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--fg)] no-underline tracking-tight">
          Aegis Labs
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-[var(--fg-muted)]"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-6 py-4 flex flex-col gap-3 text-sm bg-[var(--bg)]">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--fg-muted)]"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
