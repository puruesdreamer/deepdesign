param (
    [string]$msg
)

$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      DeepDesign One-Click Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = Read-Host "Enter update message (Press Enter for default timestamp)"
}

if ([string]::IsNullOrWhiteSpace($msg)) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $msg = "Update: $date"
}

Write-Host ""
Write-Host "[1/3] Saving local changes..." -ForegroundColor Yellow
git add .
git commit -m "$msg"

Write-Host ""
Write-Host "[2/3] Pushing to GitHub (Vercel)..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "[3/3] Pushing to Aliyun..." -ForegroundColor Yellow
git push aliyun main

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "      Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Read-Host "Press Enter to exit..."
