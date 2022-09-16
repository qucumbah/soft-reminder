-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSync" TIMESTAMP(3) NOT NULL DEFAULT '-infinity';
