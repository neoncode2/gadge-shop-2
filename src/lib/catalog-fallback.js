import { products as fallbackProducts } from "@/data/products";
import { brands as fallbackBrands, categories as fallbackCategories } from "@/data/filters";
import { inferBrand, normalizeProduct } from "./catalog-normalize";
import { uniqueValues } from "./catalog-utils";

export { fallbackBrands, fallbackCategories };

export const HOME_SECTIONS = ["flashDeals", "bestSale", "newArrival", "popularProducts"];

const PRODUCT_META = {
  "watch-series-11": {
    brand: "Apple",
    sections: ["flashDeals", "popularProducts"],
    shortDescription: "Latest Apple smartwatch with premium build and reliable all-day performance.",
    descriptionPoints: [
      "Advanced health tracking and always-on display for daily use.",
      "Premium aluminum body with fast charging and smooth performance.",
      "A strong choice for users who want style, notifications, and fitness in one device.",
    ],
    specs: [
      { label: "Brand", value: "Apple" },
      { label: "Display", value: "Always-On Retina" },
      { label: "Battery", value: "Up to 24 hours" },
      { label: "Connectivity", value: "GPS, Bluetooth, Wi-Fi" },
    ],
    colors: ["Rose Gold", "Midnight", "Silver"],
    strapSizes: ["SM", "ML"],
  },
  "watch-series-11-clone": {
    brand: "Apple",
    sections: ["flashDeals", "popularProducts"],
    shortDescription: "Affordable clone edition inspired by the Series 11 design language.",
    colors: ["Black", "Silver"],
    strapSizes: ["SM", "ML"],
  },
  "pixel-9-pro": {
    brand: "Google",
    sections: ["flashDeals", "popularProducts"],
    shortDescription: "Flagship Android experience with a smooth camera system and polished software.",
    descriptionPoints: [
      "Google Tensor powered performance with clean Android experience.",
      "High-quality camera output for day and night photography.",
      "Balanced flagship package for users who want premium Android hardware.",
    ],
    specs: [
      { label: "Brand", value: "Google" },
      { label: "RAM", value: "12GB" },
      { label: "Storage", value: "128GB" },
      { label: "Category", value: "Phones" },
    ],
    colors: ["Obsidian", "Porcelain", "Hazel"],
  },
  "iphone-air": {
    brand: "Apple",
    sections: ["flashDeals", "popularProducts"],
    shortDescription: "A premium iPhone experience with sleek design and polished performance.",
    colors: ["Blue", "Black", "Titanium"],
  },
  "headphone-slyr": {
    brand: "Skullcandy",
    sections: ["bestSale"],
    categories: ["Speaker & Headphone", "Earbuds"],
    shortDescription: "Gaming-focused headphone with rich sound and clear voice pickup.",
    colors: ["Black", "Blue"],
  },
  "logitech-f310": {
    brand: "Logitech",
    sections: ["bestSale"],
    shortDescription: "Reliable wired controller for PC and classic gaming compatibility.",
    specs: [
      { label: "Brand", value: "Logitech" },
      { label: "Connectivity", value: "USB Wired" },
      { label: "Category", value: "Gaming" },
      { label: "Compatibility", value: "PC" },
    ],
  },
  "canon-eos": {
    brand: "Canon",
    sections: ["bestSale"],
    shortDescription: "DSLR camera built for creators who need sharp images and flexible controls.",
    specs: [
      { label: "Brand", value: "Canon" },
      { label: "Resolution", value: "32.5 MP" },
      { label: "Category", value: "Camera" },
      { label: "Video", value: "4K UHD" },
    ],
  },
  "iphone-16-pro": {
    brand: "Apple",
    sections: ["bestSale"],
    shortDescription: "Top-tier iPhone configuration with large storage and flagship performance.",
    colors: ["Natural Titanium", "Black Titanium", "White Titanium"],
  },
  "watch-10": {
    brand: "Apple",
    sections: ["newArrival"],
    shortDescription: "Compact premium smartwatch for users who want everyday convenience.",
    colors: ["Pink", "Midnight", "Starlight"],
    strapSizes: ["SM", "ML"],
  },
  "logitech-x1": {
    brand: "Logitech",
    sections: ["newArrival"],
    categories: ["Speaker & Headphone", "Earbuds"],
    shortDescription: "USB headset built for communication, long sessions, and clear audio.",
  },
  "xbox-controller": {
    brand: "Xbox",
    sections: ["newArrival"],
    shortDescription: "Ergonomic wireless controller for comfortable everyday gaming.",
  },
  "test-product": {
    brand: "Anker",
    sections: ["newArrival"],
    categories: ["Charger & Adapter", "Power Bank"],
    shortDescription: "Compact adapter-style accessory entry for testing commerce flows.",
  },
};

function buildFallbackSections(index) {
  const sections = [];

  if (index < 4) {
    sections.push("flashDeals", "popularProducts");
  }

  if (index >= 4 && index < 8) {
    sections.push("bestSale");
  }

  if (index >= 8 && index < 12) {
    sections.push("newArrival");
  }

  return uniqueValues(sections);
}

export const FALLBACK_CATALOG_PRODUCTS = fallbackProducts.map((product, index) => {
  const meta = PRODUCT_META[product.id] || {};
  const category =
    product.category || meta.category || fallbackCategories[index % fallbackCategories.length];

  return normalizeProduct({
    ...product,
    ...meta,
    category,
    categories: uniqueValues([
      category,
      ...(product.categories || []),
      ...(meta.categories || []),
    ]),
    brand: meta.brand || product.brand || inferBrand(product.name, fallbackBrands[index % fallbackBrands.length]),
    sections: uniqueValues([...(meta.sections || []), ...buildFallbackSections(index)]),
    sortOrder: index,
  });
});
