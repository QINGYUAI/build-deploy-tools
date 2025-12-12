# 🔐 npm 双因素认证(2FA)启用指南

## 📋 为什么需要2FA？

npm现在**强制要求**启用2FA才能发布包。这是为了增强账户安全性。

## 🚀 启用步骤

### 步骤 1: 访问安全设置页面

打开浏览器，访问：
```
https://www.npmjs.com/settings/qingyuai/security
```

或者：
1. 登录 https://www.npmjs.com
2. 点击右上角头像
3. 选择 "Account Settings"
4. 点击左侧 "Security" 菜单

### 步骤 2: 启用2FA

在 "Two-factor authentication" 部分：

1. 点击 "Enable 2FA" 或 "Edit" 按钮
2. 选择认证方式：

#### 方式A：Authenticator App（推荐）⭐

**优点**：
- 更安全
- 不需要手机信号
- 支持离线使用

**步骤**：
1. 选择 "Authenticator app"
2. 使用手机扫描二维码（使用Google Authenticator、Microsoft Authenticator、Authy等）
3. 输入显示的6位验证码确认
4. **重要**：保存恢复码（用于找回账户）

#### 方式B：SMS（短信）

**优点**：
- 简单易用
- 不需要安装app

**缺点**：
- 需要手机信号
- 可能延迟

**步骤**：
1. 选择 "SMS"
2. 输入手机号码
3. 接收并输入验证码
4. **重要**：保存恢复码

### 步骤 3: 保存恢复码

**非常重要**：务必保存恢复码到安全的地方！

恢复码用于：
- 丢失手机时恢复账户
- 无法访问认证器时使用

### 步骤 4: 验证2FA已启用

回到安全设置页面，应该看到：
- ✅ Two-factor authentication: **Enabled**
- Mode: **auth-and-writes**（发布和认证都需要）

## 🔧 使用2FA发布包

### 登录时

```powershell
npm login
```

输入：
- Username
- Password
- Email
- **OTP**: 从认证器app或短信获取的6位验证码

### 发布时

```powershell
npm publish
```

如果配置为 "auth-and-writes" 模式，发布时可能需要再次输入OTP验证码。

## 📱 推荐的认证器App

1. **Google Authenticator** - iOS/Android
2. **Microsoft Authenticator** - iOS/Android
3. **Authy** - iOS/Android/Desktop（支持多设备同步）
4. **1Password** - 密码管理器内置

## ⚠️ 注意事项

1. **备份恢复码**：务必保存恢复码到安全的地方
2. **时间同步**：确保手机时间准确，否则验证码可能无效
3. **多设备**：如果使用Authy，可以在多个设备上同步
4. **丢失设备**：如果丢失设备，使用恢复码恢复账户

## 🔄 禁用2FA（不推荐）

如果需要禁用2FA：
1. 访问安全设置页面
2. 点击 "Disable 2FA"
3. **注意**：禁用后可能无法发布包

## 🆘 故障排除

### 问题1: 验证码无效
- 检查手机时间是否准确
- 确保输入的是最新的验证码（30秒有效期）
- 重新扫描二维码

### 问题2: 丢失手机
- 使用恢复码恢复账户
- 如果没有恢复码，联系npm支持

### 问题3: 无法接收SMS
- 检查手机信号
- 检查手机号码是否正确
- 尝试使用Authenticator App方式

---

**启用2FA后，就可以正常发布包了！** 🎉
