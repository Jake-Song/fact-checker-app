/*
  Warnings:

  - Added the required column `authorId` to the `Fact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fact" ADD COLUMN     "authorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
