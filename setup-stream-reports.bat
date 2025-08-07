@echo off
title Casi Stream Reports Setup

echo.
echo 🎮 Casi Stream Reports - Automated Setup
echo ========================================
echo.

:: Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% equ 0 (
    echo Running PowerShell setup script...
    powershell -ExecutionPolicy Bypass -File "setup-stream-reports.ps1"
    goto :end
)

:: Fallback to batch commands if PowerShell isn't available
echo PowerShell not available, using batch fallback...
echo.

:: Step 1: Stop Node processes
echo 🔍 Stopping any running Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 >nul

:: Step 2: Install dependencies
echo 📦 Installing dependencies...
echo This may take a few minutes...
npm cache clean --force >nul 2>&1
npm install resend dotenv --no-audit --no-fund

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo Please close all applications using this project and try again
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Step 3: Create environment file
echo 🔧 Setting up environment configuration...
if not exist ".env.local" (
    if exist ".env.example" (
        copy ".env.example" ".env.local" >nul
        echo ✅ Created .env.local from .env.example
    ) else (
        echo # Casi Platform Environment Variables > .env.local
        echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url >> .env.local
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key >> .env.local
        echo RESEND_API_KEY=your_resend_api_key >> .env.local
        echo ✅ Created basic .env.local file
    )
) else (
    echo ✅ .env.local already exists
)

:: Step 4: Prepare database migration
echo 🗄️ Preparing database migration...
if exist "database\schema.sql" (
    echo -- Run this in your Supabase SQL Editor > database\run-migration.sql
    echo -- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql >> database\run-migration.sql
    echo. >> database\run-migration.sql
    type "database\schema.sql" >> database\run-migration.sql
    echo ✅ Database migration prepared: database\run-migration.sql
) else (
    echo ❌ Database schema file not found
)

:: Step 5: Run setup script if available
echo ⚙️ Running setup configuration...
if exist "scripts\setup-reports.js" (
    node scripts\setup-reports.js
) else (
    echo ⚠️ Setup script not found, skipping
)

:: Final instructions
echo.
echo 🎉 Installation Complete!
echo.
echo 📋 Next Steps:
echo 1. Edit .env.local with your actual API keys
echo 2. Run the database migration in Supabase
echo 3. Get your Resend API key from resend.com
echo 4. Run: npm run test:reports
echo 5. Run: npm run dev
echo.
echo 📖 See QUICK_START.md for detailed instructions

:end
echo.
echo Press any key to exit...
pause >nul