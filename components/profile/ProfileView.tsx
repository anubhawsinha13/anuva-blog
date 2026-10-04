"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ProfileContent } from "./types";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

export default function ProfileView({ profile }: { profile: ProfileContent }) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : { initial: { y: 16 }, animate: { y: 0 }, transition: { duration: 0.7 } };

  return (
    <>
      <header className="pf-nav">
        <a className="pf-wordmark" href="/">
          ANUBHAW.
        </a>
        <nav className="pf-nav-links" aria-label="Profile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="pf-talk" href={profile.contact.linkedin}>
            Let&apos;s talk
          </a>
        </nav>
      </header>

      <section className="pf-hero">
        <motion.div {...fade}>
          <p className="pf-kicker">{profile.eyebrow}</p>
          <h1 className="pf-lockup">
            {profile.headlineLines.map((line) => (
              <span key={line} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </h1>
          <p className="pf-disciplines">{profile.disciplines}</p>
          <p className="pf-bio">{profile.shortBio}</p>
          <div className="pf-actions">
            <a className="pf-btn" href="#work">
              Explore the work
            </a>
            <a className="pf-text-link" href={profile.contact.linkedin}>
              LinkedIn
            </a>
          </div>
        </motion.div>
        <motion.figure
          className="pf-figure"
          {...(reduce
            ? {}
            : { initial: { y: 12 }, animate: { y: 0 }, transition: { duration: 0.8, delay: 0.1 } })}
        >
          <img src="/profile/hero.png" alt={profile.name} />
        </motion.figure>
      </section>

      <section id="about" className="pf-section pf-about">
        <h2>About</h2>
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </section>

      <section id="work" className="pf-section">
        <h2>Work</h2>
        <div className="pf-work-grid">
          {profile.work.map((card) => (
            <article key={card.title} className="pf-card">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
        <div className="pf-timeline">
          {profile.roles.map((role) => (
            <article key={`${role.title}-${role.dates}`} className="pf-role">
              <div>
                <div className="pf-role-meta">{role.dates}</div>
                {role.location ? <div className="pf-role-meta">{role.location}</div> : null}
              </div>
              <div>
                <h3>
                  {role.title}
                  {role.company ? ` · ${role.company}` : ""}
                </h3>
                <ul>
                  {role.bullets.map((bullet) => (
                    <li key={`${bullet.label ?? ""}-${bullet.body.slice(0, 40)}`}>
                      {bullet.label ? <strong>{bullet.label} — </strong> : null}
                      {bullet.body}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="skills" className="pf-section">
        <h2>Skills</h2>
        <div className="pf-pinned">
          {profile.pinnedSkills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
        <div className="pf-pills">
          {profile.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section id="writing" className="pf-section">
        <h2>Writing</h2>
        <div className="pf-writing">
          {profile.writing.map((item) => (
            <a key={item.url} href={item.url}>
              {item.label}
            </a>
          ))}
        </div>
      </section>

      <section id="contact" className="pf-section">
        <h2>Contact</h2>
        <div className="pf-contact">
          <a href={profile.contact.linkedin}>
            <span>LinkedIn</span>
            <strong>Anubhaw Sinha</strong>
          </a>
          <a href={profile.contact.blog}>
            <span>Blog</span>
            <strong>{profile.contact.blogLabel}</strong>
          </a>
        </div>
      </section>
    </>
  );
}
