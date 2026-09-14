import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/order/order-detail";
import { ResetCartOnMount } from "@/components/order/reset-cart";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string; placed?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number}` };
}

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ number }, sp, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  const order = await commerce.getOrderByNumber(number, { orderToken: sp.t ?? null, userId: user?.id ?? null });
  if (!order || order.state !== "complete") notFound();

  const justPlaced = sp.placed === "1";

  return (
    <>
      {justPlaced && <ResetCartOnMount />}
      <OrderDetail order={order} justPlaced={justPlaced} />
      <div className="container-x mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-stone-200 pt-8 text-[14px]">
        {user ? (
          <Link href="/account/orders" className="label link-underline">
            View order history
          </Link>
        ) : (
          <p className="text-stone-500">
            <Link href={`/register?next=${encodeURIComponent(`/orders/${order.number}?t=${order.token}`)}`} className="text-ink underline underline-offset-4">
              Create an account
            </Link>{" "}
            to keep this order in your history and track future deliveries.
          </p>
        )}
        <Link href="/products" className="label link-underline">
          Continue shopping
        </Link>
      </div>
    </>
  );
}
