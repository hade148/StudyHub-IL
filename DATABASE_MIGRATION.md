# Database Migration Guide

## Issue
The application was experiencing login errors because the Prisma schema included user profile fields (`bio`, `location`, `institution`, `fieldOfStudy`, `website`, `interests`) that were not present in the actual PostgreSQL database.

## Solution
The database schema needs to be synchronized with the Prisma schema to add these missing columns to the `users` table.

## Quick Fix (Recommended)

Run the provided sync script:

```bash
./sync-database.sh
```

This interactive script will help you choose the best method to synchronize your database.

## Manual Methods

If you prefer to apply the migration manually, choose one of the following methods:

### How to Apply the Migration

### Method 1: Using Prisma Migrate Deploy (Production/CI)

**When to use:** Production deployments, CI/CD pipelines, or when you want to apply existing committed migrations.

```bash
cd server
npx prisma migrate deploy
```

This will apply all pending migrations to your database.

### Method 2: Using Prisma Migrate Dev (Development)

**When to use:** Local development when creating migrations from schema changes.

```bash
cd server
npx prisma migrate dev
```

This will detect schema changes, create a migration, apply it, and regenerate the Prisma client.

### Method 3: Using Prisma DB Push (Quick Fix)

**When to use:** Quick prototyping or emergency fixes when you want to sync schema without migration files.

```bash
cd server
npx prisma db push
```

This pushes your schema changes directly to the database without creating migration files.

### Method 4: Manual SQL Execution
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
