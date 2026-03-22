# Aegis Labs site (`aegis-labs.pro`)

Static Next.js app deployed separately from the main blog.

## Shared repo content

- **Posts:** MDX files are read from `../content/posts` at build time (no duplicate content).
- **Interactive demos:** `components/simulations` is a **symlink** to `../../components/simulations` (same components as anuva.blog). On Windows, recreate it if needed:
  ```bash
  cd orionedge/components && mklink /D simulations ..\..\components\simulations
  ```

## Develop

```bash
cd orionedge && npm install && npm run dev
```

## Deploy

GitHub Actions: **Build & Deploy Aegis Labs** (on changes under `orionedge/`).
