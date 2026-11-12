import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IoStar, IoHeart } from "react-icons/io5";

export const metadata: Metadata = {
  title: "About Us | Colors by Nisha Vijay",
  description:
    "Discover the story and craftsmanship behind Colors by Nisha Vijay. Handcrafted lehengas, sarees, and festive wear rooted in Jaipur's royal heritage.",
};

const featureCards = [
  {
    image: "/About-us/card1.png",
    title: "Crafted with Heritage",
    description:
      "Every creation reflects timeless traditions, intricate craftsmanship and thoughtful design, bringing the beauty of our cultural heritage into the modern world.",
  },
  {
    image: "/About-us/card2.png",
    title: "Curated Ethnic Elegance",
    description:
      "Step into our boutique to explore meticulously crafted traditional wear, offering the perfect mix of style and grace.",
  },
  {
    image: "/About-us/card3.png",
    title: "Modern Festive Charm",
    description:
      "Experience the perfect harmony of traditional craftsmanship and modern pastel palettes, designed to make every celebration truly unforgettable.",
  },
  {
    image: "/About-us/card4.png",
    title: "The Heart of Tradition",
    description:
      "Creating breathtaking ethnic ensembles with uncompromising quality and rich details. Our royal designs beautifully honor timeless femininity and classic Indian artistry.",
  },
  {
    image: "/About-us/card5.png",
    title: "Royal Festive Collection",
    description:
      "Discover our regal assortment of lehengas, gowns, and ethnic sets, beautifully crafted to bring a touch of majestic elegance to your grandest celebrations.",
  },
  {
    image: "/About-us/card6.png",
    title: "Celebrate Your Style",
    description:
      "Embrace the joy of dressing up with our vibrant ensembles, meticulously crafted to bring elegance, movement, and royal charm to your celebrations.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Banner Image */}
      <section className="w-full relative overflow-hidden" aria-label="About Hero Banner">
        <div className="w-full">
          <Image
            src="/About-us/hero.png"
            alt="Colors by Nisha Vijay - Festive Edit, Modern Heirlooms"
            width={1500}
            height={750}
            priority
            className="w-full h-auto object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* 2. The Artistry Behind Every Heirloom */}
      <section className="w-full py-10 md:py-14" aria-label="The Artistry Behind Every Heirloom">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          {/* Section Heading */}
          <div className="text-center mb-6 md:mb-8">
            <h2 className="font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-[#111111]">
              The Artistry Behind Every Heirloom
            </h2>
            <p className="mt-2.5 font-sans text-sm md:text-[15px] font-normal leading-relaxed text-[#444444] tracking-normal max-w-2xl mx-auto px-2 md:px-0">
              An expression of exceptional artistry, where skilled hands create pieces to be cherished for generations.
            </p>
          </div>

          {/* 3-Column Karigar Mosaic Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 items-stretch">
            {/* Column 1: Tall Artisan Portrait */}
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[540px] overflow-hidden rounded-md bg-neutral-100">
              <Image
                src="/About-us/karigar1.png"
                alt="Artisan craftsmanship at Colors by Nisha Vijay"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute bottom-5 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <span className="inline-flex items-center px-6 py-2.5 bg-white text-[#111111] font-sans text-xs md:text-sm font-semibold rounded-md shadow-md whitespace-nowrap">
                    Where Craft Becomes Couture
                  </span>
                </div>
            </div>

            {/* Column 2: Stacked Images with Centered Pill Button */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
              <div className="relative aspect-[4/3] flex-1 md:min-h-[255px] overflow-hidden rounded-md bg-neutral-100">
                <Image
                  src="/About-us/karigar2.png"
                  alt="The Making Of An Heirloom"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute bottom-5 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <span className="inline-flex items-center px-6 py-2.5 bg-white text-[#111111] font-sans text-xs md:text-sm font-semibold rounded-md shadow-md whitespace-nowrap">
                    The Making Of An Heirloom
                  </span>
                </div>
              </div>

              <div className="relative aspect-[4/3] flex-1 md:min-h-[255px] overflow-hidden rounded-md bg-neutral-100">
                <Image
                  src="/About-us/karigar3.png"
                  alt="Karigar artisans at work"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute bottom-5 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <span className="inline-flex items-center px-6 py-2.5 bg-white text-[#111111] font-sans text-xs md:text-sm font-semibold rounded-md shadow-md whitespace-nowrap">
                    An Artistry Of Many Hands
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Tall Embroidery & Lotus Motif Portrait */}
            <div className="relative aspect-[4/3] md:aspect-auto md:h-full md:min-h-[540px] overflow-hidden rounded-md bg-neutral-100">
              <Image
                src="/About-us/karigar4.png"
                alt="Intricate handcrafted lotus embroidery detail"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute bottom-5 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <span className="inline-flex items-center px-6 py-2.5 bg-white text-[#111111] font-sans text-xs md:text-sm font-semibold rounded-md shadow-md whitespace-nowrap">
                    From Skilled Hands To Timeless Pieces
                  </span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 3: Elegance in Every Stitch */}
      <section className="w-full py-10 md:py-14 bg-white" aria-label="Elegance in Every Stitch">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
            {/* Left Column: Image (Aligned directly under left column, reduced height) */}
            <div className="relative w-full aspect-[4/5] md:aspect-auto md:h-[460px] lg:h-[500px] overflow-hidden rounded-md bg-neutral-100 shadow-sm">
              <Image
                src="/About-us/elegance.png"
                alt="Elegance in Every Stitch - Colors by Nisha Vijay"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right Column: Centered Content */}
            <div className="flex flex-col items-center justify-center text-center px-2 md:px-6 lg:px-10">
              <p
                className="font-sans text-sm md:text-[15px] font-medium leading-relaxed tracking-normal text-[#111111] mb-2"
              >
                Our Craftsmanship
              </p>
              <h2
                className="font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-[#111111] mb-4"
              >
                Elegance in Every Stitch
              </h2>
              <p className="font-sans text-sm md:text-[15px] font-normal leading-relaxed text-[#444444] max-w-[500px] mb-8">
                Every outfit reflects the artistry of skilled craftsmen, premium fabrics, and intricate embroidery, bringing timeless tradition and modern elegance together.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-[#2d254d] text-[#FCF1D8] hover:bg-[#d4af37] hover:text-[#2d254d] font-display text-[14px] font-normal uppercase tracking-[1.5px] leading-normal px-8 py-3.5 rounded-md transition-all duration-300 shadow-sm cursor-pointer"
              >
                EXPLORE COLLECTION
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 4: Timeless Products*/}
      <section className="w-full py-10 md:py-14 bg-white" aria-label="Timeless Products">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
            {/* Left Column: Centered Content */}
            <div className="order-2 md:order-1 flex flex-col items-center justify-center text-center px-2 md:px-6 lg:px-10">
              <p
                className="font-sans text-sm md:text-[15px] font-medium leading-relaxed tracking-normal text-[#111111] mb-2"
              >
                Our Products
              </p>
              <h2
                className="font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-[#111111] mb-4"
              >
                Timeless Products
              </h2>
              <p className="font-sans text-sm md:text-[15px] font-normal leading-relaxed text-[#444444] max-w-[520px] mb-8">
                This exquisite lehenga celebrates Indian heritage through divine embroidered motifs, delicate pearl embellishments, floral artistry, and majestic peacock designs. Soft pastel hues and intricate lotus borders bring timeless elegance to every detail.
              </p>
              <Link
                href="/products/raasleela"
                className="inline-flex items-center justify-center bg-[#2d254d] text-[#FCF1D8] hover:bg-[#d4af37] hover:text-[#2d254d] font-display text-[14px] font-normal uppercase tracking-[1.5px] leading-normal px-10 py-3.5 rounded-md transition-all duration-300 shadow-sm cursor-pointer"
              >
                SHOP NOW
              </Link>
            </div>

            {/* Right Column: Image*/}
            <div className="order-1 md:order-2 relative w-full aspect-[4/5] md:aspect-auto md:h-[460px] lg:h-[500px] overflow-hidden rounded-md bg-neutral-100 shadow-sm">
              <Image
                src="/About-us/timeless.png"
                alt="Timeless Products - Exquisite Craftsmanship"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 5: Our Story*/}
      <section className="w-full bg-[#2d254d] text-white py-10 md:py-14" aria-label="Our Story">
        <div className="mx-auto w-full max-w-[880px] px-4 md:px-6 text-center">
          <p className="font-sans text-[13px] md:text-[14px] font-normal tracking-normal text-white mb-2">
            Colors by Nisha Vijay was born from a love for these moments.
          </p>

          <h2
            className="font-display text-2xl font-medium leading-tight tracking-normal md:text-3xl text-white mb-3"
          >
            Our Story
          </h2>

          {/* 5 Stars with side lines using Ionicons */}
          <div className="flex items-center justify-center gap-3 my-4">
            <span className="h-[1px] w-14 md:w-20 bg-white/40" />
            <div className="flex items-center gap-1 text-[#f6d155]">
              <IoStar className="w-3.5 h-3.5 fill-current" />
              <IoStar className="w-3.5 h-3.5 fill-current" />
              <IoStar className="w-3.5 h-3.5 fill-current" />
              <IoStar className="w-3.5 h-3.5 fill-current" />
              <IoStar className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="h-[1px] w-14 md:w-20 bg-white/40" />
          </div>

          <p className="font-sans text-sm md:text-[15px] font-normal leading-relaxed text-white max-w-[800px] mx-auto mb-4">
            We believe that while weddings are unforgettable, it is often the celebrations surrounding them that hold the most cherished memories. The candid photographs, the endless dancing, the happy tears, and the feeling of being surrounded by loved ones. Our collections are designed to be a part of those moments
          </p>

          <p className="font-sans text-sm md:text-[15px] font-normal leading-relaxed text-white max-w-[800px] mx-auto">
            Every piece is thoughtfully created for those who want to celebrate in style while feeling effortlessly comfortable and confident. Blending vibrant colors, elegant silhouettes, and timeless details, our designs are made for every occasion that deserves to be remembered.
          </p>

          {/* Heart with side lines using Ionicons */}
          <div className="flex items-center justify-center gap-3 mt-5 mb-4">
            <span className="h-[1px] w-14 md:w-20 bg-white/40" />
            <IoHeart className="w-2.5 h-2.5 text-[#f6d155] fill-current" />
            <span className="h-[1px] w-14 md:w-20 bg-white/40" />
          </div>

          <div className="space-y-1">
            <p className="font-sans text-[13px] md:text-[14px] text-white">With love</p>
            <p className="font-display text-[18px] md:text-[20px] font-medium text-white">
              Colors by Nisha Vijay
            </p>
          </div>
        </div>
      </section>

      {/* 6. Section 6: Brand Highlights */}
      <section className="w-full py-10 md:py-14 bg-white" aria-label="Brand Pillars and Values">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-[1328px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12 lg:gap-y-14">
            {featureCards.map((card) => (
              <div key={card.title} className="flex flex-col items-center text-center group">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-neutral-100 shadow-xs">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3
                  className="mt-5 mb-2.5 font-display text-lg md:text-xl font-medium leading-snug text-[#111111]"
                >
                  {card.title}
                </h3>
                <p
                  className="font-sans text-sm md:text-[15px] font-normal leading-relaxed tracking-normal text-[#444444] max-w-[340px]"
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
