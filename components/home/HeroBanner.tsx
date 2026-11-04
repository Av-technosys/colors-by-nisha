"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  { image: "/Home/hero/slide-1.webp", title: "Crafted for Grand Celebrations", button: "Shop Now" },
  { image: "/Home/hero/slide-2.webp", title: "Timeless Elegance For Modern Women", button: "Explore Now" },
  { image: "/Home/hero/slide-3.webp", title: "Where Heritage Meets Modern Style", button: "Shop Collection" },
];
const ease = [0.22, 1, 0.36, 1] as const;

export function HeroBanner({ onShop, paused = false }: { onShop: () => void; paused?: boolean }) {
  const [slide, setSlide] = useState(0);
  const [loaded, setLoaded] = useState<number[]>([]);
  const requested = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reducedMotion = useReducedMotion();
  const autoplay = !hovered && !focused && !hidden && !paused && !reducedMotion;

  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, []);

  const changeSlide = useCallback((index: number) => {
    requested.current = index;
    if (loaded.includes(index)) setSlide(index);
  }, [loaded]);

  useEffect(() => {
    if (!autoplay || !loaded.includes(slide)) return;
    const timer = window.setTimeout(() => changeSlide((slide + 1) % slides.length), 6500);
    return () => window.clearTimeout(timer);
  }, [slide, autoplay, loaded, changeSlide]);

  return (
    <>
      <link rel="preload" as="image" href={slides[0].image} fetchPriority="high" />
      <section
        className="group relative isolate h-[calc(100svh-100px)] w-full overflow-hidden bg-[#6e573c] text-white lg:h-svh"
        aria-roledescription="carousel"
        aria-label="Featured collections"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
      >
        {slides.map((item, index) => {
          const active = slide === index;
          return (
            <motion.div
              key={item.image}
              className={`absolute inset-0 ${active ? "pointer-events-auto" : "pointer-events-none"}`}
              initial={false}
              animate={{ opacity: active ? 1 : 0, zIndex: active ? 2 : 1 }}
              transition={{ opacity: { duration: reducedMotion || !active ? 0 : 1.1, delay: !active && !reducedMotion ? 1.1 : 0, ease: "easeInOut" }, zIndex: { duration: 0 } }}
              aria-hidden={!active}
              inert={!active}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slides.length}`}
            >
              <motion.div
                className="absolute inset-0 origin-center"
                initial={{ scale: 1.055 }}
                animate={{ scale: active ? 1 : 1.055 }}
                transition={{ duration: reducedMotion ? 0 : 5, ease }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  unoptimized
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "low"}
                  onLoad={async event => {
                    const image = event.currentTarget;
                    try { await image.decode(); } catch { return; }
                    setLoaded(current => current.includes(index) ? current : [...current, index]);
                    if (index === requested.current) setSlide(index);
                  }}
                />
              </motion.div>
              <div className="absolute inset-0 bg-black/10" />
              <motion.div
                className="absolute inset-x-5 bottom-[110px] text-center md:inset-x-6 md:bottom-[70px]"
                initial={{ opacity: 1, y: 16 }}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, delay: active && !reducedMotion ? 0.25 : 0, ease }}
              >
                <h1 className="mb-5 font-display text-[clamp(28px,7vw,40px)] leading-tight md:mb-6 md:text-[clamp(30px,3.4vw,56px)]">{item.title}</h1>
                <Button variant="hero" onClick={onShop}>{item.button}</Button>
              </motion.div>
            </motion.div>
          );
        })}
        <button className="absolute left-6 top-1/2 z-10 hidden size-[46px] place-items-center rounded-md border border-white/40 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:grid" aria-label="Previous slide" onClick={() => changeSlide((slide + slides.length - 1) % slides.length)}>
          <Icon name="arrow" style={{ transform: "rotate(180deg)" }} />
        </button>
        <button className="absolute right-6 top-1/2 z-10 hidden size-[46px] place-items-center rounded-md border border-white/40 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:grid" aria-label="Next slide" onClick={() => changeSlide((slide + 1) % slides.length)}>
          <Icon name="arrow" />
        </button>
        <div className="absolute bottom-[85px] left-1/2 z-10 flex -translate-x-1/2 gap-3 md:bottom-6">
          {slides.map((item, index) => (
            <button className="size-1.5 rounded-md bg-white/45 transition-colors aria-current:bg-white aria-current:outline aria-current:outline-1 aria-current:outline-offset-8 aria-current:outline-white" key={item.image} onClick={() => changeSlide(index)} aria-label={`Show ${item.title}`} aria-current={slide === index} />
          ))}
        </div>
      </section>
    </>
  );
}
