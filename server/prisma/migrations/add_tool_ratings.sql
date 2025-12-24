-- Add avgRating field to tools table
ALTER TABLE "tools" ADD COLUMN "avgRating" DOUBLE PRECISION;

-- Create tool_ratings table
CREATE TABLE "tool_ratings" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toolId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "tool_ratings_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to ensure one rating per user per tool
CREATE UNIQUE INDEX "tool_ratings_toolId_userId_key" ON "tool_ratings"("toolId", "userId");

-- Add foreign key constraints
ALTER TABLE "tool_ratings" ADD CONSTRAINT "tool_ratings_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tool_ratings" ADD CONSTRAINT "tool_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
