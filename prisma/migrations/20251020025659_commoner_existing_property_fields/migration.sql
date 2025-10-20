-- AlterTable
ALTER TABLE "CommonerRegistration" ADD COLUMN     "existingLotNumber" TEXT,
ADD COLUMN     "existingPropertyNotes" TEXT,
ADD COLUMN     "hasExistingProperty" BOOLEAN NOT NULL DEFAULT false;
