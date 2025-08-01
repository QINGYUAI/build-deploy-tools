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

## 🚀 立即使用

### 1. 安装依赖

```bash
cd /d/MyWeb/scripts
npm install
```

### 2. 测试功能

```bash
# 测试通知功能
node bin/test-notification.js

# 查看构建复制工具帮助
node bin/build-copy.js --help
```

### 3. 基本使用

```bash
# 交互模式（推荐首次使用）
node bin/build-copy.js

# 自动模式
node bin/build-copy.js --auto

# 自动模式 + 自动提交
node bin/build-copy.js --auto --commit
```

## 📦 发布为npm包

### 1. 修改package.json

```bash
# 编辑包名（必须唯一）
# 将 "name": "build-deploy-tools" 改为您的包名
# 例如: "name": "@yourname/build-deploy-tools"
```

### 2. 发布到npm

```bash
# 登录npm
npm login

# 发布包
npm publish
```

### 3. 全局安装使用

```bash
# 安装您发布的包
npm install -g @yourname/build-deploy-tools

# 直接使用命令
build-copy --help
test-notification --help
```

## 🔧 集成到现有项目

### 方式1: 本地使用

```bash
# 复制到您的项目
cp -r . /path/to/your/project/tools/

# 在项目中使用
node tools/bin/build-copy.js
```

### 方式2: 包依赖

```json
// package.json
{
  "devDependencies": {
    "@yourname/build-deploy-tools": "^1.0.0"
  },
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit"
  }
}
```

### 方式3: 编程使用

```javascript
const { BuildDeployTools } = require('@yourname/build-deploy-tools')

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
# .env 文件
CI=true                          # CI环境模式
npm_config_auto=true             # 自动模式
npm_config_commit_cli=true       # 自动提交
npm_config_notification=false    # 禁用通知
npm_config_build=myapp          # 构建文件名
```

### 命令行参数

```bash
build-copy --build=myapp --target=D:/Projects --auto --commit
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
   # 替代原来的使用方式
   # 原: node scripts/build-copy.js
   # 新: node bin/build-copy.js
   
   # 或者安装后直接使用
   # build-copy
   ```

3. **更新package.json脚本**
   ```json
   {
     "scripts": {
       "build-copy": "node bin/build-copy.js",
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