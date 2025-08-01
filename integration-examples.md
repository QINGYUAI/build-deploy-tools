# 构建工具集成示例

本文档提供了在不同构建工具中集成 `build-deploy-tools` 的详细示例，确保在打包完成后才执行文件复制和部署操作。

## 🎯 集成原理

所有集成方案都基于以下原理：
1. **监听构建完成事件** - 使用构建工具提供的钩子或回调
2. **验证构建结果** - 检查构建是否成功，有错误则跳过部署
3. **执行部署操作** - 调用 BuildDeployTools 进行文件复制和SVN操作
4. **错误处理** - 优雅处理部署过程中的错误

## 📁 Vue CLI + Webpack 项目

### 完整的 vue.config.js 配置

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

// 获取打包文件名的函数
function getFileName() {
  return process.env.npm_config_build || 'vam3'
}

// 检查是否应该执行部署插件
function shouldExecuteDeployPlugin() {
  // 只有包含 'build-copy' 的npm脚本才执行插件
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log(`🔍 当前npm脚本: ${scriptName}`)
  console.log(`🔍 脚本命令: ${scriptCommand}`)
  
  // 检查脚本名称或命令中是否包含 build-copy 或 deploy
  const shouldExecute = scriptName.includes('build-copy') || 
                       scriptCommand.includes('build-copy') ||
                       scriptName.includes('deploy')
  
  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

module.exports = {
  // Vue CLI 基础配置
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: getFileName(), // 自定义输出目录名
  assetsDir: 'static',
  
  // Webpack 配置
  configureWebpack: {
    plugins: [
      // 生产环境部署插件 - 只在包含build-copy的脚本中执行
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin() && {
        apply: compiler => {
          compiler.hooks.done.tapAsync('BuildDeployPlugin', async (stats, callback) => {
            try {
              console.log('📦 Vue项目构建完成，开始执行文件复制...')

              // 检查构建错误
              if (stats.hasErrors()) {
                console.error('❌ 构建过程中发现错误：')
                stats.compilation.errors.forEach(error => {
                  console.error(error.message)
                })
                console.error('跳过文件复制操作')
                callback()
                return
              }

              // 检查构建警告
              if (stats.hasWarnings()) {
                console.warn('⚠️  构建过程中发现警告：')
                stats.compilation.warnings.forEach(warning => {
                  console.warn(warning.message)
                })
              }

              // 执行文件复制
              const buildDeployTools = new BuildDeployTools({
                maxRetries: 3,
                retryDelay: 2000,
              })

              const deployConfig = {
                sourceDir: `./${getFileName()}`,
                targetParentDir: 'D:/Work/Vue3/yiyumsaas',
                fileName: getFileName(),
                autoCommit: process.env.AUTO_COMMIT === 'true'
              }

              console.log('🚀 开始部署配置：', deployConfig)

              await buildDeployTools.executeBuildCopy(deployConfig)

              console.log('✅ Vue项目部署完成')
              callback()
            } catch (error) {
              console.error('❌ 部署失败:', error.message)
              // 在CI环境中，部署失败应该导致构建失败
              if (process.env.CI) {
                callback(error)
              } else {
                callback() // 本地开发时不中断
              }
            }
          })
        },
      },
    ].filter(Boolean),
  },

  // 开发服务器配置
  devServer: {
    port: 8080,
    open: true,
  },
}
```

### package.json 脚本配置

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "build:deploy": "vue-cli-service build",
    "build:auto": "AUTO_COMMIT=true vue-cli-service build",
    "deploy:test": "npm run build:deploy --build=test-vam3",
    "deploy:prod": "npm run build:auto --build=vam3"
  }
}
```

## ⚡ Vite 项目

### 完整的 vite.config.js 配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { BuildDeployTools } from 'build-deploy-tools'

// 获取构建配置
const getBuildConfig = () => {
  const fileName = process.env.npm_config_build || 'vam3'
  return {
    outDir: fileName,
    fileName: fileName
  }
}

// 检查是否应该执行部署插件
const shouldExecuteDeployPlugin = () => {
  // 只有包含 'build-copy' 的npm脚本才执行插件
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log(`🔍 当前npm脚本: ${scriptName}`)
  console.log(`🔍 脚本命令: ${scriptCommand}`)
  
  // 检查脚本名称或命令中是否包含 build-copy 或 deploy
  const shouldExecute = scriptName.includes('build-copy') || 
                       scriptCommand.includes('build-copy') ||
                       scriptName.includes('deploy')
  
  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

export default defineConfig({
  plugins: [
    vue(),
    
    // 部署插件 - 只在包含build-copy的脚本中执行
    shouldExecuteDeployPlugin() && {
      name: 'build-deploy-plugin',
      enforce: 'post', // 确保在最后执行
      
      // Vite 构建完成钩子
      closeBundle: {
        order: 'post',
        handler: async () => {
          if (process.env.NODE_ENV === 'production') {
            console.log('📦 Vite构建完成，开始执行文件复制...')
            
            const buildConfig = getBuildConfig()
            const buildDeployTools = new BuildDeployTools({
              maxRetries: 3,
              retryDelay: 2000,
            })
            
            try {
              await buildDeployTools.executeBuildCopy({
                sourceDir: `./${buildConfig.outDir}`,
                targetParentDir: 'D:/Work/Vue3/yiyumsaas',
                fileName: buildConfig.fileName,
                autoCommit: process.env.AUTO_COMMIT === 'true'
              })
              
              console.log('✅ Vite项目部署完成')
            } catch (error) {
              console.error('❌ 部署失败:', error.message)
              
              // 在CI环境中抛出错误
              if (process.env.CI) {
                throw error
              }
            }
          }
        }
      }
    }
  ].filter(Boolean), // 过滤掉false值

  // 构建配置
  build: {
    outDir: getBuildConfig().outDir,
    assetsDir: 'static',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
  },
})
```

## 📦 Rollup 项目

### rollup.config.js 配置

```javascript
import { BuildDeployTools } from 'build-deploy-tools'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const isProduction = process.env.NODE_ENV === 'production'
const fileName = process.env.npm_config_build || 'vam3'

// 检查是否应该执行部署插件
const shouldExecuteDeployPlugin = () => {
  // 只有包含 'build-copy' 的npm脚本才执行插件
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log(`🔍 当前npm脚本: ${scriptName}`)
  console.log(`🔍 脚本命令: ${scriptCommand}`)
  
  // 检查脚本名称或命令中是否包含 build-copy 或 deploy
  const shouldExecute = scriptName.includes('build-copy') || 
                       scriptCommand.includes('build-copy') ||
                       scriptName.includes('deploy')
  
  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

export default {
  input: 'src/main.js',
  output: {
    file: `${fileName}/bundle.js`,
    format: 'iife',
    name: 'MyApp'
  },
  
  plugins: [
    resolve(),
    commonjs(),
    isProduction && terser(),
    
    // 部署插件 - 只在包含build-copy的脚本中执行
    isProduction && shouldExecuteDeployPlugin() && {
      name: 'build-deploy-plugin',
      writeBundle: async (options, bundle) => {
        console.log('📦 Rollup构建完成，开始执行文件复制...')
        
        const buildDeployTools = new BuildDeployTools()
        
        try {
          // 检查bundle是否有错误
          const hasErrors = Object.values(bundle).some(chunk => chunk.error)
          if (hasErrors) {
            console.error('❌ 构建包含错误，跳过部署')
            return
          }
          
          await buildDeployTools.executeBuildCopy({
            sourceDir: `./${fileName}`,
            targetParentDir: 'D:/Work/Vue3/yiyumsaas',
            fileName: fileName,
            autoCommit: process.env.AUTO_COMMIT === 'true'
          })
          
          console.log('✅ Rollup项目部署完成')
        } catch (error) {
          console.error('❌ 部署失败:', error.message)
          
          if (process.env.CI) {
            throw error
          }
        }
      }
    }
  ].filter(Boolean)
}
```

## 🔧 高级集成方案

### 1. 条件部署插件

```javascript
// deploy-plugin.js
const { BuildDeployTools } = require('build-deploy-tools')

class ConditionalDeployPlugin {
  constructor(options = {}) {
    this.options = {
      enabled: process.env.NODE_ENV === 'production',
      skipOnErrors: true,
      skipOnWarnings: false,
      environments: ['production', 'staging'],
      ...options
    }
  }

  apply(compiler) {
    if (!this.options.enabled) {
      console.log('🔕 部署插件已禁用')
      return
    }

    compiler.hooks.done.tapAsync('ConditionalDeployPlugin', async (stats, callback) => {
      try {
        // 环境检查
        if (!this.options.environments.includes(process.env.NODE_ENV)) {
          console.log(`🔕 当前环境 ${process.env.NODE_ENV} 不在部署环境列表中`)
          callback()
          return
        }

        // 错误检查
        if (this.options.skipOnErrors && stats.hasErrors()) {
          console.error('❌ 构建有错误，跳过部署')
          callback()
          return
        }

        // 警告检查
        if (this.options.skipOnWarnings && stats.hasWarnings()) {
          console.warn('⚠️  构建有警告，跳过部署')
          callback()
          return
        }

        await this.executeDeploy()
        callback()
      } catch (error) {
        console.error('❌ 部署失败:', error.message)
        callback(this.options.failOnError ? error : null)
      }
    })
  }

  async executeDeploy() {
    const tools = new BuildDeployTools(this.options.toolOptions)
    await tools.executeBuildCopy(this.options.deployConfig)
  }
}

module.exports = ConditionalDeployPlugin
```

### 2. 多环境部署配置

```javascript
// multi-env-deploy.js
const { BuildDeployTools } = require('build-deploy-tools')

const deployConfigs = {
  development: {
    targetParentDir: 'D:/Work/Vue3/dev',
    autoCommit: false
  },
  staging: {
    targetParentDir: 'D:/Work/Vue3/staging',
    autoCommit: true
  },
  production: {
    targetParentDir: 'D:/Work/Vue3/production',
    autoCommit: true
  }
}

async function deployToEnvironment(env = process.env.NODE_ENV) {
  const config = deployConfigs[env]
  if (!config) {
    throw new Error(`未找到环境 ${env} 的部署配置`)
  }

  console.log(`🚀 部署到 ${env} 环境...`)
  
  const tools = new BuildDeployTools()
  await tools.executeBuildCopy({
    sourceDir: './dist',
    fileName: process.env.npm_config_build || 'vam3',
    ...config
  })
  
  console.log(`✅ ${env} 环境部署完成`)
}

module.exports = { deployToEnvironment, deployConfigs }
```

## 🚀 使用建议

### 1. 环境变量配置

创建 `.env` 文件：

```bash
# 构建环境
NODE_ENV=production

# 部署配置
AUTO_COMMIT=false
TARGET_DIR=D:/Work/Vue3/yiyumsaas
BUILD_NAME=vam3

# 错误处理
FAIL_ON_DEPLOY_ERROR=false
SKIP_ON_WARNINGS=true
```

### 2. CI/CD 集成

在 `.github/workflows/deploy.yml` 中：

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build and Deploy
        run: npm run build:auto
        env:
          AUTO_COMMIT: true
          CI: true
```

### 3. 错误处理最佳实践

```javascript
// 错误处理示例
compiler.hooks.done.tapAsync('SafeDeployPlugin', async (stats, callback) => {
  try {
    // 预检查
    if (!await preDeployCheck()) {
      console.log('🔕 预检查失败，跳过部署')
      callback()
      return
    }

    // 执行部署
    await executeDeploy()
    
    // 后处理
    await postDeployActions()
    
    callback()
  } catch (error) {
    // 记录错误
    console.error('部署错误详情:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // 发送通知
    await sendDeployNotification('failed', error.message)
    
    // 决定是否中断构建
    callback(process.env.CI ? error : null)
  }
})
```

## 🎯 脚本执行控制示例

### 执行逻辑说明

插件只在npm脚本名称或命令中包含 `build-copy` 或 `deploy` 时才执行：

```javascript
// 检查函数
function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  // 满足条件之一即执行：
  // 1. 脚本名称包含 'build-copy'
  // 2. 脚本命令包含 'build-copy'  
  // 3. 脚本名称包含 'deploy'
  return scriptName.includes('build-copy') || 
         scriptCommand.includes('build-copy') ||
         scriptName.includes('deploy')
}
```

### 执行场景演示

根据您的 `package.json` 配置：

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "dev": "vue-cli-service serve", 
    "build": "vue-cli-service build",
    "build:copy": "vue-cli-service build && node scripts/build-copy.js",
    "lint": "vue-cli-service lint",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit",
    "test-notification": "test-notification"
  }
}
```

#### ✅ 会执行插件的脚本：

| 脚本命令 | npm_lifecycle_event | 执行插件 | 原因 |
|----------|-------------------|---------|------|
| `npm run build:copy` | `build:copy` | ✅ 是 | 脚本名包含 `build-copy` |
| `npm run deploy` | `deploy` | ✅ 是 | 脚本名包含 `deploy` |
| `npm run deploy-commit` | `deploy-commit` | ✅ 是 | 脚本名包含 `deploy` |

**控制台输出示例：**
```bash
$ npm run deploy
🔍 当前npm脚本: deploy
🔍 脚本命令: npm run build && build-copy --auto
🔍 是否执行部署插件: true
📦 构建完成，开始执行文件复制...
```

#### ❌ 不会执行插件的脚本：

| 脚本命令 | npm_lifecycle_event | 执行插件 | 原因 |
|----------|-------------------|---------|------|
| `npm run build` | `build` | ❌ 否 | 脚本名不包含关键词 |
| `npm run dev` | `dev` | ❌ 否 | 脚本名不包含关键词 |
| `npm run serve` | `serve` | ❌ 否 | 脚本名不包含关键词 |
| `npm run lint` | `lint` | ❌ 否 | 脚本名不包含关键词 |

**控制台输出示例：**
```bash
$ npm run build
🔍 当前npm脚本: build
🔍 脚本命令: vue-cli-service build
🔍 是否执行部署插件: false
# 插件不会加载，正常构建继续
```

### 自定义检测规则

如果您有特殊需求，可以自定义检测规则：

```javascript
// 更严格的检测：只有确切的脚本名才执行
function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  
  // 只有这些确切的脚本名才执行
  const allowedScripts = [
    'build:copy',
    'deploy', 
    'deploy-commit',
    'production-deploy'
  ]
  
  const shouldExecute = allowedScripts.includes(scriptName)
  console.log(`🔍 脚本 ${scriptName} ${shouldExecute ? '✅ 允许' : '❌ 禁止'}执行插件`)
  
  return shouldExecute
}
```

```javascript
// 更灵活的检测：支持环境变量控制
function shouldExecuteDeployPlugin() {
  // 环境变量强制控制
  if (process.env.FORCE_DEPLOY === 'true') {
    console.log('🔍 环境变量强制启用部署插件')
    return true
  }
  
  if (process.env.DISABLE_DEPLOY === 'true') {
    console.log('🔍 环境变量强制禁用部署插件')
    return false
  }
  
  // 默认逻辑
  const scriptName = process.env.npm_lifecycle_event || ''
  const shouldExecute = scriptName.includes('build-copy') || scriptName.includes('deploy')
  
  console.log(`🔍 脚本检测结果: ${shouldExecute}`)
  return shouldExecute
}
```

### 调试技巧

如果需要调试脚本检测逻辑，可以添加更详细的日志：

```javascript
function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log('🔍 =====  部署插件检测  =====')
  console.log(`🔍 npm_lifecycle_event: "${scriptName}"`)
  console.log(`🔍 npm_lifecycle_script: "${scriptCommand}"`)
  console.log(`🔍 NODE_ENV: "${process.env.NODE_ENV}"`)
  console.log(`🔍 CI: "${process.env.CI}"`)
  
  const conditions = {
    hasDeployInName: scriptName.includes('deploy'),
    hasBuildCopyInName: scriptName.includes('build-copy'),
    hasBuildCopyInCommand: scriptCommand.includes('build-copy'),
  }
  
  console.log('🔍 检测条件:', conditions)
  
  const shouldExecute = Object.values(conditions).some(Boolean)
  console.log(`🔍 最终决定: ${shouldExecute ? '✅ 执行插件' : '❌ 跳过插件'}`)
  console.log('🔍 ===========================')
  
  return shouldExecute
}
```

---

这些集成示例确保了 `build-deploy-tools` 只在特定的npm脚本中运行，避免在开发和普通构建过程中意外执行部署操作，提供了可靠和可控的自动化部署解决方案。