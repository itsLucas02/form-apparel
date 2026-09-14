/**
 * External provider boundaries.
 *
 * Nothing in the storefront talks to a payment gateway or courier directly;
 * everything goes through these two interfaces. The demo implementations
 * below simulate realistic behaviour so the full journey works in the Arena
 * preview. Replace them (or wire Spree's payment methods / a South African
 * courier API) without touching checkout or order UI.
 */
import { randomInt } from "node:crypto";
import type { Address } from "../types";

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export interface PaymentAttempt {
  orderNumber: string;
  amountCents: number;
  currency: string;
  methodCode: string;
  card?: { brand: string | null; last4: string | null };
}

export type PaymentResult =
  | { success: true; reference: string }
  | { success: false; message: string };

export interface PaymentGateway {
  readonly name: string;
  authorizeAndCapture(attempt: PaymentAttempt): Promise<PaymentResult>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Demo gateway: always succeeds, except for a card ending in 0002 which is
 * declined so the failure path can be exercised.
 */
export const demoPaymentGateway: PaymentGateway = {
  name: "Demo gateway",
  async authorizeAndCapture(attempt) {
    await sleep(900);
    if (attempt.card?.last4 === "0002") {
      return { success: false, message: "The card was declined by the issuing bank. Please try another card." };
    }
    const stamp = Date.now().toString(36).toUpperCase();
    return { success: true, reference: `DEMO-${stamp}-${randomInt(1000, 9999)}` };
  },
};

/* ------------------------------------------------------------------ */
/* Courier / fulfilment                                                */
/* ------------------------------------------------------------------ */

export interface CourierBookingRequest {
  orderNumber: string;
  shipmentNumber: string;
  destination: Address;
  shippingMethodCode: string;
  etaMaxDays: number;
  itemCount: number;
}

export interface CourierBooking {
  courierName: string;
  waybillNumber: string;
  trackingNumber: string;
  trackingUrl: string | null;
  estimatedDelivery: Date;
}

export interface CourierTrackingEvent {
  code: string;
  title: string;
  description: string;
  location: string | null;
  occurredAt: Date;
}

export interface CourierTrackingRequest {
  trackingNumber: string;
  bookedAt: Date;
  destination: Address;
  shippingMethodCode: string;
  recipientFirstName: string;
}

export interface CourierProvider {
  readonly name: string;
  /** Books the shipment and returns waybill + tracking references. */
  createShipment(request: CourierBookingRequest): Promise<CourierBooking>;
  /** Latest tracking history. Real providers expose this via API or webhooks. */
  getTrackingEvents(request: CourierTrackingRequest): Promise<CourierTrackingEvent[]>;
}

export const WAREHOUSE_LOCATION = "FORM Warehouse, Woodstock, Cape Town";

/**
 * Demo courier: generates believable ZA waybill/tracking references and a
 * time-compressed tracking history (order → delivered in ~15 minutes for
 * standard, ~8 minutes for express) so reviewers can watch an order progress.
 */
export const demoCourier: CourierProvider = {
  name: "FORM Courier Partner (demo)",
  async createShipment(request) {
    const eta = new Date();
    eta.setDate(eta.getDate() + request.etaMaxDays);
    return {
      courierName: this.name,
      waybillNumber: `WB${randomInt(100_000_000, 999_999_999)}ZA`,
      trackingNumber: `ZA${randomInt(1_000_000_000, 9_999_999_999)}`,
      trackingUrl: null,
      estimatedDelivery: eta,
    };
  },
  async getTrackingEvents(request) {
    const speed = request.shippingMethodCode === "express" ? 0.55 : 1;
    const city = request.destination.city;
    const timeline: Array<Omit<CourierTrackingEvent, "occurredAt"> & { offsetSeconds: number }> = [
      {
        code: "order_confirmed",
        offsetSeconds: 0,
        title: "Order confirmed",
        description: "Payment received. Your order is being picked and packed.",
        location: WAREHOUSE_LOCATION,
      },
      {
        code: "waybill_created",
        offsetSeconds: 25,
        title: "Waybill generated",
        description: "Shipment booked with the courier and tracking number issued.",
        location: WAREHOUSE_LOCATION,
      },
      {
        code: "collected",
        offsetSeconds: 120,
        title: "Collected by courier",
        description: "Parcel collected from our Woodstock warehouse.",
        location: "Woodstock, Cape Town",
      },
      {
        code: "in_transit",
        offsetSeconds: 300,
        title: "In transit",
        description: "Departed the Cape Town sorting hub.",
        location: "Cape Town Hub",
      },
      {
        code: "arrived_depot",
        offsetSeconds: 480,
        title: "Arrived at local depot",
        description: `Arrived at the ${city} delivery depot.`,
        location: `${city} Depot`,
      },
      {
        code: "out_for_delivery",
        offsetSeconds: 660,
        title: "Out for delivery",
        description: "Your parcel is with the driver and will be delivered today.",
        location: city,
      },
      {
        code: "delivered",
        offsetSeconds: 900,
        title: "Delivered",
        description: `Parcel delivered and signed for by ${request.recipientFirstName}.`,
        location: city,
      },
    ];
    const now = Date.now();
    return timeline
      .map(({ offsetSeconds, ...event }) => ({
        ...event,
        occurredAt: new Date(request.bookedAt.getTime() + offsetSeconds * speed * 1000),
      }))
      .filter((event) => event.occurredAt.getTime() <= now);
  },
};

/** Active providers. Swap these when real integrations are implemented. */
export const paymentGateway: PaymentGateway = demoPaymentGateway;
export const courier: CourierProvider = demoCourier;
