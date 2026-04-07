"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Copy, MapPin, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { bangladeshDistricts } from "@/data/districts";
import { products } from "@/data/products";
import api, { getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { trackMetaPixelEvent } from "@/lib/meta-pixel-client";

const paymentOptions = [
  {
    id: "Cash on Delivery",
    label: "Cash on Delivery",
    image: "/images/cod_logo_200px.png",
    type: "offline",
  },
  {
    id: "bKash",
    label: "Bkash",
    image: "/images/bkash-logo-200px.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Bkash Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
  {
    id: "Binance",
    label: "Binance",
    image: "/images/binance.png",
    type: "other",
  },
  {
    id: "Nagad",
    label: "Nagad",
    image: "/images/nagad_logo_200px.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Nagad Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
  {
    id: "Rocket",
    label: "Rocket",
    image: "/images/rocket_200px.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Rocket Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
  {
    id: "Pay with Online",
    label: "Pay with Online",
    image: "/images/sslcommerz_logo_200px.png",
    type: "other",
  },
  {
    id: "Upay",
    label: "Upay",
    image: "/images/upay.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Upay Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
  {
    id: "Pay Station",
    label: "Pay Station",
    image: "/images/paystation-24.png",
    type: "other",
  },
  {
    id: "EPS",
    label: "EPS",
    image: "/images/credit-cards.jpeg",
    type: "other",
  },
  {
    id: "Zini Pay",
    label: "Zini Pay",
    image: "/images/zinipay.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Zini Pay Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
  {
    id: "Shurjo Pay",
    label: "Shurjo Pay",
    image: "/images/shurjopay.png",
    type: "mobile_banking",
    accountNumber: "01773253900",
    numberLabel: "Shurjo Pay Number",
    numberPlaceholder: "017XXXXXXXX*",
  },
];

function SelectedBadge({ active }) {
  if (!active) return null;

  return (
    <span className="absolute left-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0d7b43] text-white">
      <Check size={11} strokeWidth={3} />
    </span>
  );
}

function createCheckoutItem(item, fullProduct, qty = item.qty || 1) {
  return {
    ...item,
    qty,
    details: fullProduct,
    strapSize: fullProduct?.strapSizes?.[0] || item.strapSizes?.[0] || "Standard",
    color: fullProduct?.colors?.[1] || fullProduct?.colors?.[0] || item.colors?.[0] || "Default",
    originalPrice: fullProduct?.oldPrice || item.oldPrice || item.price,
  };
}

function applyAddressToCustomer(current, address, { force = false } = {}) {
  if (!address) return current;

  return {
    ...current,
    name: force || !current.name ? address.name || "" : current.name,
    phone: force || !current.phone ? address.phone || "" : current.phone,
    district: force || !current.district ? address.district || "" : current.district,
    address: force || !current.address ? address.address || "" : current.address,
    note: force || !current.note ? address.note || "" : current.note,
  };
}

function buildMetaPixelCommercePayload(items = [], total = 0, extra = {}) {
  return {
    currency: "BDT",
    value: Number(total || 0),
    content_type: "product",
    content_ids: items.map((item) => String(item?.id || "")),
    num_items: items.reduce((sum, item) => sum + Math.max(1, Number(item?.qty || 1)), 0),
    contents: items.map((item) => ({
      id: String(item?.id || ""),
      quantity: Math.max(1, Number(item?.qty || 1)),
      item_price: Number(item?.price || 0),
    })),
    ...extra,
  };
}

function CheckoutPageFallback() {
  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px]">
        <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-sm text-ink-500">
          Loading checkout...
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CheckoutPageContent() {
  const { items, updateQty, removeItem, clear } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState("Cash on Delivery");
  const [copiedMethod, setCopiedMethod] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    district: "",
    address: "",
    note: "",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    senderNumber: "",
    transactionId: "",
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [isLoadingSavedAddress, setIsLoadingSavedAddress] = useState(true);
  const [directCheckoutQty, setDirectCheckoutQty] = useState(1);
  const [isDirectCheckoutRemoved, setIsDirectCheckoutRemoved] = useState(false);
  const [directCheckoutProduct, setDirectCheckoutProduct] = useState(null);
  const [isLoadingDirectCheckoutProduct, setIsLoadingDirectCheckoutProduct] = useState(false);
  const [directCheckoutLoadError, setDirectCheckoutLoadError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const hasTrackedInitiateCheckoutRef = useRef(false);
  const directCheckoutProductId = searchParams.get("product") || "";
  const hasDirectCheckoutParam = Boolean(directCheckoutProductId);

  useEffect(() => {
    setDirectCheckoutQty(1);
    setIsDirectCheckoutRemoved(false);
  }, [directCheckoutProductId]);

  useEffect(() => {
    hasTrackedInitiateCheckoutRef.current = false;
  }, [directCheckoutProductId, hasDirectCheckoutParam]);

  useEffect(() => {
    let ignore = false;

    api.get("/api/account/address")
      .then(({ data }) => {
        if (ignore) return;

        const nextAddress = data?.address || null;
        setSavedAddress(nextAddress);

        if (nextAddress) {
          setCustomer((current) => {
            const hasTypedAddress =
              current.name || current.phone || current.district || current.address || current.note;

            if (hasTypedAddress) {
              return current;
            }

            return applyAddressToCustomer(current, nextAddress, { force: true });
          });
        }
      })
      .catch((error) => {
        if (ignore) return;

        if (error?.response?.status !== 401) {
          setSavedAddress(null);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingSavedAddress(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    if (!hasDirectCheckoutParam) {
      setDirectCheckoutProduct(null);
      setDirectCheckoutLoadError("");
      setIsLoadingDirectCheckoutProduct(false);
      return undefined;
    }

    setIsLoadingDirectCheckoutProduct(true);
    setDirectCheckoutLoadError("");

    api.get(`/api/products/${encodeURIComponent(directCheckoutProductId)}`)
      .then(({ data }) => {
        if (!ignore) {
          setDirectCheckoutProduct(data.product || null);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDirectCheckoutProduct(null);
          setDirectCheckoutLoadError(getApiErrorMessage(error, "Unable to load selected product."));
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingDirectCheckoutProduct(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [directCheckoutProductId, hasDirectCheckoutParam]);

  const cartCheckoutItems = items.map((item) => {
    const fullProduct = products.find((product) => product.id === item.id) || item;

    return createCheckoutItem(item, fullProduct, item.qty);
  });
  const directCheckoutItem = directCheckoutProduct
    ? createCheckoutItem(
        {
          id: directCheckoutProduct.id,
          name: directCheckoutProduct.name,
          price: directCheckoutProduct.price,
          image: directCheckoutProduct.image,
        },
        directCheckoutProduct,
        directCheckoutQty
      )
    : null;
  const isDirectCheckout = hasDirectCheckoutParam && Boolean(directCheckoutItem) && !isDirectCheckoutRemoved;
  const checkoutItems = hasDirectCheckoutParam
    ? (isDirectCheckout && directCheckoutItem ? [directCheckoutItem] : [])
    : cartCheckoutItems;

  const itemCount = checkoutItems.reduce((sum, item) => sum + item.qty, 0);
  const currentSubtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const originalSubtotal = checkoutItems.reduce((sum, item) => sum + item.originalPrice * item.qty, 0);
  const itemDiscount = Math.max(0, originalSubtotal - currentSubtotal);
  const isOnlinePayment = method !== "Cash on Delivery";
  const selectedPayment = paymentOptions.find((option) => option.id === method) || paymentOptions[0];
  const showMobileBankingPanel = selectedPayment.type === "mobile_banking";
  const newRegistrationOffer = checkoutItems.length > 0 && !isOnlinePayment ? 200 : 0;
  const onlinePaymentOffer = checkoutItems.length > 0 && isOnlinePayment ? Math.round(currentSubtotal * 0.1) : 0;
  const activeOffer = newRegistrationOffer || onlinePaymentOffer;
  const deliveryFee = 0;
  const total = Math.max(0, currentSubtotal - activeOffer + deliveryFee);
  const backLinkHref = hasDirectCheckoutParam
    ? (directCheckoutProduct ? `/product/${directCheckoutProduct.id}` : "/products")
    : "/cart";
  const backLinkLabel = hasDirectCheckoutParam ? "পণ্যে ফিরে যান" : "কার্টে ফিরে যান";
  const emptyMessage = hasDirectCheckoutParam
    ? (isLoadingDirectCheckoutProduct
        ? "নির্বাচিত product loading হচ্ছে..."
        : directCheckoutLoadError || "এই direct checkout-এর জন্য কোনো প্রোডাক্ট পাওয়া যায়নি।")
    : "আপনার কার্টে কোনো পণ্য নেই।";
  const isOrderButtonDisabled =
    checkoutItems.length === 0 || isLoadingDirectCheckoutProduct || isSubmittingOrder;

  useEffect(() => {
    if (hasTrackedInitiateCheckoutRef.current) return;
    if (isLoadingDirectCheckoutProduct || checkoutItems.length === 0) return;

    hasTrackedInitiateCheckoutRef.current = true;

    void trackMetaPixelEvent(
      "InitiateCheckout",
      buildMetaPixelCommercePayload(checkoutItems, total, {
        source: hasDirectCheckoutParam ? "direct" : "cart",
      })
    );
  }, [checkoutItems, hasDirectCheckoutParam, isLoadingDirectCheckoutProduct, total]);

  const handleCopyNumber = async () => {
    if (!selectedPayment.accountNumber || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedPayment.accountNumber);
      setCopiedMethod(selectedPayment.id);
    } catch {
      setCopiedMethod("");
    }
  };

  const updateCustomerField = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePaymentField = (field, value) => {
    setPaymentDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleQtyChange = (itemId, qty) => {
    if (isDirectCheckout && directCheckoutItem?.id === itemId) {
      setDirectCheckoutQty(Math.max(1, qty));
      return;
    }

    updateQty(itemId, qty);
  };

  const handleRemoveCheckoutItem = (itemId) => {
    if (isDirectCheckout && directCheckoutItem?.id === itemId) {
      setIsDirectCheckoutRemoved(true);
      return;
    }

    removeItem(itemId);
  };

  const handlePlaceOrder = async () => {
    setOrderError("");

    if (checkoutItems.length === 0) {
      setOrderError("অর্ডার করার জন্য অন্তত একটি product দরকার।");
      return;
    }

    if (!customer.name || !customer.phone || !customer.district || !customer.address) {
      setOrderError("নাম, ফোন, জেলা এবং সম্পূর্ণ ঠিকানা দিন।");
      return;
    }

    if (
      showMobileBankingPanel &&
      (!paymentDetails.senderNumber || !paymentDetails.transactionId)
    ) {
      setOrderError("Mobile banking payment-এর জন্য number এবং transaction ID দিন।");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const { data } = await api.post("/api/orders", {
        customer,
        items: checkoutItems.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
        payment: {
          method,
          senderNumber: paymentDetails.senderNumber,
          transactionId: paymentDetails.transactionId,
        },
        pricing: {
          offerAmount: activeOffer,
          deliveryFee,
        },
        source: hasDirectCheckoutParam ? "direct" : "cart",
      });

      await trackMetaPixelEvent(
        "Purchase",
        buildMetaPixelCommercePayload(
          Array.isArray(data?.order?.items) && data.order.items.length ? data.order.items : checkoutItems,
          Number(data?.order?.pricing?.total ?? total),
          {
            order_id: data?.order?.orderNumber || "",
            payment_method: method,
            source: hasDirectCheckoutParam ? "direct" : "cart",
          }
        )
      );

      if (!hasDirectCheckoutParam) {
        clear();
      }

      router.push(data.redirectTo || "/track-order");
      router.refresh();
    } catch (error) {
      setOrderError(getApiErrorMessage(error, "Unable to place your order right now."));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.55fr)_320px]">
          <section>
            <h1 className="text-[18px] font-semibold text-ink-900">ডেলিভারি ঠিকানা</h1>

            {isLoadingSavedAddress ? (
              <div className="mt-4 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-500">
                আপনার saved address check করা হচ্ছে...
              </div>
            ) : savedAddress ? (
              <div className="mt-4 rounded-[12px] border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 shadow-[0_6px_18px_rgba(16,185,129,0.12)]">
                      <MapPin size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">Saved delivery address found</p>
                      <p className="mt-1 text-sm text-ink-700">
                        {savedAddress.name} · {savedAddress.phone}
                      </p>
                      <p className="mt-1 text-sm text-ink-600">
                        {savedAddress.district}, {savedAddress.address}
                      </p>
                      {savedAddress.note ? (
                        <p className="mt-1 text-xs text-ink-500">Note: {savedAddress.note}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomer((current) =>
                          applyAddressToCustomer(current, savedAddress, { force: true })
                        )
                      }
                      className="inline-flex min-h-10 items-center justify-center rounded-[8px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-[#111111]"
                    >
                      Use saved address
                    </button>
                    <Link
                      href="/account/address"
                      className="inline-flex min-h-10 items-center justify-center rounded-[8px] border border-[#979797] px-4 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f7f7f7]"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[8px] border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-ink-500">
                Account-এ saved address নেই। চাইলে আগে{" "}
                <Link href="/account/address" className="font-semibold text-ink-800 underline">
                  My Address
                </Link>{" "}
                থেকে save করে নিতে পারো।
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_210px]">
              <input
                value={customer.name}
                onChange={(event) => updateCustomerField("name", event.target.value)}
                className="h-[42px] rounded-[2px] border border-slate-200 px-3 text-[14px] text-ink-800 outline-none placeholder:text-ink-400"
                placeholder="আপনার নাম *"
              />
              <input
                value={customer.phone}
                onChange={(event) => updateCustomerField("phone", event.target.value)}
                className="h-[42px] rounded-[2px] border border-slate-200 px-3 text-[14px] text-ink-800 outline-none placeholder:text-ink-400"
                placeholder="আপনার মোবাইল নম্বর দিন *"
              />
              <div className="relative">
                <select
                  value={customer.district}
                  onChange={(event) => updateCustomerField("district", event.target.value)}
                  className="h-[42px] w-full appearance-none rounded-[2px] border border-slate-200 bg-white px-3 pr-9 text-[14px] text-ink-700 outline-none"
                >
                  <option value="">জেলা নির্বাচন করুন</option>
                  {bangladeshDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
                />
              </div>
            </div>

            <textarea
              value={customer.address}
              onChange={(event) => updateCustomerField("address", event.target.value)}
              className="mt-4 h-[86px] w-full resize-none rounded-[2px] border border-slate-200 px-3 py-3 text-[14px] text-ink-800 outline-none placeholder:text-ink-400"
              placeholder="সম্পূর্ণ ঠিকানা *"
            />

            <textarea
              value={customer.note}
              onChange={(event) => updateCustomerField("note", event.target.value)}
              className="mt-4 h-[42px] w-full resize-none rounded-[2px] border border-slate-200 px-3 py-3 text-[14px] text-ink-800 outline-none placeholder:text-ink-400"
              placeholder="আপনার অর্ডার নোট লিখুন"
            />

            <h2 className="mt-6 text-[18px] font-semibold text-ink-900">
              একটি পেমেন্ট অপশন নির্বাচন করুন
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {paymentOptions.map((option) => {
                const active = method === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setMethod(option.id);
                      setCopiedMethod("");
                    }}
                    className={`relative flex h-[92px] flex-col items-center justify-center rounded-[2px] border bg-white px-3 text-center transition-colors ${
                      active
                        ? "border-[#39a66b] bg-[#f3fff7]"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <SelectedBadge active={active} />
                    <Image
                      src={option.image}
                      alt={option.label}
                      width={118}
                      height={38}
                      className="h-auto max-h-[34px] w-auto max-w-[118px] object-contain"
                      sizes="118px"
                    />
                    <span className="mt-2 text-[13px] font-semibold text-ink-700">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {showMobileBankingPanel && (
              <div className="mt-6 rounded-[2px] bg-[#ededed] p-5">
                <div className="flex flex-wrap items-center gap-3 border border-white bg-transparent px-4 py-4">
                  <Image
                    src={selectedPayment.image}
                    alt={selectedPayment.label}
                    width={78}
                    height={28}
                    className="h-auto max-h-[28px] w-auto max-w-[78px] object-contain"
                    sizes="78px"
                  />
                  <span className="text-[17px] font-semibold text-ink-900">
                    {selectedPayment.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="inline-flex items-center justify-center text-[#b61b1b]"
                    aria-label={`Copy ${selectedPayment.label} number`}
                  >
                    <Copy size={25} strokeWidth={2} />
                  </button>
                  {copiedMethod === selectedPayment.id && (
                    <span className="text-sm font-medium text-[#0d7b43]">Copied</span>
                  )}
                </div>

                <h3 className="mt-6 text-[18px] font-semibold text-ink-900">Payment Instructions</h3>

                <ol className="mt-6 space-y-1 text-[15px] font-medium leading-8 text-ink-900">
                  <li>1. Sent Money to {selectedPayment.accountNumber} personal number</li>
                  <li>2. Enter the Transaction ID of your successful transaction</li>
                  <li>3. Enter the phone number</li>
                  <li>4. Place your order</li>
                </ol>

                <p className="mt-6 max-w-[720px] text-[15px] leading-7 text-[#df2e26]">
                  Note: We will check your payment within 6-12 hours and confirm your order. If your
                  information is wrong your order will be canceled.
                </p>

                <div className="mt-7 space-y-5">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[110px_1fr] md:items-center">
                    <label className="text-[15px] text-ink-900">{selectedPayment.numberLabel}:</label>
                    <input
                      value={paymentDetails.senderNumber}
                      onChange={(event) => updatePaymentField("senderNumber", event.target.value)}
                      className="h-[42px] rounded-[4px] border border-slate-200 bg-white px-4 text-[15px] text-ink-800 outline-none placeholder:text-ink-500"
                      placeholder={selectedPayment.numberPlaceholder}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[110px_1fr] md:items-center">
                    <label className="text-[15px] text-ink-900">Transaction ID:</label>
                    <input
                      value={paymentDetails.transactionId}
                      onChange={(event) => updatePaymentField("transactionId", event.target.value)}
                      className="h-[42px] rounded-[4px] border border-slate-200 bg-white px-4 text-[15px] text-ink-800 outline-none placeholder:text-ink-500"
                      placeholder="Transaction Id *"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside>
            <h2 className="text-[18px] font-semibold text-ink-900">অর্ডার আইটেম ({itemCount} Items)</h2>

            <div className="mt-5 rounded-[2px] border border-slate-200 bg-white p-3">
              {checkoutItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-500">
                  {emptyMessage}
                </div>
              ) : (
                checkoutItems.map((item) => (
                  <div key={item.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="flex h-[54px] w-[34px] flex-none items-center justify-center rounded-[3px] border border-slate-200 bg-white">
                        <Image
                          src={item.details?.image || item.image}
                          alt={item.name}
                          width={28}
                          height={48}
                          className="h-auto max-h-[44px] w-auto max-w-[24px] object-contain"
                          sizes="24px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="line-clamp-2 text-[18px] font-semibold leading-[1.2] text-ink-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[12px] text-ink-500">
                              Strap Size: {item.strapSize}, Color: {item.color}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCheckoutItem(item.id)}
                            className="text-[#c8c8cd] transition-colors hover:text-ink-700"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={15} strokeWidth={2.2} />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.qty - 1)}
                            className="text-ink-700"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={12} strokeWidth={2.4} />
                          </button>
                          <span className="inline-flex h-[22px] min-w-[24px] items-center justify-center rounded-[2px] border border-slate-300 px-1 text-[12px] text-ink-900">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.id, item.qty + 1)}
                            className="text-ink-700"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={12} strokeWidth={2.4} />
                          </button>
                          <p className="text-[17px] font-semibold text-ink-900">
                            {formatPrice(item.price * item.qty)}
                          </p>
                          {item.originalPrice > item.price && (
                            <p className="text-[12px] text-[#c4c4ca] line-through">
                              {formatPrice(item.originalPrice * item.qty)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-4 text-[14px] text-ink-700">
                <div className="flex items-center justify-between">
                  <span>সাব টোটাল:</span>
                  <span>{formatPrice(originalSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ডিসকাউন্ট:</span>
                  <span>-{formatPrice(itemDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isOnlinePayment ? "Online Payment Offer:" : "New Registration Offer:"}</span>
                  <span>-{formatPrice(activeOffer)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ডেলিভারি ফি:</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[18px] font-semibold text-ink-900">
                  <span>সর্বমোট:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <p className="mt-3 text-[12px] text-ink-500">আপনার সাথে নতুন কোনো অফার যোগ করা আছে?</p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-[2px] border px-3 py-3 ${
                    !isOnlinePayment ? "border-[#69d49a] bg-[#f3fff7]" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                        !isOnlinePayment ? "bg-[#0d7b43] text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-[11px] text-ink-500">New Registration Offer</p>
                      <p className="text-[21px] font-semibold text-[#0d7b43]">৳ 200 OFF</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-[2px] border px-3 py-3 ${
                    isOnlinePayment ? "border-[#69d49a] bg-[#f3fff7]" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${
                        isOnlinePayment ? "bg-[#0d7b43] text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-[11px] text-ink-500">Online Payment Offer</p>
                      <p className="text-[21px] font-semibold text-ink-900">10% OFF</p>
                    </div>
                  </div>
                </div>
              </div>

              {orderError && (
                <p className="mt-4 text-sm font-medium text-red-600">{orderError}</p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={backLinkHref}
                  className="inline-flex items-center gap-1.5 text-[14px] text-ink-700"
                >
                  <ArrowLeft size={15} />
                  <span>{backLinkLabel}</span>
                </Link>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isOrderButtonDisabled}
                  className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[3px] bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={15} strokeWidth={2.8} />
                  <span>{isSubmittingOrder ? "অর্ডার হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
