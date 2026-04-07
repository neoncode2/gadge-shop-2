export function createAdminProductFormState() {
  return {
    id: "",
    name: "",
    category: "",
    categories: "",
    brand: "",
    price: "",
    oldPrice: "",
    stock: "",
    image: "/images/product.webp",
    images: [],
    rating: "4",
    tag: "",
    sections: "",
    colors: "",
    strapSizes: "",
    shortDescription: "",
    descriptionPoints: "",
    specs: "",
  };
}

export function toAdminProductFormState(product) {
  if (!product) return createAdminProductFormState();

  const galleryImages = Array.isArray(product.gallery)
    ? product.gallery
        .map((item) => (typeof item === "string" ? item : item?.src || item?.image || ""))
        .filter(Boolean)
    : [];

  const images = Array.from(
    new Set([...(Array.isArray(product.images) ? product.images : []), ...galleryImages, product.image || ""])
  ).filter(Boolean);

  return {
    id: product.id || "",
    name: product.name || "",
    category: product.category || "",
    categories: (product.categories || []).filter((value) => value !== product.category).join(", "),
    brand: product.brand || "",
    price: String(product.price || ""),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    stock: String(product.stock || 0),
    image: images[0] || "/images/product.webp",
    images,
    rating: String(product.rating || 4),
    tag: product.tag || "",
    sections: (product.sections || []).join(", "),
    colors: (product.colors || []).join(", "),
    strapSizes: (product.strapSizes || []).join(", "),
    shortDescription: product.shortDescription || "",
    descriptionPoints: (product.descriptionPoints || []).join("\n"),
    specs: (product.specs || []).map((spec) => `${spec.label}: ${spec.value}`).join("\n"),
  };
}
