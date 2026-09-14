"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";
import { Field } from "@/components/checkout/checkout-forms";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui-client";
import { cn } from "@/lib/format";

export const DEMO_CREDENTIALS = { email: "thabo@example.co.za", password: "form-demo" };

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthState, FormData>(loginAction, {});
  const [email, setEmail] = useState(state.values?.email ?? "");
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email">
        <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" required />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" required />
      </Field>

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>

      <div className="border border-dashed border-stone-300 p-4 text-[13px] text-stone-600">
        <p className="font-medium text-ink">Demo account</p>
        <p className="mt-1">
          <span className="tabular-nums">{DEMO_CREDENTIALS.email}</span> · password{" "}
          <span className="tabular-nums">{DEMO_CREDENTIALS.password}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_CREDENTIALS.email);
            setPassword(DEMO_CREDENTIALS.password);
          }}
          className="label link-underline mt-2 text-ink"
        >
          Fill demo details
        </button>
      </div>

      <p className="text-center text-[14px] text-stone-500">
        New to FORM?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthState, FormData>(registerAction, {});
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" name="firstName" error={e.firstName}>
          <input id="firstName" name="firstName" autoComplete="given-name" defaultValue={v.firstName} className={cn("field", e.firstName && "border-clay")} required />
        </Field>
        <Field label="Last name" name="lastName" error={e.lastName}>
          <input id="lastName" name="lastName" autoComplete="family-name" defaultValue={v.lastName} className={cn("field", e.lastName && "border-clay")} required />
        </Field>
      </div>
      <Field label="Email" name="email" error={e.email}>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} className={cn("field", e.email && "border-clay")} required />
      </Field>
      <Field label="Password" name="password" error={e.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className={cn("field", e.password && "border-clay")} required />
        <p className="mt-1 text-[12px] text-stone-400">At least 8 characters.</p>
      </Field>

      {state.error && <Notice tone="error">{state.error}</Notice>}

      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>

      <p className="text-center text-[14px] text-stone-500">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
