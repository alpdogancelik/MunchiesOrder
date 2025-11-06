CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" varchar DEFAULT 'Kalkanlı' NOT NULL,
	"country" varchar DEFAULT 'TRNC' NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"restaurant_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courier_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"courier_id" varchar NOT NULL,
	"restaurant_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courier_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"courier_id" varchar NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courier_restaurant_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"courier_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "couriers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"vehicle_type" varchar NOT NULL,
	"license_plate" varchar,
	"phone_number" varchar NOT NULL,
	"is_available" boolean DEFAULT true,
	"current_latitude" numeric(10, 8),
	"current_longitude" numeric(11, 8),
	"delivery_radius" integer DEFAULT 5 NOT NULL,
	"rating" numeric(3, 2) DEFAULT '5.0',
	"total_deliveries" integer DEFAULT 0,
	"is_online" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"category_id" integer,
	"name" varchar NOT NULL,
	"description" text,
	"price" numeric(8, 2) NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true,
	"is_popular" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(8, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"restaurant_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(8, 2) NOT NULL,
	"delivery_fee" numeric(8, 2) NOT NULL,
	"service_fee" numeric(8, 2) DEFAULT '0',
	"total" numeric(8, 2) NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"iyzico_payment_id" varchar,
	"iyzico_conversation_id" varchar,
	"special_instructions" text,
	"estimated_delivery_time" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"cuisine" varchar NOT NULL,
	"address" text,
	"phone" varchar,
	"opening_hours" varchar DEFAULT '9:00-22:00' NOT NULL,
	"delivery_radius" integer DEFAULT 5 NOT NULL,
	"image_url" text,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"delivery_time" varchar NOT NULL,
	"delivery_fee" numeric(8, 2) NOT NULL,
	"minimum_order" numeric(8, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"restaurant_id" integer NOT NULL,
	"order_id" integer,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "security_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"event" varchar NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"phone" varchar,
	"role" varchar DEFAULT 'student' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");