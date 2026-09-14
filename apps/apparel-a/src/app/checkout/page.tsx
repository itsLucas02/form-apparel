import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { AddressStep, DeliveryStep, PaymentStep, PlaceOrderForm } from "@/components/checkout/checkout-forms";
import { OrderSummary } from "@/components/checkout/order-summary";
import { getCartToken, getCurrentUser } from "@/lib/auth/session";
import { commerce, type Order } from "@/lib/commerce";
import { cn, formatZAR } from "@/lib/format";
import { formatAddressLines } from "@/lib/za";

export const metadata: Metadata = { title: "Checkout" };

type Step = "address" | "delivery" | "payment" | "review";
const STEPS: Array<{ id: Step; label: string }> = [
  { id: "address", label: "Information" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

function stepFromState(state: Order["state"]): Step {
  switch (state) {
    case "delivery":
      return "delivery";
    case "payment":
      return "payment";
    case "confirm":
      return "review";
    default:
      return "address";
  }
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const [sp, token, user] = await Promise.all([searchParams, getCartToken(), getCurrentUser()]);
  const cart = await commerce.getCart(token);
  if (!cart || !token || cart.lineItems.length === 0) redirect("/cart");

  const reached = stepFromState(cart.state);
  const reachedIndex = STEPS.findIndex((s) => s.id === reached);
  const requestedIndex = STEPS.findIndex((s) => s.id === sp.step);
  const step: Step = requestedIndex >= 0 && requestedIndex <= reachedIndex ? STEPS[requestedIndex].id : reached;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const [shippingMethods, paymentMethods, savedAddresses] = await Promise.all([
    step === "delivery" ? commerce.listShippingMethods(token) : Promise.resolve([]),
    step === "payment" ? commerce.listPaymentMethods() : Promise.resolve([]),
    user ? commerce.listAddresses(user.id) : Promise.resolve([]),
  ]);

  const payment = cart.payments.find((p) => p.state === "checkout");

  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      <div className="flex items-end justify-between">
        <h1 className="display text-[40px] sm:text-[52px]">Checkout</h1>
        <Link href="/cart" className="label link-underline hidden pb-2 text-stone-500 sm:inline-block">
          Back to bag
        </Link>
      </div>

      {/* Step indicator */}
      <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium uppercase tracking-label">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          const reachable = i <= reachedIndex;
          const content = (
            <span className={cn("flex items-center gap-2", current ? "text-ink" : done ? "text-stone-600" : "text-stone-400")}>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px]",
                  current ? "border-ink bg-ink text-bone" : done ? "border-ink text-ink" : "border-stone-300",
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              {s.label}
            </span>
          );
          return (
            <li key={s.id} className="flex items-center gap-3">
              {reachable && !current ? <Link href={`/checkout?step=${s.id}`}>{content}</Link> : content}
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-stone-300" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-16 xl:grid-cols-[minmax(0,1fr)_440px]">
        {/* Mobile summary */}
        <details className="group mb-8 border border-stone-200 bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[14px]">
            <span className="font-medium">
              Order summary <span className="text-stone-400">({cart.itemCount})</span>
            </span>
            <span className="tabular-nums">{formatZAR(cart.totalCents)}</span>
          </summary>
          <div className="border-t border-stone-200 p-4">
            <OrderSummary order={cart} />
          </div>
        </details>

        <div className="min-w-0">
          {/* Completed step summaries */}
          {stepIndex > 0 && (
            <dl className="mb-8 divide-y divide-stone-200 border border-stone-200 bg-white text-[14px]">
              <SummaryRow label="Contact" href="/checkout?step=address" value={cart.email ?? ""} />
              {cart.shipAddress && (
                <SummaryRow label="Ship to" href="/checkout?step=address" value={formatAddressLines(cart.shipAddress).join(", ")} />
              )}
              {stepIndex > 1 && cart.shippingMethod && (
                <SummaryRow
                  label="Method"
                  href="/checkout?step=delivery"
                  value={`${cart.shippingMethod.name} · ${cart.shipmentTotalCents === 0 ? "Free" : formatZAR(cart.shipmentTotalCents)}`}
                />
              )}
              {stepIndex > 2 && payment && (
                <SummaryRow
                  label="Payment"
                  href="/checkout?step=payment"
                  value={
                    payment.cardLast4
                      ? `${payment.cardBrand ?? "Card"} ending ${payment.cardLast4}`
                      : payment.method.name
                  }
                />
              )}
            </dl>
          )}

          {step === "address" && (
            <>
              {sp.error && <p className="mb-6 border border-clay/40 bg-clay-soft/50 px-4 py-3 text-[14px] text-clay">{sp.error}</p>}
              <AddressStep user={user} savedAddresses={savedAddresses} currentEmail={cart.email} currentAddress={cart.shipAddress} />
            </>
          )}
          {step === "delivery" && <DeliveryStep methods={shippingMethods} selectedCode={cart.shippingMethod?.code ?? null} />}
          {step === "payment" && (
            <PaymentStep methods={paymentMethods} totalCents={cart.totalCents} initialError={sp.error ?? null} />
          )}
          {step === "review" && (
            <div className="space-y-8">
              <section>
                <h2 className="text-[17px] font-medium">Review your order</h2>
                <p className="mt-2 text-[14px] text-stone-500">
                  Check everything below, then place your order. You&apos;ll get a confirmation email with your tracking
                  details as soon as the courier collects.
                </p>
              </section>
              <PlaceOrderForm totalCents={cart.totalCents} />
            </div>
          )}
        </div>

        {/* Desktop summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-36 border border-stone-200 bg-white p-6">
            <h2 className="text-[15px] font-medium">
              Order summary <span className="text-stone-400">({cart.itemCount})</span>
            </h2>
            <div className="mt-5">
              <OrderSummary order={cart} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <dt className="w-20 shrink-0 text-stone-500">{label}</dt>
      <dd className="min-w-0 flex-1 truncate">{value}</dd>
      <Link href={href} className="label shrink-0 text-stone-500 hover:text-ink">
        Change
      </Link>
    </div>
  );
}
