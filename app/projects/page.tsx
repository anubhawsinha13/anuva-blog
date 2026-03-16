import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

const PROJECTS = [
  {
    year: "2025",
    name: "AI Blog Workflow",
    description: "Slack-powered content pipeline: slash command → Perplexity research → Claude writing → image injection → GitHub Actions → WordPress publish. Fully automated blog post generation from Slack.",
    tags: ["AI", "Python", "Slack", "GitHub Actions"],
    github: "https://github.com/anubhawsinha/blog_post_workflow",
  },
  {
    year: "2025",
    name: "Financial Agent",
    description: "Agentic system for financial data analysis using LLM tool calls. The agent can research companies, pull data, and generate structured reports autonomously.",
    tags: ["AI Agents", "Python", "LLMs"],
    github: "https://github.com/anubhawsinha/financial_agent",
  },
  {
    year: "2025",
    name: "anuva.blog",
    description: "This site. A Next.js blog with ciechanow.ski-style interactive simulations for AI concepts — live tokenizers, attention visualizers, context window demos.",
    tags: ["Next.js", "D3.js", "React", "Interactive"],
    github: "https://github.com/anubhawsinha/anuva-blog",
  },
];

export default function ProjectsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--fg)]">Projects</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Things I&apos;ve built</p>
      </div>
      <div className="space-y-4">
        {PROJECTS.map((p) => (
          <div
            key={p.name}
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[var(--fg-subtle)] font-mono">{p.year}</span>
                  <h2 className="font-semibold text-[var(--fg)]">{p.name}</h2>
                </div>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{p.description}</p>
                <div className="mt-3 flex gap-1.5 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-3 text-xs text-[var(--accent)]">
              <a href={p.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
