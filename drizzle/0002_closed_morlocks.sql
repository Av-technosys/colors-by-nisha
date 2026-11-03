ALTER TABLE "products" RENAME COLUMN "product_type" TO "short_description";--> statement-breakpoint
ALTER TABLE "product_media" ADD COLUMN "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" DROP COLUMN "alt_text";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "attributes";