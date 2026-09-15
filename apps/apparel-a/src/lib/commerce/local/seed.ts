import { eq } from "drizzle-orm";
import { db } from "@/db/pg";
import * as s from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import {
  COLORS,
  PAYMENT_METHODS,
  PRODUCTS,
  SHIPPING_METHODS,
  SIZES,
  TAXONS,
  stockFor,
} from "./seed-data";
import { generateOrderNumber, generateShipmentNumber, generateToken } from "./shared";
import { WAREHOUSE_LOCATION } from "./providers";

const daysAgo = (days: number, hours = 0) => new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000);
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

export const DEMO_ACCOUNT = { email: "thabo@example.co.za", password: "form-demo" };

/** Populates an empty database with the demo catalogue and a demo customer. */
export async function seedDatabase(): Promise<void> {
  /* Option types & values */
  const [colorType] = await db
    .insert(s.optionTypes)
    .values({ name: "color", presentation: "Colour", position: 1 })
    .returning();
  const [sizeType] = await db
    .insert(s.optionTypes)
    .values({ name: "size", presentation: "Size", position: 2 })
    .returning();

  const colorRows = await db
    .insert(s.optionValues)
    .values(COLORS.map((c, i) => ({ optionTypeId: colorType.id, name: c.name, presentation: c.presentation, hex: c.hex, position: i + 1 })))
    .returning();
  const sizeRows = await db
    .insert(s.optionValues)
    .values(SIZES.map((sz, i) => ({ optionTypeId: sizeType.id, name: sz.name, presentation: sz.presentation, position: i + 1 })))
    .returning();
  const colorId = new Map(colorRows.map((r) => [r.name, r.id]));
  const sizeId = new Map(sizeRows.map((r) => [r.name, r.id]));

  /* Taxons */
  const taxonRows = await db.insert(s.taxons).values(TAXONS).returning();
  const taxonId = new Map(taxonRows.map((t) => [t.permalink, t.id]));

  /* Shipping & payment methods */
  await db.insert(s.shippingMethods).values(SHIPPING_METHODS);
  await db.insert(s.paymentMethods).values(PAYMENT_METHODS);

  /* Products — inserted in bulk, then linked by slug. */
  const productRows = await db
    .insert(s.products)
    .values(
      PRODUCTS.map((seed) => ({
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        priceCents: seed.priceCents,
        compareAtPriceCents: seed.compareAtPriceCents ?? null,
        availableOn: daysAgo(seed.availableDaysAgo),
        featured: Boolean(seed.featured),
        newArrival: Boolean(seed.newArrival),
        bestseller: Boolean(seed.bestseller),
        details: seed.details,
        createdAt: daysAgo(seed.availableDaysAgo),
      })),
    )
    .returning({ id: s.products.id, slug: s.products.slug });
  const productId = new Map(productRows.map((p) => [p.slug, p.id]));

  await db.insert(s.productsTaxons).values(
    PRODUCTS.flatMap((seed) => {
      const links = [...new Set([seed.category, ...(seed.collections ?? []), ...(seed.newArrival ? ["new-in"] : [])])];
      return links.map((permalink, i) => ({
        productId: productId.get(seed.slug)!,
        taxonId: taxonId.get(permalink)!,
        position: i,
      }));
    }),
  );

  await db.insert(s.productOptionTypes).values(
    PRODUCTS.flatMap((seed) => [
      { productId: productId.get(seed.slug)!, optionTypeId: colorType.id, position: 1 },
      { productId: productId.get(seed.slug)!, optionTypeId: sizeType.id, position: 2 },
    ]),
  );

  await db.insert(s.images).values(
    PRODUCTS.flatMap((seed) =>
      seed.images.map((url, i) => ({
        productId: productId.get(seed.slug)!,
        url,
        alt: `${seed.name} – view ${i + 1}`,
        position: i,
      })),
    ),
  );

  /* Variants — one master + one sellable per colour/size, all in bulk. */
  type VariantPlan = { sku: string; colorValId: number; sizeValId: number; countOnHand: number };
  const plans: VariantPlan[] = [];
  const variantValues: Array<{ productId: number; sku: string; isMaster: boolean; position: number }> = [];

  for (const seed of PRODUCTS) {
    const pid = productId.get(seed.slug)!;
    variantValues.push({ productId: pid, sku: `FRM-${seed.code}-MASTER`, isMaster: true, position: 0 });
    let index = 0;
    for (const color of seed.colors) {
      for (const size of seed.sizes) {
        const sku = `FRM-${seed.code}-${color.toUpperCase()}-${size.toUpperCase()}`;
        variantValues.push({ productId: pid, sku, isMaster: false, position: index + 1 });
        const override = seed.stockOverrides?.[`${color}/${size}`];
        plans.push({
          sku,
          colorValId: colorId.get(color)!,
          sizeValId: sizeId.get(size)!,
          countOnHand: override ?? stockFor(seed.stock, index),
        });
        index += 1;
      }
    }
  }

  const insertedVariants = await db
    .insert(s.variants)
    .values(variantValues)
    .returning({ id: s.variants.id, sku: s.variants.sku });
  const variantIdBySku = new Map(insertedVariants.map((v) => [v.sku, v.id]));

  await db.insert(s.optionValueVariants).values(
    plans.flatMap((p) => [
      { variantId: variantIdBySku.get(p.sku)!, optionValueId: p.colorValId },
      { variantId: variantIdBySku.get(p.sku)!, optionValueId: p.sizeValId },
    ]),
  );

  await db.insert(s.stockItems).values(
    plans.map((p) => ({
      variantId: variantIdBySku.get(p.sku)!,
      countOnHand: p.countOnHand,
      backorderable: false,
    })),
  );

  /* Demo customer */
  const [user] = await db
    .insert(s.users)
    .values({
      email: DEMO_ACCOUNT.email,
      passwordHash: hashPassword(DEMO_ACCOUNT.password),
      firstName: "Thabo",
      lastName: "Nkosi",
      phone: "+27 82 555 0147",
      createdAt: daysAgo(210),
    })
    .returning();

  const [home] = await db
    .insert(s.addresses)
    .values({
      userId: user.id,
      firstName: "Thabo",
      lastName: "Nkosi",
      address1: "14 Jan Smuts Avenue",
      address2: "Unit 7, The Parkwood",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2196",
      phone: "+27 82 555 0147",
      label: "Home",
      isDefault: true,
    })
    .returning();
  const [work] = await db
    .insert(s.addresses)
    .values({
      userId: user.id,
      firstName: "Thabo",
      lastName: "Nkosi",
      company: "Nkosi & Partners",
      address1: "8 Kloof Street",
      address2: "3rd Floor",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "8001",
      phone: "+27 21 424 0190",
      label: "Work",
      isDefault: false,
    })
    .returning();

  const standard = (await db.select().from(s.shippingMethods).where(eq(s.shippingMethods.code, "standard")))[0];
  const express = (await db.select().from(s.shippingMethods).where(eq(s.shippingMethods.code, "express")))[0];
  const card = (await db.select().from(s.paymentMethods).where(eq(s.paymentMethods.code, "demo_card")))[0];

  const priceOf = (sku: string) => {
    const code = sku.split("-")[1];
    return PRODUCTS.find((p) => p.code === code)!.priceCents;
  };

  async function historicalOrder(input: {
    items: Array<{ sku: string; qty: number }>;
    address: typeof home;
    method: typeof standard;
    completedAt: Date;
    delivered: boolean;
    cardLast4: string;
    events?: Array<{ code: string; title: string; description: string; location: string; at: Date }>;
  }) {
    const itemTotal = input.items.reduce((sum, li) => sum + priceOf(li.sku) * li.qty, 0);
    const shipping = input.method.freeAboveCents != null && itemTotal >= input.method.freeAboveCents ? 0 : input.method.costCents;
    const total = itemTotal + shipping;
    const [order] = await db
      .insert(s.orders)
      .values({
        number: generateOrderNumber(),
        token: generateToken(),
        userId: user.id,
        email: user.email,
        state: "complete",
        itemCount: input.items.reduce((sum, li) => sum + li.qty, 0),
        itemTotalCents: itemTotal,
        shipmentTotalCents: shipping,
        totalCents: total,
        shipAddressId: input.address.id,
        billAddressId: input.address.id,
        shippingMethodId: input.method.id,
        paymentState: "paid",
        shipmentState: input.delivered ? "delivered" : "pending",
        completedAt: input.completedAt,
        createdAt: new Date(input.completedAt.getTime() - 20 * 60 * 1000),
        updatedAt: input.completedAt,
      })
      .returning();

    await db.insert(s.lineItems).values(
      input.items.map((li) => ({
        orderId: order.id,
        variantId: variantIdBySku.get(li.sku)!,
        quantity: li.qty,
        priceCents: priceOf(li.sku),
        createdAt: order.createdAt,
      })),
    );
    await db.insert(s.payments).values({
      orderId: order.id,
      paymentMethodId: card.id,
      amountCents: total,
      state: "completed",
      reference: `DEMO-${order.number.slice(1, 7)}-${input.cardLast4}`,
      cardBrand: "Visa",
      cardLast4: input.cardLast4,
      createdAt: input.completedAt,
    });

    const eta = new Date(input.completedAt.getTime() + input.method.etaMaxDays * 24 * 60 * 60 * 1000);
    const [shipment] = await db
      .insert(s.shipments)
      .values({
        orderId: order.id,
        number: generateShipmentNumber(),
        state: input.delivered ? "delivered" : "pending",
        courierName: "FORM Courier Partner (demo)",
        waybillNumber: `WB${Math.floor(100_000_000 + Math.random() * 899_999_999)}ZA`,
        trackingNumber: `ZA${Math.floor(1_000_000_000 + Math.random() * 8_999_999_999)}`,
        estimatedDelivery: eta,
        shippedAt: input.delivered ? input.events?.find((e) => e.code === "collected")?.at ?? null : null,
        deliveredAt: input.delivered ? input.events?.find((e) => e.code === "delivered")?.at ?? null : null,
        createdAt: input.completedAt,
        updatedAt: input.completedAt,
      })
      .returning();

    if (input.events?.length) {
      await db.insert(s.trackingEvents).values(
        input.events.map((e) => ({
          shipmentId: shipment.id,
          code: e.code,
          title: e.title,
          description: e.description,
          location: e.location,
          occurredAt: e.at,
        })),
      );
    }
  }

  const deliveredTimeline = (start: Date, city: string, recipient: string, days: number) => {
    const at = (fraction: number) => new Date(start.getTime() + fraction * days * 24 * 60 * 60 * 1000);
    return [
      { code: "order_confirmed", title: "Order confirmed", description: "Payment received. Your order is being picked and packed.", location: WAREHOUSE_LOCATION, at: at(0) },
      { code: "waybill_created", title: "Waybill generated", description: "Shipment booked with the courier and tracking number issued.", location: WAREHOUSE_LOCATION, at: at(0.05) },
      { code: "collected", title: "Collected by courier", description: "Parcel collected from our Woodstock warehouse.", location: "Woodstock, Cape Town", at: at(0.2) },
      { code: "in_transit", title: "In transit", description: "Departed the Cape Town sorting hub.", location: "Cape Town Hub", at: at(0.35) },
      { code: "arrived_depot", title: "Arrived at local depot", description: `Arrived at the ${city} delivery depot.`, location: `${city} Depot`, at: at(0.7) },
      { code: "out_for_delivery", title: "Out for delivery", description: "Your parcel is with the driver and will be delivered today.", location: city, at: at(0.85) },
      { code: "delivered", title: "Delivered", description: `Parcel delivered and signed for by ${recipient}.`, location: city, at: at(1) },
    ];
  };

  // Delivered a few weeks ago (standard, Johannesburg).
  const o1 = daysAgo(26, 3);
  await historicalOrder({
    items: [
      { sku: "FRM-OXF-WHITE-M", qty: 1 },
      { sku: "FRM-CHN-STONE-W32", qty: 1 },
    ],
    address: home,
    method: standard,
    completedAt: o1,
    delivered: true,
    cardLast4: "4242",
    events: deliveredTimeline(o1, "Johannesburg", "Thabo", 3),
  });

  // Delivered last week (express, Cape Town office).
  const o2 = daysAgo(9, 5);
  await historicalOrder({
    items: [
      { sku: "FRM-MCN-NAVY-L", qty: 1 },
      { sku: "FRM-MBN-CHARCOAL-ONE-SIZE", qty: 2 },
      { sku: "FRM-HWT-WHITE-L", qty: 2 },
    ],
    address: work,
    method: express,
    completedAt: o2,
    delivered: true,
    cardLast4: "4242",
    events: deliveredTimeline(o2, "Cape Town", "Reception", 1),
  });

  // Placed minutes ago – the demo courier will progress this one live.
  await historicalOrder({
    items: [{ sku: "FRM-WOC-CAMEL-M", qty: 1 }],
    address: home,
    method: standard,
    completedAt: minutesAgo(6),
    delivered: false,
    cardLast4: "1881",
  });
}
