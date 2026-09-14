import Image from "next/image";
import type { ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="fade-in lg:grid lg:min-h-[calc(100vh-112px)] lg:grid-cols-2">
      <div className="relative hidden bg-ink lg:block">
        <Image src="/images/edit-tailoring.webp" alt="" fill sizes="50vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <p className="display absolute bottom-12 left-12 max-w-md text-[44px] leading-[1] text-bone">
          Made for South African days.
        </p>
      </div>
      <div className="container-x flex items-center py-14 lg:py-20">
        <div className="mx-auto w-full max-w-md">
          <h1 className="display text-[40px] sm:text-[48px]">{title}</h1>
          <p className="mt-3 text-[15px] text-stone-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
