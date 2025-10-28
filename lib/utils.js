/**
 * 通用工具函数模块
 * 提供延迟、重试、进度条等功能
 */

// 重试配置常量（优化版）
const RETRY_CONFIG = {
  maxRetries: 3, // 减少重试次数，提高速度
  retryDelay: 1500, // 减少重试延迟
  svnTimeout: 30000, // 优化超时时间
  cleanupTimeout: 60000, // 减少cleanup超时时间
  commitTimeout: 120000 // 优化提交超时时间
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
  let currentDelay = retryDelay

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
        // 优化的重试延迟策略
        if (error.message && (
          error.message.includes('locked') ||
          error.message.includes('E155037') ||
          error.message.includes('Previous operation has not finished')
        )) {
          // SVN锁定错误，使用适度延迟
          currentDelay = Math.min(currentDelay * 1.2, 5000) // 减少最大延迟
          console.log(`⏳ SVN锁定错误，${currentDelay / 1000}秒后重试...`)
        } else {
          console.log(`⏳ ${currentDelay / 1000}秒后重试...`)
        }
        await delay(currentDelay)
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
 * 创建多阶段进度条 - 专为SVN提交等复杂操作设计
 * @param {Array} stages - 阶段配置数组，每个阶段包含 {name, duration, emoji}
 * @param {string} operation - 操作名称
 * @returns {Object} 包含nextStage、updateProgress、stop方法的控制对象
 */
function createMultiStageProgressBar (stages, operation = '操作') {
  let currentStageIndex = 0
  let currentStageProgress = 0
  let progressInterval = null
  let isCompleted = false

  const totalStages = stages.length
  const barWidth = 30

  // 显示初始状态
  console.log(`\n🚀 开始${operation}...`)
  displayProgress()

  function displayProgress () {
    if (isCompleted) return

    const currentStage = stages[currentStageIndex] || {
      name: '完成',
      emoji: '✅'
    }
    const overallProgress =
      (currentStageIndex + currentStageProgress / 100) / totalStages
    const overallPercent = Math.round(overallProgress * 100)

    // 创建总体进度条
    const filled = Math.round(overallProgress * barWidth)
    const empty = barWidth - filled
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty)

    // 创建当前阶段进度条
    const stageFilled = Math.round((currentStageProgress / 100) * 15)
    const stageEmpty = 15 - stageFilled
    const stageBar = '▓'.repeat(stageFilled) + '▒'.repeat(stageEmpty)

    // 显示进度信息
    const stageInfo = `${currentStage.emoji} ${
      currentStage.name
    } [${stageBar}] ${Math.round(currentStageProgress)}%`
    const overallInfo = `总进度: [${progressBar}] ${overallPercent}% (${
      currentStageIndex + 1
    }/${totalStages})`

    // 清除之前的输出并显示新的进度
    process.stdout.write('\r\x1b[K') // 清除当前行
    process.stdout.write('\r\x1b[1A\x1b[K') // 上移一行并清除
    process.stdout.write(`${stageInfo}\n${overallInfo}`)
  }

  function startStageProgress () {
    if (progressInterval) {
      clearInterval(progressInterval)
    }

    currentStageProgress = 0
    const currentStage = stages[currentStageIndex]
    if (!currentStage) return

    const updateInterval = currentStage.duration / 100 // 100步完成

    progressInterval = setInterval(() => {
      if (currentStageProgress < 100) {
        currentStageProgress += 2 // 每次增加2%
        displayProgress()
      }
    }, updateInterval)
  }

  // 开始第一个阶段
  if (stages.length > 0) {
    startStageProgress()
  }

  return {
    /**
     * 进入下一个阶段
     * @param {string} customMessage - 自定义阶段完成消息
     */
    nextStage: (customMessage = null) => {
      if (isCompleted) return

      // 完成当前阶段
      currentStageProgress = 100
      displayProgress()

      if (customMessage) {
        console.log(`\n💡 ${customMessage}`)
      }

      // 移动到下一阶段
      currentStageIndex++

      if (currentStageIndex < totalStages) {
        startStageProgress()
      } else {
        // 所有阶段完成
        isCompleted = true
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        console.log(`\n🎉 ${operation}完成!\n`)
      }
    },

    /**
     * 更新当前阶段进度
     * @param {number} progress - 进度百分比 (0-100)
     * @param {string} message - 可选的状态消息
     */
    updateProgress: (progress, message = null) => {
      if (isCompleted) return

      currentStageProgress = Math.min(100, Math.max(0, progress))
      displayProgress()

      if (message) {
        console.log(`\n💬 ${message}`)
      }
    },

    /**
     * 停止进度条
     * @param {string} message - 完成消息
     */
    stop: (message = '操作完成') => {
      isCompleted = true
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      console.log(`\n✅ ${message}\n`)
    },

    /**
     * 错误停止
     * @param {string} error - 错误消息
     */
    error: error => {
      isCompleted = true
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      console.log(`\n❌ 操作失败: ${error}\n`)
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
  createMultiStageProgressBar,
  getFileName,
  getAutoConfig
}
