import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import HomeProductCard from "@/components/HomeProductCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import Link from "next/link";
import {
  BatteryCharging,
  Camera,
  Ear,
  Gamepad2,
  PlugZap,
  Smartphone,
  Speaker,
  Watch,
} from "lucide-react";
import { featuredCategoryAliases, mergeCategoryLists } from "@/data/category-aliases";
import { getCatalogCategories, getHomeSections } from "@/lib/catalog";

const CATEGORY_ICONS = {
  Phones: Smartphone,
  Watches: Watch,
  "Power Bank": BatteryCharging,
  "Speaker & Headphone": Speaker,
  "Charger & Adapter": PlugZap,
  Earbuds: Ear,
  Gaming: Gamepad2,
  Accessories: PlugZap,
  Controllers: Gamepad2,
  Camera,
};

const HOME_CONTAINER_CLASS = "mx-auto w-[calc(100%-24px)] max-w-[1240px]";

function takeUniqueProducts(limit, ...groups) {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((product) => {
    if (!product?.id || seen.has(product.id)) return;

    seen.add(product.id);
    merged.push(product);
  });

  return merged.slice(0, limit);
}

function Section({ title, children }) {
  return (
    <section className="mt-10 md:mt-14">
      <div className={HOME_CONTAINER_CLASS}>
        <h2 className="text-center text-[22px] font-semibold text-[#4f4f4f] md:text-[28px]">
          {title}
        </h2>
        <div className="mt-4 rounded-[10px] bg-white px-4 py-6 shadow-[0_12px_32px_rgba(15,23,42,0.05)] md:mt-5 md:px-6 md:py-7">
          {children}
        </div>
      </div>
    </section>
  );
}

function ProductGrid({ products }) {
  return (
    <div className="homepage-product-grid">
      {products.map((product) => (
        <HomeProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function FeaturedCategories({ categories }) {
  return (
    <section className="mt-10 md:mt-14">
      <div className={HOME_CONTAINER_CLASS}>
        <div className="text-center">
          <h2 className="text-[18px] font-semibold uppercase tracking-[0.07em] text-[#505050] md:text-[24px]">
            Featured Categories
          </h2>
          <p className="mt-2 text-[13px] text-[#8c8c8c] md:text-[15px]">
            Get your desired product from featured category
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 lg:gap-3 xl:gap-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] || Smartphone;

            return (
              <Link
                key={category}
                href={{ pathname: "/products", query: { category } }}
                className="group rounded-[10px] border border-[#ebebeb] bg-white px-4 py-5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#ff8f3c] md:px-5 md:py-6 lg:px-2.5 lg:py-4"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#efefef] text-[#8e8e8e] transition-colors duration-200 group-hover:text-[#ff8f3c] md:h-14 md:w-14">
                  <Icon size={24} strokeWidth={1.7} />
                </span>
                <span className="mt-3 block text-[13px] font-medium leading-[1.4] text-[#666666] md:text-[14px] lg:text-[12px]">
                  {category}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [homeSections, categories] = await Promise.all([
    getHomeSections(),
    getCatalogCategories(),
  ]);

  const {
    flashDeals,
    bestSale,
    newArrival,
    popularProducts,
  } = homeSections;
  const featuredCategories = mergeCategoryLists(categories, featuredCategoryAliases).slice(0, 10);
  const flashSaleProducts = takeUniqueProducts(5, flashDeals, popularProducts, bestSale);
  const popularSaleProducts = takeUniqueProducts(5, bestSale, popularProducts, newArrival);
  const newArrivalProducts = takeUniqueProducts(5, newArrival, bestSale, popularProducts);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pb-28 md:pb-0">
        <HeroSlider />
        <FeaturedCategories categories={featuredCategories} />

        <Section title="Flash Sale">
          <ProductGrid products={flashSaleProducts} />
        </Section>

        <Section title="Popular products">
          <ProductGrid products={popularSaleProducts} />
        </Section>

        <Section title="New Arrival">
          <ProductGrid products={newArrivalProducts} />
        </Section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
