# Database Migration Guide

## Issue
The application was experiencing login errors because the Prisma schema included user profile fields (`bio`, `location`, `institution`, `fieldOfStudy`, `website`, `interests`) that were not present in the actual PostgreSQL database.

## Solution
A migration has been created to add these missing columns to the `users` table.

## How to Apply the Migration

### Method 1: Using Prisma Migrate (Recommended)
```bash
cd server
npx prisma migrate deploy
```

This will apply all pending migrations to your database.

### Method 2: Manual SQL Execution
If you prefer to run the SQL manually, execute the following in your PostgreSQL database:

```sql
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "institution" TEXT,
ADD COLUMN IF NOT EXISTS "fieldOfStudy" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT ARRAY[]::TEXT[];
```

### Method 3: Using Prisma Migrate Dev (Development Only)
```bash
cd server
npx prisma migrate dev
```

This will apply the migration and regenerate the Prisma client.

## After Migration
After applying the migration, make sure to regenerate the Prisma client:

```bash
cd server
npx prisma generate
```

Then restart your server.

## Verification
You can verify the migration was successful by checking your database:

```sql
\d users
```

Or:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

You should see the new columns: `bio`, `location`, `institution`, `fieldOfStudy`, `website`, and `interests`.
