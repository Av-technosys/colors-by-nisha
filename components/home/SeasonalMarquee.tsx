"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SeasonalMarquee() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="overflow-hidden bg-purple py-2.5 font-display text-sm text-white md:text-base">
      <motion.div className="flex w-max" animate={{ x: reducedMotion ? 0 : "-50%" }} transition={{ duration: 50, ease: "linear", repeat: Infinity }}>{Array.from({ length: 4 }, (_, i) => <span key={i} className="mr-8 flex items-center gap-8 whitespace-nowrap md:mr-15 md:gap-15">Exclusive Seasonal Picks <b className="text-2xl font-normal">✧</b> Express Your True Self <b className="text-2xl font-normal">✧</b> Curated Winter Wonders <b className="text-2xl font-normal">✧</b>
      </span>)}</motion.div>
    </div>
  );
}
