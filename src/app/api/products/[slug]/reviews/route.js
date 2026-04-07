import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMongoConfigured } from "@/lib/mongodb";
import { getProductReviewsState, upsertProductReview } from "@/lib/reviews";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const session = await auth();
    const reviewState = await getProductReviewsState(slug, session?.user?.id || "");

    return NextResponse.json({
      ok: true,
      ...reviewState,
    });
  } catch (_error) {
    return NextResponse.json(
      { ok: false, message: "Unable to load product reviews right now." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    if (!isMongoConfigured()) {
      return NextResponse.json(
        { ok: false, message: "MongoDB is not configured. Add MONGODB_URI to enable reviews." },
        { status: 500 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, message: "Please log in to submit a review." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const reviewState = await upsertProductReview({
      productId: slug,
      userId: session.user.id,
      userName: session.user.name || session.user.email?.split("@")[0] || "Customer",
      userImage: session.user.image || null,
      rating: body?.rating,
      title: body?.title,
      comment: body?.comment,
    });

    return NextResponse.json({
      ok: true,
      ...reviewState,
    });
  } catch (error) {
    const message = error?.message || "Unable to submit your review right now.";
    const validationMessages = new Set([
      "Product id is required.",
      "Please select a rating between 1 and 5.",
      "Review comment must be at least 12 characters.",
      "Review comment must be 600 characters or fewer.",
      "Review title must be 80 characters or fewer.",
    ]);
    const status =
      message === "Product not found."
        ? 404
        : message === "Please log in to submit a review."
          ? 401
          : validationMessages.has(message)
            ? 400
            : 500;

    return NextResponse.json(
      { ok: false, message },
      { status }
    );
  }
}
