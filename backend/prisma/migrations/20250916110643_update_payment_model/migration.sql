-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_cardId_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ALTER COLUMN "cardId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
