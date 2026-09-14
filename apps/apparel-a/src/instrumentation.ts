export async function register() {
  // Auto-bootstrap is a local-development convenience only. In production the
  // schema is migrated and seeded explicitly (`pnpm db:seed`) — running
  // migrations/seeds inside the request lifecycle is unsafe on serverless.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV !== "production" &&
    process.env.COMMERCE_BACKEND !== "spree"
  ) {
    const { ensureCommerceReady } = await import("@/lib/commerce/local/bootstrap");
    try {
      await ensureCommerceReady();
    } catch (error) {
      console.error("[commerce] bootstrap failed", error);
    }
  }
}
