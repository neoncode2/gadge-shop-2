"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Star,
  User,
} from "lucide-react";

const links = [
  { label: "My Account", href: "/account", icon: User },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "My Wishlists", href: "/account/wishlists", icon: Heart },
  { label: "My Address", href: "/account/address", icon: MapPin },
  { label: "My Reviews", href: "/account/reviews", icon: Star },
  { label: "Setting", href: "/account/settings", icon: Settings },
];

function SidebarItem({ active, href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className={`flex min-h-[34px] items-center gap-2 rounded-[8px] border px-4 py-2.5 text-[13px] font-medium transition-colors ${
        active === label
          ? "border-black bg-black text-white"
          : "border-[#d8d8d8] bg-white text-[#6a6a6a] hover:bg-[#fafafa]"
      }`}
    >
      <span className={active === label ? "text-white" : "text-[#6a6a6a]"}>
        <Icon size={14} />
      </span>
      {label}
    </Link>
  );
}

export default function AccountSidebar({ active }) {
  return (
    <div className="space-y-1.5">
      {links.map((item) => (
        <SidebarItem key={item.label} active={active} {...item} />
      ))}

      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/" })}
        className="flex min-h-[34px] w-full items-center gap-2 rounded-[8px] border border-[#d8d8d8] bg-white px-4 py-2.5 text-left text-[13px] font-medium text-[#6a6a6a] transition-colors hover:bg-[#fafafa]"
      >
        <span className="text-[#6a6a6a]">
          <LogOut size={14} />
        </span>
        Logout
      </button>
    </div>
  );
}
