import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getCartToken, getCurrentUser } from "@/lib/auth/session";
import { brand } from "@/lib/brand";
import { commerce } from "@/lib/commerce";
import { ensureCommerceReady } from "@/lib/commerce/local/bootstrap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Men's apparel, South Africa`,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: "#f4f1ec",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  if (process.env.COMMERCE_BACKEND !== "spree") await ensureCommerceReady();

  const [categories, collections, user, cartToken] = await Promise.all([
    commerce.listTaxons("category"),
    commerce.listTaxons("collection"),
    getCurrentUser(),
    getCartToken(),
  ]);
  const cart = await commerce.getCart(cartToken);

  return (
    <html lang="en-ZA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Placeholder brand typography – swap when the final identity lands. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <CartProvider initialCart={cart}>
          <Header categories={categories} collections={collections} user={user ? { firstName: user.firstName } : null} />
          <main className="flex-1">{children}</main>
          <Footer categories={categories} />
        </CartProvider>
      </body>
    </html>
  );
}
