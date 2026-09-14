# Commerce integration notes

This storefront is built against a single boundary, `CommerceClient`
(`src/lib/commerce/client.ts`), whose methods map 1:1 onto Spree Storefront
API v2 capabilities. Two adapters exist:

| Adapter | Location | Status |
| --- | --- | --- |
| `local` (default) | `src/lib/commerce/local` | Postgres/Drizzle demo backend, tables mirror Spree concepts |
| `spree` | `src/lib/commerce/spree` | Skeleton with endpoint mapping; select with `COMMERCE_BACKEND=spree` |

Spree (Rails) cannot run inside the Arena sandbox, so the local adapter
provides identical behaviour for the demo. Nothing in `src/app` or
`src/components` knows which adapter is active.

## What is simulated and where

| Concern | Boundary | Demo implementation |
| --- | --- | --- |
| Payment gateway | `PaymentGateway` in `local/providers.ts` | `demoPaymentGateway` – always succeeds, card ending `0002` declines |
| Courier / waybill / tracking | `CourierProvider` in `local/providers.ts` | `demoCourier` – ZA waybill & tracking numbers, time-compressed tracking timeline |
| Tracking sync | `local/fulfilment.ts` | Pulls provider events lazily when an order is viewed (replace with courier webhook/poll) |
| Customer auth | `src/lib/auth/session.ts` | Cookie sessions + scrypt passwords (replace with Spree OAuth tokens) |
| Cart identity | `form_cart_token` cookie | Equivalent of Spree `X-Spree-Order-Token` |
| Demo catalogue & customer | `local/seed-data.ts`, `local/seed.ts` | Seeded once on first boot (`local/bootstrap.ts`) |

Demo customer: `thabo@example.co.za` / `form-demo`.

## Reconnecting Spree

1. Implement `src/lib/commerce/spree/index.ts` against `${SPREE_API_URL}/api/v2/storefront`
   (endpoint mapping is documented in that file and in `client.ts`).
2. Map JSON:API `included` resources onto the types in `src/lib/commerce/types.ts`
   (money as integer cents; stock via variant `in_stock`/`backorderable`/`total_on_hand`).
3. Point `PaymentGateway` at the chosen South African PSP via Spree payment methods.
4. Point `CourierProvider` at the chosen courier API; populate Spree shipment
   `tracking`/`tracking_url` and, optionally, the richer `Shipment.events` history.
5. Set `COMMERCE_BACKEND=spree` and remove the local bootstrap call from `src/app/layout.tsx`.

## Branding

Placeholder brand values live in `src/lib/brand.ts`; design tokens (colours,
type) in `src/app/globals.css` (`@theme`). Fonts are loaded via a Google Fonts
`<link>` in `src/app/layout.tsx`.
