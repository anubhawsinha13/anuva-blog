import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "All articles—AI, LLMs, agents, and interactive explainers.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[var(--fg)]">Blog</h1>
      <p className="mt-2 text-[var(--fg-muted)]">
        {posts.length} posts · Use your browser search to find a topic, or scroll the archive.
      </p>
      <div className="mt-10">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
        {posts.length === 0 && <p className="text-sm text-[var(--fg-muted)]">No posts yet.</p>}
      </div>
    </div>
  );
}
