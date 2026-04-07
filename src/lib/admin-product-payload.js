function parseCsv(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTextareaPairs(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        label: String(item?.label || "").trim(),
        value: String(item?.value || "").trim(),
      }))
      .filter((item) => item.label && item.value);
  }

  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: String(label || "").trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

function parseImageCollection(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        return item?.src || item?.image || "";
      })
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeAdminProductPayload(body, { productId = "" } = {}) {
  const category = String(body?.category || "").trim();
  const primaryImage = String(body?.image || "").trim();
  const parsedImages = parseImageCollection(body?.images);
  const images =
    primaryImage && primaryImage !== "/images/product.webp"
      ? Array.from(new Set([primaryImage, ...parsedImages]))
      : Array.from(new Set(parsedImages));
  const image = primaryImage || images[0] || "/images/product.webp";

  return {
    id: productId || String(body?.id || "").trim(),
    name: String(body?.name || "").trim(),
    category,
    categories: Array.from(new Set([category, ...parseCsv(body?.categories)])),
    brand: String(body?.brand || "").trim(),
    price: Number(body?.price || 0),
    oldPrice: body?.oldPrice ? Number(body.oldPrice) : null,
    image,
    images,
    rating: Number(body?.rating || 4),
    tag: String(body?.tag || "").trim(),
    stock: Number(body?.stock || 0),
    sections: parseCsv(body?.sections),
    colors: parseCsv(body?.colors),
    strapSizes: parseCsv(body?.strapSizes),
    descriptionPoints: String(body?.descriptionPoints || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    specs: parseTextareaPairs(body?.specs),
    shortDescription: String(body?.shortDescription || "").trim(),
  };
}
