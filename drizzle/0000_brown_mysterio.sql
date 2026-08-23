CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"amount" bigint NOT NULL,
	"method" text NOT NULL,
	"channel" text NOT NULL,
	"message" text,
	"receipt_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
