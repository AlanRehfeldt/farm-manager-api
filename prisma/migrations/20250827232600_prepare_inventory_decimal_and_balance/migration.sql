-- CreateEnum
CREATE TYPE "StockMovementSourceType" AS ENUM ('PURCHASE', 'ACTIVITY', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "purchase_transaction_products" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,6) USING ("quantity"::numeric);

-- AlterTable
ALTER TABLE "stock_movements" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,6) USING ("quantity"::numeric),
ADD COLUMN "sourceType" "StockMovementSourceType",
ADD COLUMN "sourceId" TEXT;

-- AlterTable
ALTER TABLE "purchase_transactions" RENAME COLUMN "nfNumber" TO "documentRef";
ALTER TABLE "purchase_transactions" ALTER COLUMN "documentRef" DROP NOT NULL;

-- CreateTable
CREATE TABLE "product_stock_balances" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantityOnHand" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "avgCost" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_stock_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_stock_balances_productId_key" ON "product_stock_balances"("productId");

-- AddForeignKey
ALTER TABLE "product_stock_balances" ADD CONSTRAINT "product_stock_balances_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
