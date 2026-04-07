import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import { getArticles, getFeaturedArticle } from "@/lib/articles";

export default function ArticlesSection() {
  const featuredArticle = getFeaturedArticle();
  const articles = getArticles().filter((article) => article.slug !== featuredArticle.slug).slice(0, 3);

  return (
    <section className="mt-8 md:mt-11">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600">
              Articles & Insights
            </span>
            <h2 className="mt-3 text-[25px] font-semibold leading-[1.08] text-ink-900 md:text-[32px]">
              Helpful reads that guide the next gadget you buy.
            </h2>
            <p className="mt-2.5 max-w-[650px] text-[14px] leading-6 text-ink-600">
              Real article content, clear buying advice, and category-specific guidance that help
              shoppers make better decisions before they place an order.
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-emerald-700"
          >
            View all articles
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="group relative overflow-hidden rounded-[30px] border border-slate-200 text-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.78)_0%,rgba(15,23,42,0.55)_42%,rgba(5,150,105,0.45)_100%)]" />
            </div>

            <div className="relative flex min-h-[280px] flex-col justify-between p-5 md:min-h-[312px] md:p-6">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                  {featuredArticle.category}
                </span>
                <h3 className="mt-4 max-w-[520px] text-[24px] font-semibold leading-[1.08] md:text-[32px]">
                  {featuredArticle.title}
                </h3>
                <p className="mt-3 max-w-[520px] text-[14px] leading-6 text-white/78">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="relative mt-5 flex flex-col gap-3 border-t border-white/15 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 text-sm text-white/80">
                  <Clock3 size={15} />
                  {featuredArticle.readTime}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Read article
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </div>
          </Link>

          <div className="grid gap-3">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group grid gap-3 rounded-[24px] border border-slate-200 bg-white p-3.5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5 sm:grid-cols-[136px_minmax(0,1fr)] sm:items-center"
              >
                <div className="relative min-h-[118px] overflow-hidden rounded-[18px]">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="136px"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.18)_0%,rgba(15,23,42,0.08)_45%,rgba(15,23,42,0.42)_100%)]" />
                  <span className="absolute left-4 top-4 inline-flex rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {article.category}
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-500">
                    <Clock3 size={14} />
                    {article.readTime}
                  </div>
                  <h3 className="mt-2.5 text-[19px] font-semibold leading-[1.12] text-ink-900 md:text-[21px]">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-ink-600">{article.excerpt}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-900 transition-colors group-hover:text-emerald-700">
                    Read article
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
