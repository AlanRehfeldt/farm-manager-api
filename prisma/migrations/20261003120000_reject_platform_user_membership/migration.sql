-- Papel de plataforma não é membro de organização (ADR-020).
DELETE FROM "memberships" AS membership
USING "users" AS "user"
WHERE membership."userId" = "user".id
  AND "user"."platformRole" <> 'NONE'::"PlatformRole";

CREATE OR REPLACE FUNCTION reject_platform_user_membership()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  role "PlatformRole";
BEGIN
  SELECT "platformRole" INTO role FROM "users" WHERE id = NEW."userId";

  IF role IS DISTINCT FROM 'NONE'::"PlatformRole" THEN
    RAISE EXCEPTION 'Platform users cannot receive a membership';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER memberships_reject_platform_user
BEFORE INSERT OR UPDATE ON "memberships"
FOR EACH ROW
EXECUTE FUNCTION reject_platform_user_membership();

CREATE OR REPLACE FUNCTION reject_platform_role_with_membership()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."platformRole" IS DISTINCT FROM 'NONE'::"PlatformRole"
    AND EXISTS (
      SELECT 1 FROM "memberships" WHERE "userId" = NEW.id
    ) THEN
    RAISE EXCEPTION 'Platform users cannot keep a membership';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER users_reject_platform_role_with_membership
BEFORE UPDATE OF "platformRole" ON "users"
FOR EACH ROW
EXECUTE FUNCTION reject_platform_role_with_membership();
