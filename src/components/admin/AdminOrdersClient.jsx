"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  CreditCard,
  MapPin,
  Package2,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";

function formatDateTime(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusToneClasses(status) {
  if (status === "Delivered") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "Confirmed" || status === "In Process") {
    return "bg-sky-50 text-sky-700 ring-sky-100";
  }

  if (status === "Cancelled") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  return "bg-amber-50 text-amber-700 ring-amber-100";
}

function getTextValue(value, fallback = "Not provided") {
  return String(value || "").trim() || fallback;
}

function buildDraft(order, currentDraft = {}) {
  return {
    status: currentDraft.status || order.status || "Pending",
    note: currentDraft.note || "",
    location: currentDraft.location || "Admin Dashboard",
  };
}

function DetailRow({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function OrderListCard({ order, active, onSelect }) {
  const primaryItem = order.items?.[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(order.orderNumber)}
      className={`w-full rounded-[26px] border p-3.5 text-left transition-all ${
        active
          ? "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.96)_0%,rgba(255,255,255,1)_100%)] shadow-[0_18px_36px_rgba(14,165,233,0.10)]"
          : "border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            active
              ? "bg-sky-100 text-sky-700 ring-1 ring-sky-200"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          <Truck size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {order.orderNumber}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${getStatusToneClasses(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-700">
            {primaryItem?.name || "No item"} • {formatPrice(order.pricing?.total || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {order.customer?.name || "Guest"} • {order.customer?.phone || "N/A"}
          </p>
        </div>
      </div>
    </button>
  );
}

function OrderDetailsPanel({
  order,
  draft,
  statuses,
  onUpdateDraft,
  onUpdateStatus,
  savingOrderNumber,
}) {
  const primaryItem = order.items?.[0];

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-start">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Truck size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">{order.orderNumber}</p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${getStatusToneClasses(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {getTextValue(order.source, "Online")}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {primaryItem?.name || "No item"} • {formatPrice(order.pricing?.total || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {order.customer?.name || "Guest"} • {order.customer?.phone || "N/A"} •{" "}
                {getTextValue(order.userEmail, "No email")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:ml-auto xl:min-w-[430px]">
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ordered
            </p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Items
            </p>
            <p className="mt-2 text-sm font-medium text-slate-800">{order.itemCount || 0} pcs</p>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Payment
            </p>
            <p className="mt-2 text-sm font-medium text-slate-800">
              {getTextValue(order.payment?.method, "Not set")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 2xl:grid-cols-[1.06fr_0.94fr]">
        <div className="space-y-4">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Package2 size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Ordered items</p>
                <p className="text-xs text-slate-500">Products included in this order</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(order.items || []).length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No order items found.
                </div>
              ) : (
                (order.items || []).map((item) => (
                  <div
                    key={`${order.orderNumber}-${item.id}`}
                    className="flex flex-col gap-3 rounded-[22px] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <img
                      src={item.image || "/images/product.webp"}
                      alt={item.name || "Product image"}
                      className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.name || "Unnamed product"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {getTextValue(item.category, "No category")} •{" "}
                        {getTextValue(item.brand, "No brand")}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          Qty {Number(item.qty || 0)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          Price {formatPrice(item.price || 0)}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          Old {formatPrice(item.oldPrice || item.price || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formatPrice(Number(item.price || 0) * Number(item.qty || 0))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="grid gap-4">
            <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <UserRound size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Customer details</p>
                  <p className="text-xs text-slate-500">Contact and delivery information</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailRow label="Name" value={getTextValue(order.customer?.name, "Guest customer")} />
                <DetailRow label="Phone" value={getTextValue(order.customer?.phone, "No phone")} />
                <DetailRow label="Email" value={getTextValue(order.userEmail, "No email")} />
                <DetailRow label="District" value={getTextValue(order.customer?.district, "No district")} />
                <DetailRow
                  label="Address"
                  value={getTextValue(order.customer?.address, "No address")}
                  className="sm:col-span-2"
                />
                <DetailRow
                  label="Customer Note"
                  value={getTextValue(order.customer?.note, "No note")}
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Order snapshot</p>
                  <p className="text-xs text-slate-500">Reference and tracking metadata</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailRow label="Record ID" value={getTextValue(order.id, "Not available")} />
                <DetailRow label="Lookup Key" value={getTextValue(order.lookupKey, "Not available")} />
                <DetailRow label="Source" value={getTextValue(order.source, "cart")} />
                <DetailRow label="User ID" value={getTextValue(order.userId, "Guest")} />
                <DetailRow
                  label="Created At"
                  value={formatDateTime(order.createdAt)}
                  className="sm:col-span-2"
                />
                <DetailRow
                  label="Updated At"
                  value={formatDateTime(order.updatedAt)}
                  className="sm:col-span-2"
                />
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <CreditCard size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Payment and pricing</p>
                <p className="text-xs text-slate-500">Billing method and amount breakdown</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailRow
                label="Payment Method"
                value={getTextValue(order.payment?.method, "Not provided")}
              />
              <DetailRow
                label="Payment Type"
                value={getTextValue(order.payment?.type, "Not provided")}
              />
              <DetailRow
                label="Sender Number"
                value={getTextValue(order.payment?.senderNumber, "Not provided")}
              />
              <DetailRow
                label="Transaction ID"
                value={getTextValue(order.payment?.transactionId, "Not provided")}
              />
            </div>

            <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(order.pricing?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Original Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(order.pricing?.originalSubtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Item Discount</span>
                  <span className="font-semibold text-emerald-700">
                    {formatPrice(order.pricing?.itemDiscount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Offer Amount</span>
                  <span className="font-semibold text-emerald-700">
                    {formatPrice(order.pricing?.offerAmount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(order.pricing?.deliveryFee || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-[18px] border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-semibold">
                  {formatPrice(order.pricing?.total || 0)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <Clock3 size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Order timeline</p>
                <p className="text-xs text-slate-500">Status history and admin actions</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(order.timeline || []).length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No timeline activity available.
                </div>
              ) : (
                order.timeline.map((entry) => (
                  <div
                    key={`${order.orderNumber}-${entry.id}`}
                    className="rounded-[20px] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${getStatusToneClasses(
                            entry.title
                          )}`}
                        >
                          {entry.title}
                        </span>
                        <span className="text-xs text-slate-400">{entry.location}</span>
                      </div>
                      <span className="text-xs text-slate-400">{formatDateTime(entry.at)}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {getTextValue(entry.note, "No timeline note")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                <MapPin size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Update order status</p>
                <p className="text-xs text-slate-500">Add a note and location for the timeline</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <select
                value={draft.status}
                onChange={(event) => onUpdateDraft(order, "status", event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              >
                {statuses.filter((status) => status !== "All").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                value={draft.note}
                onChange={(event) => onUpdateDraft(order, "note", event.target.value)}
                placeholder="Update note"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
              <input
                value={draft.location}
                onChange={(event) => onUpdateDraft(order, "location", event.target.value)}
                placeholder="Location"
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => onUpdateStatus(order)}
                disabled={savingOrderNumber === order.orderNumber}
                className="h-11 rounded-2xl bg-black px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingOrderNumber === order.orderNumber ? "Saving..." : "Update Order"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [activeStatus, setActiveStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingOrderNumber, setSavingOrderNumber] = useState("");
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [activeOrderNumber, setActiveOrderNumber] = useState("");

  const loadOrders = async (status = activeStatus, searchValue = search) => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();
      if (status && status !== "All") query.set("status", status);
      if (searchValue.trim()) query.set("search", searchValue.trim());
      const { data } = await api.get(`/api/admin/orders${query.toString() ? `?${query.toString()}` : ""}`);
      const nextOrders = data.orders || [];

      setOrders(nextOrders);
      setStatuses(["All", ...(data.statuses || [])]);
      setActiveOrderNumber((current) =>
        nextOrders.some((order) => order.orderNumber === current)
          ? current
          : nextOrders[0]?.orderNumber || ""
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders("All", "");
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadOrders(activeStatus, search);
  };

  const updateDraft = (order, field, value) => {
    setDrafts((current) => ({
      ...current,
      [order.orderNumber]: {
        ...buildDraft(order, current[order.orderNumber]),
        [field]: value,
      },
    }));
  };

  const handleUpdateStatus = async (order) => {
    const draft = buildDraft(order, drafts[order.orderNumber]);

    setSavingOrderNumber(order.orderNumber);
    setError("");

    try {
      await api.patch(`/api/admin/orders/${encodeURIComponent(order.orderNumber)}`, draft);

      await loadOrders(activeStatus, search);
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, "Unable to update order."));
    } finally {
      setSavingOrderNumber("");
    }
  };

  const activeOrder = orders.find((order) => order.orderNumber === activeOrderNumber) || orders[0] || null;
  const activeDraft = activeOrder ? buildDraft(activeOrder, drafts[activeOrder.orderNumber]) : null;

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Order Control</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Manage customer orders</h2>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full max-w-xl items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, phone..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button className="rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
            Search
          </button>
        </form>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => {
              setActiveStatus(status);
              loadOrders(status, search);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeStatus === status
                ? "bg-black text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="rounded-[22px] border border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[22px] border border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
            No orders found.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderListCard
                  key={order.orderNumber}
                  order={order}
                  active={activeOrder?.orderNumber === order.orderNumber}
                  onSelect={setActiveOrderNumber}
                />
              ))}
            </div>

            {activeOrder && activeDraft ? (
              <OrderDetailsPanel
                order={activeOrder}
                draft={activeDraft}
                statuses={statuses}
                onUpdateDraft={updateDraft}
                onUpdateStatus={handleUpdateStatus}
                savingOrderNumber={savingOrderNumber}
              />
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
                Select an order to view full details.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
