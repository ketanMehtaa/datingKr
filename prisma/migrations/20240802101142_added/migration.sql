/*
  Warnings:

  - Made the column `coordinates` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "location_coordinates_idx";

-- AlterTable
ALTER TABLE "Location" ALTER COLUMN "coordinates" SET NOT NULL;
