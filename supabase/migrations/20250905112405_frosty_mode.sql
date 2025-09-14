/*
  # Add RefreshToken model and User.isAdmin field

  1. New Tables
    - `RefreshToken`
      - `id` (int, primary key)
      - `token` (string, unique)
      - `userId` (int, foreign key)
      - `expiresAt` (datetime)
      - `createdAt` (datetime)

  2. Changes
    - Add `isAdmin` field to `User` table (boolean, default false)
    - Add `last4` field to `Card` table for display purposes
    - Add `cardType` field to `Card` table
    - Add `category` and `description` fields to `Transaction` table
    - Add `minDue` and `isPaid` fields to `Statement` table
    - Add `title` field to `Notification` table
    - Add `isActive` field to `Offer` table
    - Change `Payment.id` to string (cuid)
    - Add `externalId` field to `Payment` table

  3. Security
    - Enable RLS on new tables
    - Add foreign key constraints with CASCADE delete for RefreshToken
*/

-- Add isAdmin field to User table
ALTER TABLE "public"."User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Add fields to Card table
ALTER TABLE "public"."Card" ADD COLUMN "last4" TEXT;
ALTER TABLE "public"."Card" ADD COLUMN "cardType" TEXT NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "public"."Card" ADD COLUMN "creditLimit" DOUBLE PRECISION NOT NULL DEFAULT 100000;
ALTER TABLE "public"."Card" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add fields to Transaction table
ALTER TABLE "public"."Transaction" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Others';
ALTER TABLE "public"."Transaction" ADD COLUMN "description" TEXT;
ALTER TABLE "public"."Transaction" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add fields to Statement table
ALTER TABLE "public"."Statement" ADD COLUMN "minDue" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "public"."Statement" ADD COLUMN "isPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Statement" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add fields to Payment table
ALTER TABLE "public"."Payment" ADD COLUMN "externalId" TEXT;
ALTER TABLE "public"."Payment" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add title field to Notification table
ALTER TABLE "public"."Notification" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';

-- Add fields to Offer table
ALTER TABLE "public"."Offer" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."Offer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt field to CardApplication table
ALTER TABLE "public"."CardApplication" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt field to Dispute table
ALTER TABLE "public"."Dispute" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create RefreshToken table
CREATE TABLE IF NOT EXISTS "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- Create unique index on RefreshToken.token
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "public"."RefreshToken"("token");

-- Add foreign key constraint for RefreshToken
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint on Statement (cardId, month, year)
CREATE UNIQUE INDEX "Statement_cardId_month_year_key" ON "public"."Statement"("cardId", "month", "year");

-- Create unique constraint on Reward (cardId, userId)
CREATE UNIQUE INDEX "Reward_cardId_userId_key" ON "public"."Reward"("cardId", "userId");

-- Update existing cards with last4 if they don't have it
UPDATE "public"."Card" SET "last4" = RIGHT("number", 4) WHERE "last4" IS NULL;

-- Make last4 NOT NULL after updating existing records
ALTER TABLE "public"."Card" ALTER COLUMN "last4" SET NOT NULL;