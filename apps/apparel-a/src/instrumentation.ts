export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.COMMERCE_BACKEND !== "spree") {
    const { ensureCommerceReady } = await import("@/lib/commerce/local/bootstrap");
    try {
      await ensureCommerceReady();
    } catch (error) {
      // The layout retries lazily; don't block server start-up on a transient DB issue.
      console.error("[commerce] bootstrap failed", error);
    }
  }
}
