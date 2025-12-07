@echo off
REM Database Schema Sync Script for Windows
REM This script helps synchronize your database with the Prisma schema

echo 🔍 Checking database schema...
echo.

cd /d "%~dp0server"

REM Check if .env exists
if not exist .env (
    echo ❌ Error: .env file not found in server directory
    echo Please copy .env.example to .env and configure your DATABASE_URL
    exit /b 1
)

echo ✅ .env file found

REM Check if DATABASE_URL is set by trying to run a simple prisma command
npx prisma --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Prisma is not available. Please run 'npm install' first.
    exit /b 1
)

echo.

REM Display options
echo Choose an option:
echo 1) Create and apply migration (recommended for development)
echo 2) Push schema changes directly (quick fix, skips migrations)
echo 3) Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto migrate
if "%choice%"=="2" goto push
if "%choice%"=="3" goto end
goto invalid

:migrate
echo.
echo 📝 Creating migration...
call npx prisma migrate dev --name add_user_profile_fields
if errorlevel 1 (
    echo ❌ Migration failed. Please check your DATABASE_URL in .env
    exit /b 1
)
echo.
echo ✅ Migration created and applied!
goto finish

:push
echo.
echo ⚡ Pushing schema changes...
call npx prisma db push
if errorlevel 1 (
    echo ❌ Push failed. Please check your DATABASE_URL in .env
    exit /b 1
)
echo.
echo ✅ Schema synchronized!
goto finish

:finish
echo.
echo 🔄 Regenerating Prisma Client...
call npx prisma generate
echo.
echo ✅ Database schema is now synchronized!
echo.
echo You can now start your server with: npm start
goto end

:invalid
echo ❌ Invalid choice
exit /b 1

:end
