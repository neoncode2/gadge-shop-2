"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Globe, LogOut, ShieldCheck } from "lucide-react";
import { ADMIN_NAV_GROUPS, isAdminNavActive } from "@/lib/admin-navigation";

function AdminNavItem({ item, active, onNavigate }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm transition-colors ${
        active
          ? "bg-black text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
          active ? "bg-white/12 text-white" : "bg-white text-slate-700 shadow-sm"
        }`}
      >
        <Icon size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium leading-5">{item.label}</span>
      </span>
    </Link>
  );
}

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))] p-4 shadow-[0_30px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Admin Control</h2>
            <p className="text-sm text-slate-500">Live tools plus future modules</p>
          </div>
        </div>
      </div>

      <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div
            key={group.label}
            className="rounded-[28px] bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          >
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <AdminNavItem
                  key={item.href}
                  item={item}
                  active={isAdminNavActive(pathname, item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 rounded-[28px] bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <Globe size={18} />
          </span>
          Visit Storefront
        </Link>

        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            signOut({ redirectTo: "/login" });
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
            <LogOut size={18} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
