-- Add cost category to products (natureza do insumo)
ALTER TABLE "products" ADD COLUMN "costCategoryId" TEXT;

UPDATE "products" p
SET "costCategoryId" = cc.id
FROM "cost_categories" cc
WHERE cc."organizationId" = p."organizationId"
  AND cc.code = 'outros';

ALTER TABLE "products" ALTER COLUMN "costCategoryId" SET NOT NULL;

ALTER TABLE "products" ADD CONSTRAINT "products_costCategoryId_fkey" FOREIGN KEY ("costCategoryId") REFERENCES "cost_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "products_costCategoryId_idx" ON "products"("costCategoryId");
