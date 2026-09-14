"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce, CommerceError } from "@/lib/commerce";
import { validateAddress } from "@/lib/za";

export interface AccountFormState {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

const str = (fd: FormData, key: string) => (fd.get(key)?.toString() ?? "").trim();

async function requireUserId(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  return user.id;
}

export async function updateProfileAction(_prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const userId = await requireUserId();
  const values = { firstName: str(fd, "firstName"), lastName: str(fd, "lastName"), phone: str(fd, "phone") };
  const fieldErrors: Record<string, string> = {};
  if (!values.firstName) fieldErrors.firstName = "Required";
  if (!values.lastName) fieldErrors.lastName = "Required";
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };
  await commerce.updateProfile(userId, { ...values, phone: values.phone || null });
  revalidatePath("/", "layout");
  return { success: "Profile updated.", values };
}

export async function saveAddressAction(_prev: AccountFormState, fd: FormData): Promise<AccountFormState> {
  const userId = await requireUserId();
  const addressId = Number(str(fd, "addressId")) || null;
  const { input, errors } = validateAddress(fd);
  const values = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, v.toString()]));
  if (Object.keys(errors).length) return { fieldErrors: errors, values, error: "Please check the highlighted fields." };
  try {
    if (addressId) await commerce.updateAddress(userId, addressId, input);
    else await commerce.createAddress(userId, input);
  } catch (error) {
    return { error: error instanceof CommerceError ? error.message : "Could not save the address.", values };
  }
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

export async function deleteAddressAction(fd: FormData): Promise<void> {
  const userId = await requireUserId();
  const addressId = Number(str(fd, "addressId"));
  if (addressId) await commerce.deleteAddress(userId, addressId);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(fd: FormData): Promise<void> {
  const userId = await requireUserId();
  const addressId = Number(str(fd, "addressId"));
  const address = (await commerce.listAddresses(userId)).find((a) => a.id === addressId);
  if (address) {
    await commerce.updateAddress(userId, addressId, { ...address, isDefault: true });
  }
  revalidatePath("/account/addresses");
}
