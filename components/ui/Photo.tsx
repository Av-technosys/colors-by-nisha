import { images } from "@/data/home";
import Image from "next/image";

export function Photo({
  id,
  alt,
  className = "",
  priority = false,
  contain = false,
}: {
  id?: number | string;
  alt: string;
  className?: string;
  priority?: boolean;
  contain?: boolean;
}) {
  let src = "/product-placeholder.svg";
  if (typeof id === "string") {
    if (id.startsWith("/") || id.startsWith("http")) {
      src = id;
    } else if (images[Number(id)]) {
      src = images[Number(id)];
    }
  } else if (typeof id === "number" && images[id]) {
    src = images[id];
  }

  const isExternal = typeof src === "string" && (src.startsWith("http") || src.startsWith("data:"));

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 767px) 100vw, 50vw"
      unoptimized={isExternal}
      className={`${contain ? "object-contain" : "object-cover"} ${className}`}
      priority={priority}
    />
  );
}

