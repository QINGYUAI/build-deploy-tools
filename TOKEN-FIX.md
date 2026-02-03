# 🔧 Token 权限问题修复

## ❌ 当前问题

Token 已配置，但发布时出现：
```
npm error 403 You may not perform that action with these credentials.
```

## 🔍 问题原因

Token 可能缺少以下权限之一：
1. ❌ **Bypass 2FA** 权限未启用
2. ❌ **Publish** 权限不足
3. ❌ Token 类型不正确（需要使用 Granular Access Token）

## ✅ 解决方案

### 步骤 1: 重新创建 Token（确保权限正确）

1. **访问 Token 管理页面**：
   ```
   https://www.npmjs.com/settings/qingyuai/tokens
   ```

2. **删除旧的 Token**（如果存在）

3. **创建新的 Granular Access Token**：
   - 点击 "Create New Token"
   - 选择 **"Granular Access Token"**（不是 Classic Token）
   - 配置权限：
     - **Package**: `build-deploy-tools`
     - **Permission**: `Read and Publish` ⚠️ 必须选择这个
     - **⚠️ 重要**：勾选 **"Bypass 2FA"** 选项
   - 点击 "Generate Token"
   - **立即复制 token**（只显示一次！）

### 步骤 2: 配置新 Token

```powershell
# 清除旧的认证
npm logout

# 设置新 token（替换 YOUR_NEW_TOKEN）
npm config set //registry.npmjs.org/:_authToken YOUR_NEW_TOKEN

# 验证
npm whoami
```

### 步骤 3: 发布

```powershell
npm publish
```

---

## 🎯 快速检查清单

创建 Token 时确保：
- ✅ Token 类型：**Granular Access Token**（不是 Classic）
- ✅ Package：`build-deploy-tools`
- ✅ Permission：**Read and Publish**（不是 Read only）
- ✅ **Bypass 2FA**：已勾选 ⚠️

---

## 🔄 如果还是不行

### 方案 A：启用 2FA（推荐）

1. 访问：https://www.npmjs.com/settings/qingyuai/security
2. 启用 2FA
3. 重新登录：
   ```powershell
   npm logout
   npm login  # 输入 2FA 验证码
   npm publish
   ```

### 方案 B：检查包权限

确认你是 `build-deploy-tools` 包的维护者：
```powershell
npm owner ls build-deploy-tools
```

应该显示：`qingyuai <15102652848@163.com>`

---

## 📋 当前状态

- ✅ npm 用户名: `qingyuai`
- ✅ Registry: `https://registry.npmjs.org/`
- ✅ 版本号: `1.6.1`（本地）vs `1.6.0`（npm）
- ⚠️ Token 权限: 需要重新创建带有正确权限的 token
