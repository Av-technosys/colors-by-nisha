import { images } from "@/data/home";
import Image from "next/image";

export function Photo({ id, alt, className = "", priority = false, contain = false }: { id: number; alt: string; className?: string; priority?: boolean; contain?: boolean }) {
  return <Image src={images[id]} alt={alt} fill sizes="(max-width: 767px) 100vw, 50vw" className={`${contain ? "object-contain" : "object-cover"} ${className}`} priority={priority} />;
}

