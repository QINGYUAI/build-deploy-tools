/**
 * 通用工具函数模块
 * 提供延迟、重试、进度条等功能
 */

// 重试配置常量
const RETRY_CONFIG = {
  maxRetries: 3, // 最大重试次数
  retryDelay: 2000, // 重试延迟(毫秒)
  svnTimeout: 30000, // SVN命令超时时间(毫秒)
  cleanupTimeout: 180000, // cleanup超时时间(毫秒)
  commitTimeout: 180000 // 提交超时时间(毫秒)
}

/**
 * 延迟函数
 * @param {number} ms - 延迟时间(毫秒)
 * @returns {Promise} Promise对象
 */
function delay (ms) {
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
async function retryOperation (
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
function createProgressBar (duration, message) {
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
function getFileName () {
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

  return 'vam3' // 默认值
}

/**
 * 解析自动化配置
 * @returns {Object} 自动化配置对象
 */
function getAutoConfig () {
  return {
    isAutoMode:
      process.env.npm_config_auto === 'true' ||
      process.argv.includes('--auto') ||
      process.env.CI === 'true', // CI环境自动启用自动模式
    autoCommit:
      process.env.npm_config_commit_cli === 'true' ||
      process.argv.includes('--commit'), // 自动提交到SVN
    useNotification:
      process.env.npm_config_notification !== 'false' &&
      !process.argv.includes('--no-notification') // 使用通知（默认启用）
  }
}

module.exports = {
  RETRY_CONFIG,
  delay,
  retryOperation,
  createProgressBar,
  getFileName,
  getAutoConfig
}
