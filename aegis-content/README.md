# Aegis Labs — content site (CodeCut-style backup)

This is the **publication-first** version of Aegis Labs: blog-forward home, reader tips, newsletter CTA, and support/motivation—similar in spirit to [CodeCut](https://codecut.ai/) (tips, explore, community energy).

## When to use which app

| Folder | Role |
|--------|------|
| **`orionedge/`** | Consulting landing (Stripe `/pay/`, services, corporate hero). **Current `aegis-labs.pro` deploy.** |
| **`aegis-content/`** | **Backup / future main** when your domain is ready for a content-first site like CodeCut. |

Same repo: both read **`content/posts`** and symlink **`components/simulations`**.

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

## Consulting site backup

The consulting build stays in **`orionedge/`** and remains deployable from **Build & Deploy Aegis Labs**. Swapping which folder FTPs to production is a workflow / SiteGround path change when you’re ready.
