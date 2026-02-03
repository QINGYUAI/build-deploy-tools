# 🔧 修复 npm 发布 2FA 问题

## ❌ 错误信息

```
npm error 403 403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

## ✅ 解决方案

### 方案1：启用 2FA（推荐）⭐

#### 步骤 1: 访问 npm 安全设置

打开浏览器，访问：
```
https://www.npmjs.com/settings/qingyuai/security
```

#### 步骤 2: 启用 2FA

1. 找到 "Two-factor authentication" 部分
2. 点击 "Enable 2FA" 或 "Edit"
3. 选择认证方式：
   - **Authenticator app**（推荐）：使用 Google Authenticator、Microsoft Authenticator、Authy 等
   - **SMS**：使用手机短信
4. 按照提示完成设置
5. **重要**：保存恢复码！

#### 步骤 3: 重新登录 npm

```powershell
npm logout
npm login
```

输入：
- Username: `qingyuai`
- Password: 你的密码
- Email: 你的邮箱
- **OTP**: 从认证器 app 获取的 6 位验证码

#### 步骤 4: 发布包

```powershell
npm publish
```

发布时可能需要再次输入 2FA 验证码。

---

### 方案2：使用 Granular Access Token（如果不想启用 2FA）

#### 步骤 1: 创建访问令牌

1. 访问：https://www.npmjs.com/settings/qingyuai/tokens
2. 点击 "Create New Token"
3. 选择 "Granular Access Token"
4. 配置权限：
   - **Package**: `build-deploy-tools`
   - **Permission**: `Read and Publish`
   - **⚠️ 重要**：勾选 "Bypass 2FA" 选项
5. 点击 "Generate Token"
6. **立即复制并保存 token**（只显示一次！）

#### 步骤 2: 使用 Token 配置 npm

```powershell
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN_HERE
```

将 `YOUR_TOKEN_HERE` 替换为你刚才复制的 token。

#### 步骤 3: 验证配置

```powershell
npm whoami
```

应该显示：`qingyuai`

#### 步骤 4: 发布包

```powershell
npm publish
```

---

## 🚀 快速修复命令（方案2）

如果你已经创建了带有 bypass 2FA 的 token：

```powershell
# 1. 设置 token（替换 YOUR_TOKEN_HERE）
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN_HERE

# 2. 验证登录
npm whoami

# 3. 发布
npm publish
```

---

## 📋 当前状态

- ✅ npm 用户名: `qingyuai`
- ✅ Registry: `https://registry.npmjs.org/`
- ✅ 版本号: `1.6.1`
- ⏳ 状态: 等待配置 2FA 或 Token 后发布

---

## 🔗 相关链接

- [npm 安全设置](https://www.npmjs.com/settings/qingyuai/security)
- [npm Token 管理](https://www.npmjs.com/settings/qingyuai/tokens)
- [启用 2FA 详细指南](./docs/启用2FA指南.md)
