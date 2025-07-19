/*
  Warnings:

  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FARM_MANAGER', 'AGRONOMIST', 'VETERINARIAN', 'MACHINE_OPERATOR', 'FIELD_WORKER', 'LIVESTOCK_HANDLER', 'IRRIGATION_TECHNICIAN', 'ADMINISTRATIVE_ASSISTANT', 'DRIVER', 'SECURITY_GUARD', 'TEMPORARY_WORKER', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');

-- CreateEnum
CREATE TYPE "PaymentForm" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_SLIP', 'TRANSFER', 'PIX', 'CHECK', 'DIGITAL_WALLET', 'LOAN', 'TRADE', 'FINANCING', 'OTHER');

-- CreateEnum
CREATE TYPE "GenericTransactionSubtype" AS ENUM ('GENERAL_EXPENSE', 'FIXED_ASSET_EXPENSE', 'LOAN_PAYMENT', 'SERVICE_PAYMENT', 'TAX_PAYMENT', 'SUPPLIER_ADVANCE', 'RENTAL_PAYMENT', 'PROFIT_DISTRIBUTION', 'INSURANCE_EXPENSE', 'LOSS_OR_FINE', 'PROJECT_INVESTMENT', 'BANK_FEE', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE_INPUT', 'SALARY_PAYMENT', 'GENERIC');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "type" "EmployeeType" NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,

    CONSTRAINT "account_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
    "id" TEXT NOT NULL,
    "value" BIGINT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentForm" "PaymentForm" NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_allocations" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,
    "accountPlanId" TEXT NOT NULL,
    "allocatedValueInCents" BIGINT NOT NULL,

    CONSTRAINT "transaction_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_transaction_products" (
    "id" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "priceInCents" BIGINT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseTransactionId" TEXT NOT NULL,

    CONSTRAINT "purchase_transaction_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_transactions" (
    "id" TEXT NOT NULL,
    "nfNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "purchase_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_transactions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "salary_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generic_transaction_details" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "subtype" "GenericTransactionSubtype" NOT NULL,
    "note" TEXT,

    CONSTRAINT "generic_transaction_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "productId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" BIGINT NOT NULL,
    "note" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_registration_key" ON "employees"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_cnpj_key" ON "suppliers"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "account_plans_code_key" ON "account_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_transactions_transactionId_key" ON "purchase_transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "salary_transactions_transactionId_key" ON "salary_transactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "generic_transaction_details_transactionId_key" ON "generic_transaction_details"("transactionId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "cost_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_allocations" ADD CONSTRAINT "transaction_allocations_accountPlanId_fkey" FOREIGN KEY ("accountPlanId") REFERENCES "account_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transaction_products" ADD CONSTRAINT "purchase_transaction_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transaction_products" ADD CONSTRAINT "purchase_transaction_products_purchaseTransactionId_fkey" FOREIGN KEY ("purchaseTransactionId") REFERENCES "purchase_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_transactions" ADD CONSTRAINT "purchase_transactions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_transactions" ADD CONSTRAINT "salary_transactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_transactions" ADD CONSTRAINT "salary_transactions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generic_transaction_details" ADD CONSTRAINT "generic_transaction_details_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
