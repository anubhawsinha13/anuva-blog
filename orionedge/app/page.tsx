import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aegis Labs — AI Strategy Consulting",
  description: "AI strategy consulting for enterprises and small businesses. We help you navigate AI adoption, build intelligent systems, and create lasting competitive advantage.",
};

const STRIPE_LINK = "https://buy.stripe.com/test_00w7sL348apL1S82yG9MY00";
const CONTACT_EMAIL = "orion.edge.here@gmail.com";

const services = [
  {
    icon: "◈",
    title: "AI Strategy & Roadmapping",
    description:
      "Define a clear, actionable AI strategy aligned with your business goals. We assess your current capabilities, identify high-impact opportunities, and build a phased roadmap for adoption.",
  },
  {
    icon: "⬡",
    title: "Enterprise AI Integration",
    description:
      "Seamlessly integrate AI into your existing workflows and systems. From LLM-powered tooling to intelligent automation, we handle architecture, implementation, and change management.",
  },
  {
    icon: "◇",
    title: "Small Business AI Enablement",
    description:
      "Practical, affordable AI solutions for small and growing businesses. Cut costs, automate repetitive work, and compete with larger players using the right tools for your scale.",
  },
  {
    icon: "△",
    title: "Team Training & Upskilling",
    description:
      "Equip your team to work effectively alongside AI. We run workshops and training programs tailored to your industry, from prompt engineering to responsible AI practices.",
  },
  {
    icon: "○",
    title: "AI Vendor & Tool Selection",
    description:
      "Navigate the crowded AI vendor landscape with confidence. We evaluate, test, and recommend the right platforms and tools for your specific needs — without the sales pitch.",
  },
  {
    icon: "▷",
    title: "Ongoing Advisory",
    description:
      "Retain expert AI guidance as your needs evolve. Monthly advisory sessions, architecture reviews, and strategic check-ins to keep your AI initiatives on track.",
  },
];

const process = [
  { step: "01", title: "Discovery", desc: "We start with a deep-dive into your business, goals, and current technology landscape." },
  { step: "02", title: "Strategy", desc: "We deliver a clear AI strategy with prioritized initiatives and a realistic roadmap." },
  { step: "03", title: "Execution", desc: "Hands-on support through implementation — architecture, integrations, and team enablement." },
  { step: "04", title: "Iteration", desc: "Ongoing advisory to refine, scale, and adapt as AI capabilities and your needs evolve." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div
          className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 border border-[var(--border)]"
          style={{ color: "var(--accent)", background: "var(--accent-light)" }}
        >
          AI Strategy Consulting
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--fg)] leading-tight mb-6 max-w-3xl mx-auto">
          Turn AI from a buzzword into a{" "}
          <span style={{ color: "var(--accent)" }}>business advantage</span>
        </h1>
        <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto mb-10">
          Aegis Labs helps enterprises and small businesses design and execute AI strategies that
          deliver real results — not just experiments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noreferrer"
            className="px-8 py-3 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Book a Consultation
          </a>
          <a
            href="#services"
            className="px-8 py-3 rounded-lg text-sm font-semibold border border-[var(--border)] text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
          >
            See What We Do
          </a>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-[var(--border)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 text-sm text-[var(--fg-muted)]">
          <span>Enterprise & SMB clients</span>
          <span className="text-[var(--border)]">|</span>
          <span>End-to-end AI strategy</span>
          <span className="text-[var(--border)]">|</span>
          <span>Vendor-neutral advice</span>
          <span className="text-[var(--border)]">|</span>
          <span>Practical, not theoretical</span>
        </div>
      </div>

      {/* Services */}
      <section id="services" className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-3">What We Do</h2>
          <p className="text-[var(--fg-muted)] max-w-xl mx-auto">
            From strategy to execution, we cover the full spectrum of AI adoption for your business.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              style={{ background: "var(--bg-secondary)" }}
            >
              <div className="text-2xl mb-3" style={{ color: "var(--accent)" }}>{s.icon}</div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-[var(--border)]" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-3">How We Work</h2>
            <p className="text-[var(--fg-muted)] max-w-xl mx-auto">
              A structured, four-phase engagement that delivers clarity and results.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p) => (
              <div key={p.step} className="text-center">
                <div
                  className="text-3xl font-bold mb-3 block"
                  style={{ color: "var(--accent)" }}
                >
                  {p.step}
                </div>
                <h3 className="font-semibold text-[var(--fg)] mb-2">{p.title}</h3>
                <p className="text-sm text-[var(--fg-muted)]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-6">About Orion Edge</h2>
          <p className="text-[var(--fg-muted)] leading-relaxed mb-5">
          Aegis Labs is a specialized AI strategy consultancy helping organizations at every scale
          cut through the noise and implement AI that actually works. We bring hands-on experience
          in enterprise AI systems, LLM integration, and technology leadership — not just theory.
          </p>
          <p className="text-[var(--fg-muted)] leading-relaxed">
            Whether you're a Fortune 500 navigating a company-wide AI transformation or a small
            business looking to automate your first workflow, we meet you where you are and build
            a path forward that fits your resources and goals.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)]" style={{ background: "var(--accent-light)" }}>
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[var(--fg-muted)] mb-8 max-w-xl mx-auto">
            Book a consultation session and let's explore what AI can do for your business.
            Payments are processed securely via Stripe.
          </p>
          <a
            href={STRIPE_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-10 py-3.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Book a Consultation
          </a>
          <p className="mt-4 text-xs text-[var(--fg-subtle)]">
            Secure payment via Stripe · Funds go directly to Orion Edge
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-[var(--fg)] mb-4">Get in Touch</h2>
        <p className="text-[var(--fg-muted)] mb-6">
          Have questions before booking? Reach out directly.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--accent)" }}
        >
          {CONTACT_EMAIL}
        </a>
      </section>
    </>
  );
}
