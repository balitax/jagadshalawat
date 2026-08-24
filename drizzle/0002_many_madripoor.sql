CREATE TABLE "doa_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "doa_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "doa_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"arab" text NOT NULL,
	"latin" text NOT NULL,
	"translation" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wirid_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "wirid_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wirid_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"arab" text NOT NULL,
	"latin" text NOT NULL,
	"translation" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "doa_items" ADD CONSTRAINT "doa_items_category_id_doa_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."doa_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wirid_items" ADD CONSTRAINT "wirid_items_category_id_wirid_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wirid_categories"("id") ON DELETE no action ON UPDATE no action;