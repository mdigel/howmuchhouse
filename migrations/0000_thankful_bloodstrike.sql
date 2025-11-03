CREATE TABLE IF NOT EXISTS "ai_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"character_count" integer NOT NULL,
	"has_paid" boolean DEFAULT false,
	"is_helpful" boolean DEFAULT null,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_session_id" text NOT NULL,
	"status" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
