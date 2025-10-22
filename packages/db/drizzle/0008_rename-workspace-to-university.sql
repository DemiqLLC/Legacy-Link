ALTER TABLE "workspace" RENAME TO "university";--> statement-breakpoint
ALTER TABLE "workspace_profile" RENAME TO "university_profile";--> statement-breakpoint
ALTER TABLE "user_workspaces" RENAME TO "user_universities";--> statement-breakpoint
ALTER TABLE "chat" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "embeddings" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "feature_flag" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "global_feature_flags" RENAME COLUMN "allowWorkspaceControl" TO "allowUniversityControl";--> statement-breakpoint
ALTER TABLE "integration" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "member_invitations" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "workspace_id" TO "university_id";--> statement-breakpoint
ALTER TABLE "tables_history" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "user_universities" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "webhook-events" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "webhooks" RENAME COLUMN "workspaceId" TO "universityId";--> statement-breakpoint
ALTER TABLE "university_profile" RENAME COLUMN "workspace_id" TO "university_id";--> statement-breakpoint
ALTER TABLE "feature_flag" DROP CONSTRAINT "feature_flag_workspaceId_globalFeatureFlagId_unique";--> statement-breakpoint
ALTER TABLE "integration" DROP CONSTRAINT "integration_platform_workspaceId_unique";--> statement-breakpoint
ALTER TABLE "member_invitations" DROP CONSTRAINT "unique_email_workspace";--> statement-breakpoint
ALTER TABLE "chat" DROP CONSTRAINT "chat_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "feature_flag" DROP CONSTRAINT "feature_flag_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "integration" DROP CONSTRAINT "integration_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "member_invitations" DROP CONSTRAINT "member_invitations_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "tables_history" DROP CONSTRAINT "tables_history_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "user_universities" DROP CONSTRAINT "user_workspaces_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_universities" DROP CONSTRAINT "user_workspaces_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "webhook-events" DROP CONSTRAINT "webhook-events_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_workspaceId_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "university_profile" DROP CONSTRAINT "workspace_profile_workspace_id_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "user_universities" DROP CONSTRAINT "user_workspaces_userId_workspaceId_pk";--> statement-breakpoint
ALTER TABLE "university_profile" DROP CONSTRAINT "workspace_profile_workspace_id_pk";--> statement-breakpoint
ALTER TABLE "user_universities" ADD CONSTRAINT "user_universities_userId_universityId_pk" PRIMARY KEY("userId","universityId");--> statement-breakpoint
ALTER TABLE "university_profile" ADD CONSTRAINT "university_profile_university_id_pk" PRIMARY KEY("university_id");--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tables_history" ADD CONSTRAINT "tables_history_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_universities" ADD CONSTRAINT "user_universities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_universities" ADD CONSTRAINT "user_universities_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook-events" ADD CONSTRAINT "webhook-events_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_universityId_university_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_profile" ADD CONSTRAINT "university_profile_university_id_university_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."university"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag" ADD CONSTRAINT "feature_flag_universityId_globalFeatureFlagId_unique" UNIQUE("universityId","globalFeatureFlagId");--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_platform_universityId_unique" UNIQUE("platform","universityId");--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "unique_email_university" UNIQUE("email","universityId");--> statement-breakpoint
ALTER TABLE "public"."webhook-events" ALTER COLUMN "eventTableName" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_table_name";--> statement-breakpoint
CREATE TYPE "public"."event_table_name" AS ENUM('feature_flag', 'member_invitation', 'password_recovery_token', 'user_feature_flag', 'user_university', 'user', 'university', 'university_profile', 'reports');--> statement-breakpoint
ALTER TABLE "public"."webhook-events" ALTER COLUMN "eventTableName" SET DATA TYPE "public"."event_table_name" USING "eventTableName"::"public"."event_table_name";