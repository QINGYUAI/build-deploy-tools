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

// .env 文件会在 utils 模块加载时自动加载

/**
 * 解析命令行参数
 * @returns {Object} 解析后的配置对象
 */
function parseArguments () {
  const args = process.argv.slice(2)

  // 从环境变量获取默认值
  const envConfig = utils.getEnvConfig()

  const config = {
    fileName: utils.getFileName(),
    targetParentDir: utils.getTargetDir('D:/Work/Vue3/yiyumsaas'), // 从环境变量或默认值获取目标目录
    sourceDir: null, // 将在后面设置
    autoCommit: null, // null表示使用配置自动判断
    commitMessage: process.env.COMMIT_MESSAGE || null, // 从环境变量获取自定义提交信息
    useVcsHistory: process.env.USE_VCS_HISTORY !== 'false', // 从环境变量获取是否使用版本控制历史
    commitOptions: {}, // 提交信息格式化选项
    showHelp: false
  }

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      config.showHelp = true
    } else if (arg.startsWith('--build=')) {
      config.fileName = arg.split('=')[1]
    } else if (arg.startsWith('--target=')) {
      config.targetParentDir = arg.split('=')[1]
    } else if (arg.startsWith('--source=')) {
      config.sourceDir = arg.split('=')[1]
    } else if (arg.startsWith('--message=')) {
      config.commitMessage = arg.split('=')[1]
    } else if (arg.startsWith('--commit-message=')) {
      config.commitMessage = arg.split('=')[1]
    } else if (arg === '--commit') {
      config.autoCommit = true
    } else if (arg === '--no-commit') {
      config.autoCommit = false
    } else if (arg === '--no-vcs-history') {
      config.useVcsHistory = false
    } else if (arg === '--add-timestamp') {
      config.commitOptions.addTimestamp = true
    } else if (arg.startsWith('--prefix=')) {
      config.commitOptions.prefix = arg.split('=')[1]
    } else if (arg.startsWith('--suffix=')) {
      config.commitOptions.suffix = arg.split('=')[1]
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
  --build=<文件名>        指定构建文件名 (默认: vam3)
  --target=<目录>         指定目标父目录 (默认: D:/Work/Vue3/yiyumsaas)
  --source=<目录>         指定源目录 (默认: 使用构建文件名)
  --auto                 启用自动模式
  --commit               强制自动提交到SVN
  --no-commit            禁止提交到SVN
  --message=<信息>       自定义提交信息
  --commit-message=<信息> 自定义提交信息（同--message）
  --no-vcs-history       不使用版本控制历史信息
  --add-timestamp        在提交信息中添加时间戳
  --prefix=<前缀>        为提交信息添加前缀
  --suffix=<后缀>        为提交信息添加后缀
  --no-notification      禁用系统通知
  --help, -h             显示此帮助信息

环境变量：
  # 基础配置
  TARGET_DIR=<目录>             # 指定目标目录（优先级高于默认值）
  SOURCE_DIR=<目录>             # 指定源目录（优先级高于默认值）
  BUILD_NAME=<文件名>           # 指定构建文件名（优先级高于默认值）
  
  # npm配置（通过 npm run script --key=value 或 export npm_config_key=value）
  npm_config_target=<目录>      # 指定目标目录
  npm_config_source=<目录>      # 指定源目录
  npm_config_build=<文件名>     # 指定构建文件名
  
  # 自动化配置
  CI=true                       # CI环境自动启用自动模式
  AUTO_MODE=true                # 启用自动模式
  AUTO_COMMIT=true              # 启用自动提交
  npm_config_auto=true          # 启用自动模式（npm配置方式）
  npm_config_commit_cli=true    # 启用自动提交（npm配置方式）
  npm_config_notification=false # 禁用通知
  USE_NOTIFICATION=false        # 禁用通知（环境变量方式）
  
  # 提交配置
  COMMIT_MESSAGE=<信息>         # 自定义提交信息
  USE_VCS_HISTORY=false         # 禁用版本控制历史（默认true）
  
  # 重试配置
  MAX_RETRIES=<次数>            # 最大重试次数
  RETRY_DELAY=<毫秒>            # 重试延迟时间

示例：
  build-copy
  build-copy --auto
  build-copy --auto --commit
  build-copy --build=myapp --target=D:/Work/Projects
  build-copy --message="修复登录问题" --commit
  build-copy --auto --add-timestamp --prefix="[部署]"
  build-copy --no-vcs-history --message="手动部署"
  build-copy --no-notification

智能提交信息：
  - 优先级：自定义信息 > Git最近提交 > SVN最近提交 > 默认信息
  - 自动从当前Git/SVN仓库获取最近一次提交信息
  - 支持格式化选项：前缀、后缀、时间戳

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

  // 构建源目录路径 - 优先使用环境变量或命令行参数，否则使用默认逻辑
  let sourceDir = config.sourceDir
  if (!sourceDir) {
    // 尝试从环境变量获取源目录
    const envSourceDir = utils.getSourceDir()
    if (envSourceDir) {
      sourceDir = path.isAbsolute(envSourceDir)
        ? envSourceDir
        : path.resolve(process.cwd(), envSourceDir)
    } else {
      // 默认逻辑：从当前工作目录开始，使用构建文件名
      sourceDir = path.resolve(process.cwd(), config.fileName)
    }
  } else {
    // 如果命令行参数指定了源目录，确保是绝对路径
    sourceDir = path.isAbsolute(sourceDir)
      ? sourceDir
      : path.resolve(process.cwd(), sourceDir)
  }
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

  // 🆕 显示提交信息配置
  if (config.commitMessage) {
    console.log(`📋 自定义提交信息: "${config.commitMessage}"`)
  }
  console.log(
    `📋 使用版本控制历史: ${config.useVcsHistory ? '✅ 启用' : '❌ 禁用'}`
  )

  if (Object.keys(config.commitOptions).length > 0) {
    console.log(`📋 提交信息选项:`, config.commitOptions)
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

// 🔧 只有在直接运行时才执行main函数
if (require.main === module) {
  // 运行主函数
  main()
}

// 🔧 导出供编程使用
module.exports = {
  main,
  parseArguments,
  showHelp
}
