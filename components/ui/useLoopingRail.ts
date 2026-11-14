"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useLoopingRail(count: number, enabled = true) {
  const rail = useRef<HTMLDivElement>(null);
  const lastInteraction = useRef(0);
  const autoplayPausedRef = useRef(false);
  const motionOptInRef = useRef(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const reducedMotionPreference = useReducedMotion();
  const isPaused = autoplayPaused || (reducedMotionPreference === true && !motionOptIn);
  const toggleAutoplay = useCallback(() => {
    if (autoplayPaused) {
      autoplayPausedRef.current = false;
      setAutoplayPaused(false);
    } else if (reducedMotionPreference && !motionOptIn) {
      motionOptInRef.current = true;
      setMotionOptIn(true);
    } else {
      autoplayPausedRef.current = true;
      setAutoplayPaused(true);
    }
  }, [autoplayPaused, motionOptIn, reducedMotionPreference]);

  const scroll = useCallback((direction: number) => {
    const element = rail.current;
    if (!element) return;
    const first = element.children[0] as HTMLElement | undefined;
    const next = element.children[1] as HTMLElement | undefined;
    const step = enabled && first && next ? next.offsetLeft - first.offsetLeft : element.clientWidth;
    element.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [enabled]);

  useLayoutEffect(() => {
    const element = rail.current;
    if (!enabled || !element || count < 2) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let settling: ReturnType<typeof setTimeout>;
    const cycleWidth = () => (element.children[count] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft;
    const normalize = () => {
      const width = cycleWidth();
      if (!width) return;
      if (element.scrollLeft < width - 1) element.scrollTo({ left: element.scrollLeft + width, behavior: "instant" });
      else if (element.scrollLeft >= width * 2 - 1) element.scrollTo({ left: element.scrollLeft - width, behavior: "instant" });
    };
    const settle = () => {
      clearTimeout(settling);
      settling = setTimeout(normalize, 180);
    };
    const interact = () => { lastInteraction.current = Date.now(); };
    element.scrollTo({ left: cycleWidth(), behavior: "instant" });
    const resize = new ResizeObserver(() => element.scrollTo({ left: cycleWidth(), behavior: "instant" }));
    resize.observe(element);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.25 });
    observer.observe(element);
    element.addEventListener("scroll", settle, { passive: true });
    element.addEventListener("pointerdown", interact);
    element.addEventListener("wheel", interact, { passive: true });
    const timer = window.setInterval(() => {
      if (autoplayPausedRef.current || (reducedMotion.matches && !motionOptInRef.current) || !visible || document.hidden || element.matches(":hover") || element.parentElement?.contains(document.activeElement) || Date.now() - lastInteraction.current < 6000) return;
      scroll(1);
    }, 3500);
    return () => {
      observer.disconnect();
      resize.disconnect();
      clearTimeout(settling);
      window.clearInterval(timer);
      element.removeEventListener("scroll", settle);
      element.removeEventListener("pointerdown", interact);
      element.removeEventListener("wheel", interact);
    };
  }, [count, enabled, scroll]);

  return { rail, scroll, autoplayPaused: isPaused, toggleAutoplay };
}
