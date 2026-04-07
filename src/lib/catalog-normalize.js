import { uniqueValues } from "./catalog-utils";

export function inferBrand(name, fallback = "Generic") {
  const normalized = String(name || "").toLowerCase();

  if (normalized.includes("apple") || normalized.includes("iphone")) return "Apple";
  if (normalized.includes("pixel") || normalized.includes("google")) return "Google";
  if (normalized.includes("canon")) return "Canon";
  if (normalized.includes("logitech")) return "Logitech";
  if (normalized.includes("skullcandy")) return "Skullcandy";
  if (normalized.includes("xbox")) return "Xbox";

  return fallback;
}

function defaultColors(category) {
  if (category === "Watches") return ["Rose Gold", "Space Gray", "Midnight"];
  if (category === "Phones") return ["Black", "Blue", "Silver"];
  return ["Default"];
}

function defaultSizes(category) {
  if (category === "Watches") return ["SM", "ML"];
  return ["Standard"];
}

function normalizeSpecs(product) {
  if (Array.isArray(product.specs) && product.specs.length > 0) {
    return product.specs;
  }

  return [
    { label: "Brand", value: product.brand || "Generic" },
    { label: "Category", value: product.category || "Products" },
    { label: "SKU", value: product.sku || `SKU-${product.id}` },
    { label: "Availability", value: product.stock > 0 ? "In Stock" : "Out of Stock" },
  ];
}

function normalizeGallery(product) {
  const incoming =
    (Array.isArray(product.gallery) && product.gallery.length > 0 && product.gallery) ||
    (Array.isArray(product.images) && product.images.length > 0 && product.images) ||
    [product.image];

  return incoming.map((item, index) => {
    if (typeof item === "string") {
      return {
        src: item,
        label: `View ${index + 1}`,
        imageClass: "",
      };
    }

    return {
      src: item?.src || item?.image || product.image,
      label: item?.label || `View ${index + 1}`,
      imageClass: item?.imageClass || "",
    };
  });
}

export function normalizeProduct(product) {
  const category = product.category || "Products";
  const categories = uniqueValues([category, ...(product.categories || [])]);
  const sections = uniqueValues(product.sections || []);
  const gallery = normalizeGallery(product);
  const image = product.image || gallery[0]?.src || "/images/product.webp";

  return {
    id: String(product.id || product.slug || product._id || ""),
    name: String(product.name || ""),
    image,
    gallery,
    images: gallery.map((item) => item.src).filter(Boolean),
    price: Number(product.price || 0),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviewCount || 0),
    tag: product.tag || "",
    brand: String(product.brand || inferBrand(product.name)),
    category,
    categories,
    sections,
    shortDescription: String(
      product.shortDescription ||
        `${product.name} এখন best value price-e available with fast checkout and order tracking support.`
    ),
    descriptionPoints:
      Array.isArray(product.descriptionPoints) && product.descriptionPoints.length > 0
        ? product.descriptionPoints
        : [
            `${product.name} authentic quality and reliable performance-er jonno popular choice.`,
            `${category} category-r ei product daily use-er jonno balanced value দেয়.`,
            "Secure checkout, order tracking, and fast delivery support available.",
          ],
    specs: normalizeSpecs(product),
    colors:
      Array.isArray(product.colors) && product.colors.length > 0
        ? product.colors
        : defaultColors(category),
    strapSizes:
      Array.isArray(product.strapSizes) && product.strapSizes.length > 0
        ? product.strapSizes
        : defaultSizes(category),
    stock: Number(product.stock || 12),
    sku: String(product.sku || `SKU-${String(product.id || "product").toUpperCase()}`),
    sortOrder: Number(product.sortOrder || 0),
  };
}
