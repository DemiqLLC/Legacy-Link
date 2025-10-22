CREATE TYPE "public"."communication_method" AS ENUM('email', 'phone');--> statement-breakpoint
CREATE TYPE "public"."pledge_status" AS ENUM('pledge_intent', 'awaiting_confirmation', 'processing_donation', 'completed', 'impact_recorded');--> statement-breakpoint
CREATE TYPE "public"."pledge_type" AS ENUM('monetary_support', 'mentorship_engagement', 'in_kind_skill_based_support', 'innovation_entrepreneurship_support');--> statement-breakpoint
CREATE TABLE "pledge_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"userId" uuid NOT NULL,
	"universityId" uuid NOT NULL,
	"givingOpportunityId" uuid NOT NULL,
	"email" varchar(256) NOT NULL,
	"status" "pledge_status" DEFAULT 'pledge_intent' NOT NULL,
	"pledgeType" "pledge_type" DEFAULT 'monetary_support' NOT NULL,
	"phoneNumber" varchar(20),
	"reasonForInterest" text,
	"preferredCommunicationMethod" "communication_method" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pledge_opportunities" ADD CONSTRAINT "pledge_opportunities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_opportunities" ADD CONSTRAINT "pledge_opportunities_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pledge_opportunities" ADD CONSTRAINT "pledge_opportunities_givingOpportunityId_giving_opportunities_id_fk" FOREIGN KEY ("givingOpportunityId") REFERENCES "public"."giving_opportunities"("id") ON DELETE cascade ON UPDATE no action;