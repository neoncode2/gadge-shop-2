import { NextResponse } from "next/server";
import { findOrderByOrderNumber } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { orderNumber } = await params;
  const order = await findOrderByOrderNumber(orderNumber);

  if (!order) {
    return NextResponse.json(
      { ok: false, message: "Order not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    order,
  });
}
