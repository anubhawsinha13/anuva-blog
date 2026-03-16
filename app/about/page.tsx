import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[var(--fg)] mb-6">About</h1>
      <div className="prose">
        <p>
          I lead engineering teams building AI-native systems at enterprise scale. I focus on architecture,
          strategy, and enabling teams to ship AI-powered platforms that integrate LLMs, agents, and
          context-aware tooling into real development workflows.
        </p>
        <p>
          This blog is where I think out loud about the systems underneath AI — how tokens work, why
          context windows matter, how attention actually functions — through interactive demos you can
          manipulate yourself, rather than diagrams you just look at.
        </p>
        <h2>What I work on</h2>
        <ul>
          <li>AI-native platform engineering at enterprise scale</li>
          <li>LLM integration — agents, tool calling, context management</li>
          <li>Engineering leadership and team architecture</li>
          <li>Building systems that make AI actually work in production</li>
        </ul>
        <h2>Contact</h2>
        <p>
          Find me on{" "}
          <a href="https://github.com/anubhawsinha" target="_blank" rel="noreferrer">GitHub</a>
          {" "}or{" "}
          <a href="https://linkedin.com/in/anubhawsinha" target="_blank" rel="noreferrer">LinkedIn</a>.
        </p>
      </div>
    </div>
  );
}
