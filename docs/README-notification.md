# 通知确认功能使用说明

## 概述

本脚本已更新为使用系统通知进行用户确认，替代了传统的命令行确认方式。新的通知系统提供了更好的用户体验和跨平台兼容性，**同时完全保持原有的自动化功能**。

## 功能特性

### 🔔 系统通知确认

- **交互式通知**：使用系统原生通知显示确认对话框
- **智能回退**：当通知不可用时自动回退到命令行确认
- **跨平台兼容**：支持 Windows、macOS 和 Linux
- **用户友好**：提供清晰的视觉和听觉反馈

### 🤖 自动化模式

- **保持原有功能**：完全兼容原有的自动化工作流
- **CI/CD 友好**：CI 环境自动启用自动模式
- **灵活配置**：支持命令行参数和环境变量控制
- **智能切换**：根据运行环境自动选择最佳模式

### 🎯 确认机制

#### 交互模式（默认）

- **点击通知主体**：确认操作（✅）
- **点击取消按钮**：取消操作（❌）
- **忽略通知**：30秒后自动超时，默认为取消（⏰）
- **主动关闭通知**：手动关闭通知，默认为取消（❌）

#### 自动模式

- **自动执行**：根据预设配置自动决定操作
- **无需用户干预**：完全自动化执行
- **CI/CD 兼容**：适用于持续集成/部署环境

#### 平台支持

- **Windows 10+**：使用 Windows Toast 通知
- **macOS 10.8+**：使用 Notification Center
- **Linux**：使用 notify-send 或 libnotify-bin
- **回退机制**：不支持的平台自动使用命令行确认

## 使用方法

### 基本使用

#### 1. 交互模式（默认）

```bash
# 使用系统通知确认
node scripts/build-copy.js
npm run build-copy

# 使用命令行确认
node scripts/build-copy.js --no-notification
npm run build-copy --no-notification
```

#### 2. 自动模式

```bash
# 自动模式（不自动提交）
node scripts/build-copy.js --auto
npm run build-copy --auto

# 自动模式 + 自动提交
node scripts/build-copy.js --auto --commit
npm run build-copy --auto --commit
```

#### 3. 环境变量控制

```bash
# 通过环境变量启用自动模式
export npm_config_auto=true
npm run build-copy

# 通过环境变量启用自动提交
export npm_config_commit=true
npm run build-copy --auto

# 禁用通知
export npm_config_notification=false
npm run build-copy
```

### 编程式使用

#### 确认对话框

```javascript
// 交互模式
const result = await confirmAction('是否继续执行操作？');

// 自动模式，提供默认值
const result = await confirmAction('是否继续执行操作？', true);
```

#### 发送通知

```javascript
// 基本通知
notify('标题', '消息内容');

// 带选项的通知
notify('完成', '操作已完成', {
  sound: true, // 播放声音
  timeout: 10, // 10秒后自动消失
  icon: 'path/to/icon.png', // 自定义图标
});
```

## 自动化配置

### 运行模式

脚本会根据以下条件自动选择运行模式：

1. **自动模式触发条件**：

   - 环境变量 `CI=true`（CI/CD 环境）
   - 命令行参数 `--auto`
   - 环境变量 `npm_config_auto=true`

2. **自动提交触发条件**：

   - 命令行参数 `--commit`
   - 环境变量 `npm_config_commit=true`

3. **通知禁用条件**：
   - 命令行参数 `--no-notification`
   - 环境变量 `npm_config_notification=false`

### 环境变量

#### 📁 目录和文件配置

| 变量                      | 作用                    | 示例                            |
| ------------------------- | ----------------------- | ------------------------------- |
| `TARGET_DIR`              | 指定目标目录            | `TARGET_DIR=D:/Work/Vue3/myproject` |
| `SOURCE_DIR`              | 指定源目录              | `SOURCE_DIR=./dist`             |
| `BUILD_NAME`              | 指定构建文件名          | `BUILD_NAME=vam3`               |
| `npm_config_target`       | 指定目标目录（npm配置） | `npm_config_target=D:/Work/Vue3/myproject` |
| `npm_config_source`       | 指定源目录（npm配置）   | `npm_config_source=./dist`      |
| `npm_config_build`        | 指定构建文件名（npm配置）| `npm_config_build=vam3`         |

#### 🤖 自动化配置

| 变量                      | 作用                    | 示例                            |
| ------------------------- | ----------------------- | ------------------------------- |
| `CI`                      | CI 环境自动启用自动模式 | `CI=true`                       |
| `AUTO_MODE`               | 启用自动模式            | `AUTO_MODE=true`                |
| `AUTO_COMMIT`             | 启用自动提交            | `AUTO_COMMIT=true`              |
| `npm_config_auto`         | 启用自动模式（npm配置） | `npm_config_auto=true`          |
| `npm_config_commit_cli`   | 启用自动提交（npm配置） | `npm_config_commit_cli=true`    |
| `npm_config_notification` | 控制通知功能（npm配置） | `npm_config_notification=false` |
| `USE_NOTIFICATION`        | 控制通知功能            | `USE_NOTIFICATION=false`        |

### 命令行参数

| 参数                | 作用           | 示例                                   |
| ------------------- | -------------- | -------------------------------------- |
| `--auto`            | 启用自动模式   | `node build-copy.js --auto`            |
| `--commit`          | 启用自动提交   | `node build-copy.js --commit`          |
| `--no-notification` | 禁用通知       | `node build-copy.js --no-notification` |
| `--build=filename`  | 指定构建文件名 | `node build-copy.js --build=vam3`      |
| `--target=<path>`   | 指定目标目录   | `node build-copy.js --target=D:/Projects` |
| `--source=<path>`   | 指定源目录     | `node build-copy.js --source=./dist`   |

## 测试功能

### 基本测试

```bash
# 测试交互模式
node scripts/test-notification.js

# 测试自动模式
node scripts/test-notification.js --auto

# 测试自动提交
node scripts/test-notification.js --auto --commit

# 测试命令行模式
node scripts/test-notification.js --no-notification
```

### 测试内容

1. **基本通知测试**：验证通知显示功能
2. **确认对话框测试**：验证用户交互功能
3. **自动模式测试**：验证自动化功能
4. **回退机制测试**：验证命令行回退功能

## 配置选项

### 确认对话框选项

```javascript
{
    title: '确认操作',          // 通知标题
    message: '操作提示信息',     // 通知内容
    sound: true,              // 播放提示音
    wait: true,               // 等待用户操作
    timeout: 30,              // 30秒超时
    actions: ['确认', '取消'], // 动作按钮
    closeLabel: '取消',        // 关闭按钮文本
    reply: false              // 不需要文本回复
}
```

### 通知选项

```javascript
{
    title: '通知标题',          // 必填：通知标题
    message: '通知内容',        // 必填：通知消息
    sound: true,              // 可选：播放声音
    timeout: 5,               // 可选：自动消失时间（秒）
    icon: 'path/to/icon',     // 可选：自定义图标路径
    wait: false               // 可选：等待用户操作
}
```

## 实际应用场景

### 1. 开发环境

```bash
# 开发时使用交互模式，可以选择是否提交
npm run build-copy
```

### 2. 测试环境

```bash
# 测试环境自动构建但不提交
npm run build-copy --auto
```

### 3. 生产环境

```bash
# 生产环境自动构建并提交
npm run build-copy --auto --commit
```

### 4. CI/CD 环境

```bash
# CI 环境会自动启用自动模式
# 在 CI 环境中运行时，CI=true 自动启用自动模式
npm run build-copy --commit
```

## 故障排除

### 常见问题

1. **通知不显示**

   - 检查系统通知设置是否启用
   - 确认 `node-notifier` 模块已正确安装
   - 查看控制台错误信息

2. **自动回退到命令行**

   - 这是正常行为，说明系统不支持交互式通知
   - 可以继续使用命令行确认功能

3. **自动模式不生效**

   - 检查命令行参数是否正确
   - 确认环境变量设置
   - 查看控制台输出的运行模式信息

4. **通知权限问题**
   - Windows：检查通知权限设置
   - macOS：检查系统偏好设置 > 通知
   - Linux：确认安装了 `notify-send` 或 `libnotify-bin`

### 调试方法

1. **查看运行模式**

   ```bash
   # 脚本启动时会显示当前运行模式
   node scripts/build-copy.js
   ```

2. **测试基本通知**

   ```bash
   node -e "require('node-notifier').notify('测试', '这是测试通知');"
   ```

3. **检查环境变量**
   ```bash
   echo $CI
   echo $npm_config_auto
   echo $npm_config_commit
   ```

## 依赖要求

- **Node.js**: >= 12.0.0
- **node-notifier**: >= 10.0.0
- **系统要求**：
  - Windows: >= 8
  - macOS: >= 10.8
  - Linux: notify-send 或 libnotify-bin

## 更新日志

### v1.1.0 (当前版本)

- ✅ **保持原有自动化功能**
- ✅ 添加自动模式和交互模式切换
- ✅ 支持 CI/CD 环境自动识别
- ✅ 增强命令行参数支持
- ✅ 完善环境变量控制
- ✅ 更新测试脚本和文档

### v1.0.0

- ✅ 实现系统通知确认功能
- ✅ 添加智能回退机制
- ✅ 增强通知选项支持
- ✅ 跨平台兼容性
- ✅ 完整的错误处理
- ✅ 测试脚本和文档

## 技术支持

如有问题，请检查：

1. 系统通知权限设置
2. Node.js 和依赖包版本
3. 环境变量和命令行参数
4. 控制台错误信息
5. 运行测试脚本验证功能

**重要提醒**：本更新完全兼容原有的自动化工作流，不会影响现有的构建和部署流程。
