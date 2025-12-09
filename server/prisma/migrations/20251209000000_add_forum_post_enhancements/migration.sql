-- AlterTable
ALTER TABLE "forum_posts" ADD COLUMN "category" TEXT,
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "avgRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "forum_ratings" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "forum_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forum_ratings_postId_userId_key" ON "forum_ratings"("postId", "userId");

-- AddForeignKey
ALTER TABLE "forum_ratings" ADD CONSTRAINT "forum_ratings_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_ratings" ADD CONSTRAINT "forum_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
