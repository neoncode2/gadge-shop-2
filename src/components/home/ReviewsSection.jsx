import Link from "next/link";
import { ArrowRight, Quote, Star } from "lucide-react";

const reviewHighlights = [
  { value: "4.9/5", label: "average customer rating" },
  { value: "2.1k+", label: "verified gadget orders" },
  { value: "98%", label: "customers say they would buy again" },
];

const testimonials = [
  {
    name: "Rahim Ahmed",
    role: "iPhone buyer, Dhaka",
    product: "iPhone 16 Pro Max 1TB",
    quote:
      "Order placement theke delivery porjonto pura experience ta premium chilo. Packaging, condition, and after-sales response sob kichu confidence dise.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "Creator setup upgrade",
    product: "Canon EOS 90D DSLR Camera",
    quote:
      "Product original chilo and team theke color and stock confirmation o fast peyechi. Checkout flow onek clean and dependable.",
    rating: 5,
  },
  {
    name: "Imran Hossain",
    role: "Gaming accessories customer",
    product: "Xbox Wireless Controller 1914",
    quote:
      "Fast delivery, fair price, and responsive support. Professional ecommerce website e je trust feel asha kora hoy, eta sheta dise.",
    rating: 5,
  },
];

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {Array.from({ length: rating }).map((_, index) => (
        <Star key={index} size={14} fill="currentColor" strokeWidth={1.8} />
      ))}
    </div>
  );
}

function ReviewCard({ review, featured = false }) {
  return (
    <article
      className={`rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur ${
        featured ? "md:p-6" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <ReviewStars rating={review.rating} />
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
          <Quote size={17} />
        </span>
      </div>

      <p
        className={`mt-4 text-ink-700 ${
          featured ? "text-[15px] leading-7 md:text-[16px]" : "text-[14px] leading-6"
        }`}
      >
        {review.quote}
      </p>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-[15px] font-semibold text-ink-900">{review.name}</p>
        <p className="mt-1 text-[13px] text-ink-500">{review.role}</p>
        <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
          Purchased: {review.product}
        </p>
      </div>
    </article>
  );
}

export default function ReviewsSection() {
  return (
    <section className="mt-10 md:mt-14">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px]">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f2_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="grid gap-5 p-5 md:gap-8 md:p-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            <div className="flex flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Customer Reviews
                </span>
                <h2 className="mt-4 max-w-[440px] text-[28px] font-semibold leading-[1.1] text-ink-900 md:text-[36px]">
                  Trusted by customers who want a cleaner gadget buying experience.
                </h2>
                <p className="mt-4 max-w-[470px] text-[15px] leading-7 text-ink-600">
                  From flagship phones to gaming accessories, shoppers choose GadgetShob for
                  reliable product quality, fast communication, and a checkout flow that feels
                  easy from start to finish.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {reviewHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-white/80 bg-white/80 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  >
                    <p className="text-[24px] font-semibold text-ink-900">{item.value}</p>
                    <p className="mt-1 text-[13px] leading-5 text-ink-500">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-black"
                >
                  Shop Top Rated Picks
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <ReviewCard review={testimonials[0]} featured />
              </div>
              <ReviewCard review={testimonials[1]} />
              <ReviewCard review={testimonials[2]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
