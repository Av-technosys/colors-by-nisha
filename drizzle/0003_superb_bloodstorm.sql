CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"mobile" varchar(20),
	"email_verified" boolean DEFAULT false NOT NULL,
	"mobile_verified" boolean DEFAULT false NOT NULL,
	"password_enabled" boolean DEFAULT false NOT NULL,
	"clerk_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
