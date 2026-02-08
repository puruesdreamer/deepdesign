param (
    [string]$msg
)

$OutputEncoding = [System.Text.Encoding]::UTF8

# Configure SSH Key for passwordless deployment
$KeyFile = Join-Path $PSScriptRoot "key.pem"
if (Test-Path $KeyFile) {
    Write-Host "Found deployment key: $KeyFile" -ForegroundColor Cyan
    
    # Attempt to secure the key permissions (SSH requires strict permissions)
    try {
        $acl = Get-Acl $KeyFile
        # Check if we need to fix permissions (simplified check)
        # We just try to reset it to be safe. 
        # Note: SetAccessRuleProtection($true, $false) removes inheritance and clears existing rules
        $acl.SetAccessRuleProtection($true, $false) 
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($env:USERNAME,"FullControl","Allow")
        $acl.AddAccessRule($rule)
        Set-Acl $KeyFile $acl
        Write-Host "Key permissions secured." -ForegroundColor Green
    } catch {
        Write-Host "Note: Could not automatically update key permissions. If deployment fails, ensure only you have access to key.pem." -ForegroundColor Yellow
    }

    # Set GIT_SSH_COMMAND to use the key
    # -i: Identity file
    # -o StrictHostKeyChecking=no: Avoid prompt for new host
    # -o IdentitiesOnly=yes: Force use of this key
    $env:GIT_SSH_COMMAND = "ssh -i `"$KeyFile`" -o StrictHostKeyChecking=no -o IdentitiesOnly=yes"
} else {
    Write-Host "Warning: key.pem not found. You may be asked for a password." -ForegroundColor Yellow
}

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
