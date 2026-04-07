import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/require-admin";
import { normalizeAdminProductPayload } from "@/lib/admin-product-payload";
import {
  getCatalogBrands,
  getCatalogCategories,
  listCatalogProductsForAdmin,
  saveCatalogProduct,
} from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const [products, categories, brands] = await Promise.all([
    listCatalogProductsForAdmin({ search }),
    getCatalogCategories(),
    getCatalogBrands(),
  ]);

  return NextResponse.json({
    ok: true,
    products,
    categories,
    brands,
  });
}

export async function POST(request) {
  const admin = await requireAdminApi();
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const body = await request.json();
    const payload = normalizeAdminProductPayload(body);

    if (!payload.name || !payload.category || !payload.brand || !payload.price) {
      return NextResponse.json(
        { ok: false, message: "Name, category, brand, and price are required." },
        { status: 400 }
      );
    }

    const product = await saveCatalogProduct(payload);

    return NextResponse.json(
      { ok: true, product },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: error.message || "Unable to create product." },
      { status: 500 }
    );
  }
}
