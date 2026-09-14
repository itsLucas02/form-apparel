import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/order/order-detail";
import { getCurrentUser } from "@/lib/auth/session";
import { commerce } from "@/lib/commerce";

type Props = { params: Promise<{ number: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { number } = await params;
  return { title: `Order ${number}` };
}

export default async function AccountOrderPage({ params }: Props) {
  const [{ number }, user] = await Promise.all([params, getCurrentUser()]);
  const order = await commerce.getOrderByNumber(number, { userId: user?.id ?? null });
  if (!order) notFound();
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-10">
      <OrderDetail order={order} backHref="/account/orders" backLabel="All orders" />
    </div>
  );
}
