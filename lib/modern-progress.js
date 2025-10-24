/**
 * 现代化进度条模块 - 科技感十足的进度显示
 * 使用最新的npm库实现炫酷的进度条效果
 */

const cliProgress = require('cli-progress')
const ora = require('ora')
const chalk = require('chalk')
const gradient = require('gradient-string')
const figures = require('figures')

/**
 * 科技感渐变色配置
 */
const TECH_GRADIENTS = {
  cyber: gradient(['#00f5ff', '#0080ff', '#0040ff']), // 赛博朋克蓝
  matrix: gradient(['#00ff41', '#00cc33', '#009926']), // 矩阵绿
  neon: gradient(['#ff0080', '#ff4080', '#ff8080']), // 霓虹粉
  plasma: gradient(['#8a2be2', '#4169e1', '#00bfff']), // 等离子紫蓝
  fire: gradient(['#ff4500', '#ff6347', '#ffa500']), // 火焰橙
  ice: gradient(['#00ffff', '#87ceeb', '#b0e0e6']) // 冰蓝
}

/**
 * 科技感图标配置
 */
const TECH_ICONS = {
  scanning: '🔍',
  processing: '⚡',
  uploading: '📤',
  downloading: '📥',
  syncing: '🔄',
  building: '🔧',
  deploying: '🚀',
  checking: '✨',
  success: '🎉',
  error: '💥',
  warning: '⚠️',
  info: 'ℹ️'
}

/**
 * 创建现代化单一进度条
 * @param {Object} options - 配置选项
 * @returns {Object} 进度条控制对象
 */
function createModernProgressBar (options = {}) {
  const {
    title = '处理中',
    total = 100,
    theme = 'cyber',
    showETA = true,
    showPercentage = true,
    showValue = true,
    width = 40
  } = options

  const gradient_func = TECH_GRADIENTS[theme] || TECH_GRADIENTS.cyber

  // 自定义进度条格式
  const format = [
    gradient_func('{bar}'),
    chalk.cyan('|'),
    chalk.yellow('{percentage}%'),
    chalk.gray('|'),
    chalk.green('{value}/{total}'),
    chalk.gray('|'),
    chalk.magenta('ETA: {eta}s'),
    chalk.gray('|'),
    chalk.blue('{title}')
  ].join(' ')

  const bar = new cliProgress.SingleBar(
    {
      format: format,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      barsize: width,
      stopOnComplete: true,
      clearOnComplete: false,
      etaBuffer: 10
    },
    cliProgress.Presets.shades_grey
  )

  let isStarted = false

  return {
    /**
     * 启动进度条
     * @param {number} totalValue - 总值
     * @param {number} startValue - 起始值
     * @param {Object} payload - 额外数据
     */
    start: (totalValue = total, startValue = 0, payload = {}) => {
      if (!isStarted) {
        console.log(gradient_func(`\n🚀 ${title} 开始执行...\n`))
        bar.start(totalValue, startValue, { title, ...payload })
        isStarted = true
      }
    },

    /**
     * 更新进度
     * @param {number} value - 当前值
     * @param {Object} payload - 额外数据
     */
    update: (value, payload = {}) => {
      if (isStarted) {
        bar.update(value, { title, ...payload })
      }
    },

    /**
     * 增加进度
     * @param {number} increment - 增量
     * @param {Object} payload - 额外数据
     */
    increment: (increment = 1, payload = {}) => {
      if (isStarted) {
        bar.increment(increment, { title, ...payload })
      }
    },

    /**
     * 停止进度条
     * @param {string} message - 完成消息
     */
    stop: (message = '完成') => {
      if (isStarted) {
        bar.stop()
        console.log(gradient_func(`\n✨ ${message}!\n`))
        isStarted = false
      }
    },

    /**
     * 获取当前进度值
     */
    getProgress: () => {
      return bar.getProgress()
    }
  }
}

/**
 * 创建多阶段科技感进度条
 * @param {Array} stages - 阶段配置数组
 * @param {Object} options - 配置选项
 * @returns {Object} 多阶段进度条控制对象
 */
function createTechMultiStageProgress (stages, options = {}) {
  const {
    operation = '操作',
    theme = 'cyber',
    showStageDetails = true,
    animationSpeed = 100
  } = options

  let currentStageIndex = 0
  let currentStageProgress = 0
  let isCompleted = false
  let spinner = null
  let progressBar = null

  const gradient_func = TECH_GRADIENTS[theme] || TECH_GRADIENTS.cyber
  const totalStages = stages.length

  // 创建主进度条
  const mainProgressBar = createModernProgressBar({
    title: `${operation} 总进度`,
    total: totalStages * 100,
    theme: theme,
    width: 50
  })

  /**
   * 显示当前阶段信息
   */
  function displayStageInfo () {
    if (isCompleted || currentStageIndex >= totalStages) return

    const stage = stages[currentStageIndex]
    const stageIcon = TECH_ICONS[stage.type] || TECH_ICONS.processing
    const stageTitle = `${stageIcon} ${stage.name}`

    // 停止之前的spinner
    if (spinner) {
      spinner.stop()
    }

    // 创建新的spinner用于当前阶段
    spinner = ora({
      text: gradient_func(stageTitle),
      spinner: {
        interval: animationSpeed,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      }
    }).start()

    // 创建阶段进度条
    if (showStageDetails && stage.showProgress !== false) {
      setTimeout(() => {
        if (spinner) spinner.stop()

        progressBar = createModernProgressBar({
          title: stageTitle,
          total: 100,
          theme: theme,
          width: 30
        })
        progressBar.start(100, 0)
      }, 500)
    }
  }

  /**
   * 更新总体进度
   */
  function updateOverallProgress () {
    const overallProgress = currentStageIndex * 100 + currentStageProgress
    mainProgressBar.update(overallProgress, {
      title: `${operation} (${currentStageIndex + 1}/${totalStages})`
    })
  }

  // 初始化
  console.log(gradient_func(`\n🌟 ${operation} 系统启动中...\n`))
  mainProgressBar.start(totalStages * 100, 0)

  const progressController = {
    /**
     * 开始第一个阶段
     */
    start: () => {
      if (stages.length > 0) {
        displayStageInfo()
        updateOverallProgress()
      }
    },

    /**
     * 更新当前阶段进度
     * @param {number} progress - 进度百分比 (0-100)
     * @param {string} message - 状态消息
     */
    updateStage: (progress, message = null) => {
      if (isCompleted) return

      currentStageProgress = Math.min(100, Math.max(0, progress))

      if (progressBar) {
        progressBar.update(currentStageProgress, {
          title: message || stages[currentStageIndex]?.name || '处理中'
        })
      }

      updateOverallProgress()

      if (message && spinner && !progressBar) {
        spinner.text = gradient_func(`${TECH_ICONS.processing} ${message}`)
      }
    },

    /**
     * 进入下一个阶段
     * @param {string} completionMessage - 阶段完成消息
     */
    nextStage: (completionMessage = null) => {
      if (isCompleted) return

      // 完成当前阶段
      currentStageProgress = 100
      updateOverallProgress()

      // 停止当前阶段的显示
      if (spinner) {
        spinner.succeed(
          gradient_func(
            completionMessage || `${stages[currentStageIndex]?.name} 完成`
          )
        )
        spinner = null
      }

      if (progressBar) {
        progressBar.stop(completionMessage || '阶段完成')
        progressBar = null
      }

      // 移动到下一阶段
      currentStageIndex++
      currentStageProgress = 0

      if (currentStageIndex < totalStages) {
        // 短暂延迟后开始下一阶段
        setTimeout(() => {
          displayStageInfo()
          updateOverallProgress()
        }, 300)
      } else {
        // 所有阶段完成
        progressController.complete()
      }
    },

    /**
     * 完成所有阶段
     * @param {string} message - 完成消息
     */
    complete: (message = null) => {
      if (isCompleted) return

      isCompleted = true

      // 清理所有进度显示
      if (spinner) {
        spinner.stop()
      }
      if (progressBar) {
        progressBar.stop()
      }

      // 完成主进度条
      mainProgressBar.update(totalStages * 100)
      mainProgressBar.stop(message || `${operation}全部完成`)

      // 显示炫酷的完成效果
      console.log(gradient_func('═'.repeat(60)))
      console.log(gradient_func(`🎊 ${operation} 执行成功! 🎊`))
      console.log(gradient_func('═'.repeat(60)))
    },

    /**
     * 错误终止
     * @param {string} error - 错误消息
     */
    error: error => {
      isCompleted = true

      // 清理所有进度显示
      if (spinner) {
        spinner.fail(chalk.red(`❌ ${error}`))
      }
      if (progressBar) {
        progressBar.stop('操作失败')
      }

      mainProgressBar.stop('操作失败')

      // 显示错误信息
      console.log(chalk.red('═'.repeat(60)))
      console.log(chalk.red(`💥 ${operation} 执行失败: ${error}`))
      console.log(chalk.red('═'.repeat(60)))
    },

    /**
     * 获取当前状态
     */
    getStatus: () => ({
      currentStage: currentStageIndex,
      totalStages: totalStages,
      stageProgress: currentStageProgress,
      overallProgress:
        (currentStageIndex * 100 + currentStageProgress) / totalStages,
      isCompleted: isCompleted
    })
  }

  return progressController
}

/**
 * 创建简单的科技感spinner
 * @param {string} text - 显示文本
 * @param {string} theme - 主题色彩
 * @returns {Object} spinner控制对象
 */
function createTechSpinner (text = '处理中...', theme = 'cyber') {
  const gradient_func = TECH_GRADIENTS[theme] || TECH_GRADIENTS.cyber

  return ora({
    text: gradient_func(text),
    spinner: {
      interval: 80,
      frames: [
        '▰▱▱▱▱▱▱',
        '▰▰▱▱▱▱▱',
        '▰▰▰▱▱▱▱',
        '▰▰▰▰▱▱▱',
        '▰▰▰▰▰▱▱',
        '▰▰▰▰▰▰▱',
        '▰▰▰▰▰▰▰',
        '▱▰▰▰▰▰▰',
        '▱▱▰▰▰▰▰',
        '▱▱▱▰▰▰▰',
        '▱▱▱▱▰▰▰',
        '▱▱▱▱▱▰▰',
        '▱▱▱▱▱▱▰'
      ]
    }
  })
}

/**
 * 显示科技感成功消息
 * @param {string} message - 消息内容
 * @param {string} theme - 主题
 */
function showTechSuccess (message, theme = 'cyber') {
  const gradient_func = TECH_GRADIENTS[theme] || TECH_GRADIENTS.cyber
  console.log(
    '\n' + gradient_func('🌟 ═══════════════════════════════════════ 🌟')
  )
  console.log(gradient_func(`   ✨ ${message} ✨`))
  console.log(gradient_func('🌟 ═══════════════════════════════════════ 🌟\n'))
}

/**
 * 显示科技感错误消息
 * @param {string} message - 错误消息
 */
function showTechError (message) {
  console.log('\n' + chalk.red('💥 ═══════════════════════════════════════ 💥'))
  console.log(chalk.red(`   ❌ ${message} ❌`))
  console.log(chalk.red('💥 ═══════════════════════════════════════ 💥\n'))
}

module.exports = {
  createModernProgressBar,
  createTechMultiStageProgress,
  createTechSpinner,
  showTechSuccess,
  showTechError,
  TECH_GRADIENTS,
  TECH_ICONS
}
