import { getDatabase, isMongoConfigured } from "./mongodb";
import { categoryQueryAliases } from "@/data/category-aliases";
import {
  FALLBACK_CATALOG_PRODUCTS,
  HOME_SECTIONS,
  fallbackBrands,
  fallbackCategories,
} from "./catalog-fallback";
import { normalizeProduct } from "./catalog-normalize";
import { escapeRegExp, slugify, sortByReference, uniqueValues } from "./catalog-utils";

const PRODUCTS_COLLECTION = "products";

function resolveCategoryFilter(category) {
  const normalizedCategory = String(category || "").trim();
  if (!normalizedCategory) return [];
  return categoryQueryAliases[normalizedCategory] || [normalizedCategory];
}

function filterProducts(list, { category, brand, search, section, ids } = {}) {
  const searchTerm = String(search || "").trim().toLowerCase();
  const idSet = ids?.length ? new Set(ids.map(String)) : null;
  const categoryFilters = resolveCategoryFilter(category);

  let next = [...list];

  if (category) {
    next = next.filter((product) => {
      const productCategories = product.categories || [product.category];
      return categoryFilters.some((item) => productCategories.includes(item));
    });
  }

  if (brand) {
    next = next.filter((product) => product.brand === brand);
  }

  if (section) {
    next = next.filter((product) => (product.sections || []).includes(section));
  }

  if (idSet) {
    next = next.filter((product) => idSet.has(product.id));
    next.sort((first, second) => ids.indexOf(first.id) - ids.indexOf(second.id));
  }

  if (searchTerm) {
    next = next.filter((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.category,
        ...(product.categories || []),
        ...(product.descriptionPoints || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(searchTerm);
    });
  }

  return next;
}

async function getProductsCollection() {
  const db = await getDatabase();
  return db.collection(PRODUCTS_COLLECTION);
}

async function ensureCatalogIndexes() {
  const products = await getProductsCollection();

  await Promise.all([
    products.createIndex({ id: 1 }, { unique: true }),
    products.createIndex({ category: 1 }),
    products.createIndex({ categories: 1 }),
    products.createIndex({ brand: 1 }),
    products.createIndex({ sections: 1 }),
    products.createIndex({ sortOrder: 1 }),
  ]);

  return products;
}

let hasEnsuredCatalogSeed = false;

async function ensureCatalogSeed() {
  if (!isMongoConfigured() || hasEnsuredCatalogSeed) return;

  const products = await ensureCatalogIndexes();
  const count = await products.estimatedDocumentCount();

  if (count === 0) {
    const timestamp = new Date();

    await products.insertMany(
      FALLBACK_CATALOG_PRODUCTS.map((product, index) => ({
        ...product,
        sortOrder: index,
        createdAt: timestamp,
        updatedAt: timestamp,
      }))
    );
  }

  hasEnsuredCatalogSeed = true;
}

export async function getCatalogProducts(options = {}) {
  const {
    category = "",
    brand = "",
    search = "",
    section = "",
    ids = [],
    limit,
  } = options;

  const normalizedIds = Array.isArray(ids)
    ? ids.map((value) => String(value || "").trim()).filter(Boolean)
    : [];

  if (!isMongoConfigured()) {
    const filtered = filterProducts(FALLBACK_CATALOG_PRODUCTS, {
      category,
      brand,
      search,
      section,
      ids: normalizedIds,
    });

    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }

  await ensureCatalogSeed();
  const products = await getProductsCollection();
  const query = {};

  if (category) {
    const categoryFilters = resolveCategoryFilter(category);
    query.categories = categoryFilters.length === 1 ? categoryFilters[0] : { $in: categoryFilters };
  }

  if (brand) {
    query.brand = brand;
  }

  if (section) {
    query.sections = section;
  }

  if (normalizedIds.length > 0) {
    query.id = { $in: normalizedIds };
  }

  if (String(search || "").trim()) {
    const pattern = new RegExp(escapeRegExp(search.trim()), "i");
    query.$or = [
      { name: pattern },
      { brand: pattern },
      { category: pattern },
      { categories: pattern },
    ];
  }

  const docs = await products.find(query).sort({ sortOrder: 1, createdAt: 1, name: 1 }).toArray();
  const normalized = docs.map(normalizeProduct);
  const ordered = normalizedIds.length > 0
    ? normalized.sort((first, second) => normalizedIds.indexOf(first.id) - normalizedIds.indexOf(second.id))
    : normalized;

  return typeof limit === "number" ? ordered.slice(0, limit) : ordered;
}

export async function getCatalogProductById(id) {
  const normalizedId = String(id || "").trim();
  if (!normalizedId) return null;

  const [product] = await getCatalogProducts({ ids: [normalizedId], limit: 1 });
  return product || null;
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product?.id) return [];

  const sameCategory = await getCatalogProducts({
    category: product.category,
  });

  const filtered = sameCategory.filter((item) => item.id !== product.id);

  if (filtered.length >= limit) {
    return filtered.slice(0, limit);
  }

  const allProducts = await getCatalogProducts();
  const additional = allProducts.filter(
    (item) => item.id !== product.id && !filtered.some((existing) => existing.id === item.id)
  );

  return [...filtered, ...additional].slice(0, limit);
}

export async function getCatalogCategories() {
  if (!isMongoConfigured()) {
    const values = uniqueValues(
      FALLBACK_CATALOG_PRODUCTS.flatMap((product) => product.categories || [product.category])
    );
    return sortByReference(values, fallbackCategories);
  }

  await ensureCatalogSeed();
  const products = await getProductsCollection();
  const values = await products.distinct("categories");

  return sortByReference(uniqueValues(values), fallbackCategories);
}

export async function getCatalogBrands() {
  if (!isMongoConfigured()) {
    const values = uniqueValues(FALLBACK_CATALOG_PRODUCTS.map((product) => product.brand));
    return sortByReference(values, fallbackBrands);
  }

  await ensureCatalogSeed();
  const products = await getProductsCollection();
  const values = await products.distinct("brand");

  return sortByReference(uniqueValues(values), fallbackBrands);
}

export async function getHomeSections() {
  const [flashDeals, bestSale, newArrival, popularProducts] = await Promise.all(
    HOME_SECTIONS.map((section) => getCatalogProducts({ section, limit: 4 }))
  );

  return {
    flashDeals,
    bestSale,
    newArrival,
    popularProducts,
  };
}

export async function countCatalogProducts() {
  if (!isMongoConfigured()) {
    return FALLBACK_CATALOG_PRODUCTS.length;
  }

  await ensureCatalogSeed();
  const products = await getProductsCollection();
  return products.countDocuments();
}

export async function listCatalogProductsForAdmin({ search = "" } = {}) {
  return getCatalogProducts({ search });
}

export async function saveCatalogProduct(payload) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is required to manage products.");
  }

  await ensureCatalogSeed();
  const products = await getProductsCollection();
  const timestamp = new Date();
  const normalizedId = String(payload?.id || "").trim() || slugify(payload?.name);

  if (!normalizedId) {
    throw new Error("Product ID could not be generated.");
  }

  const existing = await products.findOne({ id: normalizedId });
  const normalized = normalizeProduct({
    ...existing,
    ...payload,
    id: normalizedId,
    sortOrder: payload?.sortOrder ?? existing?.sortOrder ?? Date.now(),
  });

  await products.updateOne(
    { id: normalizedId },
    {
      $set: {
        ...normalized,
        updatedAt: timestamp,
      },
      $setOnInsert: {
        createdAt: existing?.createdAt || timestamp,
      },
    },
    { upsert: true }
  );

  return getCatalogProductById(normalizedId);
}

export async function deleteCatalogProduct(id) {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is required to manage products.");
  }

  const normalizedId = String(id || "").trim();
  if (!normalizedId) return false;

  const products = await getProductsCollection();
  const result = await products.deleteOne({ id: normalizedId });
  return result.deletedCount > 0;
}
