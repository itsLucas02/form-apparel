# FORM Apparel — Storefront Variations

A monorepo of storefront variations for **FORM**, a South African men's apparel
brand. Each app is a distinct take on the same single-store e-commerce theme —
different code, mechanics, and UI/UX — built and deployed independently.

## Apps

| App | Description | Status |
| --- | --- | --- |
| [`apps/apparel-a`](apps/apparel-a) | Next.js + PostgreSQL commerce demo behind a Spree-shaped `CommerceClient` boundary | Active |
| [`apps/apparel-b`](apps/apparel-b) | Second storefront variation | Planned |
| [`apps/apparel-c`](apps/apparel-c) | Third storefront variation | Planned |
| [`apps/apparel-d`](apps/apparel-d) | Fourth storefront variation | Planned |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** via **Drizzle ORM**
- **pnpm** workspaces + **Turborepo**

## Requirements

- Node.js `>= 20`
- pnpm `10` (`corepack enable`)
- A PostgreSQL database (local, Docker, or hosted such as Neon)

## Getting started

```bash
pnpm install

# Configure the app you want to run
cp apps/apparel-a/.env.example apps/apparel-a/.env
# then edit DATABASE_URL

# Migrate + seed the demo catalogue
pnpm --filter @form/apparel-a db:seed

# Run a single app
pnpm --filter @form/apparel-a dev

# Or run every app
pnpm dev
```

The database is seeded with a demo catalogue on demand (`db:seed`). In local
development the app also bootstraps itself at server start. Demo customer:
`thabo@example.co.za` / `form-demo`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run all apps in development |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm typecheck` | Type-check all apps |

## Deployment

Each app deploys independently to Vercel:

1. Import this repository as a new Vercel project.
2. Set **Root Directory** to `apps/<app>` and enable
   *"Include files outside the root directory"*.
3. Add a Postgres database (e.g. the free **Neon** integration from the Vercel
   Marketplace) and confirm `DATABASE_URL` is injected.
4. Deploy, then seed once: `pnpm --filter @form/apparel-a db:seed`.
   `COMMERCE_BACKEND` defaults to `local` (simulated demo backend).

## License

Released under the MIT License — see [LICENSE](LICENSE).
