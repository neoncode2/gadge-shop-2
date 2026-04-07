import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { ArrowRight, Search } from "lucide-react";
import { findOrderByOrderNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export default async function TrackOrderPage({ searchParams }) {
  const params = await searchParams;
  const rawOrderId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;
  const orderId = String(rawOrderId || "").trim();
  const order = orderId ? await findOrderByOrderNumber(orderId) : null;
  const statuses = order?.timeline || [];
  const leadItem = order?.items?.[0];

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 w-[calc(100%-18px)] max-w-[1280px]">
        <section className="overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-6 px-6 py-5 sm:px-8 md:flex-row md:items-center md:justify-between md:px-10 md:py-6">
            <form className="flex h-[46px] w-full max-w-[280px] items-center justify-between rounded-[4px] border-2 border-slate-900 bg-white px-3">
              <input
                name="orderId"
                type="text"
                placeholder="Search Order ID"
                defaultValue={orderId}
                className="w-full bg-transparent pr-3 text-[15px] text-ink-700 outline-none placeholder:text-[#9b825b]"
              />
              <button type="submit" aria-label="Search order">
                <Search size={26} strokeWidth={2.2} className="text-slate-900" />
              </button>
            </form>

            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 text-[18px] font-semibold text-ink-900"
            >
              <span>View Your Orders</span>
              <ArrowRight size={23} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="px-6 pb-5 pt-6 text-center sm:px-8 md:px-10 md:pb-6 md:pt-7">
            <h1 className="text-[28px] font-semibold leading-none text-ink-900">
              {order ? `Order ${order.orderNumber}` : "Track Your Order"}
            </h1>
            <p className="mt-1.5 text-[15px] font-medium text-[#ff5d33]">
              {order ? order.status : orderId ? "Order not found" : "Search by order ID"}
            </p>
          </div>

          <div className="border-t border-slate-300 px-5 py-8 sm:px-8 md:px-10 md:py-10">
            {!orderId && (
              <div className="rounded-[18px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-ink-500">
                Order ID দিয়ে search করলে এখানে tracking details দেখাবে।
              </div>
            )}

            {orderId && !order && (
              <div className="rounded-[18px] border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-ink-500">
                এই order ID-এর জন্য কোনো order পাওয়া যায়নি।
              </div>
            )}

            {order && (
              <div className="mx-auto max-w-[860px] space-y-8">
                <div className="grid gap-4 rounded-[18px] bg-slate-50 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex items-center gap-4">
                    {leadItem?.image && (
                      <div className="flex h-20 w-20 items-center justify-center rounded-[12px] border border-slate-200 bg-white p-2">
                        <Image
                          src={leadItem.image}
                          alt={leadItem.name}
                          width={72}
                          height={72}
                          className="h-auto w-auto max-h-[64px] max-w-[64px] object-contain"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-400">Current Order</p>
                      <h2 className="mt-1 text-[22px] font-semibold text-ink-900">
                        {leadItem?.name || "Order Item"}
                      </h2>
                      <p className="mt-1 text-sm text-ink-500">
                        {order.itemCount} item{order.itemCount === 1 ? "" : "s"} • {formatPrice(order.pricing?.total || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-ink-400">Customer</p>
                    <p className="text-sm font-semibold text-ink-900">{order.customer?.name || "N/A"}</p>
                    <p className="text-sm text-ink-500">{order.customer?.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  {statuses.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[92px_42px_1fr] gap-3 sm:grid-cols-[120px_52px_1fr] sm:gap-5 md:grid-cols-[1fr_64px_1fr] md:gap-7"
                    >
                      <div className="pt-2 text-right">
                        <p className="text-[17px] leading-[1.18] text-[#b1b1ba]">{item.date}</p>
                        <p className="mt-1 text-[20px] font-semibold leading-[1.2] text-ink-900">
                          {item.time}
                        </p>
                      </div>

                      <div className="relative flex justify-center">
                        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-900" />
                        <span className="relative z-10 mt-2 h-[18px] w-[18px] rounded-full border-[2.5px] border-slate-900 bg-white" />
                        {index === statuses.length - 1 && (
                          <span className="absolute bottom-0 left-1/2 h-4 w-[3px] -translate-x-1/2 bg-white" />
                        )}
                      </div>

                      <div className="pb-1 pt-1">
                        <h2 className="text-[18px] font-semibold leading-[1.2] text-ink-900">
                          Status: {item.title}
                        </h2>
                        <p className="mt-1 text-[15px] leading-none text-ink-900">{item.location}</p>
                        {item.note && (
                          <p className="mt-2 text-[14px] text-ink-500">{item.note}</p>
                        )}
                        <p className="mt-3 text-[15px] text-[#d0d0d7]">Order ID : {item.orderId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
