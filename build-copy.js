/* eslint-disable */
/**
 * 构建后文件复制脚本
 * 用于将构建后的文件复制到指定目录并提交到SVN
 * 支持自动重试机制
 *
 * 特性：
 * - 使用系统通知进行用户确认（支持交互式通知）
 * - 当通知不可用时自动回退到命令行确认
 * - 跨平台兼容性：Windows、macOS、Linux
 * - 智能重试机制和进度提示
 * - 支持自动模式和交互模式
 *
 * 使用方法：
 * 1. 交互模式（默认）：
 *    node scripts/build-copy.js
 *    npm run build-copy
 *
 * 2. 自动模式：
 *    node scripts/build-copy.js --auto
 *    npm run build-copy --auto
 *
 * 3. 自动模式 + 自动提交：
 *    node scripts/build-copy.js --auto --commit
 *    npm run build-copy --auto --commit
 *
 * 4. 禁用通知：
 *    node scripts/build-copy.js --no-notification
 *    npm run build-copy --no-notification
 *
 * 环境变量：
 * - CI=true                       # CI环境自动启用自动模式
 * - npm_config_auto=true          # 启用自动模式
 * - npm_config_commit=true        # 启用自动提交
 * - npm_config_notification=false # 禁用通知
 * - npm_config_build=filename     # 指定构建文件名
 */

// 使用CommonJS语法导入所需模块
const fs = require('fs-extra') // 文件系统操作增强模块
const path = require('path') // 路径处理模块
const { execSync } = require('child_process') // 子进程执行模块
const notifier = require('node-notifier') // 系统通知模块
const readline = require('readline') // 命令行交互模块

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3, // 最大重试次数
  retryDelay: 2000, // 重试延迟(毫秒)
  svnTimeout: 30000, // SVN命令超时时间(毫秒)
  cleanupTimeout: 180000, // cleanup超时时间(毫秒)
  commitTimeout: 180000 // 提交超时时间(毫秒)
}

// 自动化配置
const AUTO_CONFIG = {
  isAutoMode:
    process.env.npm_config_auto === 'true' ||
    process.argv.includes('--auto') ||
    process.env.CI === 'true', // CI环境自动启用自动模式
  // npm_config_commit_cli 原因 npm_config_commit 无法获取这个变量
  autoCommit:
    process.env.npm_config_commit_cli === 'true' ||
    process.argv.includes('--commit'), // 自动提交到SVN
  useNotification:
    process.env.npm_config_notification !== 'false' &&
    !process.argv.includes('--no-notification') // 使用通知（默认启用）
}

/**
 * 延迟函数
 * @param {number} ms - 延迟时间(毫秒)
 * @returns {Promise} Promise对象
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 通用重试函数
 * @param {Function} fn - 要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} retryDelay - 重试延迟时间
 * @param {string} operationName - 操作名称(用于日志)
 * @returns {Promise} 执行结果
 */
async function retryOperation(
  fn,
  maxRetries = RETRY_CONFIG.maxRetries,
  retryDelay = RETRY_CONFIG.retryDelay,
  operationName = '操作'
) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 ${operationName} (第${attempt}次尝试)`)
      const result = await fn()
      if (result !== false && result !== null) {
        if (attempt > 1) {
          console.log(`✅ ${operationName}在第${attempt}次尝试后成功`)
        }
        return result
      }
      throw new Error(`${operationName}返回失败结果`)
    } catch (error) {
      lastError = error
      console.error(
        `❌ ${operationName}第${attempt}次尝试失败: ${error.message}`
      )

      if (attempt <= maxRetries) {
        console.log(`⏳ ${retryDelay / 1000}秒后重试...`)
        await delay(retryDelay)
      } else {
        console.error(`❌ ${operationName}在${maxRetries + 1}次尝试后仍然失败`)
        throw lastError
      }
    }
  }
}

/**
 * 创建进度条
 * @param {number} duration - 进度条持续时间(毫秒)
 * @param {string} message - 进度条显示消息
 * @returns {Object} 包含stop和setMessage方法的控制对象
 */
function createProgressBar(duration, message) {
  const totalSteps = 50
  let currentStep = 0
  let progressInterval

  console.log(`${message}`)

  const updateProgress = () => {
    currentStep++
    const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100))
    const filled = Math.round((currentStep / totalSteps) * 20)
    const empty = 20 - filled

    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    process.stdout.write(`\r⏳ 进度: [${bar}] ${percent}%`)

    if (currentStep >= totalSteps) {
      currentStep = 0 // 重置，让进度条循环
    }
  }

  progressInterval = setInterval(updateProgress, duration / totalSteps)

  return {
    stop: () => {
      clearInterval(progressInterval)
      process.stdout.write('\r✅ 操作完成!                                \n')
    },
    setMessage: newMessage => {
      process.stdout.write(`\r${newMessage}                                \n`)
    }
  }
}

/**
 * 获取打包文件名
 * 优先从npm配置获取，其次从命令行参数获取，最后使用默认值
 * @returns {string} 打包文件名
 */
function getFileName() {
  // 优先从 npm config 获取
  const npm_config_build = process.env.npm_config_build
  if (npm_config_build) {
    return npm_config_build
  }

  // 从命令行参数获取
  const args = process.argv.slice(2)
  const buildArg = args.find(arg => arg.startsWith('--build='))
  if (buildArg) {
    return buildArg.split('=')[1]
  }

  return 'vam3' // 与vite.config.js中保持一致的默认值
}

/**
 * 使用系统通知进行确认对话框（支持自动模式）
 * @param {string} message - 提示消息
 * @param {boolean} defaultValue - 自动模式下的默认值
 * @returns {Promise<boolean>} 用户确认结果
 */
async function confirmAction(message, defaultValue = false) {
  // 自动模式下直接返回默认值
  if (AUTO_CONFIG.isAutoMode) {
    console.log(
      `🤖 自动模式: ${message} -> ${
        defaultValue ? '✅ 自动确认' : '❌ 自动取消'
      }`
    )
    return defaultValue
  }

  // 不使用通知时，直接使用命令行确认
  if (!AUTO_CONFIG.useNotification) {
    console.log(`💬 命令行模式: ${message}`)
    return await fallbackConfirmAction(message)
  }

  return new Promise(resolve => {
    console.log(`📢 ${message}`)

    // 在支持的平台上使用交互式通知
    notifier.notify(
      {
        title: '确认操作',
        message: message,
        sound: true,
        wait: true,
        timeout: 30, // 30秒超时
        actions: ['确认', '取消'], // 动作按钮
        closeLabel: '取消',
        reply: false
      },
      (err, response, metadata) => {
        if (err) {
          console.error('通知错误:', err.message)
          // 出错时回退到命令行确认
          return fallbackConfirmAction(message).then(resolve)
        }

        console.log(`用户响应: ${response}`)

        // 根据不同的响应处理结果
        if (response === 'activate' || response === 'clicked') {
          // 用户点击了通知主体，默认为确认
          resolve(true)
        } else if (response === 'timeout') {
          // 超时，默认为取消
          console.log('⏰ 操作超时，默认取消')
          resolve(false)
        } else if (response === 'dismissed') {
          // 用户主动关闭通知
          console.log('❌ 用户取消操作')
          resolve(false)
        } else {
          // 其他情况，默认为取消
          resolve(false)
        }
      }
    )

    // 监听点击事件
    notifier.on('click', (notifierObject, options, event) => {
      console.log('✅ 用户点击确认')
      resolve(true)
    })

    // 监听超时事件
    notifier.on('timeout', (notifierObject, options) => {
      console.log('⏰ 确认超时，默认取消')
      resolve(false)
    })
  })
}

/**
 * 回退的命令行确认函数
 * @param {string} message - 提示消息
 * @returns {Promise<boolean>} 用户确认结果
 */
async function fallbackConfirmAction(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * 显示系统通知（增强版）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {Object} options - 额外选项
 */
function notify(title, message, options = {}) {
  console.log(`${title}: ${message}`)

  const notifyOptions = {
    title: title,
    message: message,
    sound: options.sound || false,
    wait: options.wait || false,
    timeout: options.timeout || 5, // 5秒自动消失
    icon: options.icon || undefined,
    ...options
  }

  notifier.notify(notifyOptions, (err, response, metadata) => {
    if (err) {
      console.error('通知发送失败:', err.message)
    } else if (response) {
      console.log(`通知响应: ${response}`)
    }
  })
}

/**
 * 执行SVN命令
 * @param {string} command - SVN命令
 * @param {string} cwd - 执行目录
 * @param {string} errorMessage - 错误提示信息
 * @param {number} timeout - 超时时间(毫秒)
 * @param {boolean} showProgress - 是否显示进度条
 * @returns {Promise<boolean>} 执行结果
 */
async function executeSvn(
  command,
  cwd,
  errorMessage,
  timeout = RETRY_CONFIG.svnTimeout,
  showProgress = false
) {
  let progressBar = null

  try {
    console.log(`执行命令: ${command}`)

    if (showProgress) {
      progressBar = createProgressBar(timeout, `⏳ 正在执行: ${command}`)
    }

    execSync(command, {
      cwd,
      stdio: 'pipe',
      timeout: timeout
    })

    if (progressBar) {
      progressBar.stop()
    }

    return true
  } catch (error) {
    if (progressBar) {
      progressBar.stop()
    }

    if (error.status === 'ETIMEDOUT') {
      console.error(`❌ ${errorMessage}: 命令执行超时 (${timeout / 1000}秒)`)
    } else {
      console.error(`❌ ${errorMessage}: ${error.message}`)
    }
    throw error
  }
}

/**
 * 执行SVN更新，支持自动重试和cleanup
 * @param {string} cwd - 执行目录
 * @returns {Promise<boolean>} 更新结果
 */
async function executeSvnUpdate(cwd) {
  console.log('🔄 更新SVN仓库...')

  return await retryOperation(
    async () => {
      try {
        await executeSvn(
          'svn update',
          cwd,
          'SVN更新失败',
          RETRY_CONFIG.svnTimeout,
          true
        )
        return true
      } catch (error) {
        // 如果错误信息包含cleanup提示，自动执行cleanup
        if (error.message && error.message.includes('cleanup')) {
          console.log('🧹 检测到需要cleanup，自动执行cleanup...')
          console.log('⏳ cleanup可能需要较长时间，请耐心等待...')

          await executeSvn(
            'svn cleanup',
            cwd,
            'SVN cleanup失败',
            RETRY_CONFIG.cleanupTimeout,
            true
          )
          console.log('✅ SVN cleanup完成，重新尝试更新...')

          // cleanup后重新尝试更新
          await executeSvn(
            'svn update',
            cwd,
            'SVN更新失败',
            RETRY_CONFIG.svnTimeout,
            true
          )
          return true
        }
        throw error
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN更新'
  )
}

/**
 * 复制文件夹，支持自动重试
 * @param {string} sourceDir - 源目录
 * @param {string} targetDir - 目标目录
 * @returns {Promise<boolean>} 复制结果
 */
async function copyDirectoryWithRetry(sourceDir, targetDir) {
  return await retryOperation(
    async () => {
      console.log('📋 复制文件夹...')
      fs.copySync(sourceDir, targetDir, { overwrite: true })

      // 验证复制是否成功
      if (!fs.existsSync(targetDir)) {
        throw new Error('复制后目标目录不存在')
      }

      const fileCount = fs.readdirSync(targetDir).length
      console.log(`✅ 复制完成 (${fileCount} 个文件/文件夹)`)
      return true
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    '文件复制'
  )
}

/**
 * 删除目录，支持自动重试
 * @param {string} targetDir - 目标目录
 * @returns {Promise<boolean>} 删除结果
 */
async function deleteDirectoryWithRetry(targetDir) {
  return await retryOperation(
    async () => {
      console.log('🗑️  删除旧文件夹...')

      // 尝试SVN删除
      try {
        await executeSvn('svn delete --force .', targetDir, 'SVN删除失败')
        return true
      } catch (error) {
        // SVN删除失败，尝试直接删除
        console.log('SVN删除失败，尝试直接删除...')
        fs.removeSync(targetDir)
        return true
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    '删除旧文件'
  )
}

/**
 * SVN提交，支持自动重试
 * @param {string} targetDir - 目标目录
 * @param {string} parentDir - 父目录
 * @returns {Promise<boolean>} 提交结果
 */
async function commitToSvnWithRetry(targetDir, parentDir) {
  return await retryOperation(
    async () => {
      console.log('📤 提交到SVN...')

      await executeSvn('svn add . --force', targetDir, 'SVN添加失败')
      await executeSvn(
        'svn commit -m "更新构建文件"',
        parentDir,
        'SVN提交失败',
        RETRY_CONFIG.commitTimeout,
        true
      )

      console.log('✅ SVN提交成功')
      return true
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN提交'
  )
}

// 定义源目录和目标目录
const sourceDir = path.resolve(__dirname, `../${getFileName()}`)
const targetParentDir = 'D:/Work/Vue3/development'
const targetDirWithFolder = path.join(targetParentDir, path.basename(sourceDir))

console.log(`📦 准备复制: ${path.basename(sourceDir)} → ${targetParentDir}`)

// 检查源目录是否存在
if (!fs.existsSync(sourceDir)) {
  console.error(`❌ 源目录不存在: ${sourceDir}`)
  console.error(`请先执行: npm run build`)
  notify('错误', '请先执行构建命令', { sound: true, timeout: 10 })
  process.exit(1)
}

/**
 * 主函数 - 执行文件复制和SVN操作
 * 支持自动重试机制
 */
async function main() {
  // 显示运行模式
  console.log(
    `🚀 开始执行构建后复制任务 (最大重试次数: ${RETRY_CONFIG.maxRetries})`
  )
  console.log(
    `📋 运行模式: ${AUTO_CONFIG.isAutoMode ? '🤖 自动模式' : '👤 交互模式'}`
  )

  if (AUTO_CONFIG.isAutoMode) {
    console.log(
      `📋 自动提交: ${AUTO_CONFIG.autoCommit ? '✅ 启用' : '❌ 禁用'}`
    )
    console.log(
      `📋 使用通知: ${AUTO_CONFIG.useNotification ? '✅ 启用' : '❌ 禁用'}`
    )
  }

  return await retryOperation(
    async () => {
      // 确保目标父目录存在
      fs.ensureDirSync(targetParentDir)

      // 1. 更新SVN仓库
      await executeSvnUpdate(targetParentDir)

      // 2. 处理已存在的文件夹
      if (fs.existsSync(targetDirWithFolder)) {
        await deleteDirectoryWithRetry(targetDirWithFolder)
      }

      // 3. 复制文件夹
      await copyDirectoryWithRetry(sourceDir, targetDirWithFolder)

      // 4. SVN操作
      // 在自动模式下，根据 autoCommit 配置决定是否提交；在交互模式下询问用户
      const shouldCommit = await confirmAction(
        '是否提交到SVN？',
        AUTO_CONFIG.autoCommit
      )
      if (shouldCommit) {
        await commitToSvnWithRetry(targetDirWithFolder, targetParentDir)
        notify('完成', '文件已成功复制并提交到SVN', { sound: true, timeout: 8 })
      } else {
        notify('完成', '文件已复制，未提交到SVN', { sound: true, timeout: 8 })
      }

      console.log(`🎉 操作完成！`)
      return true
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    '整个构建复制流程'
  )
}

// 执行主函数
main().catch(error => {
  console.error('❌ 所有重试均失败，操作终止：', error.message)
  notify('错误', '操作失败，已达到最大重试次数', { sound: true, timeout: 15 })
  process.exit(1)
})
