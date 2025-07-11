/*
  Warnings:

  - Added the required column `order_from` to the `Trans_Laundry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trans_Laundry" ADD COLUMN     "order_from" TEXT NOT NULL;
