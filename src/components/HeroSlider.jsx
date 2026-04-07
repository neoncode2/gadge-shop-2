"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const heroSlides = [
  "/images/iphone-16-series-9831-e2f4.webp",
  "/images/mac-mini-m4-chip-slider-4626-3082.webp",
  "/images/samsung-slider-8904-9dc3.webp",
];

const sideBanners = [
  "/images/cmf-by-nothing-watch-pro-2-side-banner-4499-2be9.webp",
  "/images/soundcore-liberty-4-pro-top-banner-copy-2-7395-5b1b.webp",
];

export default function HeroSlider() {
  return (
    <div className="home-hero mx-auto mt-5 w-[calc(100%-24px)] max-w-[1240px] md:mt-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-[10px] border border-[#ececec] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={true}
            className="h-full"
          >
            {heroSlides.map((banner, index) => (
              <SwiperSlide key={banner}>
                <div className="relative aspect-[1.36/1] md:aspect-[2.25/1]">
                  <Image
                    src={banner}
                    alt={`Hero banner ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 767px) 100vw, 860px"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          {sideBanners.map((banner, index) => (
            <div
              key={banner}
              className="relative overflow-hidden rounded-[10px] border border-[#ececec] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
            >
              <div className="relative aspect-[1.9/1] md:aspect-[1.72/1]">
                <Image
                  src={banner}
                  alt={`Promo banner ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 50vw, 300px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
