# npm 发布修复脚本
# 解决 token 过期问题

Write-Host "🔧 修复 npm 发布问题..." -ForegroundColor Cyan

# 步骤1: 清除旧的认证信息
Write-Host "`n📝 步骤 1: 清除旧的认证信息..." -ForegroundColor Yellow
npm logout 2>&1 | Out-Null
Write-Host "✅ 已清除旧的认证信息" -ForegroundColor Green

# 步骤2: 检查registry配置
Write-Host "`n📝 步骤 2: 检查 registry 配置..." -ForegroundColor Yellow
$registry = npm config get registry
Write-Host "当前 registry: $registry" -ForegroundColor Gray

if ($registry -notmatch "registry.npmjs.org") {
    Write-Host "⚠️  检测到非官方registry，切换到官方registry..." -ForegroundColor Yellow
    npm config set registry https://registry.npmjs.org/
    Write-Host "✅ 已切换到官方registry" -ForegroundColor Green
}

# 步骤3: 检查包信息
Write-Host "`n📝 步骤 3: 检查包信息..." -ForegroundColor Yellow
$currentVersion = npm view build-deploy-tools version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm上的当前版本: $currentVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  无法获取npm上的版本信息" -ForegroundColor Yellow
}

$localVersion = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "✅ 本地版本: $localVersion" -ForegroundColor Green

# 步骤4: 提示登录
Write-Host "`n📝 步骤 4: 需要重新登录npm" -ForegroundColor Yellow
Write-Host "请运行以下命令登录:" -ForegroundColor Cyan
Write-Host "  npm login" -ForegroundColor White
Write-Host "`n登录后，运行以下命令发布:" -ForegroundColor Cyan
Write-Host "  npm publish" -ForegroundColor White

# 步骤5: 验证打包
Write-Host "`n📝 步骤 5: 验证打包..." -ForegroundColor Yellow
$packOutput = npm pack --dry-run 2>&1 | Out-String
if ($packOutput -match "total files:") {
    Write-Host "✅ 打包验证通过" -ForegroundColor Green
} else {
    Write-Host "⚠️  打包验证失败" -ForegroundColor Yellow
}

Write-Host "`n✨ 修复完成！" -ForegroundColor Green
Write-Host "`n下一步操作:" -ForegroundColor Cyan
Write-Host "1. 运行: npm login" -ForegroundColor White
Write-Host "2. 运行: npm publish" -ForegroundColor White
