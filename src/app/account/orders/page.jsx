import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import { requireUser } from "@/lib/require-user";
import { Truck } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUS_TABS, findOrdersByUserId } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export default async function OrdersPage({ searchParams }) {
  const session = await requireUser("/account/orders");
  const params = await searchParams;
  const rawStatus = Array.isArray(params?.status) ? params.status[0] : params?.status;
  const activeStatus = ORDER_STATUS_TABS.includes(rawStatus) ? rawStatus : "All";
  const orders = await findOrdersByUserId(session.user.id, activeStatus);

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 grid w-[calc(100%-32px)] max-w-[1240px] grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <AccountSidebar active="My Orders" />
        <div>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_TABS.map((tab) => (
              <Link
                key={tab}
                href={tab === "All" ? "/account/orders" : `/account/orders?status=${encodeURIComponent(tab)}`}
                className={`rounded-full px-4 py-2 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${
                  activeStatus === tab ? "bg-black text-white" : "bg-white text-ink-700"
                }`}
              >
                {tab}
              </Link>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-[22px] bg-white p-6 text-sm text-ink-500 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
                কোনো order পাওয়া যায়নি।
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.orderNumber}
                  className="flex flex-col gap-4 rounded-[22px] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                    <Truck size={18} className="text-brand-700" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("en-BD", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Date not available"}
                    </p>
                    <p className="text-sm font-semibold">Order ID: {order.orderNumber}</p>
                    <p className="text-xs text-ink-500">
                      {order.items?.[0]?.name || "No product details"}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-ink-700">
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatPrice(order.pricing?.total || 0)}
                    </span>
                    <Link
                      href={`/track-order?orderId=${encodeURIComponent(order.orderNumber)}`}
                      className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                    >
                      Track
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
