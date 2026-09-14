import type { AddressInput } from "@/lib/commerce/types";

/** South African provinces, as used on delivery addresses. */
export const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export const SA_BANKS = ["Absa", "Capitec", "Discovery Bank", "FNB", "Investec", "Nedbank", "Standard Bank", "TymeBank"];

const str = (fd: FormData, key: string) => (fd.get(key)?.toString() ?? "").trim();

export function validateAddress(fd: FormData): { input: AddressInput; errors: Record<string, string> } {
  const input: AddressInput = {
    firstName: str(fd, "firstName"),
    lastName: str(fd, "lastName"),
    company: str(fd, "company") || null,
    address1: str(fd, "address1"),
    address2: str(fd, "address2") || null,
    city: str(fd, "city"),
    province: str(fd, "province"),
    postalCode: str(fd, "postalCode"),
    phone: str(fd, "phone"),
    label: str(fd, "label") || null,
    isDefault: fd.get("isDefault") === "on",
  };
  const errors: Record<string, string> = {};
  if (!input.firstName) errors.firstName = "Required";
  if (!input.lastName) errors.lastName = "Required";
  if (!input.address1) errors.address1 = "Enter a street address";
  if (!input.city) errors.city = "Enter a city or town";
  if (!SA_PROVINCES.includes(input.province as (typeof SA_PROVINCES)[number])) errors.province = "Choose a province";
  if (!/^\d{4}$/.test(input.postalCode)) errors.postalCode = "4-digit postal code";
  if (input.phone.replace(/\D/g, "").length < 9) errors.phone = "Enter a valid phone number";
  return { input, errors };
}

export function formatAddressLines(a: {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  postalCode: string;
}): string[] {
  return [
    `${a.firstName} ${a.lastName}`,
    a.company ?? "",
    a.address1,
    a.address2 ?? "",
    `${a.city}, ${a.province} ${a.postalCode}`,
    "South Africa",
  ].filter(Boolean);
}
