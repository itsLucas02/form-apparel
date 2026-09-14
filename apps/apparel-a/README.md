# @form/apparel-a

Storefront variation **A** for **FORM**, a South African men's apparel brand.
A full Next.js e-commerce demo — catalogue, cart, checkout, orders, and customer
accounts — running on a simulated, self-seeding backend.

## Highlights

- **Catalogue** — products, collections, categories, search and filtering.
- **Cart & checkout** — guest or signed-in carts, address/delivery/payment steps.
- **Orders** — order history and a time-compressed courier tracking timeline.
- **Accounts** — registration, sign-in, profile and saved addresses.
- **Self-hosted imagery** — every image is downloaded to `public/images` and
  converted to WebP by a script; no third-party hotlinking.

## Architecture

The UI talks to a single boundary, `CommerceClient`
([`src/lib/commerce/client.ts`](src/lib/commerce/client.ts)), whose methods map
1:1 onto Spree Storefront API v2 capabilities. Two adapters implement it:

| Adapter | Location | Description |
| --- | --- | --- |
| `local` (default) | `src/lib/commerce/local` | Postgres/Drizzle demo backend; tables mirror Spree concepts |
| `spree` | `src/lib/commerce/spree` | Skeleton mapping to the Spree Storefront API (`COMMERCE_BACKEND=spree`) |

Nothing in `src/app` or `src/components` knows which adapter is active. Payment,
courier/tracking, and customer auth are simulated in the `local` adapter — see
[docs/commerce-integration.md](docs/commerce-integration.md) for the full map and
the steps to reconnect a real Spree backend.

## Getting started

```bash
cp .env.example .env      # set DATABASE_URL
pnpm install              # from the repo root
pnpm --filter @form/apparel-a db:seed   # migrate + seed the demo catalogue
pnpm --filter @form/apparel-a dev
```

`db:seed` applies Drizzle migrations and seeds a demo catalogue (products,
variants, taxons, a customer, and sample orders). In local development the app
also bootstraps itself once at server start; in production the schema is
migrated and seeded explicitly (never inside a request).

**Demo customer:** `thabo@example.co.za` / `form-demo`

## Environment

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (use the pooled URL at runtime) |
| `DATABASE_URL_UNPOOLED` | No | Direct connection, used by `db:seed`/`db:reset` when present |
| `COMMERCE_BACKEND` | No | `local` (default) or `spree` |

## Images

Catalogue and editorial imagery is committed under `public/images` as WebP. To
regenerate it (re-download from Pexels and re-convert):

```bash
pnpm --filter @form/apparel-a images:fetch          # skip existing files
pnpm --filter @form/apparel-a images:fetch -- --force
```

The product/taxon manifest is derived from `src/lib/commerce/local/seed-data.ts`,
so it never drifts from the seed.

## Database

Schema lives in [`src/db/schema.ts`](src/db/schema.ts); SQL migrations in
[`drizzle/`](drizzle). Migrations and seeding are driven by
[`scripts/db-bootstrap.ts`](scripts/db-bootstrap.ts) via `db:seed` / `db:reset`.

To generate a new migration after editing the schema:

```bash
pnpm --filter @form/apparel-a exec drizzle-kit generate
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:seed` | Migrate + seed the demo catalogue |
| `pnpm db:reset` | Truncate everything, then migrate + seed |
| `pnpm images:fetch` | Download + convert all imagery to WebP |

## Deployment

Deploys to Vercel as its own project (Root Directory: `apps/apparel-a`). Provide
`DATABASE_URL` from a Postgres provider — the free Neon integration on the Vercel
Marketplace works well (it also injects `DATABASE_URL_UNPOOLED`). All routes are
dynamic, so the database is only needed at runtime. Seed a fresh database once
with `pnpm --filter @form/apparel-a db:seed`.
