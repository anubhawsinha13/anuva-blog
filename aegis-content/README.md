# Aegis Labs — content site (CodeCut-style backup)

This is the **publication-first** version of Aegis Labs: blog-forward home, reader tips, newsletter CTA, and support/motivation—similar in spirit to [CodeCut](https://codecut.ai/) (tips, explore, community energy).

## When to use which app

| Folder | Role |
|--------|------|
| **`orionedge/`** | Legacy consulting app in this repo (superseded for production by the sibling **`aegis-labs-site`** repo). |
| **`aegis-content/`** | **Backup / future main** when your domain is ready for a content-first site like CodeCut. |

Same repo: both read **`content/posts`** and symlink **`components/simulations`**.

**Production `aegis-labs.pro`** is maintained in the sibling directory **`aegis-labs-site/`** (separate git repository next to this project). That repo contains its own copies of `content/posts` and `components/simulations`; keep them in sync manually or pick one source of truth.

## Run locally

```bash
cd aegis-content
npm install
npm run dev
```

Opens on **port 3001** so you can run `orionedge` on 3000 at the same time.

If Next.js warns about **multiple lockfiles** (repo root + `aegis-content/`), you can ignore it or remove the root lockfile only if you don’t need it. **Do not** set `turbopack.root` to this folder—it breaks the `components/simulations` symlink to shared components.

**Windows:** recreate the symlink after clone: `mklink /D components\simulations ..\..\components\simulations` (admin shell), or copy the folder.

## Deploy (manual until you switch DNS)

GitHub → **Actions** → **Build & Deploy Aegis Content (backup)** → **Run workflow**.

Configure FTP secrets when you’re ready (see workflow file). By default this does **not** auto-deploy on every push—only when you run the workflow manually or adjust `on:` in the YAML.

## Customize

- **`lib/site.ts`** — email addresses and mailto templates for newsletter + tips.
- **Homepage quotes** — edit `readerNotes` in `app/page.tsx` or remove until you have real testimonials.
- **Newsletter** — replace mailto button with Buttondown/Beehiiv embed when you set up a list.
- **`metadataBase`** in `app/layout.tsx` — set to your final domain.

## Consulting site

Production **`aegis-labs.pro`** deploys from the sibling repo **`aegis-labs-site/`** (GitHub Actions **Build & Deploy Aegis Labs**). The **`orionedge/`** folder here is a legacy copy only; run or edit it locally if you still need it before deleting it.
