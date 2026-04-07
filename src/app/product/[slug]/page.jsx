import { auth } from "@/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { getCatalogProductById, getRelatedProducts } from "@/lib/catalog";
import { getProductReviewsState } from "@/lib/reviews";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;
  const product = await getCatalogProductById(slug);

  if (!product) {
    notFound();
  }

  const session = await auth();
  const [related, reviewState] = await Promise.all([
    getRelatedProducts(product, 2),
    getProductReviewsState(product.id, session?.user?.id || ""),
  ]);

  const productWithReviews = {
    ...product,
    reviews: reviewState.reviews,
    reviewSummary: reviewState.summary,
    userReview: reviewState.userReview,
  };

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px]">
        <ProductDetailsClient product={productWithReviews} related={related} />
      </main>
      <Footer />
    </div>
  );
}
