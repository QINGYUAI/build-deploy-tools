# 🚀 npm 发布解决方案（v1.6.1）

## ⚠️ npm 安全更新

npm 已更新安全策略：
- ❌ Classic tokens 已被撤销
- ⚠️ Granular tokens 现在**默认需要 2FA**
- ⚠️ Granular tokens 限制为 90 天

## ✅ 推荐解决方案：启用 2FA

### 步骤 1: 启用 2FA

1. **访问安全设置**：
   ```
   https://www.npmjs.com/settings/qingyuai/security
   ```

2. **启用 2FA**：
   - 点击 "Enable 2FA"
   - 选择认证方式（Authenticator app 推荐）
   - 保存恢复码！

### 步骤 2: 使用 2FA 登录

```powershell
# 清除旧认证
npm logout

# 重新登录（需要输入 2FA 验证码）
npm login
```

输入：
- Username: `qingyuai`
- Password: 你的密码
- Email: `15102652848@163.com`
- **OTP**: 从认证器 app 获取的 6 位验证码

### 步骤 3: 发布包

```powershell
npm publish
```

发布时可能需要再次输入 2FA 验证码。

---

## 🔄 替代方案：使用 Granular Token（如果已创建）

如果已经创建了带有 bypass 2FA 的 Granular Token：

```powershell
# 设置 token
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN

# 验证
npm whoami

# 发布
npm publish
```

**注意**：如果还是 403 错误，说明 token 权限不足，需要重新创建或启用 2FA。

---

## 📋 当前状态

- ✅ npm 用户名: `qingyuai`
- ✅ 包维护者: `qingyuai <15102652848@163.com>`
- ✅ Registry: `https://registry.npmjs.org/`
- ✅ 版本号: `1.6.1`（本地）vs `1.6.0`（npm）
- ⏳ 状态: 需要启用 2FA 或使用正确的 token

---

## 🎯 立即操作

**推荐**：访问以下链接启用 2FA：
```
https://www.npmjs.com/settings/qingyuai/security
```

详细步骤请参考：`docs/启用2FA指南.md`

启用 2FA 后：
```powershell
npm logout
npm login  # 输入 2FA 验证码
npm publish
```
