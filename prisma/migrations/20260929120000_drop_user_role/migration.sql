-- User.role was a legacy global role. Tenant authorization uses Membership.role.
ALTER TABLE "users" DROP COLUMN "role";
