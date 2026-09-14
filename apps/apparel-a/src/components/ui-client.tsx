"use client";

import { Loader2, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/format";

export function SubmitButton({
  children,
  className = "btn-primary w-full",
  pendingLabel,
  disabled,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
  disabled?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending} {...rest}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  size = "md",
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const h = size === "sm" ? "h-10" : "h-12";
  const canDecrease = value > min && !disabled;
  const canIncrease = (max == null || value < max) && !disabled;
  return (
    <div className={cn("inline-flex items-stretch border border-stone-200 bg-white", h, className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        className="flex w-10 items-center justify-center text-ink transition-colors hover:bg-bone disabled:opacity-30"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="flex min-w-10 items-center justify-center text-[14px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="flex w-10 items-center justify-center text-ink transition-colors hover:bg-bone disabled:opacity-30"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: Array<{ id: string; title: string; content: ReactNode }>;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen == null ? null : (items[defaultOpen]?.id ?? null));
  return (
    <div className="divide-y divide-stone-200 border-y border-stone-200">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.id)}
            >
              <span className="text-[14px] font-medium">{item.title}</span>
              <Plus className={cn("size-4 transition-transform duration-300", isOpen && "rotate-45")} aria-hidden />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5 text-[14px] leading-relaxed text-stone-600">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
