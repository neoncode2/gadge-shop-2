import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMongoConfigured } from "@/lib/mongodb";
import { getCatalogProducts } from "@/lib/catalog";
import { createOrder, findOrdersByUserId } from "@/lib/orders";

export const runtime = "nodejs";

function getPaymentType(method) {
  const normalized = String(method || "").toLowerCase();

  if (normalized === "cash on delivery") return "offline";
  if (["bkash", "nagad", "rocket", "upay", "zini pay", "shurjo pay"].includes(normalized)) {
    return "mobile_banking";
  }

  return "other";
}

export async function GET(request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "All";
  const orders = await findOrdersByUserId(session.user.id, status);

  return NextResponse.json({
    ok: true,
    orders,
  });
}

export async function POST(request) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { ok: false, message: "MongoDB is not configured. Add MONGODB_URI to create orders." },
        { status: 500 }
      );
    }

    const session = await auth();
    const body = await request.json();
    const customer = body?.customer || {};
    const paymentMethod = String(body?.payment?.method || "Cash on Delivery").trim();
    const paymentType = getPaymentType(paymentMethod);
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!customer?.name || !customer?.phone || !customer?.district || !customer?.address) {
      return NextResponse.json(
        { ok: false, message: "Name, phone, district, and address are required." },
        { status: 400 }
      );
    }

    if (rawItems.length === 0) {
      return NextResponse.json(
        { ok: false, message: "At least one product is required to place an order." },
        { status: 400 }
      );
    }

    if (
      paymentType === "mobile_banking" &&
      (!body?.payment?.senderNumber || !body?.payment?.transactionId)
    ) {
      return NextResponse.json(
        { ok: false, message: "Sender number and transaction ID are required for mobile banking payments." },
        { status: 400 }
      );
    }

    const requestedIds = rawItems.map((item) => String(item?.id || "").trim()).filter(Boolean);
    const catalogProducts = await getCatalogProducts({ ids: requestedIds });
    const productMap = new Map(catalogProducts.map((product) => [product.id, product]));

    if (catalogProducts.length !== requestedIds.length) {
      return NextResponse.json(
        { ok: false, message: "One or more selected products are no longer available." },
        { status: 400 }
      );
    }

    const items = rawItems.map((item) => {
      const product = productMap.get(String(item.id));
      const qty = Math.max(1, Number(item.qty || 1));

      return {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice || product.price,
        qty,
        category: product.category,
        brand: product.brand,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const originalSubtotal = items.reduce((sum, item) => sum + item.oldPrice * item.qty, 0);
    const itemDiscount = Math.max(0, originalSubtotal - subtotal);
    const offerAmount = Math.max(0, Number(body?.pricing?.offerAmount || 0));
    const deliveryFee = Math.max(0, Number(body?.pricing?.deliveryFee || 0));

    const order = await createOrder({
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
          }
        : null,
      customer,
      items,
      payment: {
        method: paymentMethod,
        type: paymentType,
        senderNumber: body?.payment?.senderNumber || "",
        transactionId: body?.payment?.transactionId || "",
      },
      pricing: {
        subtotal,
        originalSubtotal,
        itemDiscount,
        offerAmount,
        deliveryFee,
      },
      source: body?.source || "cart",
    });

    return NextResponse.json(
      {
        ok: true,
        order,
        redirectTo: `/track-order?orderId=${encodeURIComponent(order.orderNumber)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to create your order right now." },
      { status: 500 }
    );
  }
}
