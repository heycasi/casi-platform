# PowerShell script for setting up Casi Stream Reports
# This handles Windows file locking issues better than npm

Write-Host "🎮 Setting up Casi Stream Reports..." -ForegroundColor Cyan
Write-Host ""

# Function for colored output
function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "info"
    )
    
    switch ($Status) {
        "success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "info" { Write-Host "ℹ️ $Message" -ForegroundColor Blue }
        default { Write-Host $Message }
    }
}

# Step 1: Check for running processes
Write-Host "🔍 Step 1: Checking for running processes..." -ForegroundColor Cyan

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Status "Found running Node.js processes, stopping them..." "warning"
    $nodeProcesses | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Status "Node.js processes stopped" "success"
} else {
    Write-Status "No running Node.js processes found" "success"
}

# Step 2: Install dependencies with retry logic
Write-Host ""
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Cyan

$maxRetries = 3
$retryCount = 0
$installSuccess = $false

while ($retryCount -lt $maxRetries -and -not $installSuccess) {
    try {
        Write-Status "Attempt $($retryCount + 1) of $maxRetries" "info"
        
        # Clear npm cache
        npm cache clean --force 2>$null
        
        # Install dependencies
        npm install resend dotenv --no-audit --no-fund
        
        if ($LASTEXITCODE -eq 0) {
            $installSuccess = $true
            Write-Status "Dependencies installed successfully" "success"
        } else {
            throw "npm install failed with exit code $LASTEXITCODE"
        }
    }
    catch {
        $retryCount++
        Write-Status "Installation attempt $retryCount failed: $($_.Exception.Message)" "error"
        
        if ($retryCount -lt $maxRetries) {
            Write-Status "Retrying in 5 seconds..." "warning"
            Start-Sleep -Seconds 5
            
            # Try to clean up locked files
            if (Test-Path "node_modules\.package-lock.json") {
                Remove-Item "node_modules\.package-lock.json" -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

if (-not $installSuccess) {
    Write-Status "Failed to install dependencies after $maxRetries attempts" "error"
    Write-Status "Please close all applications using this project and try again" "warning"
    exit 1
}

# Step 3: Run setup script
Write-Host ""
Write-Host "⚙️ Step 3: Running setup configuration..." -ForegroundColor Cyan

try {
    node scripts/setup-reports.js
    Write-Status "Setup configuration completed" "success"
}
catch {
    Write-Status "Setup configuration failed: $($_.Exception.Message)" "error"
    exit 1
}

# Step 4: Environment setup
Write-Host ""
Write-Host "🔧 Step 4: Environment configuration..." -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Status "Created .env.local from .env.example" "success"
    } else {
        @"
# Casi Platform Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Status "Created basic .env.local file" "success"
    }
} else {
    Write-Status ".env.local already exists" "success"
}

# Step 5: Database migration preparation
Write-Host ""
Write-Host "🗄️ Step 5: Preparing database migration..." -ForegroundColor Cyan

if (Test-Path "database/schema.sql") {
    $schema = Get-Content "database/schema.sql" -Raw
    $migrationContent = @"
-- Run this in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

$schema
"@
    $migrationContent | Out-File -FilePath "database/run-migration.sql" -Encoding UTF8
    Write-Status "Database migration prepared: database/run-migration.sql" "success"
} else {
    Write-Status "Database schema file not found" "error"
}

# Step 6: Create quick start guide
Write-Host ""
Write-Host "📖 Step 6: Creating documentation..." -ForegroundColor Cyan

$quickStartContent = @"
# 🚀 Casi Stream Reports - Quick Start

## ✅ Installation Complete!

Your stream reports system is now installed. Follow these steps:

### 1. Configure Environment Variables

Edit `.env.local` with your actual values:

``````env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
RESEND_API_KEY=re_your_actual_resend_key
``````

### 2. Set Up Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open "SQL Editor"
3. Copy contents of `database/run-migration.sql`
4. Paste and click "Run"

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com) (free)
2. Create an API key
3. Add to `.env.local`

### 4. Test Setup

``````powershell
# Test configuration
npm run test:reports

# Start development server
npm run dev

# Test email (replace with your email)
curl -X POST http://localhost:3000/api/test-email -H "Content-Type: application/json" -d '{\"email\":\"your@email.com\"}'
``````

### 5. Try Stream Reports

1. Go to dashboard with beta code: `CASI2025`
2. Connect to a live Twitch channel (try: shroud, ninja, etc.)
3. Let it run for 2-3 minutes
4. Disconnect to trigger report
5. Check your email!

## 🎯 What You Get

- **Real-time chat analysis** with sentiment tracking
- **Automated email reports** when streams end
- **Multi-language support** (13+ languages)
- **AI-powered insights** and recommendations
- **Engagement tracking** and peak moment detection

## 💰 Costs

- **Free tier**: 3,000 emails/month (100+ streamers)
- **Cost per report**: ~`$0.0004

## 🆘 Need Help?

- Run: `npm run test:reports` to check configuration
- Check `STREAM_REPORTS_SETUP.md` for detailed guide
- Email issues? Check your Resend dashboard

---
**🎮 Ready to analyze your streams!**
"@

$quickStartContent | Out-File -FilePath "QUICK_START.md" -Encoding UTF8
Write-Status "Created QUICK_START.md documentation" "success"

# Final summary
Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env.local with your actual API keys" -ForegroundColor Blue
Write-Host "2. Run the database migration in Supabase" -ForegroundColor Blue
Write-Host "3. Get your Resend API key from resend.com" -ForegroundColor Blue
Write-Host "4. Run: npm run test:reports" -ForegroundColor Blue
Write-Host "5. Run: npm run dev" -ForegroundColor Blue
Write-Host ""
Write-Host "📖 See QUICK_START.md for detailed instructions" -ForegroundColor Magenta
Write-Host ""
Write-Status "Stream Reports system is ready to configure!" "success"