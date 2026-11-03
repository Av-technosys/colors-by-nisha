export type AdminRecord = {
  id: string;
  title: string;
  subtitle: string;
  image?: number;
  fields: Record<string, string>;
  status: string;
  detail?: string;
};

export type AdminPageData = {
  title: string;
  eyebrow: string;
  description: string;
  singular: string;
  columns: string[];
  statuses: string[];
  records: AdminRecord[];
  canEdit?: boolean;
  canChangeStatus?: boolean;
};

export const categoryPage: AdminPageData = {
  title: "Categories",
  eyebrow: "Organise your collection",
  description: "Keep your products organised into simple, clear categories.",
  singular: "category",
  columns: ["Category", "Slug"],
  statuses: ["Active", "Draft"],
  canEdit: true,
  records: [
    {
      id: "CAT-001",
      title: "Lehengas",
      subtitle: "Crafted for celebrations",
      image: 30,
      fields: { Slug: "lehengas" },
      status: "Active",
    },
    {
      id: "CAT-002",
      title: "Sharara sets",
      subtitle: "Traditional silhouettes, modern details",
      image: 32,
      fields: { Slug: "sharara-sets" },
      status: "Active",
    },
    {
      id: "CAT-003",
      title: "Anarkalis",
      subtitle: "Elegance in every movement",
      image: 34,
      fields: { Slug: "anarkalis" },
      status: "Active",
    },
    {
      id: "CAT-004",
      title: "Sarees",
      subtitle: "Timeless drapes",
      image: 36,
      fields: { Slug: "sarees" },
      status: "Active",
    },
    {
      id: "CAT-005",
      title: "Co-ord sets",
      subtitle: "Effortless, considered pairings",
      image: 38,
      fields: { Slug: "co-ord-sets" },
      status: "Active",
    },
  ],
};

export const productPage: AdminPageData = {
  title: "Products",
  eyebrow: "The collection",
  description: "A considered edit of everything in your store.",
  singular: "product",
  columns: [
    "Product",
    "Category",
    "Price",
    "Stock"
  ],
  statuses: [
    "Active",
    "Low stock",
    "Draft"
  ],
  canEdit: true,
  records: [
    {
      id: "CBN-001",
      title: "NOORI",
      subtitle: "SKU: CBN-001",
      image: 30,
      status: "Active",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Lehengas",
        Price: "Rs. 26,000.00",
        Stock: "12 pieces"
      }
    },
    {
      id: "CBN-002",
      title: "NOOR",
      subtitle: "SKU: CBN-002",
      image: 32,
      status: "Active",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Sharara sets",
        Price: "Rs. 22,000.00",
        Stock: "8 pieces"
      }
    },
    {
      id: "CBN-003",
      title: "MEHER",
      subtitle: "SKU: CBN-003",
      image: 34,
      status: "Low stock",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Anarkalis",
        Price: "Rs. 22,000.00",
        Stock: "3 pieces"
      }
    },
    {
      id: "CBN-004",
      title: "IVORY BLOOM",
      subtitle: "SKU: CBN-004",
      image: 36,
      status: "Active",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Sarees",
        Price: "Rs. 38,000.00",
        Stock: "10 pieces"
      }
    },
    {
      id: "CBN-005",
      title: "PASTEL PRISM",
      subtitle: "SKU: CBN-005",
      image: 38,
      status: "Active",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Co-ord sets",
        Price: "Rs. 58,000.00",
        Stock: "6 pieces"
      }
    },
    {
      id: "CBN-006",
      title: "GAURIKA",
      subtitle: "SKU: CBN-006",
      image: 40,
      status: "Low stock",
      detail: "Handcrafted occasion wear from the Colors by Nisha collection.",
      fields: {
        Category: "Sarees",
        Price: "Rs. 28,000.00",
        Stock: "2 pieces"
      }
    }
  ]
};

export const blogPage: AdminPageData = {
  title: "Blogs",
  eyebrow: "The journal",
  description: "Stories of craftsmanship, celebrations, and personal style.",
  singular: "article",
  columns: [
    "Article",
    "Category",
    "Author",
    "Date"
  ],
  statuses: [
    "Published",
    "Draft"
  ],
  canEdit: true,
  records: [
    {
      id: "BL-001",
      title: "The art of dressing for celebrations",
      subtitle: "An occasion, a feeling, a beautiful outfit.",
      image: 42,
      status: "Published",
      detail: "Thoughtful silhouettes, rich textures, and details that make every celebration feel like your own. Explore the little things that bring an occasion wardrobe together.",
      fields: {
        Category: "Style guide",
        Author: "Nisha Vijay",
        Date: "02 Nov 2026"
      }
    },
    {
      id: "BL-002",
      title: "A closer look at our handwork",
      subtitle: "The hands and heritage behind each detail.",
      image: 15,
      status: "Published",
      detail: "A journal entry celebrating the artisans and considered details behind our collections.",
      fields: {
        Category: "Craftsmanship",
        Author: "Nisha Vijay",
        Date: "30 Oct 2026"
      }
    },
    {
      id: "BL-003",
      title: "Finding your festive colour",
      subtitle: "A palette as individual as you are.",
      image: 34,
      status: "Draft",
      detail: "From jewel tones to quiet pastels, discover a colour story that feels personal.",
      fields: {
        Category: "Inspiration",
        Author: "Nisha Vijay",
        Date: "28 Oct 2026"
      }
    },
    {
      id: "BL-004",
      title: "Heirlooms for a modern wardrobe",
      subtitle: "Traditions, beautifully reimagined.",
      image: 36,
      status: "Published",
      detail: "Timeless pieces that bring traditional artistry into a modern wardrobe.",
      fields: {
        Category: "Style guide",
        Author: "Nisha Vijay",
        Date: "25 Oct 2026"
      }
    }
  ]
};

export const userPage: AdminPageData = {
  title: "Users",
  eyebrow: "Your community",
  description: "Get to know the people who make your brand their own.",
  singular: "customer",
  columns: [
    "Customer",
    "Location",
    "Orders",
    "Total spent"
  ],
  statuses: [
    "Active",
    "Inactive"
  ],
  records: [
    {
      id: "CU-001",
      title: "Aanya Sharma",
      subtitle: "aanya@example.com",
      status: "Active",
      fields: {
        Location: "Jaipur, Rajasthan",
        Orders: "4 orders",
        "Total spent": "₹1,04,000"
      }
    },
    {
      id: "CU-002",
      title: "Riya Mehta",
      subtitle: "riya@example.com",
      status: "Active",
      fields: {
        Location: "Mumbai, Maharashtra",
        Orders: "2 orders",
        "Total spent": "₹48,000"
      }
    },
    {
      id: "CU-003",
      title: "Ishita Kapoor",
      subtitle: "ishita@example.com",
      status: "Active",
      fields: {
        Location: "New Delhi, Delhi",
        Orders: "3 orders",
        "Total spent": "₹86,500"
      }
    },
    {
      id: "CU-004",
      title: "Neha Patel",
      subtitle: "neha@example.com",
      status: "Active",
      fields: {
        Location: "Ahmedabad, Gujarat",
        Orders: "1 order",
        "Total spent": "₹38,000"
      }
    },
    {
      id: "CU-005",
      title: "Kavya Singh",
      subtitle: "kavya@example.com",
      status: "Inactive",
      fields: {
        Location: "Lucknow, Uttar Pradesh",
        Orders: "0 orders",
        "Total spent": "₹0"
      }
    },
    {
      id: "CU-006",
      title: "Diya Jain",
      subtitle: "diya@example.com",
      status: "Active",
      fields: {
        Location: "Pune, Maharashtra",
        Orders: "2 orders",
        "Total spent": "₹44,000"
      }
    }
  ]
};

export const orderPage: AdminPageData = {
  title: "Orders",
  eyebrow: "From atelier to doorstep",
  description: "Keep every order moving, from the first detail to the final delivery.",
  singular: "order",
  columns: [
    "Order",
    "Customer",
    "Amount",
    "Date"
  ],
  statuses: [
    "Processing",
    "Shipped",
    "Delivered",
    "Pending"
  ],
  canChangeStatus: true,
  records: [
    {
      id: "CBN-1048",
      title: "#CBN-1048",
      subtitle: "NOORI · 1 item",
      image: 30,
      status: "Processing",
      detail: "NOORI · Size M · Quantity 1. Delivery to Jaipur, Rajasthan. Gift packaging requested.",
      fields: {
        Customer: "Aanya Sharma",
        Amount: "₹26,000",
        Date: "02 Nov 2026"
      }
    },
    {
      id: "CBN-1047",
      title: "#CBN-1047",
      subtitle: "NOOR · 1 item",
      image: 32,
      status: "Shipped",
      detail: "NOOR · Size S · Quantity 1. Delivery to Mumbai, Maharashtra.",
      fields: {
        Customer: "Riya Mehta",
        Amount: "₹22,000",
        Date: "02 Nov 2026"
      }
    },
    {
      id: "CBN-1046",
      title: "#CBN-1046",
      subtitle: "PASTEL PRISM · 1 item",
      image: 38,
      status: "Delivered",
      detail: "PASTEL PRISM · Size M · Quantity 1. Delivery to New Delhi, Delhi.",
      fields: {
        Customer: "Ishita Kapoor",
        Amount: "₹58,000",
        Date: "01 Nov 2026"
      }
    },
    {
      id: "CBN-1045",
      title: "#CBN-1045",
      subtitle: "IVORY BLOOM · 1 item",
      image: 36,
      status: "Pending",
      detail: "IVORY BLOOM · Size L · Quantity 1. Payment confirmation pending.",
      fields: {
        Customer: "Neha Patel",
        Amount: "₹38,000",
        Date: "01 Nov 2026"
      }
    },
    {
      id: "CBN-1044",
      title: "#CBN-1044",
      subtitle: "MEHER · 1 item",
      image: 34,
      status: "Delivered",
      detail: "MEHER · Size S · Quantity 1. Delivery to Pune, Maharashtra.",
      fields: {
        Customer: "Diya Jain",
        Amount: "₹22,000",
        Date: "31 Oct 2026"
      }
    },
    {
      id: "CBN-1043",
      title: "#CBN-1043",
      subtitle: "GAURIKA · 1 item",
      image: 40,
      status: "Delivered",
      detail: "GAURIKA · Size M · Quantity 1. Delivery to Jaipur, Rajasthan.",
      fields: {
        Customer: "Aanya Sharma",
        Amount: "₹28,000",
        Date: "30 Oct 2026"
      }
    }
  ]
};

export const paymentPage: AdminPageData = {
  title: "Payments",
  eyebrow: "The financial edit",
  description: "A clear view of transactions, payment methods, and their status.",
  singular: "payment",
  columns: [
    "Transaction",
    "Customer",
    "Amount",
    "Method"
  ],
  statuses: [
    "Paid",
    "Pending",
    "Refunded",
    "Failed"
  ],
  records: [
    {
      id: "PAY-0841",
      title: "PAY-0841",
      subtitle: "Order #CBN-1048",
      status: "Paid",
      detail: "Received on 02 Nov 2026. Sample transaction for interface preview.",
      fields: {
        Customer: "Aanya Sharma",
        Amount: "₹26,000",
        Method: "UPI"
      }
    },
    {
      id: "PAY-0840",
      title: "PAY-0840",
      subtitle: "Order #CBN-1047",
      status: "Paid",
      detail: "Received on 02 Nov 2026. Sample transaction for interface preview.",
      fields: {
        Customer: "Riya Mehta",
        Amount: "₹22,000",
        Method: "Credit card"
      }
    },
    {
      id: "PAY-0839",
      title: "PAY-0839",
      subtitle: "Order #CBN-1046",
      status: "Paid",
      detail: "Received on 01 Nov 2026. Sample transaction for interface preview.",
      fields: {
        Customer: "Ishita Kapoor",
        Amount: "₹58,000",
        Method: "Net banking"
      }
    },
    {
      id: "PAY-0838",
      title: "PAY-0838",
      subtitle: "Order #CBN-1045",
      status: "Pending",
      detail: "Awaiting confirmation. Sample transaction for interface preview.",
      fields: {
        Customer: "Neha Patel",
        Amount: "₹38,000",
        Method: "UPI"
      }
    },
    {
      id: "PAY-0837",
      title: "PAY-0837",
      subtitle: "Order #CBN-1042",
      status: "Refunded",
      detail: "Refund completed on 30 Oct 2026. Sample transaction for interface preview.",
      fields: {
        Customer: "Kavya Singh",
        Amount: "₹18,500",
        Method: "Debit card"
      }
    },
    {
      id: "PAY-0836",
      title: "PAY-0836",
      subtitle: "Order #CBN-1041",
      status: "Failed",
      detail: "Payment was not completed. Sample transaction for interface preview.",
      fields: {
        Customer: "Diya Jain",
        Amount: "₹22,000",
        Method: "UPI"
      }
    }
  ]
};

export const contactPage: AdminPageData = {
  title: "Contact",
  eyebrow: "Conversations",
  description: "Every question is the beginning of a connection.",
  singular: "message",
  columns: [
    "From",
    "Subject",
    "Received"
  ],
  statuses: [
    "New",
    "Read",
    "Resolved"
  ],
  canChangeStatus: true,
  records: [
    {
      id: "MSG-001",
      title: "Aanya Sharma",
      subtitle: "aanya@example.com",
      status: "New",
      detail: "Hello! I love the NOORI set and would like some help choosing between a small and medium. Could you share the garment measurements? Thank you!",
      fields: {
        Subject: "A little help with sizing",
        Received: "02 Nov 2026"
      }
    },
    {
      id: "MSG-002",
      title: "Riya Mehta",
      subtitle: "riya@example.com",
      status: "New",
      detail: "Hi Nisha, I am looking for an outfit for my sister’s wedding. Is it possible to customise the colour of the NOOR set? I would love to hear about the available options.",
      fields: {
        Subject: "Customisation enquiry",
        Received: "02 Nov 2026"
      }
    },
    {
      id: "MSG-003",
      title: "Ishita Kapoor",
      subtitle: "ishita@example.com",
      status: "Read",
      detail: "Could you please let me know the estimated delivery time to New Delhi? My event is in three weeks and I would like to plan ahead.",
      fields: {
        Subject: "Delivery timeline",
        Received: "01 Nov 2026"
      }
    },
    {
      id: "MSG-004",
      title: "Neha Patel",
      subtitle: "neha@example.com",
      status: "Resolved",
      detail: "My outfit arrived today and it is beautiful. The detailing and fit are perfect. Thank you for making my celebration so special!",
      fields: {
        Subject: "Thank you for my outfit!",
        Received: "30 Oct 2026"
      }
    }
  ]
};
