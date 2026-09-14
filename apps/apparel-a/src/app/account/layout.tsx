import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      <p className="label text-stone-500">Account</p>
      <h1 className="display mt-2 text-[40px] sm:text-[52px]">
        {user.firstName} {user.lastName}
      </h1>
      <div className="mt-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <AccountNav />
        <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
