"use client";

import { useEffect, useRef } from "react";

export function PreviewVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const play = () => {
      video.muted = true;
      if (!reducedMotion.matches) void video.play().catch(() => { });
    };
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else video.pause();
    }, { rootMargin: "150px 0px", threshold: 0 });
    const ready = () => { if (visible) play(); };
    const motionChange = () => {
      if (reducedMotion.matches) video.pause();
      else if (visible) play();
    };
    observer.observe(video);
    video.addEventListener("loadeddata", ready);
    reducedMotion.addEventListener("change", motionChange);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", ready);
      reducedMotion.removeEventListener("change", motionChange);
      video.pause();
    };
  }, [src]);

  return <video className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:transform-none" ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />;
}
