import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock3, Sparkles } from "lucide-react";

export default function AdminComingSoonPage({ item }) {
  const Icon = item.icon;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-7">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-sky-100/80 blur-3xl" />
          <div className="absolute bottom-0 left-14 h-28 w-28 rounded-full bg-amber-100/70 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800 ring-1 ring-amber-200">
              Coming soon
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Future module
            </span>
          </div>

          <div className="mt-5 flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
              <Icon size={26} />
            </span>

            <div className="min-w-0">
              <h2 className="text-[28px] font-semibold tracking-tight text-slate-950 sm:text-[34px]">
                {item.label}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                {item.description}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Modules ready
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Live data sources
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Automation hooks
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">0</p>
            </div>
          </div>

          <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-slate-50/80 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200">
                <Clock3 size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Frontend placeholder is ready</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This page is intentionally prepared as a polished placeholder so we can connect
                  backend logic, permissions, and real metrics later without changing navigation.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back to overview
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Open product panel
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Planned capabilities</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-950">
              What this module will cover
            </h3>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Sparkles size={18} />
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {item.highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] px-4 py-4"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{highlight}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Ready for backend wiring in a later phase.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[26px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.92)_0%,rgba(255,255,255,1)_100%)] p-5">
          <p className="text-sm font-semibold text-slate-900">Implementation note</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Navigation, page title, and placeholder experience are now ready. When you want, we
            can plug in real APIs, database logic, and dynamic counts section by section.
          </p>
        </div>
      </section>
    </div>
  );
}
