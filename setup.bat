@echo off
REM StudyHub-IL Quick Setup Script for Windows
REM This script sets up the development environment for StudyHub-IL

setlocal enabledelayedexpansion

echo.
echo StudyHub-IL Setup Script
echo ============================
echo.

REM Step 1: Check prerequisites
echo 1. Checking prerequisites...

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo [OK] Node.js is installed

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    exit /b 1
)
echo [OK] npm is installed

where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] PostgreSQL client not found. Make sure PostgreSQL is installed.
) else (
    echo [OK] PostgreSQL client is installed
)

echo.

REM Step 2: Backend setup
echo 2. Setting up backend...

cd server
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not find server directory
    exit /b 1
)

echo   Installing backend dependencies...
call npm install

REM Create .env if it doesn't exist
if not exist .env (
    echo   Creating .env file from template...
    copy .env.example .env
    echo [WARNING] Please edit server\.env with your database credentials
    echo [WARNING] Default database: postgresql://postgres:postgres@localhost:5432/studyhub_db
) else (
    echo [OK] .env file already exists
)

REM Generate Prisma client
echo   Generating Prisma client...
call npx prisma generate

echo.
echo Database Setup Options:
echo   1^) Create database and run migrations ^(recommended for first-time setup^)
echo   2^) Only run migrations ^(database already exists^)
echo   3^) Skip database setup ^(I'll do it manually^)
set /p choice="Choose an option (1-3): "

if "%choice%"=="1" (
    echo   Creating database...
    where psql >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        psql -U postgres -c "CREATE DATABASE studyhub_db;" 2>nul
        if !ERRORLEVEL! NEQ 0 (
            echo [WARNING] Could not create database ^(may already exist, or check PostgreSQL connection^)
        )
    ) else (
        echo [WARNING] Cannot create database automatically. Please create it manually:
        echo   psql -U postgres -c "CREATE DATABASE studyhub_db;"
    )
    
    echo   Running migrations...
    call npx prisma migrate dev --name init
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Migration failed. Check your DATABASE_URL
    )
    
    echo   Seeding database...
    call npm run seed
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Seeding failed. You can add data manually.
    )
    
    echo [OK] Database setup complete
    
) else if "%choice%"=="2" (
    echo   Running migrations...
    call npx prisma migrate dev --name init
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Migration failed
    )
    echo [OK] Migrations complete
    
) else (
    echo [WARNING] Skipping database setup
)

cd ..

echo.

REM Step 3: Frontend setup
echo 3. Setting up frontend...

cd client
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Could not find client directory
    exit /b 1
)

echo   Installing frontend dependencies...
call npm install

echo [OK] Frontend setup complete

cd ..

echo.

REM Step 4: Summary and next steps
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next Steps:
echo.
echo 1. Start the backend server:
echo    cd server
echo    npm run dev
echo.
echo 2. In a new terminal, start the frontend:
echo    cd client
echo    npm run dev
echo.
echo 3. Open your browser to: http://localhost:5173
echo.
echo 4. Login with default credentials:
echo    Email: student@studyhub.local
echo    Password: password123
echo.
echo Additional Configuration:
echo.
echo * For Google Drive integration, see: GOOGLE_DRIVE_SETUP.md
echo * For troubleshooting uploads, see: UPLOAD_TROUBLESHOOTING.md
echo.
echo If you encounter issues:
echo * Check that PostgreSQL is running
echo * Verify DATABASE_URL in server\.env
echo * Check server terminal for errors
echo * See UPLOAD_TROUBLESHOOTING.md for detailed help
echo.

pause
