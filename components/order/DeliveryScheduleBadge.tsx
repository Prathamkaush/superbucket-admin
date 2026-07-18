"use client";

import { FiClock, FiZap } from "react-icons/fi";

type DeliveryOrder = {
  deliveryMode?: string | null;
  scheduledDeliveryAt?: string | Date | null;
  deliverySlotLabel?: string | null;
};

export function isScheduledDelivery(order: DeliveryOrder | null | undefined) {
  return Boolean(order && (order.deliveryMode === "SCHEDULED" || order.scheduledDeliveryAt));
}

export function isScheduledDeliveryPending(order: DeliveryOrder | null | undefined) {
  if (!order || !isScheduledDelivery(order) || !order.scheduledDeliveryAt) return false;
  const time = new Date(order.scheduledDeliveryAt).getTime();
  return Number.isFinite(time) && time > Date.now();
}

export function formatScheduledDelivery(order: DeliveryOrder | null | undefined) {
  if (!order || !isScheduledDelivery(order)) return "Instant delivery";
  if (!order.scheduledDeliveryAt) return order.deliverySlotLabel?.trim() || "Scheduled delivery";

  const date = new Date(order.scheduledDeliveryAt);
  if (Number.isNaN(date.getTime())) return order.deliverySlotLabel?.trim() || "Scheduled delivery";
  return date.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DeliveryScheduleBadge({
  order,
  compact = false,
}: {
  order: DeliveryOrder | null | undefined;
  compact?: boolean;
}) {
  if (!order) return null;
  const scheduled = isScheduledDelivery(order);

  if (!scheduled) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-sky-300">
        <FiZap size={11} /> Instant
      </div>
    );
  }

  return (
    <div className={`border border-amber-500/30 bg-amber-500/10 text-amber-200 ${compact ? "rounded-md px-3 py-2" : "rounded-lg p-4"}`}>
      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-amber-400">
        <FiClock size={12} /> Scheduled delivery
      </div>
      <p className={`${compact ? "mt-1 text-xs" : "mt-2 text-sm"} font-black text-white`}>
        {formatScheduledDelivery(order)}
      </p>
    </div>
  );
}
