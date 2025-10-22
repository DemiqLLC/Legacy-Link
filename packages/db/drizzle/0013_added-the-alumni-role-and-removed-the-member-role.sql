-- First, remove defaults to avoid constraint issues
ALTER TABLE "member_invitations" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user_universities" ALTER COLUMN "role" DROP DEFAULT;

-- Convert columns to text
ALTER TABLE "public"."member_invitations" ALTER COLUMN "role" SET DATA TYPE text;
ALTER TABLE "public"."user_universities" ALTER COLUMN "role" SET DATA TYPE text;

-- Update existing 'member' values to 'alumni' (or whichever role is appropriate)
UPDATE "member_invitations" SET "role" = 'alumni' WHERE "role" = 'member';
UPDATE "user_universities" SET "role" = 'alumni' WHERE "role" = 'member';

-- Drop old enum type
DROP TYPE "public"."role";

-- Create new enum type with 'alumni' instead of 'member'
CREATE TYPE "public"."role" AS ENUM('admin', 'alumni', 'super_admin');

-- Convert columns back to enum type
ALTER TABLE "public"."member_invitations" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";
ALTER TABLE "public"."user_universities" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";

-- Now set the new defaults
ALTER TABLE "member_invitations" ALTER COLUMN "role" SET DEFAULT 'alumni';
ALTER TABLE "user_universities" ALTER COLUMN "role" SET DEFAULT 'alumni';