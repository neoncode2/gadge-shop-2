import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  addWishlistProductByUserId,
  listWishlistProductsByUserId,
  removeWishlistProductByUserId,
} from "@/lib/wishlists";

export const runtime = "nodejs";

async function requireWishlistUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}

export async function GET() {
  try {
    const user = await requireWishlistUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to access your wishlist." },
        { status: 401 }
      );
    }

    const items = await listWishlistProductsByUserId(user.id);

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to load your wishlist right now." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireWishlistUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to save wishlist items." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const productId = String(body?.productId || "").trim();

    if (!productId) {
      return NextResponse.json(
        { message: "Product id is required." },
        { status: 400 }
      );
    }

    const item = await addWishlistProductByUserId(user.id, productId);

    return NextResponse.json(
      {
        ok: true,
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error?.message === "Product not found."
        ? "This product could not be found."
        : "Unable to save this wishlist item right now.";

    return NextResponse.json(
      { message },
      { status: error?.message === "Product not found." ? 404 : 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await requireWishlistUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in to update your wishlist." },
        { status: 401 }
      );
    }

    let productId = "";

    try {
      const body = await request.json();
      productId = String(body?.productId || "").trim();
    } catch {
      productId = String(new URL(request.url).searchParams.get("productId") || "").trim();
    }

    if (!productId) {
      return NextResponse.json(
        { message: "Product id is required." },
        { status: 400 }
      );
    }

    await removeWishlistProductByUserId(user.id, productId);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to remove this wishlist item right now." },
      { status: 500 }
    );
  }
}
