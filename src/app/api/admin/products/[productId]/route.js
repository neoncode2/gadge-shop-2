import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import { deleteCatalogProduct, saveCatalogProduct } from "@/lib/catalog";

export const runtime = "nodejs";

export async function PATCH(request, { params }) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const { productId } = await params;
    const body = await request.json();
    const payload = normalizeAdminProductPayload(body, { productId });
    const product = await saveCatalogProduct(payload);

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const { productId } = await params;
    const deleted = await deleteCatalogProduct(productId);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to delete product." },
      { status: 500 }
    );
  }
}
