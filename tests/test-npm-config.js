#!/usr/bin/env node

/**
 * 测试 npm 如何传递参数给脚本
 */

console.log('🔍 测试 npm 参数传递\n')
console.log('='.repeat(60))

console.log('\n📋 process.argv:')
console.log(JSON.stringify(process.argv, null, 2))

console.log('\n📋 npm_config_* 环境变量:')
const npmConfigKeys = Object.keys(process.env)
  .filter(key => key.startsWith('npm_config_'))
  .sort()

if (npmConfigKeys.length > 0) {
  npmConfigKeys.forEach(key => {
    console.log(`  ${key}=${process.env[key]}`)
  })
} else {
  console.log('  (无)')
}

console.log('\n📋 相关环境变量:')
console.log(`  npm_config_build=${process.env.npm_config_build || '(未设置)'}`)
console.log(`  npm_config_target=${process.env.npm_config_target || '(未设置)'}`)
console.log(`  npm_config_source=${process.env.npm_config_source || '(未设置)'}`)

console.log('\n💡 说明：')
console.log('  如果使用 npm run build-copy --build=vam4（没有双破折号）')
console.log('  npm 会尝试解析 --build 作为自己的配置参数')
console.log('  如果 npm 不认识这个参数，会警告，但不会传递给脚本')
console.log('\n  正确用法：npm run build-copy -- --build=vam4')
console.log('  或者直接：build-copy --build=vam4')
