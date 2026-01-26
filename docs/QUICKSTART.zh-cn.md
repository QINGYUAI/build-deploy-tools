# 快速开始指南

## 🎯 项目概述

**Build Deploy Tools** 是一个功能强大的 Node.js 构建部署工具包，将您原有的两个JS脚本整合成了一个完整的npm插件。

### ✨ 核心功能

- 🔄 **智能重试机制** - 自动处理网络异常和临时错误
- 📢 **跨平台通知** - 支持 Windows、macOS、Linux 系统通知
- 🤖 **自动化支持** - 完美适配 CI/CD 环境
- 📁 **文件操作** - 高效的文件复制、删除等操作
- 🔗 **SVN集成** - 完整的 SVN 操作支持
- 🛠️ **命令行工具** - 便捷的 CLI 命令

## 🚀 5分钟快速上手

### 步骤 1: 安装

```bash
# 全局安装（推荐）
npm install -g build-deploy-tools

# 或项目本地安装
npm install build-deploy-tools --save-dev

# 安装 dotenv（可选，用于支持 .env 文件）
npm install dotenv
```

### 步骤 1.5: 配置 .env 文件（推荐）

```bash
# 复制示例文件
cp env.example .env

# 编辑 .env 文件，设置你的配置
# TARGET_DIR=D:/Work/Vue3/myproject
# BUILD_NAME=myapp
# AUTO_MODE=true
# AUTO_COMMIT=true
```

详细说明请参考：[📖 环境变量使用指南](./ENV-USAGE.md)

### 步骤 2: 基本使用

```bash
# 交互模式（首次使用推荐）
build-copy

# 自动模式（跳过确认）
build-copy --auto

# 自动模式 + 自动提交到SVN
build-copy --auto --commit

# 自定义配置
build-copy --build=myapp --target=D:/Projects/deployment --auto
```

### 步骤 3: 集成到项目

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit"
  }
}
```

### 方式3: 编程使用

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

const tools = new BuildDeployTools()

async function deploy() {
  await tools.executeBuildCopy({
    sourceDir: './dist',
    targetParentDir: 'D:/Work/Vue3/myproject',
    fileName: 'myapp',
    autoCommit: true
  })
}

deploy()
```

## 📋 配置选项

### 环境变量配置

```bash
# .env 文件示例
# 目录和文件配置
TARGET_DIR=D:/Work/Vue3/myproject    # 目标目录
SOURCE_DIR=./dist                     # 源目录
BUILD_NAME=myapp                      # 构建文件名

# 自动化配置
CI=true                                # CI环境模式
AUTO_MODE=true                        # 自动模式
AUTO_COMMIT=true                      # 自动提交
USE_NOTIFICATION=false                # 禁用通知

# npm配置方式（通过 npm run script --key=value）
npm_config_auto=true                  # 自动模式
npm_config_commit_cli=true            # 自动提交
npm_config_notification=false         # 禁用通知
npm_config_build=myapp               # 构建文件名
npm_config_target=D:/Work/Vue3/myproject  # 目标目录
npm_config_source=./dist              # 源目录

# 提交配置
COMMIT_MESSAGE="修复登录问题"          # 自定义提交信息
USE_VCS_HISTORY=true                  # 使用版本控制历史

# 重试配置
MAX_RETRIES=5                         # 最大重试次数
RETRY_DELAY=3000                      # 重试延迟（毫秒）
```

### 命令行参数

```bash
# 基本使用
build-copy --build=myapp --target=D:/Projects --auto --commit

# 指定源目录和目标目录
build-copy --source=./dist --target=D:/Projects --auto --commit

# 使用环境变量
TARGET_DIR=D:/Projects SOURCE_DIR=./dist BUILD_NAME=myapp build-copy --auto
```

## 🔍 与原脚本对比

| 功能 | 原脚本 | npm包版本 |
|------|--------|-----------|
| 文件复制 | ✅ | ✅ 增强重试 |
| SVN操作 | ✅ | ✅ 智能错误处理 |
| 系统通知 | ✅ | ✅ 跨平台兼容 |
| 命令行工具 | ❌ | ✅ 完整CLI |
| 编程接口 | ❌ | ✅ 模块化API |
| 错误处理 | 基础 | ✅ 智能重试 |
| 文档说明 | ❌ | ✅ 完整文档 |
| npm分发 | ❌ | ✅ 标准包 |

## 🎯 迁移指南

### 从原脚本迁移

1. **保留原脚本（备份）**
   ```bash
   mv build-copy.js build-copy.js.backup
   mv test-notification.js test-notification.js.backup
   ```

2. **使用新版本**
   ```bash
   # 使用方式
   # 全局安装后: build-copy
   # 项目本地安装: npm run build-copy
   # 临时使用: npx build-deploy-tools build-copy
   # build-copy
   ```

3. **更新package.json脚本**
   ```json
   {
     "scripts": {
       "build-copy": "build-copy",
       "deploy": "npm run build && npm run build-copy -- --auto"
     }
   }
   ```

## 💡 使用技巧

### 1. CI/CD集成

```yaml
# GitHub Actions 示例
- name: Deploy
  run: |
    npm run build
    npx @yourname/build-deploy-tools build-copy --auto --commit
  env:
    CI: true
```

### 2. 多环境配置

```javascript
// deploy.config.js
const configs = {
  dev: {
    targetParentDir: 'D:/Work/Vue3/dev',
    autoCommit: false
  },
  prod: {
    targetParentDir: 'D:/Work/Vue3/production',
    autoCommit: true
  }
}

module.exports = configs[process.env.NODE_ENV || 'dev']
```

### 3. 批量部署

```bash
# 批量部署多个项目
for project in project1 project2 project3; do
  build-copy --build=$project --target=/path/to/$project --auto
done
```

## 🆘 常见问题

**Q: 如何禁用系统通知？**
A: 使用 `--no-notification` 参数或设置环境变量 `npm_config_notification=false`

**Q: SVN操作失败怎么办？**
A: 确保目标目录是SVN工作副本，检查网络连接和权限

**Q: 如何自定义重试次数？**
A: 编程方式使用时可以在构造函数中配置 `maxRetries` 参数

**Q: 支持Git吗？**
A: 当前版本专注于SVN，Git支持在计划中

## 🎯 重要提醒：脚本执行控制

⚠️ **v1.2.1 重要特性** - 插件现在具备智能脚本检测，**仅在特定npm脚本中执行**：

### 执行条件
- 脚本名包含 `build-copy`：如 `npm run build:copy`
- 脚本名包含 `deploy`：如 `npm run deploy`
- 脚本命令包含 `build-copy`：如 `vue-cli-service build && build-copy`

### 推荐的package.json配置
```json
{
  "scripts": {
    "serve": "vue-cli-service serve",                    // ❌ 跳过插件
    "build": "vue-cli-service build",                    // ❌ 跳过插件
    "deploy": "npm run build && build-copy --auto",      // ✅ 执行插件 
    "deploy-commit": "npm run build && build-copy --auto --commit"  // ✅ 执行插件
  }
}
```

### 在vue.config.js中启用检测
```javascript
// 脚本检测函数
function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  return scriptName.includes('build-copy') || scriptName.includes('deploy')
}

module.exports = {
  configureWebpack: {
    plugins: [
      // 只在生产环境且特定脚本中执行
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin()
        ? /* 部署插件配置 */ : null
    ].filter(Boolean)
  }
}
```

🔍 **这样确保插件只在您真正需要部署时才运行，避免在开发中意外触发！**

详细配置请参考：[integration-examples.md](integration-examples.md)

## 📞 获取帮助

- 查看详细文档：`README.md`
- 查看API文档：`INSTALL.md`
- 查看集成示例：`integration-examples.md`
- 命令行帮助：`build-copy --help`
- 测试功能：`test-notification --help`

---

🎉 **恭喜！您已经成功将原有的JS脚本转换为一个专业的npm包！**