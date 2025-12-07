#!/bin/bash

# StudyHub-IL Quick Setup Script
# This script sets up the development environment for StudyHub-IL

set -e  # Exit on error

echo "🎓 StudyHub-IL Setup Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "1️⃣  Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
print_status "Node.js is installed ($(node --version))"

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_status "npm is installed ($(npm --version))"

if ! command_exists psql; then
    print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed."
else
    print_status "PostgreSQL client is installed"
fi

echo ""

# Step 2: Backend setup
echo "2️⃣  Setting up backend..."

cd server || exit 1

# Install dependencies
echo "  Installing backend dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "  Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit server/.env with your database credentials"
    print_warning "Default database: postgresql://postgres:postgres@localhost:5432/studyhub_db"
else
    print_status ".env file already exists"
fi

# Check if DATABASE_URL is set
if grep -q "your-database-url" .env 2>/dev/null || grep -q "username:password" .env 2>/dev/null; then
    print_warning "DATABASE_URL needs to be configured in server/.env"
    echo ""
    echo "Example configuration:"
    echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/studyhub_db?schema=public\""
    echo ""
    read -p "Do you want to continue with database setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipping database setup. You'll need to configure it manually."
        cd ..
        exit 0
    fi
fi

# Generate Prisma client
echo "  Generating Prisma client..."
npx prisma generate

# Ask about database setup
echo ""
echo "Database Setup Options:"
echo "  1) Create database and run migrations (recommended for first-time setup)"
echo "  2) Only run migrations (database already exists)"
echo "  3) Skip database setup (I'll do it manually)"
read -p "Choose an option (1-3): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo "  Creating database..."
    DB_NAME="studyhub_db"
    
    # Try to create database (will fail if already exists, which is ok)
    if command_exists psql; then
        psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Could not create database (may already exist, or check PostgreSQL connection)"
    else
        print_warning "Cannot create database automatically. Please create it manually:"
        echo "  psql -U postgres -c \"CREATE DATABASE studyhub_db;\""
    fi
    
    echo "  Running migrations..."
    npx prisma migrate dev --name init || print_error "Migration failed. Check your DATABASE_URL"
    
    echo "  Seeding database..."
    npm run seed || print_warning "Seeding failed. You can add data manually."
    
    print_status "Database setup complete"
    
elif [[ $REPLY == "2" ]]; then
    echo "  Running migrations..."
    npx prisma migrate dev --name init || print_error "Migration failed"
    print_status "Migrations complete"
    
else
    print_warning "Skipping database setup"
fi

cd ..

echo ""

# Step 3: Frontend setup
echo "3️⃣  Setting up frontend..."

cd client || exit 1

echo "  Installing frontend dependencies..."
npm install

print_status "Frontend setup complete"

cd ..

echo ""

# Step 4: Summary and next steps
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "3. Open your browser to: http://localhost:5173"
echo ""
echo "4. Login with default credentials:"
echo "   Email: student@studyhub.local"
echo "   Password: password123"
echo ""
echo "📚 Additional Configuration:"
echo ""
echo "• For Google Drive integration, see: GOOGLE_DRIVE_SETUP.md"
echo "• For troubleshooting uploads, see: UPLOAD_TROUBLESHOOTING.md"
echo ""
echo "🐛 If you encounter issues:"
echo "• Check that PostgreSQL is running"
echo "• Verify DATABASE_URL in server/.env"
echo "• Check server terminal for errors"
echo "• See UPLOAD_TROUBLESHOOTING.md for detailed help"
echo ""
