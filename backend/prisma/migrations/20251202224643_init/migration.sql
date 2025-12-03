-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "redditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT,
    "flair" TEXT,
    "createdUtc" INTEGER NOT NULL,
    "media" TEXT,
    "category" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googlePlaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "rating" REAL,
    "priceLevel" INTEGER,
    "cuisine" TEXT,
    "categories" TEXT,
    "website" TEXT,
    "menuUrl" TEXT,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_redditId_key" ON "Post"("redditId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_googlePlaceId_key" ON "Restaurant"("googlePlaceId");
