-- CreateTable
CREATE TABLE `transcriptions` (
    `id` VARCHAR(191) NOT NULL,
    `text` LONGTEXT NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'en-US',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
