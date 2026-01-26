# 快速使用指南

## 🚀 快速开始

### 原有功能保持不变

✅ **重要提醒**：本次更新完全兼容原有的自动化工作流，不会影响现有的构建和部署流程。

### 📄 使用 .env 文件配置（推荐）

最简单的方式是使用 `.env` 文件：

```bash
# 1. 安装 dotenv（如果还没安装）
npm install dotenv

# 2. 复制示例文件
cp env.example .env

# 3. 编辑 .env 文件，设置你的配置
# TARGET_DIR=D:/Work/Vue3/myproject
# BUILD_NAME=myapp
# AUTO_MODE=true
# AUTO_COMMIT=true

# 4. 使用（.env 文件会自动加载）
build-copy
```

详细说明请参考：[📖 环境变量使用指南](./ENV-USAGE.md)

### 基本使用

#### 1. 交互模式（默认，和以前一样）

```bash
npm run build-copy
```

现在会显示系统通知确认对话框，点击确认或取消即可。

#### 2. 自动模式（保持原有自动化功能）

```bash
# 自动模式，不自动提交
npm run build-copy --auto

# 自动模式 + 自动提交
npm run build-copy --auto --commit
```

#### 3. CI/CD 环境（自动识别）

```bash
# 在 CI 环境中会自动启用自动模式
npm run build-copy --commit
```

## 🔧 常用命令

| 场景     | 命令                                   | 说明             |
| -------- | -------------------------------------- | ---------------- |
| 日常开发 | `npm run build-copy`                   | 交互式确认       |
| 测试环境 | `npm run build-copy --auto`            | 自动执行，不提交 |
| 生产部署 | `npm run build-copy --auto --commit`   | 自动执行并提交   |
| 禁用通知 | `npm run build-copy --no-notification` | 使用命令行确认   |

## 🎯 核心改进

### 用户体验提升

- 📱 **系统通知**：替代命令行确认，更直观
- 🔄 **智能回退**：通知失败自动切换到命令行
- ⏰ **自动超时**：30秒后自动取消，避免阻塞

### 自动化增强

- 🤖 **自动模式**：支持完全自动化执行
- 🔍 **CI 识别**：自动检测 CI 环境
- ⚙️ **灵活配置**：支持环境变量和命令行参数

## 🧪 测试功能

```bash
# 测试交互模式
test-notification

# 测试自动模式
test-notification --auto --commit
```

## 📖 详细文档

查看完整文档：[README-notification.md](./README-notification.md)

## ❓ 问题解决

### 通知不显示？

- 检查系统通知权限设置
- 尝试使用 `--no-notification` 回退到命令行

### 自动模式不生效？

- 确保使用了 `--auto` 参数
- 检查环境变量设置
- 查看控制台输出的运行模式信息

### 需要帮助？

运行测试脚本验证功能：

```bash
test-notification --auto
```

---

**💡 小贴士**：如果你习惯了原来的命令行确认方式，可以继续使用 `--no-notification` 参数保持原有体验。
