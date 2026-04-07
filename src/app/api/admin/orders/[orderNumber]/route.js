import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { updateOrderStatus } from "@/lib/orders";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const order = await updateOrderStatus(orderNumber, {
      status: body?.status,
      note: body?.note || "",
      location: body?.location || "",
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to update order." },
      { status: error.message === "Order not found." ? 404 : 500 }
    );
  }
}
