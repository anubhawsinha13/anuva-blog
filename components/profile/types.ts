export type ProfileBullet = {
  label: string | null;
  body: string;
};

export type ProfileRole = {
  title: string;
  company: string | null;
  dates: string | null;
  location: string | null;
  bullets: ProfileBullet[];
};

export type ProfileContent = {
  source: string;
  name: string;
  eyebrow: string;
  headlineLines: string[];
  disciplines: string;
  shortBio: string;
  about: string[];
  work: { title: string; body: string }[];
  roles: ProfileRole[];
  pinnedSkills: string[];
  skills: string[];
  writing: { label: string; url: string }[];
  contact: { linkedin: string; blog: string; blogLabel: string };
};
