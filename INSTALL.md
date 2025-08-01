# 安装和使用指南

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 全局安装（可选）

```bash
npm install -g .
```

### 3. 基本测试

```bash
# 测试通知功能
npm run test

# 或者直接运行
node bin/test-notification.js
```

## 📦 发布到 npm

### 1. 准备发布

```bash
# 检查包内容
npm pack --dry-run

# 查看会发布的文件
npm publish --dry-run
```

### 2. 发布包

```bash
# 登录 npm（如果未登录）
npm login

# 发布包
npm publish
```

### 3. 版本管理

```bash
# 更新补丁版本
npm version patch

# 更新次版本
npm version minor

# 更新主版本
npm version major
```

## 🛠️ 开发指南

### 项目结构

```
build-deploy-tools/
├── package.json          # 包配置文件
├── index.js              # 主入口文件
├── README.md             # 项目说明
├── CHANGELOG.md          # 更新日志
├── LICENSE               # 许可证
├── .gitignore            # Git忽略文件
├── .npmignore            # npm忽略文件
├── bin/                  # 命令行工具
│   ├── build-copy.js     # 构建复制工具
│   └── test-notification.js # 通知测试工具
├── lib/                  # 核心库
│   ├── utils.js          # 通用工具函数
│   ├── notification.js   # 通知模块
│   ├── file-operations.js # 文件操作模块
│   └── svn-operations.js # SVN操作模块
└── example.config.js     # 配置示例
```

### 本地测试

```bash
# 在项目根目录链接到全局
npm link

# 测试命令行工具
build-copy --help
test-notification --help

# 取消链接
npm unlink -g build-deploy-tools
```

### 代码规范

项目使用 JavaScript Standard Style：

```bash
# 安装代码检查工具
npm install -g standard

# 检查代码风格
standard

# 自动修复
standard --fix
```

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `CI` | CI环境自动启用自动模式 | `CI=true` |
| `npm_config_auto` | 启用自动模式 | `npm_config_auto=true` |
| `npm_config_commit_cli` | 启用自动提交 | `npm_config_commit_cli=true` |
| `npm_config_notification` | 启用/禁用通知 | `npm_config_notification=false` |
| `npm_config_build` | 指定构建文件名 | `npm_config_build=myapp` |

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
node bin/build-copy.js --help
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

在 `vue.config.js` 中添加脚本检测：

```javascript
const { BuildDeployTools } = require('build-deploy-tools')

// 检查是否应该执行部署插件
function shouldExecuteDeployPlugin() {
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''
  
  console.log(`🔍 当前npm脚本: ${scriptName}`)
  
  // 满足任一条件即执行
  const shouldExecute = scriptName.includes('build-copy') || 
                       scriptCommand.includes('build-copy') ||
                       scriptName.includes('deploy')
  
  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

module.exports = {
  configureWebpack: {
    plugins: [
      // 只在特定脚本中执行
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin()
        ? {
            apply: compiler => {
              compiler.hooks.done.tapAsync('BuildDeployPlugin', async (stats, callback) => {
                // 部署逻辑...
              })
            }
          }
        : null,
    ].filter(Boolean)
  }
}
```

### scripts配置建议

```json
{
  "scripts": {
    "serve": "vue-cli-service serve",          // ❌ 不执行插件
    "build": "vue-cli-service build",          // ❌ 不执行插件  
    "deploy": "npm run build && build-copy",   // ✅ 执行插件
    "deploy-auto": "npm run build && build-copy --auto" // ✅ 执行插件
  }
}
```

详细说明请参考 [integration-examples.md](integration-examples.md)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。