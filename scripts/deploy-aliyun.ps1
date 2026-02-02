# Deploy to GitHub and Aliyun
Write-Host "Starting deployment..."

# Push to GitHub (uses default SSH key)
Write-Host "Pushing to GitHub..."
git push origin main

# Push to Aliyun (uses specific PEM key)
Write-Host "Pushing to Aliyun..."
# Use git -c to specify the SSH command for this operation only
git -c core.sshCommand="ssh -i H:/demo/deepdesign密钥对.pem" push aliyun main

Write-Host "Deployment trigger sent to Aliyun."
Write-Host "The server post-receive hook will handle the build and restart."
