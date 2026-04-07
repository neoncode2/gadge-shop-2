"use client";

import Link from "next/link";
import { Globe, Home, MessageCircle, Phone, UserRound } from "lucide-react";

const navItems = [
  { label: "Messenger", href: "#", icon: MessageCircle },
  { label: "Call", href: "#", icon: Phone },
  { label: "Home", href: "/", icon: Home, active: true },
  { label: "Page", href: "#", icon: Globe },
  { label: "Account", href: "/account", icon: UserRound },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-white/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 py-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1.5 py-1 text-[12px] text-ink-600"
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                  item.active ? "bg-black text-white" : "bg-white text-ink-600"
                }`}
              >
                <Icon size={18} />
              </span>
              <span className={item.active ? "font-semibold text-ink-900" : ""}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
