import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  date,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";


// -----------------Categories table-----------------
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});


// -----------------Products table-----------------
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  shortDescription: text("short_description"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


// -----------------Product Variants table-----------------
export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 100 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock"),
});


// -----------------Product Media table-----------------
export const productMedia = pgTable("product_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  position: integer("position").notNull().default(0),
});


// Blog categories
export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

// -----------------Blogs table-----------------
export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  categoryId: uuid("category_id").notNull().references(() => blogCategories.id, { onDelete: "restrict" }),
  publishDate: date("publish_date").notNull(),
  mainBannerImage: text("main_banner_image").notNull(),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  metaTitle: varchar("meta_title", { length: 300 }),
  metaDescription: text("meta_description").notNull(),
  content: text("content").notNull(),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  mobile: varchar("mobile", { length: 20 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  mobileVerified: boolean("mobile_verified").default(false).notNull(),
  passwordEnabled: boolean("password_enabled").default(false).notNull(),
  clerkUpdatedAt: timestamp("clerk_updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Saved addresses
export const addresses = pgTable("addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  street: text("street").notNull(),
  locality: varchar("locality", { length: 80 }),
  city: varchar("city", { length: 80 }).notNull(),
  state: varchar("state", { length: 80 }).notNull(),
  pincode: varchar("pincode", { length: 16 }).notNull(),
  country: varchar("country", { length: 80 }).notNull().default("India"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("addresses_user_idx").on(table.userId),
  uniqueIndex("addresses_user_default_idx").on(table.userId).where(sql`${table.isDefault} = true`),
]);

// Order records
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  paymentId: varchar("payment_id", { length: 100 }).unique(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  stockDeductedAt: timestamp("stock_deducted_at", { withTimezone: true }),
  shippingName: varchar("shipping_name", { length: 120 }),
  shippingPhone: varchar("shipping_phone", { length: 20 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  trackingUrl: text("tracking_url"),
  courierName: varchar("courier_name", { length: 100 }),
  estimatedDeliveryDate: timestamp("estimated_delivery_date", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  addressLine1: varchar("address_line_1", { length: 500 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 500 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 20 }).notNull(),
  subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("orders_user_created_idx").on(table.userId, table.createdAt),
  index("orders_status_idx").on(table.status),
  index("orders_created_idx").on(table.createdAt),
]);

// Order items
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  size: varchar("size", { length: 100 }),
  quantity: integer("quantity").notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productSlug: varchar("product_slug", { length: 255 }).notNull(),
  productImage: text("product_image"),
  productPrice: numeric("product_price", { precision: 10, scale: 2 }).notNull(),
  productSku: varchar("product_sku", { length: 100 }),
}, (table) => [index("order_items_order_idx").on(table.orderId)]);

// -----------------Payment table-----------------
export const payment = pgTable("payment", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  paymentId: varchar("payment_id", { length: 100 }),
  paymentStatus: varchar("payment_status", { length: 50 }).notNull().default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentAmount: integer("payment_amount").notNull(),
  paymentOrderId: varchar("payment_order_id", { length: 100 }),
  paymentMeta: jsonb("payment_meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("payment_order_idx").on(table.orderId),
  index("payment_payment_id_idx").on(table.paymentId),
]);

export const payments = payment;

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payment),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(orders, { fields: [payment.orderId], references: [orders.id] }),
}));
export const paymentsRelations = paymentRelations;

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  blogs: many(blogs),
}));

export const blogsRelations = relations(blogs, ({ one }) => ({
  category: one(blogCategories, { fields: [blogs.categoryId], references: [blogCategories.id] }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants), 
  media: many(productMedia),
  orderItems: many(orderItems),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  media: many(productMedia),
  orderItems: many(orderItems),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
  variant: one(productVariants, { fields: [productMedia.variantId], references: [productVariants.id] }),
}));

// -----------------Contact Us table-----------------
export const contactUs = pgTable("contact_us", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email"),
  phone: varchar("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ContactUs = typeof contactUs.$inferSelect;
export type NewContactUs = typeof contactUs.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
