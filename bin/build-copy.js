#!/usr/bin/env node

/**
 * 构建后文件复制命令行工具
 * 基于原始 build-copy.js 重构的命令行版本
 *
 * 使用方法：
 * 1. 交互模式（默认）：
 *    build-copy
 *    npx build-deploy-tools build-copy
 *
 * 2. 自动模式：
 *    build-copy --auto
 *    npx build-deploy-tools build-copy --auto
 *
 * 3. 自动模式 + 自动提交：
 *    build-copy --auto --commit
 *    npx build-deploy-tools build-copy --auto --commit
 *
 * 4. 禁用通知：
 *    build-copy --no-notification
 *
 * 5. 自定义构建文件名：
 *    build-copy --build=myapp
 *
 * 6. 自定义目标目录：
 *    build-copy --target=D:/Work/Vue3/myproject
 */

const path = require('path')
const { BuildDeployTools, utils, notification } = require('../index')

/**
 * 解析命令行参数
 * @returns {Object} 解析后的配置对象
 */
function parseArguments () {
  const args = process.argv.slice(2)
  const config = {
    fileName: utils.getFileName(),
    targetParentDir: 'D:/Work/Vue3/yiyumsaas', // 默认目标目录
    autoCommit: null, // null表示使用配置自动判断
    showHelp: false
  }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      config.showHelp = true
    } else if (arg.startsWith('--build=')) {
      config.fileName = arg.split('=')[1]
    } else if (arg.startsWith('--target=')) {
      config.targetParentDir = arg.split('=')[1]
    } else if (arg === '--commit') {
      config.autoCommit = true
    } else if (arg === '--no-commit') {
      config.autoCommit = false
    }
  }

  return config
}

/**
 * 显示帮助信息
 */
function showHelp () {
  console.log(`
构建后文件复制工具 v${require('../package.json').version}

用途：
  将构建后的文件复制到指定目录并可选提交到SVN

用法：
  build-copy [选项]

选项：
  --build=<文件名>     指定构建文件名 (默认: vam3)
  --target=<目录>      指定目标父目录 (默认: D:/Work/Vue3/yiyumsaas)
  --auto              启用自动模式
  --commit            强制自动提交到SVN
  --no-commit         禁止提交到SVN
  --no-notification   禁用系统通知
  --help, -h          显示此帮助信息

环境变量：
  CI=true                       # CI环境自动启用自动模式
  npm_config_auto=true          # 启用自动模式
  npm_config_commit_cli=true    # 启用自动提交
  npm_config_notification=false # 禁用通知
  npm_config_build=filename     # 指定构建文件名

示例：
  build-copy
  build-copy --auto
  build-copy --auto --commit
  build-copy --build=myapp --target=D:/Work/Projects
  build-copy --no-notification

注意：
  - 请确保已执行构建命令生成相应文件
  - SVN操作需要在目标目录中有SVN工作副本
  - 自动模式下会根据配置自动执行，无需用户交互
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

  // 构建源目录路径 - 从当前工作目录开始，而不是从工具安装目录
  const sourceDir = path.resolve(process.cwd(), config.fileName)
  config.sourceDir = sourceDir

  // 显示运行信息
  const autoConfig = utils.getAutoConfig()
  console.log(`🚀 开始执行构建后复制任务`)
  console.log(
    `📋 运行模式: ${autoConfig.isAutoMode ? '🤖 自动模式' : '👤 交互模式'}`
  )
  console.log(`📋 源目录: ${config.sourceDir}`)
  console.log(`📋 目标目录: ${config.targetParentDir}`)

  if (autoConfig.isAutoMode) {
    const finalAutoCommit =
      config.autoCommit !== null ? config.autoCommit : autoConfig.autoCommit
    console.log(`📋 自动提交: ${finalAutoCommit ? '✅ 启用' : '❌ 禁用'}`)
    console.log(
      `📋 使用通知: ${autoConfig.useNotification ? '✅ 启用' : '❌ 禁用'}`
    )
  }

  try {
    // 创建工具实例
    const tools = new BuildDeployTools()

    // 执行构建复制流程
    await tools.executeBuildCopy(config)

    console.log('🎉 构建复制任务完成！')
    process.exit(0)
  } catch (error) {
    console.error('❌ 构建复制任务失败：', error.message)
    await notification.notify('错误', '构建复制失败', {
      sound: true,
      timeout: 15
    })
    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('uncaughtException', error => {
  console.error('❌ 未捕获的异常:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason)
  process.exit(1)
})

// 运行主函数
main()
