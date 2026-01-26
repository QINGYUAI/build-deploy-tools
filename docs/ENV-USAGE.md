# 📋 环境变量使用指南

## 🎯 概述

本项目支持多种方式配置环境变量，优先级从高到低如下：

1. **命令行参数**（最高优先级）
2. **npm 配置**（`npm_config_*` 环境变量）
3. **系统环境变量**
4. **`.env` 文件**（需要安装 `dotenv`）
5. **默认值**（代码中定义）

## 📁 使用 .env 文件

### 1. 安装 dotenv（必需）

```bash
npm install dotenv
```

**注意**：`dotenv` 是可选依赖，如果不安装，`.env` 文件不会被加载，但你可以使用系统环境变量或命令行参数。

### 2. 创建 .env 文件

```bash
# 复制示例文件
cp env.example .env

# 或者手动创建
touch .env
```

### 3. 配置环境变量

编辑 `.env` 文件，设置你的配置：

```bash
# 目标目录（部署目录）
TARGET_DIR=D:/Work/Vue3/yiyumsaas

# 源目录（构建输出目录）
SOURCE_DIR=./IAC

# 构建文件名
BUILD_NAME=IAC

# 自动模式配置
CI=true
AUTO_MODE=true
AUTO_COMMIT=true

# 通知配置
USE_NOTIFICATION=true
```

### 4. 使用

```bash
# 直接运行，会自动加载 .env 文件
build-copy

# 或者
node bin/build-copy.js
```

## 🔍 验证 .env 文件是否加载

### 方法1：设置 DEBUG 环境变量

```bash
# Windows
set DEBUG=true
node bin/build-copy.js

# Linux/Mac
DEBUG=true node bin/build-copy.js
```

如果 `.env` 文件成功加载，会显示：
```
✅ 已从 .env 文件加载环境变量
```

### 方法2：检查环境变量

```bash
# Windows PowerShell
$env:TARGET_DIR

# Linux/Mac
echo $TARGET_DIR
```

## 📝 环境变量列表

### 📁 目录和文件配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `TARGET_DIR` | 目标目录（部署目录） | `TARGET_DIR=D:/Work/Vue3/myproject` |
| `SOURCE_DIR` | 源目录（构建输出目录） | `SOURCE_DIR=./dist` |
| `BUILD_NAME` | 构建文件名 | `BUILD_NAME=myapp` |

### 🤖 自动化配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `CI` | CI环境标识（设置为true时自动启用自动模式） | `CI=true` |
| `AUTO_MODE` | 自动模式（跳过所有交互确认） | `AUTO_MODE=true` |
| `AUTO_COMMIT` | 自动提交到SVN | `AUTO_COMMIT=true` |
| `USE_NOTIFICATION` | 使用通知（false时禁用） | `USE_NOTIFICATION=true` |

### 📝 提交配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `COMMIT_MESSAGE` | 自定义提交信息 | `COMMIT_MESSAGE=更新构建文件` |
| `USE_VCS_HISTORY` | 使用版本控制历史（false时禁用） | `USE_VCS_HISTORY=true` |

### 🔄 重试配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MAX_RETRIES` | 最大重试次数 | `MAX_RETRIES=3` |
| `RETRY_DELAY` | 重试延迟时间（毫秒） | `RETRY_DELAY=2000` |

## 🚀 使用示例

### 示例1：使用 .env 文件

```bash
# 1. 创建 .env 文件
cp env.example .env

# 2. 编辑 .env 文件
# TARGET_DIR=D:/Work/Vue3/myproject
# BUILD_NAME=myapp
# AUTO_MODE=true

# 3. 安装 dotenv（如果还没安装）
npm install dotenv

# 4. 运行
build-copy
```

### 示例2：使用系统环境变量

```bash
# Windows
set TARGET_DIR=D:/Work/Vue3/myproject
set BUILD_NAME=myapp
set AUTO_MODE=true
build-copy

# Linux/Mac
export TARGET_DIR=/path/to/project
export BUILD_NAME=myapp
export AUTO_MODE=true
build-copy
```

### 示例3：使用命令行参数（优先级最高）

```bash
build-copy --target=D:/Work/Vue3/myproject --build=myapp --auto
```

## ⚠️ 常见问题

### Q1: .env 文件没有被加载？

**原因**：`dotenv` 包未安装

**解决**：
```bash
npm install dotenv
```

### Q2: 环境变量没有生效？

**检查优先级**：
1. 命令行参数优先级最高
2. 检查是否有系统环境变量覆盖了 `.env` 文件
3. 确认 `.env` 文件格式正确（`KEY=VALUE`，不要有空格）

### Q3: 如何调试环境变量加载？

设置 `DEBUG=true` 环境变量：
```bash
DEBUG=true build-copy
```

### Q4: .env 文件应该放在哪里？

`.env` 文件应该放在项目根目录（与 `package.json` 同级）。

## 📚 相关文档

- [完整配置说明](../README.md#⚙️-配置选项)
- [环境变量示例文件](../env.example)
- [快速开始指南](./QUICKSTART.md)
