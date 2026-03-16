import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]" style={{ backdropFilter: "blur(8px)" }}>
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-[var(--fg)] hover:text-[var(--accent)] transition-colors text-[0.95rem] tracking-tight"
        >
          Anubhaw Sinha
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-[var(--border)]">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
