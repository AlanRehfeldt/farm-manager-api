-- AlterTable Organization: optional contact and address
ALTER TABLE "organizations" ADD COLUMN "cnpj" TEXT;
ALTER TABLE "organizations" ADD COLUMN "phone" TEXT;
ALTER TABLE "organizations" ADD COLUMN "email" TEXT;
ALTER TABLE "organizations" ADD COLUMN "street" TEXT;
ALTER TABLE "organizations" ADD COLUMN "number" TEXT;
ALTER TABLE "organizations" ADD COLUMN "complement" TEXT;
ALTER TABLE "organizations" ADD COLUMN "city" TEXT;
ALTER TABLE "organizations" ADD COLUMN "state" TEXT;
ALTER TABLE "organizations" ADD COLUMN "zipCode" TEXT;

-- AlterTable Farm: optional address (country defaults to BR)
ALTER TABLE "farms" ADD COLUMN "street" TEXT;
ALTER TABLE "farms" ADD COLUMN "number" TEXT;
ALTER TABLE "farms" ADD COLUMN "complement" TEXT;
ALTER TABLE "farms" ADD COLUMN "city" TEXT;
ALTER TABLE "farms" ADD COLUMN "state" TEXT;
ALTER TABLE "farms" ADD COLUMN "country" TEXT DEFAULT 'BR';
ALTER TABLE "farms" ADD COLUMN "zipCode" TEXT;

-- AlterTable Supplier: cnpj optional + cpf XOR + city/state
ALTER TABLE "suppliers" ALTER COLUMN "cnpj" DROP NOT NULL;
ALTER TABLE "suppliers" ADD COLUMN "cpf" TEXT;
ALTER TABLE "suppliers" ADD COLUMN "city" TEXT;
ALTER TABLE "suppliers" ADD COLUMN "state" TEXT;

CREATE UNIQUE INDEX "suppliers_organizationId_cpf_key" ON "suppliers"("organizationId", "cpf");

ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_document_xor_check"
  CHECK (
    ("cnpj" IS NOT NULL AND "cpf" IS NULL)
    OR ("cnpj" IS NULL AND "cpf" IS NOT NULL)
  );
