#!/usr/bin/env node

/**
 * 测试命令行参数 --build= 对源目录的影响
 * 验证当指定 --build= 时，源目录应该使用构建文件名，而不是 SOURCE_DIR 环境变量
 */

const utils = require('../lib/utils')
const path = require('path')

console.log('🔍 测试命令行参数 --build= 对源目录的影响\n')
console.log('='.repeat(60))

// 保存原始参数
const originalArgv = process.argv.slice()

// 测试场景1：命令行指定 --build=vam4，应该使用 vam4 作为源目录
console.log('\n📋 测试场景1：命令行指定 --build=vam4')
process.argv = ['node', 'test-build-arg.js', '--build=vam4']

console.log('  命令行参数:', process.argv.slice(2))
console.log('  环境变量:')
console.log('    BUILD_NAME:', process.env.BUILD_NAME || '(未设置)')
console.log('    SOURCE_DIR:', process.env.SOURCE_DIR || '(未设置)')

const buildName1 = utils.getFileName()
const sourceDir1 = utils.getSourceDir()

console.log('\n  解析结果:')
console.log(`    构建文件名: ${buildName1}`)
console.log(`    源目录（getSourceDir）: ${sourceDir1 || '(null)'}`)

if (buildName1 === 'vam4') {
  console.log('\n✅ 测试通过：命令行参数 --build=vam4 正确解析')
} else {
  console.log(`\n❌ 测试失败：期望 'vam4'，实际得到 '${buildName1}'`)
}

// 测试场景2：命令行指定 --build=vam4 和 --source=./custom
console.log('\n' + '='.repeat(60))
console.log('\n📋 测试场景2：命令行指定 --build=vam4 和 --source=./custom')
process.argv = ['node', 'test-build-arg.js', '--build=vam4', '--source=./custom']

const buildName2 = utils.getFileName()
const sourceDir2 = utils.getSourceDir()

console.log('\n  解析结果:')
console.log(`    构建文件名: ${buildName2}`)
console.log(`    源目录: ${sourceDir2 || '(null)'}`)

if (sourceDir2 === './custom') {
  console.log('\n✅ 测试通过：命令行参数 --source=./custom 优先级最高')
} else {
  console.log(`\n❌ 测试失败：期望 './custom'，实际得到 '${sourceDir2}'`)
}

// 恢复原始参数
process.argv = originalArgv

console.log('\n' + '='.repeat(60))
console.log('\n💡 优先级顺序：')
console.log('  1. 命令行参数 --source=（最高优先级）')
console.log('  2. npm配置 npm_config_source')
console.log('  3. 环境变量 SOURCE_DIR')
console.log('  4. 命令行参数 --build=（如果指定了，且未指定 --source=）')
console.log('  5. 环境变量 BUILD_NAME（如果 SOURCE_DIR 未设置）')
console.log('  6. 默认值')
