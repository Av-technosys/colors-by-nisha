CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
LOCK TABLE "blogs" IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
INSERT INTO "blog_categories" ("id", "name", "slug")
SELECT "categories"."id", "categories"."name", "categories"."slug"
FROM "categories"
WHERE EXISTS (SELECT 1 FROM "blogs" WHERE "blogs"."category_id" = "categories"."id");
--> statement-breakpoint
ALTER TABLE "blogs" DROP CONSTRAINT "blogs_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE restrict ON UPDATE no action;
