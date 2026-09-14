"use client";

import { useActionState } from "react";
import { updateProfileAction, type AccountFormState } from "@/app/account/actions";
import { Field } from "@/components/checkout/checkout-forms";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui-client";
import type { CustomerProfile } from "@/lib/commerce/types";
import { cn } from "@/lib/format";

export function ProfileForm({ profile }: { profile: CustomerProfile }) {
  const [state, action] = useActionState<AccountFormState, FormData>(updateProfileAction, {});
  const v = state.values ?? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? "" };
  const e = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" error={e.firstName}>
          <input id="firstName" name="firstName" defaultValue={v.firstName} className={cn("field", e.firstName && "border-clay")} required />
        </Field>
        <Field label="Last name" name="lastName" error={e.lastName}>
          <input id="lastName" name="lastName" defaultValue={v.lastName} className={cn("field", e.lastName && "border-clay")} required />
        </Field>
      </div>
      <Field label="Email" name="email">
        <p className="field flex items-center bg-bone-deep/50 text-stone-600">{profile.email}</p>
        <p className="mt-1 text-[12px] text-stone-400">Contact us to change the email on your account.</p>
      </Field>
      <Field label="Phone" name="phone">
        <input id="phone" name="phone" defaultValue={v.phone} inputMode="tel" placeholder="+27 82 555 0147" className="field" />
      </Field>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <SubmitButton className="btn-primary sm:w-auto sm:min-w-[200px]" pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
