import Link from "next/link";
import { getAllPosts, getAllTags, getFeaturedPosts } from "@/lib/posts";
import { NEWSLETTER_MAILTO, SITE_EMAIL, TIP_MAILTO } from "@/lib/site";

const readerNotes = [
  {
    quote:
      "The interactive demos finally made context windows click for our team—we use them in onboarding now.",
    who: "Engineering lead",
    role: "Enterprise SaaS",
  },
  {
    quote: "Short, dense posts. I send the agent guardrails series to every new hire working with Copilot.",
    who: "Staff engineer",
    role: "Fintech",
  },
  {
    quote: "Love that I can suggest topics. Two of our pain points showed up as posts within a month.",
    who: "CTO",
    role: "SMB consultancy",
  },
];

export default function HomePage() {
  const featured = getFeaturedPosts(6);
  const tags = getAllTags(28);
  const total = getAllPosts().length;

  return (
    <>
      {/* Hero — CodeCut-style: tips + newsletter + CTA */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
          Short on time? — No worries
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--fg)] leading-tight max-w-3xl mx-auto">
          Stay sharp on <span className="text-[var(--accent)]">AI &amp; LLMs</span>. One practical insight at a time.
        </h1>
        <p className="mt-6 text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
          Skimmable explainers, live simulations, and engineering notes—plus{" "}
          <strong className="text-[var(--fg)] font-medium">your tips</strong> shape what we publish next.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-xl mx-auto">
          <a
            href={NEWSLETTER_MAILTO}
            className="inline-flex justify-center items-center px-8 py-3.5 rounded-lg text-white font-semibold text-sm bg-[var(--accent)] hover:opacity-90 transition-opacity"
          >
            Subscribe for tips
          </a>
          <Link
            href="/blog/"
            className="inline-flex justify-center items-center px-8 py-3.5 rounded-lg text-sm font-semibold border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
          >
            Explore the blog
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--fg-subtle)]">
          Newsletter opens your email app—we’ll add a proper list when you’re ready (Buttondown, Beehiiv, etc.).
        </p>
      </section>

      {/* Stats strip */}
      <div className="border-y border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-8 sm:gap-12 text-center text-sm text-[var(--fg-muted)]">
          <div>
            <p className="text-2xl font-bold text-[var(--fg)]">{total}+</p>
            <p className="text-xs uppercase tracking-wide">Articles &amp; explainers</p>
          </div>
          <div className="hidden sm:block w-px bg-[var(--border)]" aria-hidden />
          <div>
            <p className="text-2xl font-bold text-[var(--fg)]">Interactive</p>
            <p className="text-xs uppercase tracking-wide">Demos you can touch</p>
          </div>
          <div className="hidden sm:block w-px bg-[var(--border)]" aria-hidden />
          <div>
            <p className="text-2xl font-bold text-[var(--fg)]">Reader-led</p>
            <p className="text-xs uppercase tracking-wide">Topics from your tips</p>
          </div>
        </div>
      </div>

      {/* Featured posts */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)]">Latest &amp; featured</h2>
            <p className="text-sm text-[var(--fg-muted)] mt-1">Start here—then dive into the full archive.</p>
          </div>
          <Link href="/blog/" className="text-sm font-medium text-[var(--accent)] hover:underline shrink-0">
            View all posts →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="group p-5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] transition-colors text-left shadow-sm"
            >
              <div className="flex gap-2 flex-wrap mb-3">
                {(post.tags ?? []).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--fg-subtle)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-semibold text-[var(--fg)] group-hover:text-[var(--accent)] leading-snug text-sm">
                {post.title}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-2 line-clamp-3">{post.description}</p>
              <span className="text-xs font-medium text-[var(--accent)] mt-3 inline-block">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Topics — like CodeCut categories */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-xl font-bold text-[var(--fg)] mb-2 text-center">Explore topics</h2>
          <p className="text-sm text-[var(--fg-muted)] text-center mb-8 max-w-lg mx-auto">
            Tags from real posts—browse the blog and use search in your browser (⌘F) until we add filters.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href="/blog/"
                className="px-3 py-1.5 text-xs rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reader voices */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-xl font-bold text-[var(--fg)] text-center mb-2">Why readers stick around</h2>
        <p className="text-sm text-[var(--fg-muted)] text-center mb-10 max-w-xl mx-auto">
          Placeholder quotes you can replace with real testimonials—or delete until you have them.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {readerNotes.map((r) => (
            <blockquote
              key={r.who}
              className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm"
            >
              <p className="text-[var(--fg-muted)] italic">&ldquo;{r.quote}&rdquo;</p>
              <footer className="mt-4 text-xs">
                <span className="font-semibold text-[var(--fg)]">{r.who}</span>
                <span className="text-[var(--fg-subtle)]"> · {r.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Dual CTA: tip + support */}
      <section className="border-t border-[var(--border)] py-16 bg-[var(--accent-light)]/40">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <h3 className="font-bold text-[var(--fg)]">Send a tip or topic</h3>
            <p className="text-sm text-[var(--fg-muted)] mt-2">
              Spotted a pattern at work? Want a post on a specific LLM or agent topic? Email us—reader requests
              keep this project alive.
            </p>
            <a
              href={TIP_MAILTO}
              className="inline-block mt-4 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              Open email template →
            </a>
          </div>
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]">
            <h3 className="font-bold text-[var(--fg)]">Support the site</h3>
            <p className="text-sm text-[var(--fg-muted)] mt-2">
              Hosting, demos, and writing take time. If these articles helped your team, a one-time or recurring
              tip goes a long way.
            </p>
            <Link href="/support/" className="inline-block mt-4 text-sm font-semibold text-[var(--accent)] hover:underline">
              Ways to support →
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-[var(--fg-subtle)] mt-10">
          Direct line:{" "}
          <a href={`mailto:${SITE_EMAIL}`} className="text-[var(--accent)]">
            {SITE_EMAIL}
          </a>
        </p>
      </section>
    </>
  );
}
