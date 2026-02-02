# Deploy to GitHub and Aliyun
Write-Host "Starting deployment..."

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin main

# Push to Aliyun
Write-Host "Pushing to Aliyun..."
git push aliyun main

Write-Host "Deployment trigger sent to Aliyun."
Write-Host "Note: If the Aliyun server has a post-receive hook, it should update automatically."
Write-Host "If images are still missing on Aliyun, ensure the server has run 'npm run build' and 'pm2 restart deepdesign'."
