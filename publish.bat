@echo off
REM npm 发布脚本 (Windows)

echo 🚀 开始发布 build-deploy-tools@1.6.0 到 npm...

REM 检查是否登录
npm whoami >nul 2>&1
if errorlevel 1 (
    echo ❌ 未登录 npm，请先运行: npm login
    pause
    exit /b 1
)

echo ✅ npm 登录状态正常

REM 打包测试
echo 📦 打包测试...
call npm pack --dry-run

REM 确认发布
set /p confirm="是否确认发布到 npm? (y/n): "
if /i not "%confirm%"=="y" (
    echo ❌ 已取消发布
    pause
    exit /b 1
)

REM 发布
echo 🚀 正在发布...
call npm publish

if errorlevel 1 (
    echo ❌ 发布失败，请检查错误信息
    pause
    exit /b 1
) else (
    echo ✅ 发布成功！
    echo 📦 包地址: https://www.npmjs.com/package/build-deploy-tools
    echo 📝 版本: 1.6.0
)

pause
