export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: "Lehenga" | "Saree" | "Ethnic";
  collection?: string;
  inStock: boolean;
  stockCount?: number;
  badge?: "Sale" | "New" | "Bestseller";
  images: string[];
  description: string;
  details?: {
    noOfComponents?: string;
    components?: string;
    noteworthyFeatures?: string;
    occasion?: string;
    style?: string;
    pattern?: string;
    typeOfWork?: string;
    work?: string;
    fabric?: string;
    colour?: string;
    blouse?: string;
    flare?: string;
    dupatta?: string;
    care?: string;
    dispatch?: string;
  };
  sizes?: string[];
}

export const productsData: ProductItem[] = [
  {
    id: "10399229444396",
    slug: "bharat-welcome-print-theme-full-patch-work",
    name: "AZURE REVERIE",
    price: 24500,
    originalPrice: 28000,
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 3,
    badge: "Bestseller",
    images: [
      "/products/azure-reverie/1.jpg",
      "/products/azure-reverie/2.jpg",
      "/products/azure-reverie/3.jpg",
      "/products/azure-reverie/4.jpg",
    ],
    description:
      "Ethereal and whimsical, Azure Reverie draws inspiration from endless blue skies and dreamlike landscapes. The digitally illustrated lehenga features floating cloud motifs and scenic garden elements, creating a captivating visual narrative. Paired with a statement blouse adorned with intricate 3D pearl work, the ensemble is elevated through delicate pearl tassels and subtle sequin embellishments that add movement and sparkle. Designed for the modern woman who loves playful elegance, Azure Reverie is a standout choice for celebrations that call for effortless glamour.",
    details: {
      noOfComponents: "2",
      components: "Lehenga, Embellished Blouse",
      noteworthyFeatures:
        "Scenic cloud-inspired digital print, statement 3D pearl work, pearl tassel detailing on sleeves, print featuring floating clouds, tropical foliage, architectural accents and whimsical storytelling elements.",
      occasion: "Mehendi Ceremonies, Sangeet Celebrations, Destination Weddings, Brunch & Day Festivities",
      style: "Contemporary Indian / Resort Couture",
      pattern: "Scenic Cloud & Garden Botanical Print",
      typeOfWork: "3D Pearl Work, Pearl Tassels & Sequin Handwork",
      fabric: "Printed Silk Blend Lehenga, Embellished Blouse",
      colour: "Azure Blue, Ivory & Soft Pastel Tones",
      blouse: "Padded designer sweetheart neckline blouse with handmade pearl tassels",
      flare: "Approx. 9 metres voluminous flare with can-can and double canvas lining",
      dupatta: "Sheer Organza dupatta with embroidered scalloped borders and delicate buttis",
      care: "Strictly dry clean only. Store in muslin cloth.",
      dispatch: "10-15 business days (Custom sizing available)",
    },
    sizes: ["XS", "S", "M", "L", "XL", "XXL", "Custom Fit"],
  },
  {
    id: "10398948458796",
    slug: "full-floral-print-orange-dupatta-choli-style-flared-lehenga-approx-9-metre-flare",
    name: "CELESTE BLOOM & ROSÉ REVERIE",
    price: 24500,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 5,
    images: [
      "/Home/images/010_flamingo_fable__IMG_0053.jpg",
      "/Home/images/011_flamingo_fable__IMG_0055.jpg",
      "/Home/images/012_flamingo_fable__IMG_0052.jpg",
    ],
    description:
      "A dual tone wonder featuring rich contrasting palettes. Celeste Bloom and Rosé Reverie captures the celebratory charm of blooming springtime with modern silhouettes and signature hand embroidery.",
    details: {
      fabric: "Pure Chanderi Silk & Organza",
      work: "Handcrafted Zari, Sequins & Floral Appliqué",
      blouse: "Choli style structured blouse with cap sleeve accents",
      flare: "Approx. 9 metres flare with reinforced hem",
      care: "Dry clean only",
      dispatch: "12-14 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458797",
    slug: "celestial-bloom",
    name: "CELESTIAL BLOOM",
    price: 24500,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/036_ivory_bloom__ivorybloom1.jpg",
      "/Home/images/037_ivory_bloom__ivorybloom3.jpg",
    ],
    description:
      "Celestial Bloom blends traditional ivory grace with contemporary gold accents. Intricate craftsmanship ensures you radiate poise at every celebration.",
    details: {
      fabric: "Mulberry Silk & Tissue Organza",
      work: "Mukaish, Sequin & Fine Threadwork",
      care: "Dry clean only",
      dispatch: "10-12 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458798",
    slug: "lotus-print-double-layer-lehenga-with-orange-cap-style-frill-blouse",
    name: "DUSKY BLOOM",
    price: 37000,
    originalPrice: 42000,
    badge: "Sale",
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 2,
    images: [
      "/Home/images/008_kesari_whisper_ivory_whisper__IMG_0039.jpg",
      "/Home/images/057_kesari_whisper_ivory_whisper__IMG_0037.jpg",
    ],
    description:
      "Featuring a magnificent double-layer flare with heritage lotus motifs and a contemporary orange cap-style frill blouse. A stunning statement for sangeet or destination weddings.",
    details: {
      fabric: "Crepe Silk & Tissue Georgette",
      work: "Hand Block Lotus Print, Gotta Patti & Beadwork",
      blouse: "Cap-style ruffled blouse with back tie-up",
      flare: "Double tier flare approx. 11 metres",
      care: "Dry clean only",
      dispatch: "15-18 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458799",
    slug: "double-layer-lehenga-vrindavan-theme-best-suited-for-a-bride",
    name: "ENCHANTED VRINDAVAN",
    price: 65000,
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 2,
    badge: "Bestseller",
    images: [
      "/Home/images/022_enchanted_vrindavan__IMG_0090.jpg",
      "/Home/images/023_enchanted_vrindavan__IMG_0088.jpg",
      "/Home/images/024_enchanted_vrindavan__IMG_0089.jpg",
    ],
    description:
      "A bridal masterpiece capturing the sacred, poetic gardens of Vrindavan. Intricate peacocks, blooming kadamba trees, and flowing rivers are brought alive with heirloom zardozi and resham embroidery.",
    details: {
      fabric: "Pure Raw Silk & Handloom Tissue",
      work: "Heirloom Zardozi, Fine Resham & Semi-precious Stone Highlights",
      blouse: "Heavily embroidered royal neck blouse with latkan details",
      flare: "Double canvas 10-metre bridal flare",
      dupatta: "Two dupattas: Handcrafted Organza trail dupatta + Silk veil",
      care: "Specialized dry clean only",
      dispatch: "20-25 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458800",
    slug: "flower-blossom-print-lehenga",
    name: "FLAMINGO FABLE",
    price: 24500,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 6,
    images: [
      "/Home/images/010_flamingo_fable__IMG_0053.jpg",
      "/Home/images/011_flamingo_fable__IMG_0055.jpg",
      "/Home/images/012_flamingo_fable__IMG_0052.jpg",
      "/Home/images/013_flamingo_fable__IMG_0054.jpg",
    ],
    description:
      "A celebration of art and nature, Flamingo Fable is a contemporary lehenga that blends playful elegance with effortless sophistication. Featuring an exclusive botanical print inspired by blooming florals and exotic birds, the ensemble is paired with a structured blouse delicately embellished with intricate pearl and sequin work. The flowing lehenga creates graceful movement while offering a fresh, modern take on festive dressing. Perfect for destination weddings, mehendi ceremonies, brunch celebrations, and resort festivities, Flamingo Fable is designed to make a statement with understated luxury.",
    details: {
      noOfComponents: "2",
      components: "Blouse, Skirt (Lehenga)",
      noteworthyFeatures:
        "Exclusive botanical print, intricate pearl and sequin embellishments, contemporary silhouette, lightweight construction",
      occasion: "Mehendi Ceremonies, Destination Weddings, Brunch Celebrations, Resort Festivities & Day Events",
      style: "Contemporary Indian / Resort Couture",
      pattern: "Botanical & Exotic Floral Print",
      typeOfWork: "Intricate Pearl Work, Sequin Embellishments",
      fabric: "Silk Blouse, Printed Silk Lehenga",
      colour: "Ivory, Blush Pink & Multicolour Botanical Print",
      care: "Specialized dry clean only",
      dispatch: "10-12 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458801",
    slug: "kesari-rang",
    name: "KESARI RANG",
    price: 68000,
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 3,
    images: [
      "/Home/images/015_kesari_rang__IMG_0124.jpg",
      "/Home/images/016_kesari_rang__IMG_0125.jpg",
      "/Home/images/017_kesari_rang__IMG_0126.jpg",
      "/Home/images/018_kesari_rang__IMG_0127.jpg",
    ],
    description:
      "A royal saffron ode to Rajputana grandeur. Kesari Rang combines vibrant auspicious hues with rich golden zari borders and masterful cutwork detailing.",
    details: {
      fabric: "Pure Banarasi Brocade Silk & Chiffon",
      work: "Traditional Marodi, Dabka & Antique Gold Zari",
      care: "Dry clean only",
      dispatch: "15-20 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458802",
    slug: "moonlit-manor",
    name: "MOONLIT MANOR",
    price: 24500,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/026_moonlit_manor__IMG_0017.jpg",
      "/Home/images/027_moonlit_manor__IMG_0016.jpg",
      "/Home/images/028_moonlit_manor__IMG_0018.jpg",
      "/Home/images/029_moonlit_manor__IMG_0015.jpg",
    ],
    description:
      "Midnight hues infused with celestial silver stardust. Designed for receptions and cocktail evenings where understated luxury speaks volumes.",
    details: {
      fabric: "Silk Satin & Italian Tulle",
      work: "Silver Sequins, Cut Glass Beads & Metallic Cord Embroidery",
      care: "Dry clean only",
      dispatch: "10-14 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458803",
    slug: "noori",
    name: "NOORI",
    price: 26000,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 5,
    images: [
      "/Home/images/030_noori__IMG_0144.jpg",
      "/Home/images/031_noori__IMG_0145.jpg",
    ],
    description:
      "A radiant ensemble radiating pristine luminosity. Delicately woven patterns paired with a handcrafted designer blouse for grand festive events.",
    details: {
      fabric: "Chanderi Silk & Organza",
      work: "Handcrafted Zari & Floral Threadwork",
      care: "Dry clean only",
      dispatch: "10-12 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458804",
    slug: "noor",
    name: "NOOR",
    price: 22000,
    category: "Saree",
    collection: "Drape Elite",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/032_noor__IMG_0152.jpg",
      "/Home/images/033_noor__IMG_0151.jpg",
    ],
    description:
      "The Noor saree cascades gracefully in fluid silk chiffon, accented by delicate scalloped borders and understated pearl handwork along the pallu.",
    details: {
      fabric: "Pure Silk Chiffon",
      work: "Hand Scalloped Borders & Seed Pearl Accents",
      blouse: "Includes unstitched designer blouse piece (0.9m)",
      care: "Dry clean only",
      dispatch: "7-10 business days",
    },
    sizes: ["Free Size (Includes Unstitched Blouse)"],
  },
  {
    id: "10398948458805",
    slug: "meher",
    name: "MEHER",
    price: 22000,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/034_meher__meher.jpg",
      "/Home/images/035_meher__meher1.jpg",
    ],
    description:
      "Meher radiates pure warmth with timeless motifs, tailored in an effortless silhouette suited for mehendi and intimate celebratory gatherings.",
    details: {
      fabric: "Georgette with Shantoon lining",
      work: "Gotta Patti & Thread Embroidery",
      care: "Dry clean only",
      dispatch: "10-12 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458806",
    slug: "ivory-bloom",
    name: "IVORY BLOOM",
    price: 38000,
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 3,
    images: [
      "/Home/images/036_ivory_bloom__ivorybloom1.jpg",
      "/Home/images/037_ivory_bloom__ivorybloom3.jpg",
    ],
    description:
      "Subtle ivory hues with intricate tonal threadwork and shimmering golden accents. An eternal favourite for day weddings and royal celebrations.",
    details: {
      fabric: "Organza & Silk Brocade",
      work: "Tonal Resham Embroidery with Muted Sequins",
      care: "Dry clean only",
      dispatch: "12-15 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458807",
    slug: "pastel-prism",
    name: "PASTEL PRISM",
    price: 58000,
    category: "Lehenga",
    collection: "Couture Royale",
    inStock: true,
    stockCount: 2,
    images: [
      "/Home/images/038_pastel_prism__PASTELPRISM.jpg",
      "/Home/images/039_pastel_prism__PASTELPRISM2.jpg",
    ],
    description:
      "A prism of delicate lavender, blush pink, and mint hues harmoniously blended into a sweeping fairytale lehenga.",
    details: {
      fabric: "Italian Net & Tulle over Silk Lining",
      work: "Prism Crystal Work & Micro-Sequin Shimmer",
      care: "Dry clean only",
      dispatch: "15-20 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458808",
    slug: "gaurika",
    name: "GAURIKA",
    price: 28000,
    category: "Lehenga",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/040_gaurika__GAURIKA.jpg",
      "/Home/images/041_gaurika__GAURIKA1.jpg",
    ],
    description:
      "A classic celebration of feminine charm with traditional floral jaal embroidery and delicate handcrafted borders.",
    details: {
      fabric: "Chanderi Silk & Chiffon",
      work: "Floral Jaal Resham Work & Gotta Trims",
      care: "Dry clean only",
      dispatch: "10-14 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458809",
    slug: "silver-muse",
    name: "SILVER MUSE",
    price: 18500,
    category: "Saree",
    collection: "Drape Elite",
    inStock: true,
    stockCount: 6,
    badge: "Sale",
    originalPrice: 21000,
    images: [
      "/Home/images/045_silver_muse__silvermuse1.jpg",
      "/Home/images/046_silver_muse__silvermuse2.jpg",
    ],
    description:
      "A metallic silver dream saree woven with sheer poise. Features understated woven texture and a modern contrast border.",
    details: {
      fabric: "Tissue Metallic Silk",
      work: "Silver Zari Weaving",
      care: "Dry clean only",
      dispatch: "7-10 business days",
    },
    sizes: ["Free Size (Includes Unstitched Blouse)"],
  },
  {
    id: "10398948458810",
    slug: "roohani-gul",
    name: "ROOHANI GUL",
    price: 39000,
    category: "Saree",
    collection: "Drape Elite",
    inStock: true,
    stockCount: 3,
    images: [
      "/Home/images/047_roohani_gul__rohanigul.png",
      "/Home/images/047_roohani_gul__rohanigul.png",
    ],
    description:
      "Roohani Gul evokes the soul of classic Indian flora, hand-embellished on gossamer fabric for unforgettable evening soirees.",
    details: {
      fabric: "Organza Tissue Silk",
      work: "Hand Painted Floral Motifs & Cutdana Work",
      care: "Dry clean only",
      dispatch: "10-14 business days",
    },
    sizes: ["Free Size (Includes Unstitched Blouse)"],
  },
  {
    id: "10398948458811",
    slug: "mehraab",
    name: "MEHRAAB",
    price: 39000,
    category: "Saree",
    collection: "Drape Elite",
    inStock: true,
    stockCount: 3,
    images: [
      "/Home/images/048_mehraab__mehraab.png",
      "/Home/images/048_mehraab__mehraab.png",
    ],
    description:
      "Architectural elegance inspired by royal Mughal archways (Mehraab). Drapes with fluid poise for timeless occasions.",
    details: {
      fabric: "Matka Silk & Georgette",
      work: "Fine Resham Arch Embroidery",
      care: "Dry clean only",
      dispatch: "10-14 business days",
    },
    sizes: ["Free Size (Includes Unstitched Blouse)"],
  },
  {
    id: "10398948458812",
    slug: "gulzar",
    name: "GULZAR",
    price: 93000,
    category: "Ethnic",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 2,
    badge: "Bestseller",
    images: [
      "/Home/images/049_gulzar__IMG_0336.jpg",
      "/Home/images/050_gulzar__IMG_0337.jpg",
    ],
    description:
      "A grand regal couture ensemble featuring unmatched artisan mastery, heavy hand-embroidered velvet accents, and pure silk textures.",
    details: {
      fabric: "Pure Velvet & Brocade Silk",
      work: "Heavy Antique Zardozi, Kundan & Resham Hand Embroidery",
      care: "Specialized dry clean only",
      dispatch: "20-25 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL", "Custom Fit"],
  },
  {
    id: "10398948458813",
    slug: "pichwai-rooh",
    name: "PICHWAI ROOH",
    price: 16500,
    category: "Ethnic",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 5,
    images: [
      "/Home/images/051_pichwai_rooh__IMG_0330.jpg",
      "/Home/images/052_pichwai_rooh__IMG_0331.jpg",
    ],
    description:
      "Inspired by traditional Pichwai paintings of Rajasthan, Pichwai Rooh brings devotional artistry into modern festive silhouettes.",
    details: {
      fabric: "Pure Cotton Silk & Chanderi",
      work: "Hand Screen Pichwai Print & Foil Detailing",
      care: "Dry clean only",
      dispatch: "7-10 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458814",
    slug: "shahi-bagh",
    name: "SHAHI BAGH",
    price: 16500,
    category: "Ethnic",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/059_shahi_bagh__IMG_0060.jpg",
      "/Home/images/059_shahi_bagh__IMG_0060.jpg",
    ],
    description:
      "An enchanting garden of royal flora captured in an effortless festive anarkali ensemble.",
    details: {
      fabric: "Chanderi Silk & Organza Dupatta",
      work: "Gold Foil Printing & Gotta Patti",
      care: "Dry clean only",
      dispatch: "7-10 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "10398948458815",
    slug: "mocha-vista",
    name: "MOCHA VISTA",
    price: 24500,
    category: "Ethnic",
    collection: "Occasion Atelier",
    inStock: true,
    stockCount: 4,
    images: [
      "/Home/images/061_mocha_vista__IMG_0007.jpg",
      "/Home/images/062_mocha_vista__IMG_0001.jpg",
    ],
    description:
      "Warm mocha undertones enriched with contemporary embellishments. A sophisticated choice for modern festive celebrations.",
    details: {
      fabric: "Georgette with Silk Blend",
      work: "Tonal Sequins & Cutdana Detailing",
      care: "Dry clean only",
      dispatch: "10-12 business days",
    },
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export function getAllProducts(): ProductItem[] {
  return productsData;
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  const normalized = slug.toLowerCase().trim();
  return (
    productsData.find((p) => p.slug === normalized) ||
    productsData.find((p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === normalized) ||
    (normalized === "flamingo-fable"
      ? productsData.find((p) => p.name === "FLAMINGO FABLE")
      : undefined) ||
    productsData.find((p) => normalized.includes(p.slug) || p.slug.includes(normalized))
  );
}

export function getRelatedProducts(currentSlug: string, limit = 4): ProductItem[] {
  const current = getProductBySlug(currentSlug);
  return productsData
    .filter((p) => p.slug !== currentSlug && (!current || p.category === current.category))
    .slice(0, limit);
}

export function formatINR(price: number): string {
  return `Rs. ${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

