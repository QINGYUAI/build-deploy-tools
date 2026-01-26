#!/usr/bin/env node

/**
 * 测试 .env 文件加载
 * 用于验证环境变量是否正确加载
 */

// 加载工具模块（会自动加载 .env 文件）
const utils = require('../lib/utils')

console.log('🔍 环境变量加载测试\n')
console.log('='.repeat(60))

// 测试环境变量
const testVars = {
  'TARGET_DIR': process.env.TARGET_DIR,
  'SOURCE_DIR': process.env.SOURCE_DIR,
  'BUILD_NAME': process.env.BUILD_NAME,
  'CI': process.env.CI,
  'AUTO_MODE': process.env.AUTO_MODE,
  'AUTO_COMMIT': process.env.AUTO_COMMIT,
  'USE_NOTIFICATION': process.env.USE_NOTIFICATION,
  'COMMIT_MESSAGE': process.env.COMMIT_MESSAGE,
  'USE_VCS_HISTORY': process.env.USE_VCS_HISTORY,
  'MAX_RETRIES': process.env.MAX_RETRIES,
  'RETRY_DELAY': process.env.RETRY_DELAY
}

console.log('\n📋 环境变量值：')
for (const [key, value] of Object.entries(testVars)) {
  const status = value ? '✅' : '❌'
  console.log(`  ${status} ${key}: ${value || '(未设置)'}`)
}

console.log('\n📋 解析后的配置：')
const envConfig = utils.getEnvConfig()
console.log('  构建名称:', envConfig.buildName)
console.log('  源目录:', envConfig.sourceDir || '(未设置)')
console.log('  目标目录:', envConfig.targetDir)
console.log('  自动模式:', envConfig.isAutoMode ? '✅ 启用' : '❌ 禁用')
console.log('  自动提交:', envConfig.autoCommit ? '✅ 启用' : '❌ 禁用')
console.log('  使用通知:', envConfig.useNotification ? '✅ 启用' : '❌ 禁用')
console.log('  提交信息:', envConfig.commitMessage || '(未设置)')
console.log('  使用VCS历史:', envConfig.useVcsHistory ? '✅ 启用' : '❌ 禁用')
console.log('  最大重试次数:', envConfig.maxRetries || '(使用默认值)')
console.log('  重试延迟:', envConfig.retryDelay || '(使用默认值)')

console.log('\n' + '='.repeat(60))
console.log('\n💡 提示：')
console.log('  - 如果环境变量显示 ❌，说明 .env 文件可能未加载')
console.log('  - 确保已安装 dotenv: npm install dotenv')
console.log('  - 确保 .env 文件存在于项目根目录')
console.log('  - 检查 .env 文件格式是否正确（KEY=VALUE，无空格）')
