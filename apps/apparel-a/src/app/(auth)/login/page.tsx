import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const target = next && next.startsWith("/") ? next : "/account";
  if (user) redirect(target);
  return (
    <AuthShell title="Sign in" subtitle="Track orders, save addresses and check out faster.">
      <LoginForm next={target} />
    </AuthShell>
  );
}
