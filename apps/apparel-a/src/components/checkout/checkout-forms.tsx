"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useActionState, useState } from "react";
import {
  placeOrderAction,
  submitAddressAction,
  submitDeliveryAction,
  submitPaymentAction,
  type FormState,
} from "@/app/checkout/actions";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui-client";
import type { Address, PaymentMethod, ShippingMethod } from "@/lib/commerce/types";
import { cn, formatZAR } from "@/lib/format";
import { SA_BANKS, SA_PROVINCES, formatAddressLines } from "@/lib/za";

/* ------------------------------------------------------------------ */
/* Shared address fields                                               */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  name,
  error,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[12px] text-clay" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AddressFields({
  values = {},
  errors = {},
  showLabel = false,
}: {
  values?: Partial<Record<string, string>>;
  errors?: Record<string, string>;
  showLabel?: boolean;
}) {
  const input = (name: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={name}
      name={name}
      defaultValue={values[name] ?? ""}
      className={cn("field", errors[name] && "border-clay")}
      aria-invalid={Boolean(errors[name])}
      {...extra}
    />
  );
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="First name" name="firstName" error={errors.firstName}>
        {input("firstName", { autoComplete: "given-name", required: true })}
      </Field>
      <Field label="Last name" name="lastName" error={errors.lastName}>
        {input("lastName", { autoComplete: "family-name", required: true })}
      </Field>
      <Field label="Company (optional)" name="company" className="sm:col-span-2">
        {input("company", { autoComplete: "organization" })}
      </Field>
      <Field label="Street address" name="address1" error={errors.address1} className="sm:col-span-2">
        {input("address1", { autoComplete: "address-line1", placeholder: "14 Jan Smuts Avenue", required: true })}
      </Field>
      <Field label="Apartment, complex, suburb (optional)" name="address2" className="sm:col-span-2">
        {input("address2", { autoComplete: "address-line2", placeholder: "Unit 7, Rosebank" })}
      </Field>
      <Field label="City / town" name="city" error={errors.city}>
        {input("city", { autoComplete: "address-level2", required: true })}
      </Field>
      <Field label="Province" name="province" error={errors.province}>
        <select
          id="province"
          name="province"
          defaultValue={values.province ?? ""}
          className={cn("field appearance-none", errors.province && "border-clay")}
          required
        >
          <option value="" disabled>
            Select province
          </option>
          {SA_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Postal code" name="postalCode" error={errors.postalCode}>
        {input("postalCode", { autoComplete: "postal-code", inputMode: "numeric", maxLength: 4, placeholder: "2196", required: true })}
      </Field>
      <Field label="Phone" name="phone" error={errors.phone}>
        {input("phone", { autoComplete: "tel", inputMode: "tel", placeholder: "+27 82 555 0147", required: true })}
      </Field>
      {showLabel && (
        <Field label="Label (optional)" name="label" className="sm:col-span-2">
          {input("label", { placeholder: "Home, Work…" })}
        </Field>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 – Information                                                */
/* ------------------------------------------------------------------ */

export function AddressStep({
  user,
  savedAddresses,
  currentEmail,
  currentAddress,
}: {
  user: { email: string; firstName: string; lastName: string; phone: string | null } | null;
  savedAddresses: Address[];
  currentEmail: string | null;
  currentAddress: Address | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(submitAddressAction, {});
  const hasSaved = savedAddresses.length > 0;
  const [mode, setMode] = useState<"saved" | "new">(hasSaved ? "saved" : "new");
  const [savedId, setSavedId] = useState<number>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? 0,
  );

  const values: Record<string, string> = state.values ?? {
    firstName: currentAddress?.firstName ?? user?.firstName ?? "",
    lastName: currentAddress?.lastName ?? user?.lastName ?? "",
    company: currentAddress?.company ?? "",
    address1: currentAddress?.address1 ?? "",
    address2: currentAddress?.address2 ?? "",
    city: currentAddress?.city ?? "",
    province: currentAddress?.province ?? "",
    postalCode: currentAddress?.postalCode ?? "",
    phone: currentAddress?.phone ?? user?.phone ?? "",
    email: currentEmail ?? "",
  };

  return (
    <form action={action} className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-medium">Contact</h2>
          {!user && (
            <p className="text-[13px] text-stone-500">
              Have an account?{" "}
              <Link href="/login?next=/checkout" className="text-ink underline underline-offset-4">
                Sign in
              </Link>
            </p>
          )}
        </div>
        <div className="mt-4">
          {user ? (
            <p className="field flex items-center bg-bone-deep/50 text-stone-600">{user.email}</p>
          ) : (
            <Field label="Email" name="email" error={state.fieldErrors?.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                className={cn("field", state.fieldErrors?.email && "border-clay")}
                placeholder="you@example.co.za"
                required
              />
            </Field>
          )}
          <p className="mt-2 text-[12px] text-stone-400">Order confirmation and tracking updates go here.</p>
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-medium">Delivery address</h2>

        {hasSaved && (
          <div className="mt-4 space-y-2">
            {savedAddresses.map((a) => {
              const active = mode === "saved" && savedId === a.id;
              return (
                <label
                  key={a.id}
                  className={cn(
                    "flex cursor-pointer gap-3 border bg-white p-4 transition-colors",
                    active ? "border-ink" : "border-stone-200 hover:border-stone-400",
                  )}
                >
                  <input
                    type="radio"
                    name="savedAddressId"
                    value={a.id}
                    checked={active}
                    onChange={() => {
                      setMode("saved");
                      setSavedId(a.id);
                    }}
                    className="mt-1 accent-ink"
                  />
                  <span className="text-[14px] leading-relaxed">
                    <span className="flex items-center gap-2 font-medium">
                      {a.label ?? "Address"}
                      {a.isDefault && <span className="label text-stone-400">Default</span>}
                    </span>
                    <span className="block text-stone-600">{formatAddressLines(a).join(", ")}</span>
                  </span>
                </label>
              );
            })}
            <label
              className={cn(
                "flex cursor-pointer gap-3 border bg-white p-4 transition-colors",
                mode === "new" ? "border-ink" : "border-stone-200 hover:border-stone-400",
              )}
            >
              <input
                type="radio"
                name="savedAddressId"
                value=""
                checked={mode === "new"}
                onChange={() => setMode("new")}
                className="mt-1 accent-ink"
              />
              <span className="text-[14px] font-medium">Use a different address</span>
            </label>
          </div>
        )}

        {mode === "new" && (
          <div className={cn(hasSaved && "mt-5")}>
            <div className="mt-4">
              <AddressFields values={values} errors={state.fieldErrors} />
            </div>
            {user && (
              <label className="mt-4 flex items-center gap-3 text-[14px]">
                <input type="checkbox" name="saveAddress" defaultChecked className="size-4 accent-ink" />
                Save this address to my account
              </label>
            )}
          </div>
        )}
      </section>

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/cart" className="label link-underline text-stone-500">
          Return to bag
        </Link>
        <SubmitButton className="btn-primary sm:min-w-[240px]" pendingLabel="Saving…">
          Continue to delivery
        </SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 – Delivery                                                   */
/* ------------------------------------------------------------------ */

export function DeliveryStep({ methods, selectedCode }: { methods: ShippingMethod[]; selectedCode: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(submitDeliveryAction, {});
  const [code, setCode] = useState(selectedCode ?? methods[0]?.code ?? "");
  return (
    <form action={action} className="space-y-8">
      <section>
        <h2 className="text-[17px] font-medium">Delivery method</h2>
        <div className="mt-4 space-y-2">
          {methods.map((m) => {
            const active = code === m.code;
            return (
              <label
                key={m.code}
                className={cn(
                  "flex cursor-pointer items-start gap-3 border bg-white p-4 transition-colors",
                  active ? "border-ink" : "border-stone-200 hover:border-stone-400",
                )}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={m.code}
                  checked={active}
                  onChange={() => setCode(m.code)}
                  className="mt-1 accent-ink"
                />
                <span className="flex flex-1 items-start justify-between gap-4 text-[14px]">
                  <span>
                    <span className="block font-medium">{m.name}</span>
                    <span className="block text-stone-500">{m.description}</span>
                    <span className="mt-1 block text-[12px] text-stone-400">
                      Estimated {m.etaMinDays}–{m.etaMaxDays} working days
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">{m.costCents === 0 ? "Free" : formatZAR(m.costCents)}</span>
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-stone-400">
          Orders placed before 12:00 on a working day are dispatched the same day from our Cape Town warehouse.
        </p>
      </section>

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/checkout?step=address" className="label link-underline text-stone-500">
          Return to information
        </Link>
        <SubmitButton className="btn-primary sm:min-w-[240px]" pendingLabel="Saving…">
          Continue to payment
        </SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 – Payment                                                    */
/* ------------------------------------------------------------------ */

export function PaymentStep({
  methods,
  totalCents,
  initialError,
}: {
  methods: PaymentMethod[];
  totalCents: number;
  initialError: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(submitPaymentAction, {});
  const [method, setMethod] = useState(methods[0]?.code ?? "demo_card");
  const values = state.values ?? { cardholderName: "", cardNumber: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" };
  const errors = state.fieldErrors ?? {};
  const error = state.error ?? initialError;

  return (
    <form action={action} className="space-y-8">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-medium">Payment</h2>
          <p className="flex items-center gap-1.5 text-[12px] text-stone-400">
            <Lock className="size-3" /> Encrypted &amp; 3D Secure
          </p>
        </div>

        <Notice tone="info" className="mt-4">
          <span className="font-medium">Demo payment.</span> No money moves in this preview — the gateway is simulated. Use
          any card details; a card ending in <span className="tabular-nums">0002</span> is declined so you can see the
          failure path.
        </Notice>

        <div className="mt-4 divide-y divide-stone-200 border border-stone-200 bg-white">
          {methods.map((m) => {
            const active = method === m.code;
            return (
              <div key={m.code}>
                <label className="flex cursor-pointer items-start gap-3 p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.code}
                    checked={active}
                    onChange={() => setMethod(m.code)}
                    className="mt-1 accent-ink"
                  />
                  <span className="text-[14px]">
                    <span className="block font-medium">{m.name}</span>
                    <span className="block text-stone-500">{m.description}</span>
                  </span>
                </label>
                {active && m.code === "demo_card" && (
                  <div className="grid grid-cols-2 gap-4 border-t border-stone-200 bg-bone/60 p-4 fade-in">
                    <Field label="Name on card" name="cardholderName" error={errors.cardholderName} className="col-span-2">
                      <input id="cardholderName" name="cardholderName" defaultValue={values.cardholderName} autoComplete="cc-name" className={cn("field", errors.cardholderName && "border-clay")} placeholder="T Nkosi" />
                    </Field>
                    <Field label="Card number" name="cardNumber" error={errors.cardNumber} className="col-span-2">
                      <input id="cardNumber" name="cardNumber" defaultValue={values.cardNumber} inputMode="numeric" autoComplete="cc-number" className={cn("field tabular-nums", errors.cardNumber && "border-clay")} />
                    </Field>
                    <Field label="Expiry" name="expiry" error={errors.expiry}>
                      <input id="expiry" name="expiry" defaultValue={values.expiry} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={cn("field tabular-nums", errors.expiry && "border-clay")} />
                    </Field>
                    <Field label="CVC" name="cvc" error={errors.cvc}>
                      <input id="cvc" name="cvc" defaultValue={values.cvc} inputMode="numeric" autoComplete="cc-csc" maxLength={4} className={cn("field tabular-nums", errors.cvc && "border-clay")} />
                    </Field>
                  </div>
                )}
                {active && m.code === "demo_eft" && (
                  <div className="border-t border-stone-200 bg-bone/60 p-4 fade-in">
                    <Field label="Your bank" name="bank" error={errors.bank}>
                      <select id="bank" name="bank" defaultValue={values.bank ?? ""} className={cn("field appearance-none", errors.bank && "border-clay")}>
                        <option value="" disabled>
                          Select bank
                        </option>
                        {SA_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <p className="mt-2 text-[12px] text-stone-400">You&apos;ll be redirected to your bank to approve the payment.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/checkout?step=delivery" className="label link-underline text-stone-500">
          Return to delivery
        </Link>
        <SubmitButton className="btn-primary sm:min-w-[240px]" pendingLabel="Saving…">
          Review order · {formatZAR(totalCents)}
        </SubmitButton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 – Review & place order                                       */
/* ------------------------------------------------------------------ */

export function PlaceOrderForm({ totalCents }: { totalCents: number }) {
  return (
    <form action={placeOrderAction} className="space-y-4">
      <SubmitButton className="btn-primary w-full sm:h-14" pendingLabel="Processing payment…">
        <Lock className="size-4" /> Pay {formatZAR(totalCents)}
      </SubmitButton>
      <p className="text-center text-[12px] leading-relaxed text-stone-400">
        By placing your order you agree to our terms of sale and {`${30}`}-day returns policy. Payment is simulated in this
        preview.
      </p>
    </form>
  );
}
