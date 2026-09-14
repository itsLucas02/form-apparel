import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const target = next && next.startsWith("/") ? next : "/account";
  if (user) redirect(target);
  return (
    <AuthShell title="Create an account" subtitle="Order history, saved addresses and quicker checkout.">
      <RegisterForm next={target} />
    </AuthShell>
  );
}
