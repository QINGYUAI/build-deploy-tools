#!/usr/bin/env node

/**
 * 通知功能测试命令行工具
 * 基于原始 test-notification.js 重构的命令行版本
 *
 * 使用方法：
 * 1. 交互模式（默认）：
 *    test-notification
 *    npx build-deploy-tools test-notification
 *
 * 2. 自动模式：
 *    test-notification --auto
 *
 * 3. 自动模式 + 自动提交：
 *    test-notification --auto --commit
 *
 * 4. 禁用通知：
 *    test-notification --no-notification
 */

const { BuildDeployTools, utils } = require('../index')

/**
 * 解析命令行参数
 * @returns {Object} 解析后的配置对象
 */
function parseArguments () {
  const args = process.argv.slice(2)
  const config = {
    showHelp: false
  }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      config.showHelp = true
    }
  }

  return config
}

/**
 * 显示帮助信息
 */
function showHelp () {
  console.log(`
通知功能测试工具 v${require('../package.json').version}

用途：
  测试系统通知和用户确认功能是否正常工作

用法：
  test-notification [选项]

选项：
  --auto              启用自动模式测试
  --commit            启用自动提交测试
  --no-notification   禁用通知（使用命令行确认）
  --help, -h          显示此帮助信息

环境变量：
  CI=true                       # CI环境自动启用自动模式
  npm_config_auto=true          # 启用自动模式
  npm_config_commit_cli=true    # 启用自动提交
  npm_config_notification=false # 禁用通知

示例：
  test-notification
  test-notification --auto
  test-notification --auto --commit
  test-notification --no-notification

说明：
  - 交互模式下会弹出系统通知等待用户确认
  - 自动模式下会自动执行测试流程
  - 禁用通知时会回退到命令行确认
  - 可以测试不同平台的通知兼容性
`)
}

/**
 * 主函数
 */
async function main () {
  const config = parseArguments()

  // 显示帮助信息
  if (config.showHelp) {
    showHelp()
    return
  }

  try {
    // 创建工具实例
    const tools = new BuildDeployTools()

    // 执行通知测试
    const result = await tools.testNotification()

    if (result) {
      console.log('\n✅ 通知功能测试通过！')
      process.exit(0)
    } else {
      console.log('\n❌ 通知功能测试失败！')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 测试执行失败：', error.message)
    process.exit(1)
  }
}

/**
 * 显示使用说明
 */
function showUsageInfo () {
  console.log('\n使用说明：')
  console.log('  test-notification          # 交互模式')
  console.log('  test-notification --auto   # 自动模式')
  console.log('  test-notification --auto --commit  # 自动模式+自动提交')
  console.log('  test-notification --no-notification  # 禁用通知')
  console.log('  test-notification --help   # 显示帮助')
}

// 处理未捕获的异常
process.on('uncaughtException', error => {
  console.error('❌ 未捕获的异常:', error.message)
  showUsageInfo()
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason)
  showUsageInfo()
  process.exit(1)
})

// 运行主函数
main()
