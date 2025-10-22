CREATE TABLE "giving_opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT timezone('UTC', NOW()) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(512) NOT NULL,
	"universityId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "giving_opportunities" ADD CONSTRAINT "giving_opportunities_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;