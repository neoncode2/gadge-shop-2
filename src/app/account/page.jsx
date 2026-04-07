import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import AccountReviewsList from "@/components/AccountReviewsList";
import { requireUser } from "@/lib/require-user";
import { ChevronRight, Package, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { findLatestOrderByUserId } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { findUserById } from "@/lib/users";
import { listWishlistProductsByUserId } from "@/lib/wishlists";
import { listReviewsByUserId } from "@/lib/reviews";
import Image from "next/image";

function formatMemberSince(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatOrderDate(dateValue) {
  if (!dateValue) return "-";

  return new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getOrderStatusStyles(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus.includes("deliver")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalizedStatus.includes("cancel")) {
    return "bg-rose-100 text-rose-700";
  }

  if (normalizedStatus.includes("confirm") || normalizedStatus.includes("process")) {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export default async function AccountPage() {
  const session = await requireUser("/account");
  const [latestOrder, user, wishlistPreview, reviewPreview] = await Promise.all([
    findLatestOrderByUserId(session.user.id),
    findUserById(session.user.id),
    listWishlistProductsByUserId(session.user.id, { limit: 3 }),
    listReviewsByUserId(session.user.id, { limit: 3 }),
  ]);
  const profile = user || session.user;
  const memberSince = formatMemberSince(user?.createdAt);
  const phoneNumber = latestOrder?.customer?.phone || "-";
  const latestItem = latestOrder?.items?.[0] || null;
  const orderDisplayId = latestOrder?.orderNumber
    ? latestOrder.orderNumber.slice(-4)
    : null;

  return (
    <div>
      <Header />
      <main className="mx-auto mt-9 grid w-[calc(100%-32px)] max-w-[1240px] grid-cols-1 items-start gap-4 lg:grid-cols-[214px_minmax(0,1fr)_224px]">
        <aside className="lg:sticky lg:top-[132px]">
          <AccountSidebar active="My Account" />
        </aside>

        <section className="space-y-3.5">
          <div className="rounded-[12px] border border-[#ececec] bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold text-[#111111]">My Order</h2>
              <Link
                href="/account/orders"
                className="inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#979797] px-4 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
              >
                View all
              </Link>
            </div>

            {latestOrder ? (
              <Link
                href={`/track-order?orderId=${encodeURIComponent(latestOrder.orderNumber)}`}
                className="mt-5 flex min-h-[92px] items-center gap-3 rounded-[12px] border border-[#eeeeee] bg-white px-3 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#7d7d7d]">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${getOrderStatusStyles(
                          latestOrder.status
                        )}`}
                      >
                        {latestOrder.status}
                      </span>
                      <span>{formatOrderDate(latestOrder.createdAt)}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[8px] bg-[#f6f6f6]">
                        {latestItem?.image ? (
                          <Image
                            src={latestItem.image}
                            alt={latestItem.name || "Product image"}
                            fill
                            className="object-contain p-1.5"
                            sizes="54px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package size={22} className="text-[#1f1f1f]" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#111111]">
                          Order ID: {orderDisplayId || latestOrder.orderNumber}
                        </p>
                        <p className="truncate text-[11px] text-[#666666]">
                          {latestItem?.name || "Ordered product"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-bold text-[#111111]">
                          {formatPrice(latestOrder.pricing?.total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={18} className="shrink-0 text-[#779167]" />
                </div>
              </Link>
            ) : (
              <div className="mt-5 rounded-[12px] border border-dashed border-[#d8d8d8] bg-[#fafafa] px-4 py-7 text-center text-[13px] text-[#666666]">
                You do not have any order yet.
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[#ececec] bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold text-[#111111]">My Wishlists</h2>
              <Link
                href={wishlistPreview.length > 0 ? "/account/wishlists" : "/products"}
                className="inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#979797] px-4 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
              >
                {wishlistPreview.length > 0 ? "View all" : "Add Wishlist"}
              </Link>
            </div>

            {wishlistPreview.length > 0 ? (
              <div className="mt-4 space-y-3">
                {wishlistPreview.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="product-card-accent-hover flex items-center gap-3 rounded-[12px] border border-[#eeeeee] px-3 py-3 transition-all hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)]"
                  >
                    <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] bg-[#f7f7f7]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="52px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#111111]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#666666]">{product.brand}</p>
                    </div>
                    <p className="product-card-accent-text text-[12px] font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                id="wishlists"
                className="flex min-h-[150px] flex-col items-center justify-center rounded-[12px] px-4 text-center"
              >
                <div className="relative flex h-14 w-14 items-center justify-center text-[#e5e9f2]">
                  <ShoppingBag size={42} strokeWidth={1.5} />
                  <span className="absolute bottom-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#d8e0ef] text-[10px] font-bold text-white">
                    +
                  </span>
                </div>
                <p className="mt-4 text-[18px] font-semibold text-[#111111]">
                  Your Wish List is Empty!
                </p>
              </div>
            )}
          </div>

          <div className="rounded-[12px] border border-[#ececec] bg-white p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold text-[#111111]">My Reviews</h2>
                <p className="mt-1 text-[12px] text-[#666666]">
                  Reviews you have submitted from your account.
                </p>
              </div>
              <Link
                href="/account/reviews"
                className="inline-flex min-h-9 items-center justify-center rounded-[6px] border border-[#979797] px-4 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
              >
                View all
              </Link>
            </div>

            <AccountReviewsList
              reviews={reviewPreview}
              compact
              emptyTitle="You have not submitted any review yet."
              emptyDescription="Open a product page and share your experience. Your latest reviews will appear here."
            />
          </div>
        </section>

        <div className="rounded-[12px] border border-[#ececec] bg-white px-4 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
          <div className="mx-auto flex h-[112px] w-[112px] items-end justify-center rounded-full bg-black">
            <div className="mb-2 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-black bg-white">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile?.name || "Profile image"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <UserRound size={36} strokeWidth={1.8} className="text-[#333333]" />
              )}
            </div>
          </div>

          <div className="mt-7 space-y-1.5 text-[13px] leading-5 text-[#4a4a4a]">
            <p className="font-semibold text-[#111111]">
              Name: <span>{profile?.name || "Account User"}</span>
            </p>
            <p>Phone No: {phoneNumber}</p>
            <p className="break-words">Email: {profile?.email || "-"}</p>
            <p>Member Since: {memberSince}</p>
          </div>

          <Link
            href="/account/settings"
            className="mx-auto mt-5 inline-flex min-h-9 min-w-[84px] items-center justify-center rounded-[6px] border border-[#8f8f8f] px-4 text-[12px] font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
          >
            Edit
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
