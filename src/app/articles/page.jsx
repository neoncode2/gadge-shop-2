import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import { getArticles, getFeaturedArticle } from "@/lib/articles";

export const metadata = {
  title: "Articles | GadgetShob",
  description: "Buying guides, product insights, and practical ecommerce articles from GadgetShob.",
};

export default function ArticlesPage() {
  const featuredArticle = getFeaturedArticle();
  const articles = getArticles();

  return (
    <div>
      <Header />

      <main className="pb-24 md:pb-0">
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f3f7f4_100%)]">
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px] py-10 md:py-14">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Knowledge Hub
                </span>
                <h1 className="mt-4 max-w-[700px] text-[34px] font-semibold leading-[1.05] text-ink-900 md:text-[52px]">
                  Useful articles for smarter gadget shopping.
                </h1>
                <p className="mt-4 max-w-[700px] text-[15px] leading-7 text-ink-600 md:text-[16px]">
                  Read practical buying guides, accessory suggestions, and category-specific advice
                  designed to help customers make clearer decisions online.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-emerald-700"
              >
                Browse products
                <ChevronRight size={16} />
              </Link>
            </div>

            <Link
              href={`/articles/${featuredArticle.slug}`}
              className="group relative mt-8 block overflow-hidden rounded-[32px] border border-slate-200 text-white shadow-[0_34px_90px_rgba(15,23,42,0.12)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="100vw"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.82)_0%,rgba(15,23,42,0.58)_44%,rgba(5,150,105,0.45)_100%)]" />
              </div>

              <div className="relative grid min-h-[360px] gap-6 p-6 md:min-h-[410px] md:p-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    Featured Article
                  </span>
                  <h2 className="mt-5 max-w-[720px] text-[30px] font-semibold leading-[1.08] md:text-[44px]">
                    {featuredArticle.title}
                  </h2>
                  <p className="mt-4 max-w-[680px] text-[15px] leading-7 text-white/80 md:text-[16px]">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/75">
                    <span>{featuredArticle.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={15} />
                      {featuredArticle.readTime}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span>{featuredArticle.author.name}</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {featuredArticle.highlightStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur"
                    >
                      <p className="text-[12px] uppercase tracking-[0.18em] text-white/60">
                        {item.label}
                      </p>
                      <p className="mt-2 text-[17px] font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px] md:mt-12">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.slug}
                className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_65px_rgba(15,23,42,0.07)]"
              >
                <div className="relative min-h-[210px] overflow-hidden px-5 py-5">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.1)_0%,rgba(15,23,42,0.04)_45%,rgba(15,23,42,0.38)_100%)]" />
                  <span className="relative inline-flex rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {article.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-ink-500">
                    <span>{article.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {article.readTime}
                    </span>
                  </div>

                  <h2 className="mt-4 text-[24px] font-semibold leading-[1.12] text-ink-900">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-[14px] leading-6 text-ink-600">{article.excerpt}</p>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    <div>
                      <p className="text-[14px] font-semibold text-ink-900">{article.author.name}</p>
                      <p className="text-[12px] text-ink-500">{article.author.role}</p>
                    </div>

                    <Link
                      href={`/articles/${article.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-black"
                    >
                      Read article
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
