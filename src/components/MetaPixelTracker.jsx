"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { fetchPublicPixelSettings, trackMetaPixelPageView } from "@/lib/meta-pixel-client";

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeKey = useMemo(() => {
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    void fetchPublicPixelSettings();
  }, []);

  useEffect(() => {
    if (!routeKey) return;

    void trackMetaPixelPageView(routeKey);
  }, [routeKey]);

  return null;
}
