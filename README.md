# Build Deploy Tools

[![npm version](https://badge.fury.io/js/build-deploy-tools.svg)](https://badge.fury.io/js/build-deploy-tools)
[![Node.js Version](https://img.shields.io/node/v/build-deploy-tools.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚀 **构建部署工具包** - 一个功能强大的 Node.js 工具包，提供文件复制、SVN 操作、系统通知确认等功能，专为自动化构建部署流程设计。

## ✨ 主要特性

- 🔄 **智能重试机制** - 自动处理网络异常和临时错误
- 📢 **跨平台通知** - 支持 Windows、macOS、Linux 系统通知
- 🤖 **自动化模式** - 支持 CI/CD 环境的无人值守操作
- 📁 **文件操作** - 高效的文件复制、删除等操作
- 🔗 **SVN 集成** - 完整的 SVN 更新、提交、删除等操作
- 🧠 **智能提交信息** - 自动从Git/SVN获取最近提交信息，支持自定义格式化
- 📊 **进度提示** - 直观的进度条和状态反馈
- 🛠️ **命令行工具** - 提供便捷的 CLI 命令
- 📝 **详细日志** - 完整的操作日志和错误信息

## 📦 安装

### 全局安装（推荐）

```bash
npm install -g build-deploy-tools
```

### 项目本地安装

```bash
npm install build-deploy-tools --save-dev
```

### 临时使用

```bash
npx build-deploy-tools --help
```

## 🚀 快速开始

### 命令行使用

#### 1. 文件复制工具

```bash
# 交互模式（默认）
build-copy

# 自动模式
build-copy --auto

# 自动模式 + 自动提交 SVN
build-copy --auto --commit

# 自定义构建文件名和目标目录
build-copy --build=myapp --target=D:/Projects/deployment

# 🆕 使用智能提交信息（v1.3.0+）
build-copy --auto --commit  # 自动获取Git/SVN最近提交信息

# 🆕 自定义提交信息
build-copy --message="修复登录问题" --commit

# 🆕 格式化提交信息
build-copy --prefix="🚀" --add-timestamp --commit
```

#### 2. 通知功能测试

```bash
# 测试系统通知功能
test-notification

# 自动模式测试
test-notification --auto
```

### 编程方式使用

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

// 创建工具实例
const tools = new BuildDeployTools({
  maxRetries: 3,
  retryDelay: 2000
})

// 执行构建复制
async function deploy() {
  try {
    await tools.executeBuildCopy({
      sourceDir: './dist',
      targetParentDir: 'D:/Projects/deployment',
      fileName: 'myapp',
      autoCommit: true,
      // 🆕 v1.3.0+ 智能提交信息功能
      useVcsHistory: true,  // 启用版本控制历史
      commitMessage: null,  // 使用智能获取的信息
      commitOptions: {
        prefix: '[自动部署]',
        addTimestamp: true
      }
    })
    console.log('部署成功！')
  } catch (error) {
    console.error('部署失败:', error.message)
  }
}
```

## 📚 快速配置

### package.json 集成

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit",
    "test-notification": "test-notification"
  },
  "devDependencies": {
    "build-deploy-tools": "^1.3.0"
  }
}
```

### 使用示例

```bash
# 构建并手动确认部署
npm run deploy

# 自动构建部署并提交
npm run deploy-commit

# 测试通知功能
npm run test-notification
```

## 🔧 构建工具集成

### 方案1：Webpack 集成（推荐）

在 `vue.config.js` 或 `webpack.config.js` 中配置：

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

// 检查是否应该执行部署插件
function shouldExecuteDeployPlugin() {
  // 只有包含 'build-copy' 的npm脚本才执行插件
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log(`🔍 当前npm脚本: ${scriptName}`)
  console.log(`🔍 脚本命令: ${scriptCommand}`)
  
  // 检查脚本名称或命令中是否包含 build-copy
  const shouldExecute = scriptName.includes('build-copy') || 
                       scriptCommand.includes('build-copy') ||
                       scriptName.includes('deploy')
  
  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

module.exports = {
  // ... 其他配置
  configureWebpack: {
    plugins: [
      // 在生产环境下创建自定义插件，在构建完成后执行复制操作
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin()
        ? {
            apply: compiler => {
              // 使用webpack的done钩子，确保在打包完成后执行
              compiler.hooks.done.tapAsync('BuildDeployPlugin', async (stats, callback) => {
                try {
                  console.log('📦 构建完成，开始执行文件复制...')

                  // 检查构建是否成功
                  if (stats.hasErrors()) {
                    console.error('❌ 构建有错误，跳过文件复制')
                    callback()
                    return
                  }

                  // 执行文件复制操作
                  const buildDeployTools = new BuildDeployTools({
                    maxRetries: 3,
                    retryDelay: 2000,
                  })

                  await buildDeployTools.executeBuildCopy({
                    sourceDir: './dist', // 构建输出目录
                    targetParentDir: 'D:/Work/Vue3/development',
                    autoCommit: true, // 根据需要设置
                    // 🆕 v1.3.0+ 智能提交信息
                    useVcsHistory: true,
                    commitOptions: {
                      prefix: '[Webpack构建]',
                      addTimestamp: true
                    }
                  })

                  console.log('✅ 文件复制完成')
                  callback()
                } catch (error) {
                  console.error('❌ 文件复制失败:', error)
                  callback(error)
                }
              })
            },
          }
        : null,
    ].filter(Boolean), // 过滤掉null值
  },
}
```

### 方案2：Vite 集成

在 `vite.config.js` 中配置：

```javascript
import { defineConfig } from 'vite'
import { BuildDeployTools } from 'build-deploy-tools'

export default defineConfig({
  // ... 其他配置
  plugins: [
    // ... 其他插件
    {
      name: 'build-deploy',
      closeBundle: async () => {
        if (process.env.NODE_ENV === 'production') {
          console.log('📦 Vite构建完成，开始执行文件复制...')
          
          const buildDeployTools = new BuildDeployTools()
          
          try {
            await buildDeployTools.executeBuildCopy({
              sourceDir: './dist',
              targetParentDir: 'D:/Work/Vue3/development',
              autoCommit: false,
              // 🆕 v1.3.0+ 智能提交信息
              useVcsHistory: true,
              commitOptions: {
                prefix: '[Vite构建]'
              }
            })
            console.log('✅ 文件复制完成')
          } catch (error) {
            console.error('❌ 文件复制失败:', error)
          }
        }
      }
    }
  ]
})
```

### 方案3：Rollup 集成

在 `rollup.config.js` 中配置：

```javascript
import { BuildDeployTools } from 'build-deploy-tools'

export default {
  // ... 其他配置
  plugins: [
    // ... 其他插件
    {
      name: 'build-deploy',
      writeBundle: async () => {
        if (process.env.NODE_ENV === 'production') {
          console.log('📦 Rollup构建完成，开始执行文件复制...')
          
          const buildDeployTools = new BuildDeployTools()
          
          try {
            await buildDeployTools.executeBuildCopy({
              sourceDir: './dist',
              targetParentDir: 'D:/Work/Vue3/development',
              // 🆕 v1.3.0+ 智能提交信息
              useVcsHistory: true,
              commitOptions: {
                prefix: '[Rollup构建]'
              }
            })
            console.log('✅ 文件复制完成')
          } catch (error) {
            console.error('❌ 文件复制失败:', error)
          }
        }
      }
    }
  ]
}
```

### 方案4：npm scripts 后置钩子

利用 npm 的 `post` 钩子：

```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "build-copy --auto",
    "build:prod": "vite build",
    "postbuild:prod": "build-copy --auto --commit"
  }
}
```

### 方案5：自定义 Node.js 脚本

创建 `scripts/build-and-deploy.js`：

```javascript
const { execSync } = require('child_process')
const { BuildDeployTools } = require('build-deploy-tools')

async function buildAndDeploy() {
  try {
    console.log('🚀 开始构建...')
    
    // 执行构建命令
    execSync('npm run build', { stdio: 'inherit' })
    
    console.log('📦 构建完成，开始部署...')
    
    // 执行部署
    const tools = new BuildDeployTools()
    await tools.executeBuildCopy({
      sourceDir: './dist',
      targetParentDir: 'D:/Work/Vue3/development',
      autoCommit: process.env.AUTO_COMMIT === 'true',
      // 🆕 v1.3.0+ 智能提交信息
      useVcsHistory: true,
      commitOptions: {
        prefix: '[自动构建]',
        addTimestamp: true
      }
    })
    
    console.log('🎉 构建和部署完成！')
  } catch (error) {
    console.error('❌ 失败:', error.message)
    process.exit(1)
  }
}

buildAndDeploy()
```

在 `package.json` 中添加：

```json
{
  "scripts": {
    "deploy": "node scripts/build-and-deploy.js",
    "deploy:auto": "AUTO_COMMIT=true node scripts/build-and-deploy.js"
  }
}
```

## ⚙️ 配置选项

### 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--auto` | 启用自动模式 | `build-copy --auto` |
| `--commit` | 强制自动提交到 SVN | `build-copy --commit` |
| `--no-commit` | 禁止提交到 SVN | `build-copy --no-commit` |
| `--no-notification` | 禁用系统通知 | `build-copy --no-notification` |
| `--build=<name>` | 指定构建文件名 | `build-copy --build=myapp` |
| `--target=<path>` | 指定目标目录 | `build-copy --target=D:/Projects` |
| 🆕 `--message=<信息>` | 自定义提交信息 | `build-copy --message="修复bug"` |
| 🆕 `--commit-message=<信息>` | 自定义提交信息（别名） | `build-copy --commit-message="版本发布"` |
| 🆕 `--no-vcs-history` | 禁用版本控制历史 | `build-copy --no-vcs-history` |
| 🆕 `--add-timestamp` | 添加时间戳 | `build-copy --add-timestamp` |
| 🆕 `--prefix=<前缀>` | 添加前缀 | `build-copy --prefix="[部署]"` |
| 🆕 `--suffix=<后缀>` | 添加后缀 | `build-copy --suffix="[完成]"` |

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `CI=true` | CI 环境自动启用自动模式 | `CI=true build-copy` |
| `npm_config_auto=true` | 启用自动模式 | `npm run build-copy --auto` |
| `npm_config_commit_cli=true` | 启用自动提交 | `npm run build-copy --commit` |
| `npm_config_notification=false` | 禁用通知 | `npm run build-copy --notification=false` |
| `npm_config_build=filename` | 指定构建文件名 | `npm run build-copy --build=myapp` |

## 🧠 智能提交信息功能 (v1.3.0+)

### 🎯 功能特性

**智能提交信息**功能能够自动从当前项目的版本控制系统（Git或SVN）获取最近一次提交信息，作为部署时的提交信息，保持代码变更与部署记录的一致性。

#### 🔧 优先级机制

1. **自定义信息** - 手动指定的提交信息（最高优先级）
2. **Git最近提交** - 从当前Git仓库获取最近一次提交信息
3. **SVN最近提交** - 从当前SVN工作目录获取最近一次提交信息
4. **默认信息** - 使用默认的"更新构建文件"

#### 🎨 格式化选项

- **前缀/后缀** - 为提交信息添加自定义前缀或后缀
- **时间戳** - 自动添加当前时间戳
- **组合使用** - 支持多种格式化选项组合

### 📝 使用示例

```bash
# 基本使用 - 自动获取版本控制提交信息
build-copy --auto --commit

# 自定义提交信息
build-copy --message="紧急修复支付问题" --commit

# 格式化选项
build-copy --prefix="🚀[生产]" --add-timestamp --commit
# 结果：🚀[生产] 修复用户登录验证问题 [2024-01-15 14:30]

# 禁用版本控制历史，仅使用默认信息
build-copy --no-vcs-history --commit
```

### 💻 编程接口

```javascript
await tools.executeBuildCopy({
  sourceDir: './dist',
  targetParentDir: 'D:/Work/Vue3/development',
  autoCommit: true,
  // 智能提交信息配置
  useVcsHistory: true,        // 启用版本控制历史
  commitMessage: null,        // 使用智能获取的信息
  commitOptions: {
    prefix: '[自动部署]',
    suffix: '[完成]',
    addTimestamp: true
  }
})
```

详细使用指南请参考：[📖 智能提交信息示例文档](./SMART-COMMIT-EXAMPLES.md)

## 🌍 跨平台支持

本工具支持以下平台：

- ✅ **Windows** (Windows 10/11)
- ✅ **macOS** (macOS 10.14+)
- ✅ **Linux** (Ubuntu, CentOS, 等)

## 📖 详细文档

- [📘 安装指南](./INSTALL.md) - 详细的安装和配置说明
- [🚀 快速开始](./QUICKSTART.zh-cn.md) - 中文快速开始指南
- [📝 更新日志](./CHANGELOG.md) - 版本更新历史
- [⚙️ 配置示例](./example.config.js) - 完整的配置示例
- 🆕 [🧠 智能提交信息示例](./SMART-COMMIT-EXAMPLES.md) - 智能提交信息功能详细指南

## 🛠️ API 文档

### BuildDeployTools 类

#### 构造函数

```javascript
const tools = new BuildDeployTools(options)
```

**选项 (options):**

- `maxRetries` (number): 最大重试次数，默认 3
- `retryDelay` (number): 重试延迟时间(毫秒)，默认 2000
- `defaultFileName` (string): 默认文件名，默认 'vam3'

#### 主要方法

##### `executeBuildCopy(config)`

执行完整的构建复制流程

**参数:**

- `config.sourceDir` (string): 源目录路径
- `config.targetParentDir` (string): 目标父目录路径
- `config.fileName` (string, 可选): 构建文件名
- `config.autoCommit` (boolean, 可选): 是否自动提交到 SVN
- 🆕 `config.commitMessage` (string, 可选): 自定义提交信息
- 🆕 `config.useVcsHistory` (boolean, 可选): 是否使用版本控制历史，默认true
- 🆕 `config.commitOptions` (object, 可选): 提交信息格式化选项
  - `prefix` (string): 前缀
  - `suffix` (string): 后缀
  - `addTimestamp` (boolean): 是否添加时间戳

**返回:** `Promise<boolean>`

##### `testNotification()`

测试通知功能

**返回:** `Promise<boolean>`

## 🛠️ 故障排除

### 常见问题

#### 1. 系统通知不显示

**解决方案:**

```bash
# 使用命令行模式
build-copy --no-notification
```

#### 2. SVN 操作失败

**解决方案:**

- 确保目标目录是 SVN 工作副本
- 检查 SVN 权限和网络连接

#### 3. 源目录不存在

**解决方案:**

```bash
# 先执行构建
npm run build
# 再执行部署
npm run deploy
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [npm 包](https://www.npmjs.com/package/build-deploy-tools)
- [问题反馈](https://github.com/your-username/build-deploy-tools/issues)
- [更新日志](CHANGELOG.md)

---

**Build Deploy Tools** - 让构建部署更简单、更可靠！ 🚀
