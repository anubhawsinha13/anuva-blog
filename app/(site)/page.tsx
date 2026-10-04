import Link from "next/link";
import { getRecentPosts, getAllPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

const PROJECTS = [
  {
    name: "AI Blog Workflow",
    description: "Slack-powered pipeline: prompt → Perplexity research → Claude writing → WordPress publish.",
    tags: ["AI", "Python", "Slack"],
    github: "https://github.com/anubhawsinha13/blog_post_workflow",
  },
  {
    name: "Financial Agent",
    description: "Agentic system for financial data analysis and reporting using LLM tool calls.",
    tags: ["AI", "Python", "Finance"],
    github: "https://github.com/anubhawsinha13/financial_agent",
  },
];

const TOPICS = ["AI Agents", "LLMs", "Context Windows", "Tokenization", "RAG", "Engineering Leadership", "System Design"];

export default function Home() {
  const posts = getRecentPosts(8);
  const total = getAllPosts().length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">

        {/* Left — Recent Posts */}
        <section className="flex-1 min-w-0">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-4">
            Recent Posts
          </h2>
          <div>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {total > 8 && (
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--accent)] hover:underline"
            >
              View all {total} posts →
            </Link>
          )}
        </section>

        {/* Right — Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-8">

          {/* Bio */}
          <div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-3" />
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              I lead engineering teams building AI-native systems at enterprise scale. I write about LLMs,
              agents, and the systems underneath them — with live interactive demos you can play with.
            </p>
          </div>

          {/* Featured Projects */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
              Featured Projects
            </h2>
            <div className="space-y-3">
              {PROJECTS.map((p) => (
                <div key={p.name} className="p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <div className="font-medium text-sm text-[var(--fg)]">{p.name}</div>
                  <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">{p.description}</p>
                  <div className="mt-2 flex gap-2 text-xs text-[var(--accent)]">
                    <a href={p.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
              Topics
            </h2>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 text-[11px] rounded-full border border-[var(--border)] text-[var(--fg-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
