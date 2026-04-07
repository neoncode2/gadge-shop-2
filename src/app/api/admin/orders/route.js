import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { ADMIN_ORDER_STATUSES, listOrdersForAdmin } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "All";
  const search = searchParams.get("search") || "";
  const orders = await listOrdersForAdmin({ status, search });

  return NextResponse.json({
    ok: true,
    orders,
    statuses: ADMIN_ORDER_STATUSES,
  });
}
