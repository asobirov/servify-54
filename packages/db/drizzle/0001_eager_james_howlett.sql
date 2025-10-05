CREATE TYPE "public"."location_type" AS ENUM('point', 'polygon');

--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"locale" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"street" varchar(128),
	"district" varchar(128),
	"city" varchar(64),
	"region" varchar(64),
	"country" varchar(64),
	"full_address" text,
	"type" "location_type" NOT NULL,
	"geom" geometry(point),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "location_geo_type_check" CHECK (
        (type = 'point'   AND GeometryType(geom) = 'POINT') OR 
        (type = 'polygon' AND GeometryType(geom) = 'POLYGON')
      )
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(256) NOT NULL,
	"content" text NOT NULL,
	"service_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "provider" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bio" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "service_media" (
	"service_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	CONSTRAINT "service_media_service_id_media_id_pk" PRIMARY KEY("service_id","media_id")
);
--> statement-breakpoint
CREATE TABLE "service_to_categories" (
	"service_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "service_to_categories_service_id_category_id_pk" PRIMARY KEY("service_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"phone_number" text,
	"phone_number_verified" boolean,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider" ADD CONSTRAINT "provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_provider_id_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."provider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_media" ADD CONSTRAINT "service_media_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_media" ADD CONSTRAINT "service_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_to_categories" ADD CONSTRAINT "service_to_categories_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_to_categories" ADD CONSTRAINT "service_to_categories_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "geo_idx" ON "location" USING gist ("geom");