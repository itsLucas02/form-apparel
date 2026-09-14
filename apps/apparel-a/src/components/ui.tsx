import Link from "next/link";
import type { ReactNode } from "react";
import { cn, formatZAR } from "@/lib/format";
import type { StockInfo } from "@/lib/commerce/types";

export function Price({
  cents,
  compareAtCents,
  className,
  size = "md",
}: {
  cents: number;
  compareAtCents?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-[13px]", md: "text-[15px]", lg: "text-[20px]" };
  const onSale = compareAtCents != null && compareAtCents > cents;
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", sizes[size], className)}>
      <span className={cn(onSale && "text-clay")}>{formatZAR(cents)}</span>
      {onSale && <s className="text-stone-400">{formatZAR(compareAtCents)}</s>}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "dark" | "amber" | "clay" | "success" | "outline";
  className?: string;
}) {
  const tones = {
    neutral: "bg-bone-deep text-ink",
    dark: "bg-ink text-bone",
    amber: "bg-amber-soft text-amber",
    clay: "bg-clay-soft text-clay",
    success: "bg-success-soft text-success",
    outline: "border border-stone-200 text-stone-500",
  };
  return (
    <span className={cn("label inline-flex h-6 items-center px-2", tones[tone], className)}>{children}</span>
  );
}

export function StockLabel({ stock, className }: { stock: StockInfo; className?: string }) {
  if (stock.level === "in_stock") {
    return (
      <span className={cn("inline-flex items-center gap-2 text-[13px] text-stone-500", className)}>
        <span className="size-1.5 rounded-full bg-success" /> In stock
      </span>
    );
  }
  if (stock.level === "out_of_stock") {
    return (
      <span className={cn("inline-flex items-center gap-2 text-[13px] text-stone-500", className)}>
        <span className="size-1.5 rounded-full bg-stone-300" /> {stock.message}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] text-amber", className)}>
      <span className="size-1.5 rounded-full bg-amber pulse-dot" /> {stock.message}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow && <p className="label mb-3 text-stone-500">{eyebrow}</p>}
        <h2 className="display text-[32px] sm:text-[40px]">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="label link-underline hidden shrink-0 pb-1 sm:inline-block">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Notice({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "error" | "success" | "info";
  className?: string;
}) {
  const tones = {
    neutral: "border-stone-200 bg-white text-ink",
    error: "border-clay/40 bg-clay-soft/50 text-clay",
    success: "border-success/30 bg-success-soft/60 text-success",
    info: "border-stone-200 bg-bone-deep/60 text-ink",
  };
  return <div className={cn("border px-4 py-3 text-[14px] leading-relaxed", tones[tone], className)}>{children}</div>;
}

export function Breadcrumbs({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="label flex flex-wrap items-center gap-2 text-stone-400">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function DefinitionList({ items }: { items: Array<{ term: string; value: ReactNode }> }) {
  return (
    <dl className="divide-y divide-stone-200 border-y border-stone-200">
      {items.map((item) => (
        <div key={item.term} className="grid grid-cols-[120px_1fr] gap-4 py-3 text-[14px] sm:grid-cols-[160px_1fr]">
          <dt className="text-stone-500">{item.term}</dt>
          <dd className="text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-stone-300 px-6 py-20 text-center">
      <h3 className="display text-[28px]">{title}</h3>
      {description && <p className="mt-3 max-w-md text-[14px] text-stone-500">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-primary mt-8">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string | null | undefined }) {
  const map: Record<string, { label: string; tone: "neutral" | "amber" | "success" | "dark" | "clay" }> = {
    pending: { label: "Processing", tone: "amber" },
    ready: { label: "Ready to ship", tone: "amber" },
    shipped: { label: "In transit", tone: "dark" },
    delivered: { label: "Delivered", tone: "success" },
    paid: { label: "Paid", tone: "success" },
    balance_due: { label: "Awaiting payment", tone: "amber" },
    failed: { label: "Payment failed", tone: "clay" },
    complete: { label: "Complete", tone: "success" },
  };
  const entry = status ? map[status] : undefined;
  if (!entry) return <Badge tone="neutral">{status ?? "—"}</Badge>;
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
