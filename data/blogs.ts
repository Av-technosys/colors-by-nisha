export interface BlogSection {
  title?: string;
  content?: string;
  bullets?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  intro?: string;
  sections?: BlogSection[];
  contentHtml?: string;
  conclusion?: string;
}

export const blogPostsData: BlogPost[] = [
  {
    id: "1",
    slug: "how-to-choose-the-perfect-lehenga-for-every-occasion",
    title: "How to Choose the Perfect Lehenga for Every Occasion",
    category: "News",
    excerpt:
      "A lehenga is more than just an outfit—it's a celebration of elegance, tradition, and confidence. Whether you're attending a wedding, engagement, festive celebration, or family function, choosing the right lehenga can make all the difference.",
    author: "Nisha Vijay",
    date: "Jun 17 2026",
    readTime: "5 min read",
    image: "/Home/images/015_kesari_rang__IMG_0124.jpg",
    intro:
      "A lehenga is more than just an outfit—it's a celebration of elegance, tradition, and confidence. Whether you're attending a wedding, engagement, festive celebration, or family function, choosing the right lehenga can make all the difference.",
    sections: [
      {
        title: "1. Wedding Functions",
        content:
          "For weddings, opt for richly embroidered lehengas featuring zari work, sequins, mirror work, or hand embroidery. Deep shades like maroon, emerald green, royal blue, and wine are timeless choices.",
      },
      {
        title: "2. Festivals",
        content:
          "Festivals like Diwali, Navratri, Pongal, and Eid call for vibrant colors and lightweight fabrics. Floral prints, pastel shades, and minimal embroidery provide both comfort and style.",
      },
      {
        title: "3. Engagement & Reception",
        content:
          "Choose elegant silhouettes with subtle embellishments. Soft tones such as blush pink, lavender, champagne, or ivory create a sophisticated look.",
      },
      {
        title: "4. Day Events",
        content:
          "For haldi, mehendi, or daytime celebrations, select breathable fabrics like georgette, chiffon, or organza with floral prints and light embroidery.",
      },
      {
        title: "Styling Tips",
        bullets: [
          "Pair your lehenga with statement earrings.",
          "Choose comfortable footwear for long events.",
          "Carry a matching clutch.",
          "Keep your makeup balanced with your outfit.",
        ],
      },
      {
        title: "Shop the Latest Collection",
        content:
          "At Colors by Nisha Vijay, we curate elegant lehengas designed for every celebration, combining timeless craftsmanship with modern fashion.",
      },
    ],
  },
  {
    id: "2",
    slug: "top-ethnic-fashion-trends-for-2026",
    title: "Top Ethnic Fashion Trends for 2026",
    category: "News",
    excerpt:
      "Top Ethnic Fashion Trends You Shouldn't Miss in 2026 Fashion evolves every season, but ethnic wear continues to blend traditional craftsmanship with contemporary designs, pastel palettes, and architectural motifs....",
    author: "Nisha Vijay",
    date: "Jul 16 2026",
    readTime: "5 min read",
    image: "/Home/images/010_flamingo_fable__IMG_0053.jpg",
    intro:
      "Fashion evolves every season, but ethnic couture continues to honor its deep-rooted heritage while embracing contemporary sensibilities. In 2026, the intersection of understated luxury and artisanal craft takes center stage.",
    sections: [
      {
        title: "1. Botanical & Whimsical Prints",
        content:
          "Printed lehengas inspired by lush tropical flora, blooming birds, and soft garden elements are redefining festive wardrobes with breathable elegance.",
      },
      {
        title: "2. Statement 3D Pearl Work",
        content:
          "Intricate pearl tassel detailing on sleeve cuffs and 3D floral embellishments offer tactile dimension and subtle gleam without the heaviness of metal zari.",
      },
      {
        title: "3. Pastel Sovereignty",
        content:
          "From powder blue to blush peony and ivory gold, modern brides and bridesmaids are embracing serene tones that capture sunlight gorgeously.",
      },
      {
        title: "Styling Tips",
        bullets: [
          "Balance heavy necklines with minimal ear studs.",
          "Choose lightweight dupatta draping for destination ceremonies.",
          "Opt for monochrome tone-on-tone coordinates for a statuesque look.",
        ],
      },
      {
        title: "Shop the Latest Collection",
        content:
          "Explore the Colors by Nisha Vijay 2026 curation for trendsetting silhouettes crafted with artisanal mastery.",
      },
    ],
  },
  {
    id: "3",
    slug: "why-every-woman-needs-a-versatile-ethnic-wardrobe",
    title: "Why Every Woman Needs a Versatile Ethnic Wardrobe",
    category: "News",
    excerpt:
      "Why Every Woman Needs a Versatile Ethnic Wardrobe Ethnic fashion is no longer reserved only for weddings. Today's collections offer versatile styles suitable for brunch celebrations, festive pujas, and evening gatherings...",
    author: "Nisha Vijay",
    date: "Jul 16 2026",
    readTime: "4 min read",
    image: "/Home/images/005_where_heritage_meets_modern_style__WhatsApp_Image_2026-07-20_at_3.59.21_PM.jpg",
    intro:
      "Ethnic fashion is no longer reserved exclusively for high-profile weddings or grand traditional galas. In modern wardrobes, ethnic ensembles have evolved into versatile style statements that effortlessly transition from intimate daytime gatherings to celebratory soirees.",
    sections: [
      {
        title: "1. Mix-and-Match Flexibility",
        content:
          "A structured embroidered blouse pairs effortlessly with a gathered silk skirt, an organza saree, or high-waisted contemporary trousers.",
      },
      {
        title: "2. Year-Round Celebrations",
        content:
          "Investing in high-grade natural silks and breathable cotton-silks ensures you stay comfortable across summer destination weddings and winter festivals.",
      },
      {
        title: "3. Timeless Heirloom Value",
        content:
          "Unlike fast fashion, artisanal hand-embroidered ethnic pieces carry heritage charm that can be cherished and styled across generations.",
      },
      {
        title: "Styling Tips",
        bullets: [
          "Layer lightweight capes over minimalist crop tops.",
          "Re-drape your dupatta in contemporary front cowl styles.",
          "Invest in versatile neutral blouses in ivory, champagne, and gold.",
        ],
      },
      {
        title: "Shop the Latest Collection",
        content:
          "Discover modular ethnic couture at Colors by Nisha Vijay that blends everyday grace with regal poise.",
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return blogPostsData;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const clean = slug.toLowerCase().trim();
  return (
    blogPostsData.find((p) => p.slug === clean) ||
    blogPostsData.find((p) => clean.includes(p.slug) || p.slug.includes(clean))
  );
}

export function getAdjacentPosts(currentSlug: string): { prev?: BlogPost; next?: BlogPost } {
  const index = blogPostsData.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return {};
  const prev = index > 0 ? blogPostsData[index - 1] : undefined;
  const next = index < blogPostsData.length - 1 ? blogPostsData[index + 1] : undefined;
  return { prev, next };
}
