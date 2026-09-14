/** Format integer cents as South African Rand: R 1,299 / R 1,299.50 */
export function formatZAR(cents: number, options: { alwaysCents?: boolean } = {}): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const rands = Math.floor(abs / 100);
  const remainder = abs % 100;
  const whole = rands.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const showCents = options.alwaysCents || remainder !== 0;
  const value = showCents ? `${whole}.${remainder.toString().padStart(2, "0")}` : whole;
  return `${negative ? "−" : ""}R ${value}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Africa/Johannesburg",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-ZA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Africa/Johannesburg",
});

export function formatDate(iso: string | null | undefined): string {
  return iso ? dateFormatter.format(new Date(iso)) : "—";
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFormatter.format(new Date(iso)) : "—";
}

export function formatWeekday(iso: string | null | undefined): string {
  return iso ? weekdayFormatter.format(new Date(iso)) : "—";
}

export function variantLabel(color?: { presentation: string } | null, size?: { presentation: string } | null): string {
  return [color?.presentation, size?.presentation].filter(Boolean).join(" · ");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
