"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Store,
  UserCircle2,
  X,
} from "lucide-react";
import api from "@/lib/api";
import { getAdminPageDetails } from "@/lib/admin-navigation";
import AdminSidebar from "./AdminSidebar";

function getNotificationToneClasses(tone) {
  if (tone === "warning") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (tone === "success") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (tone === "danger") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }

  return "bg-sky-50 text-sky-700 ring-sky-200";
}

function getUserInitials(name) {
  return String(name || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [summary, setSummary] = useState({
    loading: true,
    notifications: [],
  });

  const details = getAdminPageDetails(pathname);

  useEffect(() => {
    let ignore = false;

    async function loadSummary() {
      try {
        const { data } = await api.get("/api/admin/overview");

        if (!ignore) {
          setSummary({
            loading: false,
            notifications: data.notificationFeed || [],
          });
        }
      } catch (error) {
        if (!ignore) {
          setSummary({
            loading: false,
            notifications: [],
          });
        }
      }
    }

    loadSummary();
    const intervalId = window.setInterval(loadSummary, 60000);

    return () => {
      ignore = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = summary.notifications.length;
  const userInitials = getUserInitials(user?.name);
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef3f9_100%)] text-slate-900">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
            />

            <motion.div
              initial={{ x: "-100%", opacity: 0.96 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.96 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[min(92vw,380px)] p-3 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                  aria-label="Close admin menu"
                >
                  <X size={18} />
                </button>

                <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[292px] lg:p-4">
        <AdminSidebar />
      </div>

      <div className="lg:pl-[292px]">
        <header className="sticky top-3 z-30 px-2 sm:px-4 lg:px-6">
          <div className="rounded-[30px] border border-white/70 bg-white/82 shadow-[0_20px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
            <div className="px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen((current) => !current);
                      setIsNotificationsOpen(false);
                      setIsProfileOpen(false);
                    }}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] lg:hidden"
                    aria-label="Open admin navigation"
                  >
                    <Menu size={18} />
                  </button>

                  <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-sky-50 text-sky-700 shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:flex">
                    <ShieldCheck size={22} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                      {details.title}
                    </h1>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationsOpen((current) => !current);
                        setIsProfileOpen(false);
                      }}
                      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                      aria-label="Open notifications"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    <AnimatePresence>
                      {isNotificationsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="fixed inset-x-4 top-[104px] z-50 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:absolute sm:left-auto sm:right-0 sm:top-[56px] sm:w-[320px] sm:max-w-[calc(100vw-48px)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Notifications</p>
                              <p className="text-xs text-slate-500">Important updates from your store.</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                              {summary.loading ? "..." : unreadCount}
                            </span>
                          </div>

                          <div
                            className="mt-4 max-h-[min(62vh,420px)] space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                            style={{ scrollbarWidth: "none" }}
                          >
                            {summary.loading ? (
                              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                Loading notifications...
                              </div>
                            ) : summary.notifications.length === 0 ? (
                              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                                No new notifications right now.
                              </div>
                            ) : (
                              summary.notifications.map((item) => (
                                <Link
                                  key={item.id}
                                  href={item.href || "/admin"}
                                  className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                                >
                                  <span
                                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${getNotificationToneClasses(
                                      item.tone
                                    )}`}
                                  >
                                    <Bell size={15} />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="truncate text-sm font-semibold text-slate-900">
                                        {item.title}
                                      </p>
                                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      {item.description}
                                    </p>
                                    <p className="mt-2 text-[11px] font-medium text-slate-400">
                                      {item.time}
                                    </p>
                                  </div>
                                </Link>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen((current) => !current);
                        setIsNotificationsOpen(false);
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                      aria-label="Open profile menu"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-xs font-semibold text-sky-700">
                        {userInitials}
                      </span>
                      <UserCircle2 size={18} className="hidden sm:block" />
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="fixed inset-x-4 top-[104px] z-50 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:absolute sm:left-auto sm:right-0 sm:top-[56px] sm:w-[280px]"
                        >
                          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-slate-900">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                              Signed in as
                            </p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{user?.name || "Admin User"}</p>
                            <p className="mt-1 text-sm text-slate-500">{user?.email || "No email found"}</p>
                            <span className="mt-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                              {user?.role || "admin"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-2">
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              Dashboard Overview
                              <LayoutDashboard size={16} />
                            </Link>
                            <Link
                              href="/"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              Visit Storefront
                              <Store size={16} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => signOut({ redirectTo: "/login" })}
                              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              Logout
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
