/*
  Warnings:

  - Added the required column `dateOfBirth` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'COP',
ADD COLUMN     "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'es-CO',
ADD COLUMN     "preferredName" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Bogota',
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
