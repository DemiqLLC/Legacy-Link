ALTER TABLE "university" 
ADD COLUMN "legacyLinkFoundationCode" varchar(20);

WITH numbered_universities AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt") as row_num
  FROM "university"
  WHERE "legacyLinkFoundationCode" IS NULL
)
UPDATE "university"
SET "legacyLinkFoundationCode" = 'LL-LEGACY-' || LPAD(numbered_universities.row_num::TEXT, 3, '0')
FROM numbered_universities
WHERE "university".id = numbered_universities.id;

ALTER TABLE "university" 
ALTER COLUMN "legacyLinkFoundationCode" SET NOT NULL;

ALTER TABLE "university" 
ADD CONSTRAINT "university_legacyLinkFoundationCode_unique" 
UNIQUE("legacyLinkFoundationCode");

ALTER TABLE "university"
ADD CONSTRAINT "chk_legacy_link_foundation_code" 
CHECK ("legacyLinkFoundationCode" ~ '^LL-LEGACY-\d{3}$');

CREATE INDEX "idx_university_legacy_link_code" 
ON "university"("legacyLinkFoundationCode");
