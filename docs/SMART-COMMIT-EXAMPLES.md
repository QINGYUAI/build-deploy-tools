# 🎯 智能提交信息功能示例

## ✨ 功能概述

**Build Deploy Tools v1.3.0** 新增了智能提交信息功能，能够自动从Git或SVN仓库获取最近一次提交信息，作为部署时的提交信息。

### 🔧 智能提取优先级

1. **自定义信息** - 手动指定的提交信息（最高优先级）
2. **Git最近提交** - 当前目录为Git仓库时，获取最近一次提交信息
3. **SVN最近提交** - 当前目录为SVN工作目录时，获取最近一次提交信息
4. **默认信息** - 使用默认的"更新构建文件"

## 🚀 使用示例

### 1. 命令行使用

#### 基本使用（自动获取提交信息）
```bash
# 自动从当前Git/SVN仓库获取最近提交信息
build-copy --auto --commit

# 示例输出：
# 📝 从Git获取提交信息: "修复用户登录验证问题"
# ✅ SVN提交成功，提交信息: 修复用户登录验证问题
```

#### 自定义提交信息
```bash
# 使用自定义提交信息
build-copy --message="部署版本v2.1.0到生产环境" --commit

# 或者使用完整参数名
build-copy --commit-message="修复购物车计算错误" --auto --commit
```

#### 禁用版本控制历史
```bash
# 不使用Git/SVN历史，仅使用默认信息
build-copy --no-vcs-history --commit

# 配合自定义信息
build-copy --no-vcs-history --message="紧急修复" --commit
```
$$
#### 格式化选项
```bash
# 添加时间戳
build-copy --add-timestamp --commit
# 提交信息: "修复登录问题 [2024-01-15 14:30]"

# 添加前缀和后缀
build-copy --prefix="[生产]" --suffix="[自动部署]" --commit
# 提交信息: "[生产] 修复登录问题 [自动部署]"

# 组合使用
build-copy --prefix="🚀" --add-timestamp --message="版本发布" --commit
# 提交信息: "🚀 版本发布 [2024-01-15 14:30]"
```

### 2. 编程方式使用

#### 基本编程接口
```javascript
const { BuildDeployTools } = require('build-deploy-tools')

const tools = new BuildDeployTools()

// 使用智能提交信息
await tools.executeBuildCopy({
  sourceDir: './dist',
  targetParentDir: 'D:/Work/Vue3/development',
  autoCommit: true,
  // 🆕 新参数
  useVcsHistory: true,  // 启用版本控制历史（默认）
  commitMessage: null,  // 不指定自定义信息，使用智能获取
  commitOptions: {
    addTimestamp: true,
    prefix: '[自动部署]'
  }
})
```

#### 自定义提交信息
```javascript
await tools.executeBuildCopy({
  sourceDir: './dist',
  targetParentDir: 'D:/Work/Vue3/development',
  autoCommit: true,
  commitMessage: '修复关键安全漏洞',
  commitOptions: {
    addTimestamp: true,
    prefix: '🔒'
  }
})
```

#### 仅使用默认信息
```javascript
await tools.executeBuildCopy({
  sourceDir: './dist',
  targetParentDir: 'D:/Work/Vue3/development',
  autoCommit: true,
  useVcsHistory: false  // 禁用版本控制历史
})
```

### 3. Vue.js 项目集成

#### vue.config.js 配置
```javascript
const { BuildDeployTools } = require('build-deploy-tools')

function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  return scriptName.includes('deploy')
}

module.exports = {
  configureWebpack: {
    plugins: [
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin() && {
        apply: compiler => {
          compiler.hooks.done.tapAsync('BuildDeployPlugin', async (stats, callback) => {
            try {
              if (stats.hasErrors()) {
                callback()
                return
              }

              const tools = new BuildDeployTools()
              await tools.executeBuildCopy({
                sourceDir: './dist',
                targetParentDir: 'D:/Work/Vue3/development',
                autoCommit: true,
                // 🆕 智能提交信息配置
                useVcsHistory: true,
                commitOptions: {
                  prefix: '[Vue构建]',
                  addTimestamp: true
                }
              })

              callback()
            } catch (error) {
              callback(error)
            }
          })
        },
      },
    ].filter(Boolean),
  },
}
```

#### package.json 脚本
```json
{
  "scripts": {
    "build": "vue-cli-service build",
    "deploy": "npm run build && build-copy --auto --commit --prefix='[Vue]'",
    "deploy:prod": "npm run build && build-copy --auto --commit --message='生产环境发布' --add-timestamp",
    "deploy:hotfix": "npm run build && build-copy --auto --commit --prefix='🔥[紧急修复]'"
  }
}
```

## 📋 实际使用场景

### 场景1：开发团队协作
```bash
# 开发者A提交代码
git commit -m "添加用户头像上传功能"

# 开发者B部署时自动使用这个提交信息
build-copy --auto --commit
# 🎯 自动提交信息：添加用户头像上传功能
```

### 场景2：版本发布
```bash
# 发布标签
git tag v2.1.0
git commit -m "发布版本v2.1.0 - 新增多语言支持"

# 部署时自动获取版本信息
build-copy --auto --commit --prefix="🚀[发布]" --add-timestamp
# 🎯 提交信息：🚀[发布] 发布版本v2.1.0 - 新增多语言支持 [2024-01-15 14:30]
```

### 场景3：紧急修复
```bash
# 紧急修复，覆盖自动获取的信息
build-copy --message="紧急修复支付接口问题" --prefix="🔥" --commit --add-timestamp
# 🎯 提交信息：🔥 紧急修复支付接口问题 [2024-01-15 16:45]
```

### 场景4：CI/CD 环境
```yaml
# GitHub Actions
- name: Deploy to SVN
  run: |
    npm run build
    npx build-deploy-tools build-copy --auto --commit --prefix="[CI]" --add-timestamp
  env:
    CI: true
```

## 🔍 版本控制检测

工具会自动检测当前目录的版本控制系统：

### Git 项目
```bash
# 检测到 .git 目录，自动获取 Git 提交信息
git log -1 --pretty=format:"%s"
# 输出：优化数据库查询性能

build-copy --auto --commit
# 📝 从Git获取提交信息: "优化数据库查询性能"
```

### SVN 项目
```bash
# 检测到 SVN 工作目录，自动获取 SVN 提交信息
svn log -l 1
# 输出：修复文件上传组件的兼容性问题

build-copy --auto --commit
# 📝 从SVN获取提交信息: "修复文件上传组件的兼容性问题"
```

### 非版本控制项目
```bash
# 未检测到版本控制系统，使用默认信息
build-copy --auto --commit
# 📝 未找到版本控制历史信息，使用默认提交信息: "更新构建文件"
```

## ⚙️ 配置参数说明

### 命令行参数
| 参数 | 说明 | 示例 |
|------|------|------|
| `--message=<信息>` | 自定义提交信息 | `--message="修复登录bug"` |
| `--commit-message=<信息>` | 自定义提交信息（别名） | `--commit-message="版本发布"` |
| `--no-vcs-history` | 禁用版本控制历史 | `--no-vcs-history` |
| `--add-timestamp` | 添加时间戳 | `--add-timestamp` |
| `--prefix=<前缀>` | 添加前缀 | `--prefix="[部署]"` |
| `--suffix=<后缀>` | 添加后缀 | `--suffix="[完成]"` |

### 编程接口参数
```javascript
{
  commitMessage: string,      // 自定义提交信息
  useVcsHistory: boolean,     // 是否使用版本控制历史
  commitOptions: {
    prefix: string,           // 前缀
    suffix: string,           // 后缀
    addTimestamp: boolean     // 是否添加时间戳
  }
}
```

## 🎉 优势特性

1. **🤖 智能化** - 自动识别版本控制系统并提取提交信息
2. **🔗 保持一致性** - 部署信息与源代码提交信息保持一致
3. **⚡ 高效率** - 减少手动输入，提高部署效率
4. **🎨 可定制** - 支持前缀、后缀、时间戳等格式化选项
5. **🛡️ 向下兼容** - 完全兼容原有功能，新功能为可选

通过这个智能提交信息功能，您的部署流程将更加自动化和规范化！🚀
