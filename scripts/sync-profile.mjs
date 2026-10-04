#!/usr/bin/env node
/**
 * Read the public paste pack in the sibling linkedIn_profile repo and write
 * content/profile-public.json. Does not read experience/ or theses/.
 *
 * Usage: node scripts/sync-profile.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_MD = path.resolve(__dirname, "../../linkedIn_profile/profile.md");
const OUT_FILE = path.resolve(__dirname, "../content/profile-public.json");

function section(md, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^## ${escaped}\\s*$`, "m");
  const match = re.exec(md);
  if (!match) throw new Error(`Missing section: ${heading}`);
  const start = match.index + match[0].length;
  const rest = md.slice(start);
  const next = rest.search(/^## /m);
  return (next < 0 ? rest : rest.slice(0, next)).trim();
}

function fence(block) {
  const match = block.match(/```[^\n]*\n([\s\S]*?)```/);
  if (!match) throw new Error("Missing fenced block");
  return match[1].trim();
}

function field(block, label) {
  const match = block.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
  return match ? match[1].trim() : null;
}

function lockupLines(sentence) {
  const cleaned = sentence.replace(/\.\s*$/, "").trim();
  const match = cleaned.match(/^(.*?)\s+that\s+(.+?),\s+(.+?),\s+and\s+(.+)$/i);
  if (!match) return [sentence.trim()];
  return [`${match[1]}`, `that ${match[2]},`, `${match[3]},`, `and ${match[4]}.`];
}

function parseBullet(raw) {
  const match = raw.match(/^\*\*(.+?)\*\*\s*[—–-]\s*([\s\S]+)$/);
  if (!match) return { label: null, body: raw.replace(/\*\*/g, "").trim() };
  return { label: match[1].trim(), body: match[2].replace(/\*\*/g, "").trim() };
}

function parseBullets(block) {
  const idx = block.search(/#### Recommended bullets/);
  if (idx < 0) return [];
  const lines = block.slice(idx).split("\n").slice(1);
  const bullets = [];
  let current = null;
  const flush = () => {
    if (current) bullets.push(parseBullet(current.trim()));
    current = null;
  };
  for (const line of lines) {
    if (line.startsWith("###") || line.startsWith("## ")) break;
    if (line.startsWith("- ")) {
      flush();
      current = line.slice(2).trim();
    } else if (current && line.trim()) {
      current += ` ${line.trim()}`;
    } else if (!line.trim()) {
      flush();
    }
  }
  flush();
  return bullets;
}

function parseRoles(block) {
  const parts = block.split(/^### Role /m).slice(1);
  if (parts.length === 0) throw new Error("No roles found in section 3");
  return parts.map((part) => {
    const heading = part.split("\n")[0].trim();
    const titleFromHeading = heading.replace(/^\d+:\s*/, "").split(/\s+[—–-]\s+/)[0].trim();
    const bullets = parseBullets(part);
    if (bullets.length === 0) throw new Error(`No recommended bullets for ${heading}`);
    return {
      title: titleFromHeading,
      company: field(part, "Company"),
      dates: field(part, "Dates"),
      location: field(part, "Location"),
      bullets,
    };
  });
}

function parseWork(block) {
  const cards = [];
  const re = /\*\*([^*]+)\.\*\*\s*([^\n]+)/g;
  let match;
  while ((match = re.exec(block))) {
    cards.push({ title: match[1].trim(), body: match[2].trim() });
  }
  if (cards.length === 0) throw new Error("No work cards in What NSA covers");
  return cards;
}

function parseSkills(block) {
  const pinStart = block.indexOf("**Pin these at the top");
  const pinEnd = block.indexOf("**Then add");
  if (pinStart < 0 || pinEnd < 0) throw new Error("Could not find pinned skills");
  const pinnedSkills = [...block.slice(pinStart, pinEnd).matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
  if (pinnedSkills.length === 0) throw new Error("Pinned skills list is empty");

  const skills = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (line.includes("---") || line.includes("Skill")) continue;
    const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length < 4) continue;
    skills.push(cells[1], cells[3]);
  }

  const rest = block.match(/Fill the remaining slots from:\s*([\s\S]*?)\.\n/);
  if (rest) {
    skills.push(...rest[1].split("·").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean));
  }
  if (skills.length === 0) throw new Error("Skill table is empty");
  return { pinnedSkills, skills };
}

function parseWriting(block) {
  const writing = [];
  for (const line of block.split("\n")) {
    const match = line.match(/^\|\s*(.+?)\s*\|\s*(https?:\S+?)\s*\|/);
    if (match) writing.push({ label: match[1].trim(), url: match[2].trim() });
  }
  if (writing.length === 0) throw new Error("No writing links in section 9");
  return writing;
}

function parseContact(block) {
  const linkedin = block.match(/\[linkedin\.com\/in\/anubhawsinha\]\((https?:\S+?)\)/i);
  const blog = block.match(/\[anubhaws\.sg-host\.com\]\((https?:\S+?)\)/i);
  if (!linkedin || !blog) throw new Error("Connect section is missing LinkedIn or the blog");
  return {
    linkedin: linkedin[1],
    blog: blog[1],
    blogLabel: "Engineering Insights",
  };
}

function parseAbout(block) {
  const parts = block.split(/\n---\n/).map((p) => p.trim()).filter(Boolean);
  const body = parts.find((p) => p.startsWith("Innovative,"));
  if (!body) throw new Error("Could not find the recommended About");
  const about = body
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p && !/^---+$/.test(p));
  if (about.length === 0) throw new Error("Recommended About is empty");
  return about;
}

function assertPublic(json) {
  const text = JSON.stringify(json);
  if (/experience\/|theses\//.test(text)) {
    throw new Error("Refusing to write JSON that references experience/ or theses/");
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    throw new Error("Refusing to write JSON that contains an email address");
  }
  if (/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text)) {
    throw new Error("Refusing to write JSON that contains a phone number");
  }
}

function main() {
  if (!fs.existsSync(PROFILE_MD)) {
    throw new Error(`Profile source not found: ${PROFILE_MD}`);
  }
  const md = fs.readFileSync(PROFILE_MD, "utf8");
  const recommended = fence(section(md, "1. LinkedIn Headline").split("**Recommended:**")[1] ?? "");
  const pieces = recommended.split("|").map((p) => p.trim());
  if (pieces.length < 3) throw new Error("Recommended headline is not in eyebrow | lockup | disciplines form");

  const profile = {
    source: "linkedIn_profile/profile.md",
    name: "Anubhaw Sinha",
    eyebrow: pieces[0],
    headlineLines: lockupLines(pieces[1]),
    disciplines: pieces[2],
    shortBio: fence(section(md, "0. Short Bio")),
    about: parseAbout(section(md, "2b. Recommended LinkedIn About")),
    work: parseWork(section(md, "What NSA covers")),
    roles: parseRoles(section(md, "3. LinkedIn Experience — All Roles")),
    ...parseSkills(section(md, "8. LinkedIn Skills")),
    writing: parseWriting(section(md, "9. LinkedIn Featured Section")),
    contact: parseContact(section(md, "Connect")),
  };

  assertPublic(profile);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(profile, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
