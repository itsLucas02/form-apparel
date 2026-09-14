"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveAddressAction, type AccountFormState } from "@/app/account/actions";
import { AddressFields } from "@/components/checkout/checkout-forms";
import { Notice } from "@/components/ui";
import { SubmitButton } from "@/components/ui-client";
import type { Address } from "@/lib/commerce/types";

export function AddressForm({ address }: { address: Address | null }) {
  const [state, action] = useActionState<AccountFormState, FormData>(saveAddressAction, {});
  const values: Record<string, string> = state.values ?? {
    firstName: address?.firstName ?? "",
    lastName: address?.lastName ?? "",
    company: address?.company ?? "",
    address1: address?.address1 ?? "",
    address2: address?.address2 ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "",
    postalCode: address?.postalCode ?? "",
    phone: address?.phone ?? "",
    label: address?.label ?? "",
  };
  return (
    <form action={action} className="space-y-6 border border-stone-200 bg-white p-5 sm:p-6">
      {address && <input type="hidden" name="addressId" value={address.id} />}
      <h3 className="text-[15px] font-medium">{address ? "Edit address" : "New address"}</h3>
      <AddressFields values={values} errors={state.fieldErrors} showLabel />
      <label className="flex items-center gap-3 text-[14px]">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault ?? false} className="size-4 accent-ink" />
        Use as my default delivery address
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link href="/account/addresses" className="btn-ghost">
          Cancel
        </Link>
        <SubmitButton className="btn-primary sm:min-w-[200px]" pendingLabel="Saving…">
          Save address
        </SubmitButton>
      </div>
    </form>
  );
}
