#!/bin/bash
# npm 发布脚本

echo "🚀 开始发布 build-deploy-tools@1.6.0 到 npm..."

# 检查是否登录
if ! npm whoami &> /dev/null; then
    echo "❌ 未登录 npm，请先运行: npm login"
    exit 1
fi

echo "✅ npm 登录状态正常"

# 检查包名是否可用
echo "📦 检查包名..."
npm view build-deploy-tools &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ 包已存在，将更新版本"
else
    echo "✅ 包名可用，将创建新包"
fi

# 打包测试
echo "📦 打包测试..."
npm pack --dry-run

# 确认发布
read -p "是否确认发布到 npm? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消发布"
    exit 1
fi

# 发布
echo "🚀 正在发布..."
npm publish

if [ $? -eq 0 ]; then
    echo "✅ 发布成功！"
    echo "📦 包地址: https://www.npmjs.com/package/build-deploy-tools"
    echo "📝 版本: 1.6.0"
else
    echo "❌ 发布失败，请检查错误信息"
    exit 1
fi
