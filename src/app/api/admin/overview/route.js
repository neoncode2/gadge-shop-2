import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { countCatalogProducts, getCatalogProducts } from "@/lib/catalog";
import { getAdminOrderStats, listOrdersForAdmin } from "@/lib/orders";
import { countUsers } from "@/lib/users";

export const runtime = "nodejs";
const OVERVIEW_TIMEZONE = "Asia/Dhaka";
const OVERVIEW_SERIES_DAYS = 7;

const overviewDayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: OVERVIEW_TIMEZONE,
});
const overviewDayLabelFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: OVERVIEW_TIMEZONE,
  month: "short",
  day: "numeric",
});
const overviewShortDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: OVERVIEW_TIMEZONE,
  weekday: "short",
});
const overviewFullDayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: OVERVIEW_TIMEZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});

function formatNotificationTime(dateValue) {
  if (!dateValue) return "Moments ago";

  return new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildRevenueSeries(orders, days = OVERVIEW_SERIES_DAYS) {
  const today = new Date();
  const buckets = new Map();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);

    const key = overviewDayKeyFormatter.format(date);

    buckets.set(key, {
      id: key,
      label: overviewDayLabelFormatter.format(date),
      shortLabel: overviewShortDayFormatter.format(date),
      fullLabel: overviewFullDayFormatter.format(date),
      value: 0,
      orders: 0,
    });
  }

  orders.forEach((order) => {
    if (!order.createdAt) return;

    const createdAt = new Date(order.createdAt);
    const key = overviewDayKeyFormatter.format(createdAt);
    const bucket = buckets.get(key);

    if (!bucket) return;

    bucket.value += Number(order.pricing?.total || 0);
    bucket.orders += 1;
  });

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    averageOrderValue: bucket.orders ? Math.round(bucket.value / bucket.orders) : 0,
  }));
}

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  const [productCount, userCount, orderStats, overviewOrders, products] = await Promise.all([
    countCatalogProducts(),
    countUsers(),
    getAdminOrderStats(),
    listOrdersForAdmin({ limit: 120 }),
    getCatalogProducts(),
  ]);

  const recentOrders = overviewOrders.slice(0, 8);
  const lowStockProducts = products
    .filter((product) => Number(product.stock || 0) <= 5)
    .slice(0, 6);
  const totalOrders = orderStats.totalOrders || 0;
  const pendingOrders = orderStats.pendingOrders || 0;
  const deliveredOrders = orderStats.deliveredOrders || 0;
  const otherOrders = Math.max(0, totalOrders - pendingOrders - deliveredOrders);
  const revenueSeries = buildRevenueSeries(overviewOrders);
  const notificationFeed = [
    pendingOrders > 0
      ? {
          id: "pending-orders",
          title: `${pendingOrders} pending orders need attention`,
          description: "Review fulfilment queue and update statuses before dispatch delays build up.",
          time: "Updated just now",
          href: "/admin/orders?status=Pending",
          tone: "warning",
        }
      : null,
    ...recentOrders.slice(0, 4).map((order) => ({
      id: `order-${order.orderNumber}`,
      title: `New order ${order.orderNumber}`,
      description: `${order.customer?.name || "Guest customer"} placed ${
        order.items?.[0]?.name || "a new order"
      } for ${Number(order.pricing?.total || 0).toLocaleString("en-BD")} BDT.`,
      time: formatNotificationTime(order.createdAt),
      href: "/admin/orders",
      tone: "info",
    })),
    ...lowStockProducts.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      title: `${product.name} is running low`,
      description: `Only ${product.stock} item${product.stock === 1 ? "" : "s"} left in stock.`,
      time: "Inventory alert",
      href: "/admin/products",
      tone: "danger",
    })),
  ].filter(Boolean);

  return NextResponse.json({
    ok: true,
    stats: {
      products: productCount,
      users: userCount,
      orders: orderStats.totalOrders,
      pendingOrders: orderStats.pendingOrders,
      deliveredOrders: orderStats.deliveredOrders,
      revenue: orderStats.totalRevenue,
    },
    recentOrders,
    lowStockProducts,
    revenueSeries,
    orderStatusSeries: [
      { label: "Delivered", value: deliveredOrders, color: "#0f766e" },
      { label: "Pending", value: pendingOrders, color: "#d97706" },
      { label: "Other", value: otherOrders, color: "#475569" },
    ],
    notificationFeed,
  });
}
