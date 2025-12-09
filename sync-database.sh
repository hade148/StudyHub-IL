#!/bin/bash

# Database Schema Sync Script
# This script helps synchronize your database with the Prisma schema

echo "🔍 Checking database schema..."
echo ""

cd "$(dirname "$0")/server"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in server directory"
    echo "Please copy .env.example to .env and configure your DATABASE_URL"
    exit 1
fi

# Source .env file safely
set -a
source .env 2>/dev/null
set +a

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env file"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Option 1: Generate migration and apply it
echo "Choose an option:"
echo "1) Create and apply migration (recommended for development)"
echo "2) Push schema changes directly (quick fix, skips migrations)"
echo "3) Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Creating migration..."
        npx prisma migrate dev --name add_user_profile_fields
        echo ""
        echo "✅ Migration created and applied!"
        ;;
    2)
        echo ""
        echo "⚡ Pushing schema changes..."
        npx prisma db push
        echo ""
        echo "✅ Schema synchronized!"
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database schema is now synchronized!"
echo ""
echo "You can now start your server with: npm start"
