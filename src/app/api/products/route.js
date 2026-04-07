import { NextResponse } from "next/server";
import {
  getCatalogBrands,
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const search = searchParams.get("search") || "";
  const section = searchParams.get("section") || "";
  const limitParam = Number(searchParams.get("limit") || 0);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  const [products, categories, brands] = await Promise.all([
    getCatalogProducts({ category, brand, search, section, limit }),
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
