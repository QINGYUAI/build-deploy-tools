# 📦 npm 发布指南

## ✅ 发布前检查清单

### 1. 打包测试（已完成）
```bash
npm pack --dry-run  # 检查打包内容
npm pack            # 实际打包
```

**打包结果**：
- ✅ 包名: `build-deploy-tools`
- ✅ 版本: `1.5.0`
- ✅ 文件数: 24 个文件
- ✅ 包大小: 49.6 kB
- ✅ 解压大小: 187.2 kB

### 2. 检查 package.json
- ✅ 包名正确
- ✅ 版本号正确 (1.5.0)
- ✅ 描述完整
- ✅ 作者信息正确
- ✅ 许可证正确 (MIT)
- ✅ repository 链接正确
- ✅ files 字段包含所有必要文件

### 3. 检查文件
- ✅ 所有核心文件已包含
- ✅ 文档文件已包含（docs/）
- ✅ 配置文件已包含（env.example, example.config.js）
- ✅ LICENSE 文件已包含

## 🚀 发布步骤

### 步骤 1: 登录 npm

```bash
npm login
```

**注意事项**：
- 如果没有 npm 账号，请先访问 https://www.npmjs.com/signup 注册
- 如果使用 npm 镜像源，需要切换到官方源：
  ```bash
  npm config set registry https://registry.npmjs.org/
  ```

### 步骤 2: 验证登录状态

```bash
npm whoami
```

应该显示你的 npm 用户名。

### 步骤 3: 检查包名是否可用

```bash
npm view build-deploy-tools
```

如果包已存在，会显示当前版本信息。如果是第一次发布，会显示 404。

### 步骤 4: 发布到 npm

```bash
# 发布到 npm（公开包）
npm publish

# 或者发布为私有包（需要付费账号）
npm publish --access restricted
```

### 步骤 5: 验证发布

发布成功后，可以访问：
- https://www.npmjs.com/package/build-deploy-tools

或者使用命令验证：
```bash
npm view build-deploy-tools
npm info build-deploy-tools
```

## 🔄 更新版本

如果需要更新版本，使用以下命令：

```bash
# 补丁版本 (1.5.0 -> 1.5.1)
npm version patch

# 次版本 (1.5.0 -> 1.6.0)
npm version minor

# 主版本 (1.5.0 -> 2.0.0)
npm version major
```

然后再次发布：
```bash
npm publish
```

## ⚠️ 注意事项

1. **版本号**: 确保版本号符合语义化版本规范
2. **包名唯一性**: 确保包名在 npm 上是唯一的
3. **权限**: 确保你有发布该包的权限
4. **测试**: 发布前建议先本地测试安装：
   ```bash
   npm pack
   npm install -g build-deploy-tools-1.5.0.tgz
   ```

## 📝 发布后操作

1. 更新 CHANGELOG.md，将"未发布"部分移到新版本
2. 提交 Git 更改
3. 创建 Git Tag：
   ```bash
   git tag v1.5.0
   git push origin v1.5.0
   ```

## 🐛 常见问题

### 问题 1: 401 Unauthorized
**解决**: 运行 `npm login` 登录

### 问题 2: 403 Forbidden
**解决**: 检查包名是否已被占用，或者你没有发布权限

### 问题 3: 包名冲突
**解决**: 如果包名已被占用，需要修改 package.json 中的 name 字段

---

**当前状态**: ✅ 打包完成，等待发布
