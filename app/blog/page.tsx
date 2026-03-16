import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

export const metadata: Metadata = { title: "Blog" };

const UPCOMING = [
  {
    title: "How Temperature Changes Everything",
    description: "Same prompt, same model — but watch the token probability bars flatten or sharpen as you drag a single slider.",
    tags: ["LLMs", "Sampling", "Explainer"],
    simulation: true,
  },
  {
    title: "What a Tool Call Actually Looks Like",
    description: "An animated agent scratchpad stepping through user message → JSON tool call → tool result → model response.",
    tags: ["Agents", "Function Calling", "Explainer"],
    simulation: true,
  },
  {
    title: "How an Agent Thinks: The ReAct Loop",
    description: "A visual flowchart animating every Reason → Act → Observe iteration. Pick a task and watch the agent reason through it.",
    tags: ["Agents", "ReAct", "Chain-of-Thought"],
    simulation: true,
  },
  {
    title: "Why RAG Beats Fine-Tuning for Most Problems",
    description: "Split-screen: pure LLM hallucinates, RAG grounds its answer. Type questions and watch which chunks get retrieved.",
    tags: ["RAG", "Fine-Tuning", "Retrieval"],
    simulation: true,
  },
  {
    title: "How Embeddings Measure Meaning",
    description: "A 2D vector space with 20 embedded words. Type a word, nearest neighbours light up, cosine similarity updates live.",
    tags: ["Embeddings", "Vector Search", "Explainer"],
    simulation: true,
  },
];

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--fg)]">All Posts</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">{posts.length} articles on AI, LLMs, and engineering</p>
      </div>

      {/* Published */}
      <div>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-[var(--fg-muted)]">No posts yet — check back soon.</p>
        )}
      </div>

      {/* Upcoming */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">
            Upcoming
          </h2>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="space-y-0">
          {UPCOMING.map((item) => (
            <article
              key={item.title}
              className="flex gap-6 py-4 border-b border-[var(--border)] last:border-0 opacity-50"
            >
              {/* Lock icon in place of date */}
              <div className="shrink-0 w-28 pt-0.5 flex items-start">
                <span className="text-xs font-mono text-[var(--fg-subtle)] flex items-center gap-1">
                  <svg
                    className="w-3 h-3 inline-block opacity-60"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M11 6V5a3 3 0 0 0-6 0v1H3v8h10V6h-2ZM6 5a2 2 0 1 1 4 0v1H6V5Z" />
                  </svg>
                  soon
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-[var(--fg)] leading-snug">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-xs text-[var(--fg-muted)] line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-[10px] rounded-full border border-[var(--border)] text-[var(--fg-muted)] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.simulation && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full border border-[var(--accent)]/40 text-[var(--accent)]/60 font-medium">
                      interactive
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
