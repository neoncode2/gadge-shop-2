"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  ClipboardList,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";
import { ADMIN_FUTURE_NAV_ITEMS } from "@/lib/admin-navigation";
import { formatPrice } from "@/lib/format";

const statConfig = [
  {
    key: "products",
    label: "Products",
    icon: Boxes,
    iconTone: "bg-slate-100 text-slate-700",
    accentTone: "bg-slate-900",
    cardTone:
      "bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)]",
    glowTone: "bg-slate-200/60",
    note: "Catalog visibility",
  },
  {
    key: "orders",
    label: "Orders",
    icon: ClipboardList,
    iconTone: "bg-sky-50 text-sky-700",
    accentTone: "bg-sky-500",
    cardTone:
      "bg-[linear-gradient(180deg,rgba(240,249,255,0.96)_0%,rgba(255,255,255,1)_100%)]",
    glowTone: "bg-sky-200/70",
    note: "Active sales flow",
  },
  {
    key: "users",
    label: "Users",
    icon: Users,
    iconTone: "bg-violet-50 text-violet-700",
    accentTone: "bg-violet-500",
    cardTone:
      "bg-[linear-gradient(180deg,rgba(245,243,255,0.96)_0%,rgba(255,255,255,1)_100%)]",
    glowTone: "bg-violet-200/70",
    note: "Growing audience",
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: DollarSign,
    iconTone: "bg-emerald-50 text-emerald-700",
    accentTone: "bg-emerald-500",
    cardTone:
      "bg-[linear-gradient(180deg,rgba(236,253,245,0.96)_0%,rgba(255,255,255,1)_100%)]",
    glowTone: "bg-emerald-200/70",
    note: "Gross collection",
  },
];

function buildSmoothPath(points) {
  if (!points.length) return "";

  return points.reduce((path, point, index, source) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previousPoint = source[index - 1];
    const midpointX = (previousPoint.x + point.x) / 2;

    return `${path} C ${midpointX} ${previousPoint.y}, ${midpointX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function RevenueAreaChart({ items = [] }) {
  const chartId = useId().replace(/:/g, "");
  const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  const chartWidth = 720;
  const chartHeight = 280;
  const paddingTop = 26;
  const paddingRight = 24;
  const paddingBottom = 56;
  const paddingLeft = 56;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + plotHeight;
  const peakDay = items.reduce((highest, item) => {
    if (!highest || Number(item.value || 0) > Number(highest.value || 0)) {
      return item;
    }

    return highest;
  }, null);
  const latestDay = items[items.length - 1] || null;
  const points = items.map((item, index) => ({
    ...item,
    x: items.length === 1
      ? paddingLeft + plotWidth / 2
      : paddingLeft + (index / (items.length - 1)) * plotWidth,
    y: baselineY - (Number(item.value || 0) / maxValue) * plotHeight,
  }));
  const linePath = buildSmoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`
    : "";
  const guideLines = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return {
      y: paddingTop + ratio * plotHeight,
      label: formatPrice(Math.round(maxValue * (1 - ratio))),
    };
  });

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-12 text-center text-sm text-slate-500">
        Revenue activity will appear here once orders start coming in.
      </div>
    );
  }

  return (
    <div className="rounded-[24px]">
      <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(240,253,244,0.9)_0%,rgba(255,255,255,1)_100%)]">
        <div className="overflow-hidden rounded-[22px] border border-emerald-100/80 bg-white/90 p-3 sm:p-4">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[280px] w-full">
          <defs>
            <linearGradient id={`${chartId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id={`${chartId}-line`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {guideLines.map((guide) => (
            <g key={guide.y}>
              <line
                x1={paddingLeft}
                y1={guide.y}
                x2={chartWidth - paddingRight}
                y2={guide.y}
                stroke="#dcfce7"
                strokeDasharray="3 6"
              />
              <text
                x={paddingLeft - 12}
                y={guide.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#6b7280"
              >
                {guide.label}
              </text>
            </g>
          ))}

          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={chartWidth - paddingRight}
            y2={baselineY}
            stroke="#bbf7d0"
          />
          <path d={areaPath} fill={`url(#${chartId}-fill)`} />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${chartId}-line)`}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {points.map((point, index) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={index === points.length - 1 ? 7 : 5}
                fill="#22c55e"
                stroke="#f0fdf4"
                strokeWidth="4"
              />
              <text
                x={point.x}
                y={baselineY + 20}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                {point.shortLabel}
              </text>
              <text
                x={point.x}
                y={baselineY + 36}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {point.orders} ord
              </text>
            </g>
          ))}
        </svg>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-white/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Highest sales day</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {peakDay ? `${peakDay.fullLabel} · ${formatPrice(peakDay.value)}` : "No data"}
            </p>
          </div>
          <div className="rounded-[18px] border border-white/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Latest day orders</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {latestDay ? `${latestDay.orders} orders placed` : "No orders yet"}
            </p>
          </div>
          <div className="rounded-[18px] border border-white/70 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Avg order value</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {latestDay?.orders ? formatPrice(latestDay.averageOrderValue || 0) : formatPrice(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDonut({ items = [] }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

  if (total === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
        Order status distribution will show here once order activity exists.
      </div>
    );
  }

  let currentPercent = 0;
  const segments = items.map((item) => {
    const value = Number(item.value || 0);
    const start = currentPercent;
    const percent = (value / total) * 100;
    currentPercent += percent;
    return `${item.color} ${start}% ${currentPercent}%`;
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[180px_1fr] lg:items-center">
      <div className="flex items-center justify-center">
        <div
          className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${segments.join(", ")})` }}
        >
          <div className="flex h-[118px] w-[118px] flex-col items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(148,163,184,0.18)]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Orders
            </span>
            <span className="mt-2 text-3xl font-semibold text-slate-900">{total}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[20px] border border-slate-200 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{item.value}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${
                    total && Number(item.value || 0) > 0
                      ? Math.max(8, (Number(item.value || 0) / total) * 100)
                      : 0
                  }%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getAlertToneConfig(tone) {
  if (tone === "warning") {
    return {
      label: "Needs action",
      card:
        "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1)_0%,rgba(255,255,255,1)_100%)]",
      badge: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
      icon: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    };
  }

  if (tone === "danger") {
    return {
      label: "Critical",
      card:
        "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,1)_0%,rgba(255,255,255,1)_100%)]",
      badge: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
      icon: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    };
  }

  if (tone === "success") {
    return {
      label: "Healthy",
      card:
        "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,1)_0%,rgba(255,255,255,1)_100%)]",
      badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
      icon: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    };
  }

  return {
    label: "Update",
    card:
      "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,1)_0%,rgba(255,255,255,1)_100%)]",
    badge: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
    icon: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
  };
}

function getAlertIcon(tone) {
  if (tone === "warning" || tone === "danger") return AlertTriangle;
  if (tone === "success") return Truck;
  return ShoppingBag;
}

function OverviewAlerts({ items = [], pendingOrders = 0, lowStockCount = 0 }) {
  const urgentCount = items.filter((item) => item.tone === "warning" || item.tone === "danger").length;

  if (items.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-slate-900">Alert center is quiet</p>
        <p className="mt-2 text-sm text-slate-500">
          Important warnings, order updates, and stock notices will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">Attention Center</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-950">
            Alerts that deserve a quick look
          </h3>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 ring-1 ring-rose-200">
          {urgentCount > 0 ? `${urgentCount} priority alerts` : "All clear"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-rose-200 bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.22),transparent_40%),linear-gradient(180deg,rgba(255,241,242,1)_0%,rgba(255,255,255,1)_100%)] p-4">
          <div className="absolute -right-10 top-0 h-24 w-24 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="relative">
            <span className="inline-flex rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-800 ring-1 ring-rose-200">
              Live alert board
            </span>
            <p className="mt-4 text-sm font-medium text-slate-600">Needs attention</p>
            <p className="mt-2 text-4xl font-semibold leading-none text-slate-950">
              {urgentCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Pending orders and inventory issues surface here first so the team can react fast.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-2.5">
                <p className="text-xs font-medium text-slate-500">Pending orders</p>
                <p className="mt-1.5 text-lg font-semibold text-slate-950">{pendingOrders}</p>
              </div>
              <div className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-2.5">
                <p className="text-xs font-medium text-slate-500">Low stock items</p>
                <p className="mt-1.5 text-lg font-semibold text-slate-950">{lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.slice(0, 4).map((item) => {
            const alertConfig = getAlertToneConfig(item.tone);
            const Icon = getAlertIcon(item.tone);

            return (
              <Link
                key={item.id}
                href={item.href || "/admin"}
                className={`group rounded-[24px] border p-3.5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-0.5 ${alertConfig.card}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${alertConfig.icon}`}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${alertConfig.badge}`}
                      >
                        {alertConfig.label}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">{item.time}</span>
                    </div>

                    <p className="mt-2.5 text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-5 text-slate-600">{item.description}</p>

                    <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      Review now
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FutureModuleCard({ item }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-0.5"
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-slate-200/50 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon size={18} />
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-slate-500">{item.label}</p>
            <div className="mt-3 h-1.5 w-14 rounded-full bg-sky-500" />
          </div>
          <p className="text-3xl font-semibold leading-none text-slate-950">0</p>
        </div>
      </div>
    </Link>
  );
}

function OverviewStatCard({ item, value }) {
  const Icon = item.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-slate-200 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${item.cardTone}`}
    >
      <div className={`pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full blur-2xl ${item.glowTone}`} />
      <div className="pointer-events-none absolute -left-5 bottom-0 h-16 w-16 rounded-full bg-white/70 blur-2xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconTone}`}>
            <Icon size={18} />
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium text-slate-500">{item.label}</p>
            <div className={`mt-3 h-1.5 w-14 rounded-full ${item.accentTone}`} />
          </div>
          <p className="text-3xl font-semibold leading-none text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewClient() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    stats: null,
    recentOrders: [],
    lowStockProducts: [],
    revenueSeries: [],
    orderStatusSeries: [],
    notificationFeed: [],
  });

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      try {
        const { data } = await api.get("/api/admin/overview");

        if (!ignore) {
          setState({
            loading: false,
            error: "",
            stats: data.stats,
            recentOrders: data.recentOrders || [],
            lowStockProducts: data.lowStockProducts || [],
            revenueSeries: data.revenueSeries || [],
            orderStatusSeries: data.orderStatusSeries || [],
            notificationFeed: data.notificationFeed || [],
          });
        }
      } catch (error) {
        if (!ignore) {
          setState((current) => ({
            ...current,
            loading: false,
            error: getApiErrorMessage(error, "Unable to load dashboard overview."),
          }));
        }
      }
    }

    loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        Loading dashboard overview...
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-[32px] border border-rose-100 bg-white p-6 text-sm font-medium text-rose-600 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
        {state.error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statConfig.map((item) => {
          const value = item.key === "revenue"
            ? formatPrice(state.stats?.[item.key] || 0)
            : state.stats?.[item.key] || 0;

          return <OverviewStatCard key={item.key} item={item} value={value} />;
        })}

        {ADMIN_FUTURE_NAV_ITEMS.map((item) => (
          <FutureModuleCard key={item.href} item={item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue Flow</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                Last 7 days sales overview
              </h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              7 day dashboard view
            </span>
          </div>
          <div className="mt-6">
            <RevenueAreaChart items={state.revenueSeries} />
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Order Mix</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                Fulfilment status breakdown
              </h3>
            </div>
            <PackageCheck className="text-slate-300" size={24} />
          </div>
          <div className="mt-6">
            <StatusDonut items={state.orderStatusSeries} />
          </div>
        </div>
      </section>

      <section>
        <OverviewAlerts
          items={state.notificationFeed}
          pendingOrders={state.stats?.pendingOrders || 0}
          lowStockCount={state.lowStockProducts.length}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Recent Orders</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">
                Latest commerce activity
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              View Orders
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            {state.recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No recent orders yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {state.recentOrders.map((order) => (
                  <div
                    key={order.orderNumber}
                    className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.customer?.name || "Guest"} • {order.items?.[0]?.name || "Order item"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "Date unavailable"}
                      </p>
                    </div>
                    <div className="lg:ml-auto flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {order.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatPrice(order.pricing?.total || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[32px] border border-amber-200 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_42%),linear-gradient(180deg,rgba(255,251,235,0.96)_0%,rgba(255,255,255,1)_100%)] p-6 shadow-[0_24px_60px_rgba(217,119,6,0.10)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                  <AlertTriangle size={22} />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-500">Inventory Alert</p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950">Low stock products</h3>
                </div>
              </div>
              <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                {state.lowStockProducts.length} flagged
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {state.lowStockProducts.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-amber-200 bg-white/70 px-5 py-10 text-center text-sm text-slate-500">
                  No low stock alert right now.
                </div>
              ) : (
                state.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-[22px] border border-amber-100 bg-white/92 px-4 py-3 shadow-[0_10px_24px_rgba(217,119,6,0.08)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.category} • {product.brand}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                        Stock {product.stock}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-amber-100">
                      <div
                        className="h-2 rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]"
                        style={{ width: `${Math.max(8, Math.min(100, Number(product.stock || 0) * 12))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.14),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.98)_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)]">
            <p className="text-sm font-medium text-slate-500">Quick Actions</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">Jump into key workflows</h3>
            <div className="mt-5 grid gap-3">
              <Link
                href="/admin/products"
                className="rounded-[22px] border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Add or update product catalog
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-[22px] border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Review pending orders and change status
              </Link>
              <Link
                href="/admin/users"
                className="rounded-[22px] border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Check newly registered users and roles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
