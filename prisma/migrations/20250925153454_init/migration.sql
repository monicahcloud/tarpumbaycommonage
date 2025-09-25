-- CreateEnum
CREATE TYPE "public"."AppStatus" AS ENUM ('SUBMITTED');

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "ancestry" TEXT,
    "purpose" TEXT NOT NULL,
    "signature" TEXT,
    "status" "public"."AppStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
