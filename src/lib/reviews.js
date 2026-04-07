import { getCatalogProductById } from "@/lib/catalog";
import { hasPurchasedProductByUserId } from "@/lib/orders";
import { getDatabase, isMongoConfigured } from "@/lib/mongodb";

const REVIEWS_COLLECTION = "product_reviews";
const PRODUCTS_COLLECTION = "products";

function normalizeReviewId(review) {
  return review?._id?.toString?.() || `${review?.productId || "product"}-${review?.userId || "user"}`;
}

function formatReview(review) {
  if (!review) return null;

  return {
    id: normalizeReviewId(review),
    productId: String(review.productId || ""),
    userId: String(review.userId || ""),
    userName: String(review.userName || "Customer"),
    userImage: review.userImage || null,
    rating: Math.max(1, Math.min(5, Number(review.rating || 0))),
    title: String(review.title || "").trim(),
    comment: String(review.comment || "").trim(),
    verifiedPurchase: Boolean(review.verifiedPurchase),
    createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : null,
    updatedAt: review.updatedAt ? new Date(review.updatedAt).toISOString() : null,
  };
}

function emptyReviewState() {
  return {
    reviews: [],
    summary: {
      rating: 0,
      reviewCount: 0,
    },
    userReview: null,
  };
}

async function getReviewsCollection() {
  const db = await getDatabase();
  return db.collection(REVIEWS_COLLECTION);
}

async function getProductsCollection() {
  const db = await getDatabase();
  return db.collection(PRODUCTS_COLLECTION);
}

async function ensureReviewIndexes() {
  const reviews = await getReviewsCollection();

  await Promise.all([
    reviews.createIndex({ productId: 1, updatedAt: -1 }),
    reviews.createIndex({ productId: 1, userId: 1 }, { unique: true }),
    reviews.createIndex({ userId: 1, updatedAt: -1 }),
  ]);

  return reviews;
}

export async function listProductReviews(productId) {
  if (!isMongoConfigured() || !productId) return [];

  const reviews = await ensureReviewIndexes();
  const docs = await reviews
    .find({ productId: String(productId) })
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  return docs.map(formatReview);
}

export async function findProductReviewByUser(productId, userId) {
  if (!isMongoConfigured() || !productId || !userId) return null;

  const reviews = await ensureReviewIndexes();
  const doc = await reviews.findOne({
    productId: String(productId),
    userId: String(userId),
  });

  return formatReview(doc);
}

export async function summarizeProductReviews(productId) {
  if (!isMongoConfigured() || !productId) {
    return {
      rating: 0,
      reviewCount: 0,
    };
  }

  const reviews = await ensureReviewIndexes();
  const [summary] = await reviews
    .aggregate([
      { $match: { productId: String(productId) } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  return {
    rating: Number(summary?.averageRating || 0).toFixed(1) * 1,
    reviewCount: Number(summary?.reviewCount || 0),
  };
}

async function syncProductReviewSummary(productId) {
  const summary = await summarizeProductReviews(productId);

  if (!isMongoConfigured()) {
    return summary;
  }

  const products = await getProductsCollection();

  await products.updateOne(
    { id: String(productId) },
    {
      $set: {
        rating: summary.rating,
        reviewCount: summary.reviewCount,
        updatedAt: new Date(),
      },
    }
  );

  return summary;
}

export async function getProductReviewsState(productId, userId = "") {
  if (!isMongoConfigured() || !productId) {
    return emptyReviewState();
  }

  const [reviews, summary, userReview] = await Promise.all([
    listProductReviews(productId),
    summarizeProductReviews(productId),
    userId ? findProductReviewByUser(productId, userId) : Promise.resolve(null),
  ]);

  return {
    reviews,
    summary,
    userReview,
  };
}

export async function listReviewsByUserId(userId, { limit = 20 } = {}) {
  if (!isMongoConfigured() || !userId) return [];

  const reviews = await ensureReviewIndexes();
  const docs = await reviews
    .find({ userId: String(userId) })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(Math.max(1, Math.min(100, Number(limit) || 20)))
    .toArray();

  const formattedReviews = docs.map(formatReview);

  return Promise.all(
    formattedReviews.map(async (review) => {
      const product = await getCatalogProductById(review.productId);

      return {
        ...review,
        product: product
          ? {
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              brand: product.brand || "",
              category: product.category || "",
            }
          : null,
      };
    })
  );
}

export async function upsertProductReview({
  productId,
  userId,
  userName,
  userImage,
  rating,
  title = "",
  comment,
}) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  const normalizedProductId = String(productId || "").trim();
  const normalizedUserId = String(userId || "").trim();
  const normalizedTitle = String(title || "").trim();
  const normalizedComment = String(comment || "").trim();
  const normalizedName =
    String(userName || "").trim() || "Customer";
  const normalizedRating = Math.round(Number(rating || 0));

  if (!normalizedProductId) {
    throw new Error("Product id is required.");
  }

  if (!normalizedUserId) {
    throw new Error("Please log in to submit a review.");
  }

  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    throw new Error("Please select a rating between 1 and 5.");
  }

  if (normalizedComment.length < 12) {
    throw new Error("Review comment must be at least 12 characters.");
  }

  if (normalizedComment.length > 600) {
    throw new Error("Review comment must be 600 characters or fewer.");
  }

  if (normalizedTitle.length > 80) {
    throw new Error("Review title must be 80 characters or fewer.");
  }

  const product = await getCatalogProductById(normalizedProductId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const reviews = await ensureReviewIndexes();
  const timestamp = new Date();
  const verifiedPurchase = await hasPurchasedProductByUserId(normalizedUserId, normalizedProductId);

  await reviews.updateOne(
    {
      productId: normalizedProductId,
      userId: normalizedUserId,
    },
    {
      $set: {
        productId: normalizedProductId,
        userId: normalizedUserId,
        userName: normalizedName,
        userImage: userImage || null,
        rating: normalizedRating,
        title: normalizedTitle,
        comment: normalizedComment,
        verifiedPurchase,
        updatedAt: timestamp,
      },
      $setOnInsert: {
        createdAt: timestamp,
      },
    },
    { upsert: true }
  );

  await syncProductReviewSummary(normalizedProductId);

  return getProductReviewsState(normalizedProductId, normalizedUserId);
}
