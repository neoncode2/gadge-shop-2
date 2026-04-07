import { NextResponse } from "next/server";
import { getCatalogProductById, getRelatedProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const product = await getCatalogProductById(slug);

  if (!product) {
    return NextResponse.json(
      { ok: false, message: "Product not found." },
      { status: 404 }
    );
  }

  const related = await getRelatedProducts(product, 4);

  return NextResponse.json({
    ok: true,
    product,
    related,
  });
}
