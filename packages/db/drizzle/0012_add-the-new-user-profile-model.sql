CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"userId" uuid NOT NULL,
	"graduation_year" integer NOT NULL,
	"degree_major" varchar(256) NOT NULL,
	"legacy_link_id" varchar(64) NOT NULL,
	"notify_giving_opportunities" boolean DEFAULT false NOT NULL,
	"city_state" varchar(256) NOT NULL,
	"country" varchar(128) NOT NULL,
	"employment_status" varchar(128) NOT NULL,
	"industry" varchar(128) NOT NULL,
	"occupation" varchar(128)
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;