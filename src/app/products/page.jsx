import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import {
  BatteryCharging,
  Camera,
  ChevronRight,
  Gamepad2,
  Headphones,
  Package,
  PlugZap,
  Smartphone,
  Tag,
  Watch,
} from "lucide-react";
import { featuredCategoryAliases, mergeCategoryLists } from "@/data/category-aliases";
import {
  getCatalogBrands,
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/catalog";

const categoryIcons = {
  Phones: Smartphone,
  Watches: Watch,
  "Power Bank": BatteryCharging,
  "Speaker & Headphone": Headphones,
  "Charger & Adapter": PlugZap,
  Earbuds: Headphones,
  Gaming: Gamepad2,
  Accessories: PlugZap,
  Controllers: Gamepad2,
  Camera,
};

const brandStyles = {
  Apple: "bg-gradient-to-br from-violet-500 to-indigo-700",
  Google: "bg-gradient-to-br from-emerald-400 to-lime-500",
  Canon: "bg-gradient-to-br from-slate-700 to-slate-900",
  Logitech: "bg-gradient-to-br from-zinc-500 to-zinc-700",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params?.category) ? params.category[0] : params?.category;
  const rawBrand = Array.isArray(params?.brand) ? params.brand[0] : params?.brand;
  const rawSearch = Array.isArray(params?.search) ? params.search[0] : params?.search;
  const selectedCategory = String(rawCategory || "");
  const selectedBrand = String(rawBrand || "");
  const searchQuery = String(rawSearch || "").trim();

  const [categories, brands, filteredProducts] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
    getCatalogProducts({
      category: selectedCategory,
      brand: selectedBrand,
      search: searchQuery,
    }),
  ]);
  const displayCategories = mergeCategoryLists(categories, featuredCategoryAliases);

  const heading = selectedCategory || selectedBrand || "All Products";
  const hasActiveFilters = Boolean(selectedCategory || selectedBrand || searchQuery);

  return (
    <div>
      <Header />
      <main className="mx-auto mt-8 w-[calc(100%-32px)] max-w-[1240px]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-[7px] border border-slate-200 bg-white">
              <div className="bg-black px-4 py-2.5 text-[12px] font-semibold text-white">
                Categories
              </div>
              <ul className="divide-y divide-slate-100">
                {displayCategories.map((category) => {
                  const Icon = categoryIcons[category] || Package;
                  const isActive = selectedCategory === category;

                  return (
                    <li key={category}>
                      <Link
                        href={{
                          pathname: "/products",
                          query: {
                            ...(selectedBrand ? { brand: selectedBrand } : {}),
                            ...(searchQuery ? { search: searchQuery } : {}),
                            category,
                          },
                        }}
                        className={`flex w-full items-center gap-2.5 px-3 py-3 text-left text-[12px] transition-colors ${
                          isActive
                            ? "bg-slate-50 text-ink-900"
                            : "text-ink-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-[4px] border bg-white ${
                            isActive
                              ? "border-black text-black"
                              : "border-slate-200 text-ink-500"
                          }`}
                        >
                          <Icon size={15} />
                        </span>
                        <span className="flex-1 font-medium">{category}</span>
                        <ChevronRight size={14} className="text-ink-400" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-[7px] border border-slate-200 bg-white p-4">
              <h2 className="text-[20px] font-semibold text-ink-900">Brands</h2>
              <span className="mt-2 block h-[3px] w-11 rounded-full bg-black" />
              <ul className="mt-4 space-y-2">
                {brands.map((brand) => {
                  const isBrandActive = selectedBrand === brand;

                  return (
                    <li key={brand}>
                      <Link
                        href={{
                          pathname: "/products",
                          query: {
                            ...(selectedCategory ? { category: selectedCategory } : {}),
                            ...(searchQuery ? { search: searchQuery } : {}),
                            brand,
                          },
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-[4px] border px-3 py-2.5 text-left text-[12px] transition-colors ${
                          isBrandActive
                            ? "border-black bg-slate-50 text-ink-900"
                            : "border-slate-200 text-ink-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-[3px] text-white ${
                            brandStyles[brand] || "bg-slate-600"
                          }`}
                        >
                          <Tag size={9} />
                        </span>
                        <span className="font-medium">{brand}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <section>
            <div className="rounded-[7px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-[22px] font-semibold text-ink-900">
                    {heading}
                  </h1>
                  <p className="mt-1 text-sm text-ink-500">
                    {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found
                  </p>
                  {searchQuery && (
                    <p className="mt-1 text-sm text-ink-500">
                      Search query: <span className="font-medium text-ink-700">{searchQuery}</span>
                    </p>
                  )}
                  {selectedBrand && (
                    <p className="mt-1 text-sm text-ink-500">
                      Brand: <span className="font-medium text-ink-700">{selectedBrand}</span>
                    </p>
                  )}
                </div>

                {hasActiveFilters && (
                  <Link
                    href="/products"
                    className="inline-flex h-10 items-center justify-center rounded-[4px] border border-slate-200 px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-50"
                  >
                    Clear Filters
                  </Link>
                )}
              </div>

              {filteredProducts.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} compact />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-[6px] border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-ink-500">
                  No products found for the current filters.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
