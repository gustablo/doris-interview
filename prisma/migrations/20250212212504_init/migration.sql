-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('PROCESSING', 'PROCESSED_ERROR', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('TOP', 'BOTTOM');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "image_url" VARCHAR(255),
    "list_price" INTEGER NOT NULL,
    "selling_price" INTEGER NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'PROCESSING',
    "category" "ProductCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_identifier_key" ON "Product"("identifier");
