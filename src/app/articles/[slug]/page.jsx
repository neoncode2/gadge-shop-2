import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles, getRelatedArticles } from "@/lib/articles";

export function generateStaticParams() {
  return getArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found | GadgetShob",
    };
  }

  return {
    title: `${article.title} | GadgetShob`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailsPage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);

  return (
    <div>
      <Header />

      <main className="pb-24 md:pb-0">
        <section className="relative overflow-hidden border-b border-slate-200 text-white">
          <div className="absolute inset-0">
            <Image
              src={article.image}
              alt={article.imageAlt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.84)_0%,rgba(15,23,42,0.6)_38%,rgba(6,78,59,0.52)_100%)]" />
          </div>
          <div className="mx-auto w-[calc(100%-32px)] max-w-[1240px] py-10 md:py-14">
            <div className="relative flex flex-wrap items-center gap-2 text-sm text-white/70">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <ChevronRight size={15} />
              <Link href="/articles" className="transition-colors hover:text-white">
                Articles
              </Link>
              <ChevronRight size={15} />
              <span className="text-white">{article.category}</span>
            </div>

            <div className="relative mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
              <div>
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  {article.category}
                </span>
                <h1 className="mt-5 max-w-[760px] text-[34px] font-semibold leading-[1.04] md:text-[54px]">
                  {article.title}
                </h1>
                <p className="mt-5 max-w-[720px] text-[15px] leading-7 text-white/80 md:text-[17px]">
                  {article.excerpt}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/75">
                  <span>{article.publishedAt}</span>
                  <span className="h-1 w-1 rounded-full bg-white/50" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={15} />
                    {article.readTime}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/50" />
                  <span>{article.author.name}</span>
                  <span className="text-white/55">· {article.author.role}</span>
                </div>
              </div>

              <div className="grid gap-3">
                {article.highlightStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur"
                  >
                    <p className="text-[12px] uppercase tracking-[0.18em] text-white/60">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[17px] font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px] md:mt-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.07)] md:p-8">
              <div className="relative mb-8 overflow-hidden rounded-[26px]">
                <div className="relative min-h-[250px] md:min-h-[330px]">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0.12)_45%,rgba(15,23,42,0.46)_100%)]" />
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#f5fbf7_0%,#ffffff_100%)] p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Quick Takeaways
                </p>
                <ul className="mt-4 space-y-3">
                  {article.takeaways.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] leading-7 text-ink-700">
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-8">
                {article.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="text-[27px] font-semibold leading-[1.12] text-ink-900">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-[16px] leading-8 text-ink-700">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Article Snapshot
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Category</p>
                    <p className="mt-1 text-[16px] font-semibold text-ink-900">{article.category}</p>
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Published</p>
                    <p className="mt-1 text-[16px] font-semibold text-ink-900">{article.publishedAt}</p>
                  </div>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.16em] text-slate-400">Reading time</p>
                    <p className="mt-1 text-[16px] font-semibold text-ink-900">{article.readTime}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef6f2_100%)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Continue Shopping
                </p>
                <h3 className="mt-3 text-[24px] font-semibold leading-[1.12] text-ink-900">
                  Explore products related to this article.
                </h3>
                <p className="mt-3 text-[14px] leading-6 text-ink-600">
                  Move from reading to browsing with a filtered products page for this topic.
                </p>
                <Link
                  href={`/products?category=${encodeURIComponent(article.relatedCategory)}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-black"
                >
                  Browse {article.relatedCategory}
                  <ArrowRight size={15} />
                </Link>
              </div>

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-emerald-700"
              >
                <ArrowLeft size={16} />
                Back to all articles
              </Link>
            </aside>
          </div>
        </section>

        <section className="mx-auto mt-10 w-[calc(100%-32px)] max-w-[1240px] md:mt-14">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                More to Read
              </p>
              <h2 className="mt-2 text-[28px] font-semibold text-ink-900">Related articles</h2>
            </div>

            <Link
              href="/articles"
              className="hidden items-center gap-2 text-sm font-semibold text-ink-900 transition-colors hover:text-emerald-700 md:inline-flex"
            >
              View all
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.slug}
                href={`/articles/${relatedArticle.slug}`}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="relative min-h-[180px] px-5 py-5">
                  <Image
                    src={relatedArticle.image}
                    alt={relatedArticle.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.05)_42%,rgba(15,23,42,0.42)_100%)]" />
                  <span className="relative inline-flex rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {relatedArticle.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="inline-flex items-center gap-2 text-[12px] font-medium text-ink-500">
                    <Clock3 size={14} />
                    {relatedArticle.readTime}
                  </div>
                  <h3 className="mt-3 text-[23px] font-semibold leading-[1.14] text-ink-900">
                    {relatedArticle.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-6 text-ink-600">
                    {relatedArticle.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-900 transition-colors group-hover:text-emerald-700">
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
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
