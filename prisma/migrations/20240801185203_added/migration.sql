/*
  Warnings:

  - The values [OTHER] on the enum `Gender` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `state` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Gender_new" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'TRANSGENDER_MALE', 'TRANSGENDER_FEMALE', 'PREFER_NOT_TO_SAY');
ALTER TABLE "User" ALTER COLUMN "gender" TYPE "Gender_new" USING ("gender"::text::"Gender_new");
ALTER TABLE "Preference" ALTER COLUMN "genderPref" TYPE "Gender_new"[] USING ("genderPref"::text::"Gender_new"[]);
ALTER TYPE "Gender" RENAME TO "Gender_old";
ALTER TYPE "Gender_new" RENAME TO "Gender";
DROP TYPE "Gender_old";
COMMIT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "localAddress" TEXT,
ALTER COLUMN "state" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;
