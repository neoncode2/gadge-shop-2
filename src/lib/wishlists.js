import { getCatalogProductById, getCatalogProducts } from "./catalog";
import { getDatabase, isMongoConfigured } from "./mongodb";

const WISHLISTS_COLLECTION = "wishlists";

function normalizeUserId(userId) {
  return String(userId || "").trim();
}

function normalizeProductId(productId) {
  return String(productId || "").trim();
}

async function getWishlistsCollection() {
  const db = await getDatabase();
  return db.collection(WISHLISTS_COLLECTION);
}

export async function ensureWishlistIndexes() {
  const wishlists = await getWishlistsCollection();

  await Promise.all([
    wishlists.createIndex({ userId: 1 }, { unique: true }),
    wishlists.createIndex({ updatedAt: -1 }),
    wishlists.createIndex({ "items.productId": 1 }),
  ]);

  return wishlists;
}

async function getWishlistDocumentByUserId(userId) {
  const normalizedUserId = normalizeUserId(userId);

  if (!normalizedUserId || !isMongoConfigured()) {
    return null;
  }

  const wishlists = await ensureWishlistIndexes();
  return wishlists.findOne({ userId: normalizedUserId });
}

export async function listWishlistProductIdsByUserId(userId) {
  const wishlist = await getWishlistDocumentByUserId(userId);

  if (!Array.isArray(wishlist?.items)) {
    return [];
  }

  return wishlist.items
    .map((item) => normalizeProductId(item?.productId))
    .filter(Boolean);
}

export async function listWishlistProductsByUserId(userId, { limit } = {}) {
  const productIds = await listWishlistProductIdsByUserId(userId);
  const limitedIds =
    typeof limit === "number"
      ? productIds.slice(0, Math.max(0, limit))
      : productIds;

  if (limitedIds.length === 0) {
    return [];
  }

  const products = await getCatalogProducts({ ids: limitedIds });
  return limitedIds
    .map((productId) => {
      const product = products.find((item) => item.id === productId);
      return product ? { ...product, wishlisted: true } : null;
    })
    .filter(Boolean);
}

export async function addWishlistProductByUserId(userId, productId) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is required to save wishlists.");
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedProductId = normalizeProductId(productId);

  if (!normalizedUserId) {
    throw new Error("User id is required.");
  }

  if (!normalizedProductId) {
    throw new Error("Product id is required.");
  }

  const product = await getCatalogProductById(normalizedProductId);

  if (!product) {
    throw new Error("Product not found.");
  }

  const wishlists = await ensureWishlistIndexes();
  const existing = await wishlists.findOne({ userId: normalizedUserId });
  const currentItems = Array.isArray(existing?.items) ? existing.items : [];
  const timestamp = new Date();
  const alreadyExists = currentItems.some(
    (item) => normalizeProductId(item?.productId) === normalizedProductId
  );
  const nextItems = alreadyExists
    ? currentItems
    : [{ productId: normalizedProductId, addedAt: timestamp }, ...currentItems];

  await wishlists.updateOne(
    { userId: normalizedUserId },
    {
      $set: {
        items: nextItems,
        updatedAt: timestamp,
      },
      $setOnInsert: {
        createdAt: timestamp,
      },
    },
    { upsert: true }
  );

  return product;
}

export async function removeWishlistProductByUserId(userId, productId) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is required to update wishlists.");
  }

  const normalizedUserId = normalizeUserId(userId);
  const normalizedProductId = normalizeProductId(productId);

  if (!normalizedUserId || !normalizedProductId) {
    return false;
  }

  const wishlists = await ensureWishlistIndexes();
  const existing = await wishlists.findOne({ userId: normalizedUserId });

  if (!existing) {
    return false;
  }

  const currentItems = Array.isArray(existing.items) ? existing.items : [];
  const nextItems = currentItems.filter(
    (item) => normalizeProductId(item?.productId) !== normalizedProductId
  );

  await wishlists.updateOne(
    { userId: normalizedUserId },
    {
      $set: {
        items: nextItems,
        updatedAt: new Date(),
      },
    }
  );

  return nextItems.length !== currentItems.length;
}
