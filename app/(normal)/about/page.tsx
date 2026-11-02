import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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

      {/* 2. The Artistry Behind Every Heirloom (Grid from Reference Screenshot) */}
      <section className="w-full py-12 md:py-16 lg:py-20" aria-label="The Artistry Behind Every Heirloom">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-display text-[28px] md:text-[36px] font-normal leading-[36px] md:leading-[45px] text-[#111111] tracking-normal">
              The Artistry Behind Every Heirloom
            </h2>
            <p className="mt-3 font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] tracking-normal max-w-2xl mx-auto">
              An expression of exceptional artistry, where skilled hands create pieces to be cherished for generations.
            </p>
          </div>

          {/* 3-Column Karigar Mosaic Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 lg:gap-6 items-stretch">
            {/* Column 1: Tall Artisan Portrait */}
            <div className="relative aspect-[3/4] md:aspect-auto md:h-full min-h-[380px] md:min-h-[540px] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/About-us/karigar1.png"
                alt="Artisan craftsmanship at Colors by Nisha Vijay"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>

            {/* Column 2: Stacked Images with Centered Pill Button */}
            <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
              <div className="relative aspect-[4/3] flex-1 min-h-[220px] md:min-h-[255px] overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src="/About-us/karigar2.png"
                  alt="The Making Of An Heirloom"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute bottom-5 inset-x-0 flex justify-center z-10 pointer-events-none">
                  <span className="inline-flex items-center px-6 py-2.5 bg-white text-[#111111] font-sans text-xs md:text-sm font-semibold rounded-full shadow-md whitespace-nowrap">
                    The Making Of An Heirloom
                  </span>
                </div>
              </div>

              <div className="relative aspect-[4/3] flex-1 min-h-[220px] md:min-h-[255px] overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src="/About-us/karigar3.png"
                  alt="Karigar artisans at work"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Column 3: Tall Embroidery & Lotus Motif Portrait */}
            <div className="relative aspect-[3/4] md:aspect-auto md:h-full min-h-[380px] md:min-h-[540px] overflow-hidden rounded-xl bg-neutral-100">
              <Image
                src="/About-us/karigar4.png"
                alt="Intricate handcrafted lotus embroidery detail"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Story Section */}
      <section className="bg-neutral-50/60 border-y border-neutral-100 py-12 md:py-16 lg:py-20" aria-label="Our Story">
        <div className="mx-auto w-full max-w-[920px] px-5 lg:px-8 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-[#777777] mb-2.5">
            Where Craft Becomes Couture
          </p>
          <h2 className="font-display text-[28px] md:text-[36px] font-normal leading-[36px] md:leading-[45px] text-[#111111] tracking-normal mb-5">
            Our Story
          </h2>
          <p className="font-sans text-[16px] md:text-[17px] font-medium leading-[28px] text-[#111111] mb-5">
            Colors by Nisha Vijay was born from a love for these moments.
          </p>
          <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] mb-4">
            We believe that while weddings are unforgettable, it is often the celebrations surrounding them that hold the most cherished memories. The candid photographs, the endless dancing, the happy tears, and the feeling of being surrounded by loved ones.
          </p>
          <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] mb-8">
            Our collections are designed to be a part of those moments. Every piece is thoughtfully created for those who want to celebrate in style while feeling effortlessly comfortable and confident. Blending vibrant colors, elegant silhouettes, and timeless details, our designs are made for every occasion that deserves to be remembered.
          </p>
          <div className="pt-2">
            <p className="font-display italic text-lg text-[#111111]">With love,</p>
            <p className="font-display text-xl font-medium text-[#111111] mt-1">
              Colors by Nisha Vijay
            </p>
          </div>
        </div>
      </section>

      {/* 4. Brand Highlights (6 Feature Cards Grid) */}
      <section className="w-full py-12 md:py-16 lg:py-20" aria-label="Brand Pillars and Values">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-[28px] md:text-[36px] font-normal leading-[36px] md:leading-[45px] text-[#111111] tracking-normal">
              Crafted For Celebrations
            </h2>
            <p className="mt-3 font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] tracking-normal max-w-2xl mx-auto">
              Timeless traditions, authentic artistry, and modern elegance woven into every ensemble.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8 lg:gap-10">
            {featureCards.map((card) => (
              <div key={card.title} className="flex flex-col group">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 shadow-xs">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 mb-2 font-display text-[20px] md:text-[22px] font-semibold text-[#111111] leading-tight">
                  {card.title}
                </h3>
                <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Craftsmanship Showcase: Elegance in Every Stitch */}
      <section className="border-t border-neutral-100 bg-white py-12 md:py-16 lg:py-20" aria-label="Elegance in Every Stitch">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 shadow-sm">
              <Image
                src="/About-us/elegance.png"
                alt="Elegance in Every Stitch - Colors by Nisha Vijay"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="space-y-5">
              <p className="font-sans text-xs uppercase tracking-widest text-[#777777]">
                The Artistry
              </p>
              <h2 className="font-display text-[28px] md:text-[36px] font-normal leading-[36px] md:leading-[45px] text-[#111111] tracking-normal">
                Elegance in Every Stitch
              </h2>
              <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444]">
                Every outfit reflects the artistry of skilled craftsmen, premium fabrics, and intricate embroidery, bringing timeless tradition and modern elegance together.
              </p>
              <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444]">
                Rooted in the royal heritage of Jaipur, Rajasthan, our ateliers breathe life into hand-embroidery, delicate zardozi, gota patti work, and refined tailoring. From the initial sketch to the final stitch, every garment is an enduring labor of love.
              </p>
              <div className="pt-2">
                <Link
                  href="/#currently-obsessed"
                  className="inline-block border-b border-[#111111] pb-1 font-display text-sm uppercase tracking-wider text-[#111111] transition-colors hover:border-purple hover:text-purple"
                >
                  Explore Collections &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Product Heritage: Timeless Products */}
      <section className="bg-ice/30 py-12 md:py-16 lg:py-20" aria-label="Timeless Products">
        <div className="mx-auto w-full max-w-[1328px] px-5 lg:px-8">
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="order-2 md:order-1 space-y-5">
              <p className="font-sans text-xs uppercase tracking-widest text-[#777777]">
                From Skilled Hands to Timeless Pieces
              </p>
              <h2 className="font-display text-[28px] md:text-[36px] font-normal leading-[36px] md:leading-[45px] text-[#111111] tracking-normal">
                Timeless Products
              </h2>
              <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444]">
                This exquisite lehenga celebrates Indian heritage through divine embroidered motifs, delicate pearl embellishments, floral artistry, and majestic peacock designs. Soft pastel hues and intricate lotus borders bring timeless elegance to every detail.
              </p>
              <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444]">
                Our pieces are created to be cherished across generations, bridging heirloom traditions with modern grace for grand celebrations, sangeets, weddings, and festive gatherings.
              </p>
              <div className="pt-2">
                <Link
                  href="/#festive-edit"
                  className="inline-block border-b border-[#111111] pb-1 font-display text-sm uppercase tracking-wider text-[#111111] transition-colors hover:border-purple hover:text-purple"
                >
                  Discover Heirloom Edits &rarr;
                </Link>
              </div>
            </div>

            <div className="order-1 md:order-2 relative aspect-[3/4] md:aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 shadow-sm">
              <Image
                src="/About-us/timeless.png"
                alt="Timeless Products - Masterpiece Lehenga"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Studio Visit Banner */}
      <section className="border-t border-neutral-100 bg-white py-12 md:py-16 text-center" aria-label="Visit Our Studio">
        <div className="mx-auto max-w-[700px] px-5">
          <h2 className="font-display text-[24px] md:text-[28px] font-normal text-[#111111] tracking-normal mb-2">
            Visit Our Studio in Jaipur
          </h2>
          <p className="font-sans text-[15px] font-normal leading-[25.71px] text-[#444444] mb-3">
            A-235, Main Gandhi Path West, Opp. Narayan Ji Gajak, Vaishali Nagar, Jaipur, Rajasthan &ndash; 302021
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-sans">
            <a
              href="tel:+919799330455"
              className="text-[#111111] font-medium underline underline-offset-4 hover:text-purple transition-colors"
            >
              +91 97993 30455
            </a>
            <span className="text-neutral-300">&bull;</span>
            <a
              href="mailto:colorbynishavijay@gmail.com"
              className="text-[#111111] font-medium underline underline-offset-4 hover:text-purple transition-colors"
            >
              colorbynishavijay@gmail.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
