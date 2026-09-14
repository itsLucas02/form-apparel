import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  const profile = (await commerce.getProfile(user.id)) ?? user;
  return (
    <section>
      <h2 className="text-[17px] font-medium">Profile</h2>
      <p className="mt-1 text-[14px] text-stone-500">Customer since {formatDate(profile.createdAt)}.</p>
      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>
    </section>
  );
}
