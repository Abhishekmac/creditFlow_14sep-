-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
