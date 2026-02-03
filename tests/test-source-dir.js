#!/usr/bin/env node

/**
 * 测试源目录获取逻辑
 * 验证当 SOURCE_DIR 未设置时，是否使用 BUILD_NAME 作为目录名
 */

const utils = require('../lib/utils')
const path = require('path')

console.log('🔍 源目录获取逻辑测试\n')
console.log('='.repeat(60))

// 测试场景1：SOURCE_DIR 未设置，应该使用 BUILD_NAME
console.log('\n📋 测试场景1：SOURCE_DIR 未设置')
const originalSourceDir = process.env.SOURCE_DIR
delete process.env.SOURCE_DIR

console.log('  环境变量:')
console.log('    BUILD_NAME:', process.env.BUILD_NAME || '(未设置)')
console.log('    SOURCE_DIR:', process.env.SOURCE_DIR || '(未设置)')

const buildName = utils.getFileName()
const sourceDir = utils.getSourceDir()

console.log('\n  解析结果:')
console.log(`    构建文件名: ${buildName}`)
console.log(`    源目录: ${sourceDir || '(null)'}`)

if (sourceDir === buildName) {
  console.log('\n✅ 测试通过：当 SOURCE_DIR 未设置时，使用 BUILD_NAME 作为源目录')
} else {
  console.log(`\n❌ 测试失败：期望 '${buildName}'，实际得到 '${sourceDir}'`)
}

// 恢复环境变量
if (originalSourceDir) {
  process.env.SOURCE_DIR = originalSourceDir
}

// 测试场景2：SOURCE_DIR 已设置，应该使用 SOURCE_DIR
console.log('\n' + '='.repeat(60))
console.log('\n📋 测试场景2：SOURCE_DIR 已设置')

process.env.SOURCE_DIR = './dist'
console.log('  环境变量:')
console.log('    BUILD_NAME:', process.env.BUILD_NAME || '(未设置)')
console.log('    SOURCE_DIR:', process.env.SOURCE_DIR)

const sourceDir2 = utils.getSourceDir()
console.log('\n  解析结果:')
console.log(`    源目录: ${sourceDir2 || '(null)'}`)

if (sourceDir2 === './dist') {
  console.log('\n✅ 测试通过：当 SOURCE_DIR 已设置时，使用 SOURCE_DIR')
} else {
  console.log(`\n❌ 测试失败：期望 './dist'，实际得到 '${sourceDir2}'`)
}

// 恢复环境变量
if (originalSourceDir) {
  process.env.SOURCE_DIR = originalSourceDir
} else {
  delete process.env.SOURCE_DIR
}

console.log('\n' + '='.repeat(60))
console.log('\n💡 优先级顺序：')
console.log('  1. 命令行参数 --source=')
console.log('  2. npm配置 npm_config_source')
console.log('  3. 环境变量 SOURCE_DIR')
console.log('  4. 构建文件名 BUILD_NAME（如果 SOURCE_DIR 未设置）')
console.log('  5. 默认值')
