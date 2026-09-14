import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui";
import { brand } from "@/lib/brand";
import { formatZAR } from "@/lib/format";

export const metadata: Metadata = { title: "Help — delivery, returns & sizing" };

const SIZE_ROWS = [
  ["S", "92–97", "78–83", "38"],
  ["M", "98–103", "84–89", "40"],
  ["L", "104–109", "90–95", "42"],
  ["XL", "110–115", "96–101", "44"],
  ["XXL", "116–121", "102–107", "46"],
];

export default function HelpPage() {
  return (
    <div className="container-x fade-in pt-8 sm:pt-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Help" }]} />
      <h1 className="display mt-6 text-[40px] sm:text-[56px]">Help</h1>
      <p className="mt-3 max-w-xl text-[15px] text-stone-600">Delivery, returns, sizing and how to reach us.</p>

      <div className="mt-12 grid gap-16 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ul className="sticky top-36 space-y-2 text-[14px] text-stone-500">
            {[
              ["delivery", "Delivery"],
              ["returns", "Returns & exchanges"],
              ["sizing", "Size guide"],
              ["payment", "Payment"],
              ["contact", "Contact"],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-2xl space-y-16 text-[15px] leading-relaxed text-stone-600">
          <section id="delivery" className="scroll-mt-36">
            <h2 className="display text-[30px] text-ink">Delivery</h2>
            <p className="mt-4">
              We dispatch from our Cape Town warehouse every working day. Orders placed before 12:00 leave the same day.
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-ink">Standard courier</span> — 2–4 working days to main centres, R 95. Free on orders
                over {formatZAR(brand.freeDeliveryThresholdCents)}.
              </li>
              <li>
                <span className="text-ink">Express courier</span> — next working day to Johannesburg, Pretoria, Cape Town and
                Durban, R 195.
              </li>
              <li>Outlying areas may take 1–2 additional days. You&apos;ll receive a tracking number as soon as the courier collects.</li>
            </ul>
          </section>

          <section id="returns" className="scroll-mt-36">
            <h2 className="display text-[30px] text-ink">Returns &amp; exchanges</h2>
            <p className="mt-4">
              Return or exchange anything within {brand.returnsWindowDays} days of delivery, unworn and with tags attached.
              Size exchanges are free — we arrange the courier collection and send the new size as soon as the original is
              scanned by the courier.
            </p>
            <p className="mt-3">Refunds are processed to the original payment method within 5 working days of receipt.</p>
          </section>

          <section id="sizing" className="scroll-mt-36">
            <h2 className="display text-[30px] text-ink">Size guide</h2>
            <p className="mt-4">Body measurements in centimetres. If you&apos;re between sizes, size up for a relaxed fit.</p>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[14px]">
                <thead>
                  <tr className="label border-b border-stone-200 text-stone-500">
                    <th className="py-2 pr-4 font-medium">Size</th>
                    <th className="py-2 pr-4 font-medium">Chest</th>
                    <th className="py-2 pr-4 font-medium">Waist</th>
                    <th className="py-2 font-medium">Collar (shirts)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {SIZE_ROWS.map(([size, chest, waist, collar]) => (
                    <tr key={size}>
                      <td className="py-2.5 pr-4 font-medium text-ink">{size}</td>
                      <td className="py-2.5 pr-4">{chest}</td>
                      <td className="py-2.5 pr-4">{waist}</td>
                      <td className="py-2.5">{collar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] text-stone-500">Trousers and denim are sized by waist in inches (30–38). Belts: S 30–32, M 34–36, L 38–40.</p>
          </section>

          <section id="payment" className="scroll-mt-36">
            <h2 className="display text-[30px] text-ink">Payment</h2>
            <p className="mt-4">
              We accept Visa, Mastercard, American Express and Instant EFT from all major South African banks. Card payments
              are 3D Secure protected. All prices are in Rand and include 15% VAT.
            </p>
          </section>

          <section id="contact" className="scroll-mt-36">
            <h2 className="display text-[30px] text-ink">Contact</h2>
            <p className="mt-4">
              Email{" "}
              <a href={`mailto:${brand.supportEmail}`} className="text-ink underline underline-offset-4">
                {brand.supportEmail}
              </a>{" "}
              or call {brand.supportPhone}, Monday to Friday 08:30–17:00 SAST. Visit us at {brand.address}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
