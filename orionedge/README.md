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

## Pay / Stripe (stay on aegis-labs.pro)

- **`/pay/`** uses **Stripe Embedded Checkout** (form appears on your site; no redirect to `buy.stripe.com`).
- You need a tiny backend to create Checkout Sessions: use **`stripe-checkout-worker/`** (Cloudflare Worker template).
- Add GitHub repo secrets **`STRIPE_PUBLISHABLE_KEY`** and **`STRIPE_CHECKOUT_API_URL`** so the static build embeds the right keys/endpoint. See `stripe-checkout-worker/README.md`.

## Deploy

GitHub Actions: **Build & Deploy Aegis Labs** (on changes under `orionedge/`).
