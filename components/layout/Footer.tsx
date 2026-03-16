export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-[var(--fg-subtle)]">
        <span>anuva.blog · {new Date().getFullYear()}</span>
        <div className="flex gap-4">
          <a href="https://github.com/anubhawsinha" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)] transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/anubhawsinha" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)] transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
