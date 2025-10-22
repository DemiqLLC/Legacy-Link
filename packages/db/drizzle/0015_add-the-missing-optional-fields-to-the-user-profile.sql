CREATE TYPE "public"."employment_status" AS ENUM('employed_full_time', 'employed_part_time', 'self_employed', 'unemployed', 'student', 'retired');--> statement-breakpoint
CREATE TYPE "public"."gender_identity" AS ENUM('male', 'female', 'non_binary', 'prefer_not_say', 'other');--> statement-breakpoint
CREATE TYPE "public"."income_range" AS ENUM('under_50k', '50k_100k', '100k_150k', '150k_250k', 'over_250k', 'prefer_not_say');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'consulting', 'government', 'non_profit', 'other');--> statement-breakpoint
CREATE TYPE "public"."interested_in_fund" AS ENUM('yes', 'maybe', 'not_now');--> statement-breakpoint
CREATE TYPE "public"."relationship_status" AS ENUM('single', 'married', 'domestic_partnership', 'divorced', 'widowed', 'prefer_not_say');--> statement-breakpoint

ALTER TABLE "user_profile" RENAME COLUMN "employment_status" TO "employmentStatus";--> statement-breakpoint

ALTER TABLE "user_profile" 
  ALTER COLUMN "industry" 
  SET DATA TYPE industry 
  USING CASE 
    WHEN industry IS NULL THEN 'other'::industry
    WHEN industry IN ('technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'consulting', 'government', 'non_profit', 'other')
    THEN industry::industry
    ELSE 'other'::industry
  END;--> statement-breakpoint

ALTER TABLE "user_profile" ADD COLUMN "giving_inspiration" text[];--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "legacy_definition" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "important_causes" text[];--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "anonymous_giving" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "giving_types" text[];--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "mentorship_hours" integer;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "lifetime_giving" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "hometown_at_enrollment" varchar(256);--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "genderIdentity" "gender_identity";--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "racial_ethnic_background" text[];--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "first_generation_graduate" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "relationshipStatus" "relationship_status";--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "dependents_in_college" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "employer" varchar(256);--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "incomeRange" "income_range";--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "education_giving_percentage" integer;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "has_current_contributions" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "interestedInFund" "interested_in_fund";--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "willing_to_mentor" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "wants_alumni_connections" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "interested_in_events" boolean;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "recognition_preferences" text[];