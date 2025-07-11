/*
  Warnings:

  - Made the column `userId` on table `transcriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `transcriptions` DROP FOREIGN KEY `transcriptions_userId_fkey`;

-- DropIndex
DROP INDEX `transcriptions_userId_fkey` ON `transcriptions`;

-- AlterTable
ALTER TABLE `transcriptions` MODIFY `userId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `transcriptions` ADD CONSTRAINT `transcriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
