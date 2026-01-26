# 安装和使用指南

## 📦 安装方式

### 方式一：npm 全局安装（推荐）

```bash
# 全局安装，可在任何目录使用
npm install -g build-deploy-tools

# 验证安装
build-copy --help
test-notification --help
```

### 方式二：npm 项目本地安装

```bash
# 在项目目录中安装为开发依赖
npm install build-deploy-tools --save-dev

# 在 package.json 中添加脚本
# {
#   "scripts": {
#     "deploy": "build-copy --auto",
#     "deploy-commit": "build-copy --auto --commit"
#   }
# }
```

### 方式三：临时使用（无需安装）

```bash
# 使用 npx 直接运行，无需安装
npx build-deploy-tools build-copy --help
```

### 方式四：从源码安装（开发模式）

```bash
# 克隆仓库
git clone https://github.com/QINGYUAI/build-deploy-tools.git
cd build-deploy-tools

# 安装依赖
npm install

# 安装 dotenv（可选，用于支持 .env 文件）
npm install dotenv

# 本地链接（可选，用于开发测试）
npm link

# 测试功能
npm test
```

## 🚀 快速开始

### 1. 基本使用

```bash
# 交互模式（推荐首次使用）
build-copy

# 自动模式（跳过所有确认）
build-copy --auto

# 自动模式 + 自动提交到SVN
build-copy --auto --commit

# 自定义配置
build-copy --build=myapp --target=D:/Projects/deployment --auto
```

### 2. 测试通知功能

```bash
# 测试系统通知功能
test-notification

# 自动模式测试
test-notification --auto
```

### 3. 查看帮助信息

```bash
# 查看完整帮助
build-copy --help

# 查看版本信息
build-copy --version
```

## 🔧 集成到现有项目

### 在项目中使用

```bash
# 安装为开发依赖
npm install build-deploy-tools --save-dev
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit",
    "test-notification": "test-notification"
  }
}
```

### 使用示例

```bash
# 构建并部署（交互模式）
npm run deploy

# 构建并自动部署提交
npm run deploy-commit

# 测试通知功能
npm run test-notification
```

## 🛠️ 代码风格检查

### 使用 Standard

```bash
# 安装 Standard
npm install -g standard

# 检查代码风格
standard

# 自动修复
standard --fix
```

## 🔧 配置说明

### 环境变量

#### 📁 目录和文件配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `TARGET_DIR` | 指定目标目录 | `TARGET_DIR=D:/Work/Vue3/myproject` |
| `SOURCE_DIR` | 指定源目录 | `SOURCE_DIR=./dist` |
| `BUILD_NAME` | 指定构建文件名 | `BUILD_NAME=myapp` |
| `npm_config_target` | 指定目标目录（npm配置） | `npm_config_target=D:/Work/Vue3/myproject` |
| `npm_config_source` | 指定源目录（npm配置） | `npm_config_source=./dist` |
| `npm_config_build` | 指定构建文件名（npm配置） | `npm_config_build=myapp` |

#### 🤖 自动化配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `CI` | CI环境自动启用自动模式 | `CI=true` |
| `AUTO_MODE` | 启用自动模式 | `AUTO_MODE=true` |
| `AUTO_COMMIT` | 启用自动提交 | `AUTO_COMMIT=true` |
| `npm_config_auto` | 启用自动模式（npm配置） | `npm_config_auto=true` |
| `npm_config_commit_cli` | 启用自动提交（npm配置） | `npm_config_commit_cli=true` |
| `npm_config_notification` | 启用/禁用通知（npm配置） | `npm_config_notification=false` |
| `USE_NOTIFICATION` | 启用/禁用通知 | `USE_NOTIFICATION=false` |

#### 📝 提交配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `COMMIT_MESSAGE` | 自定义提交信息 | `COMMIT_MESSAGE="修复登录问题"` |
| `USE_VCS_HISTORY` | 是否使用版本控制历史（默认true） | `USE_VCS_HISTORY=false` |

#### 🔄 重试配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MAX_RETRIES` | 最大重试次数 | `MAX_RETRIES=5` |
| `RETRY_DELAY` | 重试延迟时间（毫秒） | `RETRY_DELAY=3000` |

### package.json 脚本

```json
{
  "scripts": {
    "build": "your-build-command",
    "build-copy": "build-copy",
    "deploy": "npm run build && build-copy --auto --commit",
    "test-notification": "test-notification"
  }
}
```

## 🐛 故障排除

### 常见问题

1. **权限错误**
   ```bash
   sudo chown -R $USER:$USER .
   chmod +x bin/*.js
   ```

2. **SVN 相关错误**
   - 确保目标目录是 SVN 工作副本
   - 检查 SVN 权限和网络连接

3. **通知不显示**
   - 使用 `--no-notification` 参数回退到命令行模式
   - 检查系统通知权限设置

### 调试模式

```bash
# 启用调试输出
DEBUG=build-deploy-tools build-copy

# 查看详细日志
build-copy --help

# 查看版本信息
build-copy --version
```

### 环境变量配置

详细的环境变量配置请参考 [env.example](../env.example) 文件。

```bash
# 复制示例文件
cp env.example .env

# 安装 dotenv（如果还没安装，用于支持 .env 文件）
npm install dotenv

# 编辑 .env 文件，设置你的配置
# TARGET_DIR=D:/Work/Vue3/myproject
# BUILD_NAME=myapp
# AUTO_COMMIT=true
```

## 📚 API 参考

### 编程使用

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

const tools = new BuildDeployTools({
  maxRetries: 3,
  retryDelay: 2000
})

await tools.executeBuildCopy({
  sourceDir: './dist',
  targetParentDir: '/path/to/deployment',
  autoCommit: true
})
```

## 🎯 脚本执行控制（重要）

从 v1.2.1 版本开始，插件具备智能脚本检测功能，**只在特定的npm脚本中执行**，避免在开发过程中意外触发部署。

### 执行规则

插件仅在以下情况下执行：
- npm脚本名称包含 `build-copy`
- npm脚本名称包含 `deploy`
- npm脚本命令包含 `build-copy`

### 配置示例

```json
{
  "scripts": {
    "build": "vite build",
    "deploy": "npm run build && build-copy --auto",
    "deploy-commit": "npm run build && build-copy --auto --commit"
  }
}
```

