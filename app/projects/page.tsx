import type { Metadata } from "next";
import projectsData from "@/content/projects.json";

export const metadata: Metadata = { title: "Projects" };

interface Project {
  name: string;
  description: string;
  year: string;
  tags: string[];
  github: string;
}

const PROJECTS: Project[] = projectsData;

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
