import {
  BarChart3,
  BookOpen,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  PlugZap,
  Settings2,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export const ADMIN_CORE_NAV_ITEMS = [
  {
    label: "Overview",
    pageTitle: "Dashboard Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "A high-level view of store health, operations, and live performance.",
    status: "Live",
  },
  {
    label: "Products",
    pageTitle: "Product Management",
    href: "/admin/products",
    icon: Boxes,
    description: "Manage catalog items, pricing, stock, and product presentation.",
    status: "Live",
  },
  {
    label: "Orders",
    pageTitle: "Order Operations",
    href: "/admin/orders",
    icon: ClipboardList,
    description: "Review orders, update statuses, and keep fulfillment moving.",
    status: "Live",
  },
  {
    label: "Users",
    pageTitle: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Monitor customer accounts, staff access, and registered users.",
    status: "Live",
  },
  {
    label: "Pixel Setup",
    pageTitle: "Pixel Setup",
    href: "/admin/pixel-setup",
    icon: BookOpen,
    description: "Set your Meta Pixel ID once and follow the built-in setup guide.",
    status: "Live",
  },
];

export const ADMIN_FUTURE_NAV_ITEMS = [
  {
    slug: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Advanced reporting for sales performance, customer behavior, conversion, and traffic insights.",
    highlights: [
      "Sales reports for daily, monthly, and yearly views",
      "Returning vs new customer behavior tracking",
      "Conversion rate visibility",
      "Traffic source tracking",
    ],
    status: "Coming soon",
  },
  {
    slug: "finance",
    label: "Payments",
    href: "/admin/finance",
    icon: Wallet,
    description: "Payment operations for transactions, payouts, refunds, and invoices.",
    highlights: [
      "Transaction monitoring",
      "Payout management",
      "Refund control",
      "Invoice generation",
    ],
    status: "Coming soon",
  },
  {
    slug: "marketing",
    label: "Marketing Tools",
    href: "/admin/marketing",
    icon: Megaphone,
    description: "Growth-ready tools for offers, campaigns, outreach, and abandoned cart recovery.",
    highlights: [
      "Discount and coupon system",
      "Campaign manager",
      "Email and SMS marketing",
      "Abandoned cart recovery",
    ],
    status: "Coming soon",
  },
  {
    slug: "inventory",
    label: "Inventory Management",
    href: "/admin/inventory",
    icon: Boxes,
    description: "Operational inventory controls for stock movement, alerts, and bulk actions.",
    highlights: [
      "Live stock tracking",
      "Low stock alerts",
      "Bulk import tools",
      "Bulk export tools",
    ],
    status: "Coming soon",
  },
  {
    slug: "crm",
    label: "Customer Management (CRM)",
    href: "/admin/crm",
    icon: Users,
    description: "Build a richer customer layer with profiles, order context, notes, and tags.",
    highlights: [
      "Customer profiles",
      "Order history access",
      "Internal notes",
      "Tag-based segmentation",
    ],
    status: "Coming soon",
  },
  {
    slug: "shipping",
    label: "Shipping",
    href: "/admin/shipping",
    icon: Truck,
    description: "Delivery operations for courier setup, rates, and order tracking.",
    highlights: [
      "Courier integration",
      "Shipping rate configuration",
      "Tracking system",
      "Fulfillment workflow support",
    ],
    status: "Coming soon",
  },
  {
    slug: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings2,
    description: "Core store configuration for branding, domains, and payment gateway setup.",
    highlights: [
      "Store settings",
      "Payment gateway configuration",
      "Domain and branding control",
      "Operational defaults",
    ],
    status: "Coming soon",
  },
  {
    slug: "integrations",
    label: "Integrations",
    href: "/admin/integrations",
    icon: PlugZap,
    description: "Connect key services such as WhatsApp, analytics, tracking, and payment providers.",
    highlights: [
      "WhatsApp API",
      "Facebook Pixel",
      "Google Analytics",
      "Stripe and SSLCommerz",
    ],
    status: "Coming soon",
  },
];

export const ADMIN_NAV_GROUPS = [
  {
    label: "Core",
    items: ADMIN_CORE_NAV_ITEMS,
  },
  {
    label: "Insights & Revenue",
    items: ADMIN_FUTURE_NAV_ITEMS.filter((item) =>
      ["analytics", "finance", "marketing"].includes(item.slug)
    ),
  },
  {
    label: "Operations",
    items: ADMIN_FUTURE_NAV_ITEMS.filter((item) =>
      ["inventory", "crm", "shipping"].includes(item.slug)
    ),
  },
  {
    label: "Platform",
    items: ADMIN_FUTURE_NAV_ITEMS.filter((item) =>
      ["settings", "integrations"].includes(item.slug)
    ),
  },
];

const ADMIN_MATCHABLE_NAV_ITEMS = [...ADMIN_CORE_NAV_ITEMS, ...ADMIN_FUTURE_NAV_ITEMS].sort(
  (left, right) => right.href.length - left.href.length
);

export function isAdminNavActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageDetails(pathname) {
  const matchedItem = ADMIN_MATCHABLE_NAV_ITEMS.find((item) =>
    isAdminNavActive(pathname, item.href)
  );

  if (!matchedItem) {
    return {
      title: "Dashboard Overview",
      description: "A high-level view of store health, operations, and live performance.",
      status: "Live",
    };
  }

  return {
    title: matchedItem.pageTitle || matchedItem.label,
    description: matchedItem.description,
    status: matchedItem.status || "Live",
  };
}

export function getAdminFeatureBySlug(slug) {
  return ADMIN_FUTURE_NAV_ITEMS.find((item) => item.slug === slug) || null;
}
