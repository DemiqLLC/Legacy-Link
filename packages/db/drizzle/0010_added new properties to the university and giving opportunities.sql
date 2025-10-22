ALTER TABLE "giving_opportunities" ADD COLUMN "goalAmount" numeric(12, 2) NOT NULL;
ALTER TABLE "giving_opportunities" ADD COLUMN "referenceCode" varchar(50);
ALTER TABLE "university" ADD COLUMN "universityCode" varchar(20);
ALTER TABLE "university" ADD COLUMN "referenceCode" varchar(50);


UPDATE "giving_opportunities"
SET "referenceCode" = gen_random_uuid()::text
WHERE "referenceCode" IS NULL;

UPDATE "university"
SET "referenceCode" = gen_random_uuid()::text
WHERE "referenceCode" IS NULL;

UPDATE "university"
SET "universityCode" = 'UNI-' || floor(random()*1000000)::text
WHERE "universityCode" IS NULL;


ALTER TABLE "giving_opportunities" ALTER COLUMN "referenceCode" SET NOT NULL;
ALTER TABLE "university" ALTER COLUMN "referenceCode" SET NOT NULL;
ALTER TABLE "university" ALTER COLUMN "universityCode" SET NOT NULL;

ALTER TABLE "giving_opportunities" ADD CONSTRAINT "giving_opportunities_referenceCode_unique" UNIQUE("referenceCode");
ALTER TABLE "university" ADD CONSTRAINT "university_referenceCode_unique" UNIQUE("referenceCode");
ALTER TABLE "university" ADD CONSTRAINT "university_universityCode_unique" UNIQUE("universityCode");
