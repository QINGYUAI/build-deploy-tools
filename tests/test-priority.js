#!/usr/bin/env node

/**
 * 测试环境变量优先级
 * 验证命令行参数优先于 .env 文件配置
 */

const utils = require('../lib/utils')

console.log('🔍 环境变量优先级测试\n')
console.log('='.repeat(60))

// 测试场景
console.log('\n📋 测试场景：')
console.log('1. .env 文件中设置了 BUILD_NAME=IAC')
console.log('2. 命令行参数 --build=myapp')
console.log('3. 预期结果：应该使用 myapp（命令行参数优先）\n')

// 模拟命令行参数
const originalArgv = process.argv.slice()
process.argv = ['node', 'test-priority.js', '--build=myapp']

console.log('📊 当前配置：')
console.log('  命令行参数:', process.argv.slice(2))
console.log('  环境变量 BUILD_NAME:', process.env.BUILD_NAME || '(未设置)')
console.log('  环境变量 npm_config_build:', process.env.npm_config_build || '(未设置)')

console.log('\n📊 解析结果：')
const buildName = utils.getFileName()
console.log(`  ✅ 最终使用的构建名称: ${buildName}`)

if (buildName === 'myapp') {
  console.log('\n✅ 测试通过：命令行参数优先于 .env 文件配置')
} else {
  console.log(`\n❌ 测试失败：期望 'myapp'，实际得到 '${buildName}'`)
}

// 恢复原始 argv
process.argv = originalArgv

console.log('\n' + '='.repeat(60))
console.log('\n💡 优先级顺序：')
console.log('  1. 命令行参数（--build=, --target=, --source=）⭐')
console.log('  2. npm配置（npm_config_*）')
console.log('  3. 环境变量和 .env 文件')
console.log('  4. 默认值')
