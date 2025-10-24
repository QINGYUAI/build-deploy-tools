#!/usr/bin/env node

/**
 * 现代化进度条测试脚本
 * 展示科技感十足的进度条效果
 */

const {
  createModernProgressBar,
  createTechMultiStageProgress,
  createTechSpinner,
  showTechSuccess,
  showTechError,
  TECH_GRADIENTS
} = require('./lib/modern-progress')

const { delay } = require('./lib/utils')

/**
 * 测试单一进度条
 */
async function testSingleProgressBar () {
  console.log('\n🚀 测试单一进度条效果...\n')

  const progressBar = createModernProgressBar({
    title: '数据处理中',
    total: 100,
    theme: 'cyber',
    width: 50
  })

  progressBar.start(100, 0)

  for (let i = 0; i <= 100; i += 5) {
    await delay(100)
    progressBar.update(i, {
      title: `处理数据包 ${i}/100`
    })
  }

  progressBar.stop('数据处理完成')
}

/**
 * 测试多阶段进度条
 */
async function testMultiStageProgress () {
  console.log('\n🌟 测试多阶段科技感进度条...\n')

  const stages = [
    { name: '系统初始化', type: 'scanning', showProgress: true },
    { name: '数据加载', type: 'downloading', showProgress: true },
    { name: '算法处理', type: 'processing', showProgress: true },
    { name: '结果输出', type: 'uploading', showProgress: true },
    { name: '完整性验证', type: 'checking', showProgress: true }
  ]

  const techProgress = createTechMultiStageProgress(stages, {
    operation: '智能数据处理系统',
    theme: 'plasma',
    showStageDetails: true,
    animationSpeed: 100
  })

  techProgress.start()

  // 阶段1
  await delay(500)
  techProgress.updateStage(30, '🔍 扫描系统资源...')
  await delay(400)
  techProgress.updateStage(70, '🔍 检测硬件配置...')
  await delay(300)
  techProgress.updateStage(100, '🔍 系统就绪')
  techProgress.nextStage('✅ 系统初始化完成')

  // 阶段2
  await delay(300)
  techProgress.updateStage(20, '📥 连接数据源...')
  await delay(500)
  techProgress.updateStage(60, '📥 下载数据包...')
  await delay(400)
  techProgress.updateStage(100, '📥 数据加载完成')
  techProgress.nextStage('✅ 数据加载完成')

  // 阶段3
  await delay(300)
  techProgress.updateStage(25, '⚡ 启动AI算法引擎...')
  await delay(600)
  techProgress.updateStage(50, '⚡ 执行深度学习...')
  await delay(500)
  techProgress.updateStage(85, '⚡ 优化计算结果...')
  await delay(300)
  techProgress.updateStage(100, '⚡ 算法处理完成')
  techProgress.nextStage('✅ 算法处理完成')

  // 阶段4
  await delay(300)
  techProgress.updateStage(40, '📤 格式化输出数据...')
  await delay(400)
  techProgress.updateStage(80, '📤 生成报告文件...')
  await delay(300)
  techProgress.updateStage(100, '📤 结果输出完成')
  techProgress.nextStage('✅ 结果输出完成')

  // 阶段5
  await delay(300)
  techProgress.updateStage(50, '✨ 验证数据完整性...')
  await delay(400)
  techProgress.updateStage(100, '✨ 验证通过')
  techProgress.nextStage('✅ 完整性验证完成')
}

/**
 * 测试不同主题的spinner
 */
async function testSpinners () {
  console.log('\n🎨 测试不同主题的Spinner效果...\n')

  const themes = ['cyber', 'matrix', 'neon', 'plasma', 'fire', 'ice']

  for (const theme of themes) {
    const spinner = createTechSpinner(
      `正在测试 ${theme.toUpperCase()} 主题...`,
      theme
    )
    spinner.start()

    await delay(2000)

    spinner.succeed(`${theme.toUpperCase()} 主题测试完成`)
    await delay(500)
  }
}

/**
 * 测试成功和错误消息
 */
async function testMessages () {
  console.log('\n💫 测试消息显示效果...\n')

  await delay(1000)
  showTechSuccess('系统运行正常，所有模块已就绪', 'cyber')

  await delay(1000)
  showTechSuccess('数据同步完成，性能提升 300%', 'matrix')

  await delay(1000)
  showTechError('网络连接异常，正在尝试重连...')

  await delay(1000)
  showTechSuccess('连接已恢复，系统运行稳定', 'ice')
}

/**
 * 模拟SVN提交过程
 */
async function simulateSvnCommit () {
  console.log('\n🚀 模拟SVN提交过程...\n')

  const stages = [
    { name: '系统状态扫描', type: 'scanning', showProgress: true },
    { name: '文件索引构建', type: 'building', showProgress: true },
    { name: '提交数据准备', type: 'processing', showProgress: true },
    { name: '数据传输执行', type: 'uploading', showProgress: true },
    { name: '完整性验证', type: 'checking', showProgress: true }
  ]

  const techProgress = createTechMultiStageProgress(stages, {
    operation: 'SVN智能提交系统',
    theme: 'cyber',
    showStageDetails: true,
    animationSpeed: 120
  })

  techProgress.start()

  // 模拟各个阶段
  await delay(300)
  techProgress.updateStage(20, '🔍 初始化SVN工作空间扫描...')
  await delay(400)
  techProgress.updateStage(50, '🔍 检测工作目录完整性...')
  await delay(300)
  techProgress.updateStage(80, '🔍 工作目录状态验证通过')
  await delay(200)
  techProgress.updateStage(100, '🔍 系统扫描完成')
  techProgress.nextStage('✅ 系统状态扫描完成')

  await delay(200)
  techProgress.updateStage(15, '🔧 启动文件索引引擎...')
  await delay(300)
  techProgress.updateStage(40, '🔧 扫描目标文件结构...')
  await delay(400)
  techProgress.updateStage(75, '🔧 文件索引构建完成')
  await delay(200)
  techProgress.updateStage(100, '🔧 版本控制索引已更新')
  techProgress.nextStage('✅ 文件索引构建完成')

  await delay(200)
  techProgress.updateStage(30, '📝 编译提交元数据...')
  await delay(400)
  techProgress.updateStage(70, '📝 生成提交签名...')
  await delay(300)
  techProgress.updateStage(100, '📝 提交数据包准备就绪')
  techProgress.nextStage('✅ 提交数据准备完成')

  await delay(200)
  techProgress.updateStage(5, '📤 建立SVN服务器连接...')
  await delay(300)
  techProgress.updateStage(15, '🚀 初始化传输协议...')
  await delay(400)
  techProgress.updateStage(30, '🔐 验证身份凭证...')
  await delay(500)
  techProgress.updateStage(50, '📊 分析数据差异...')
  await delay(600)
  techProgress.updateStage(70, '📦 打包传输数据...')
  await delay(500)
  techProgress.updateStage(85, '🌐 上传到远程仓库...')
  await delay(400)
  techProgress.updateStage(95, '⚙️ 同步版本信息...')
  await delay(300)
  techProgress.updateStage(100, '🎉 提交操作成功')
  techProgress.nextStage('✅ 数据传输执行完成')

  await delay(300)
  techProgress.updateStage(25, '✨ 启动完整性验证协议...')
  await delay(400)
  techProgress.updateStage(60, '✨ 验证提交记录完整性...')
  await delay(300)
  techProgress.updateStage(90, '✨ 提交记录验证通过')
  await delay(200)
  techProgress.updateStage(100, '✨ 系统完整性验证完成')
  techProgress.nextStage('🎉 提交成功! 修订号: r129901')

  await delay(500)
  showTechSuccess('SVN智能提交系统执行成功 - 修订号: r129901', 'cyber')
}

/**
 * 主测试函数
 */
async function main () {
  console.log('🌟 现代化进度条系统测试开始 🌟\n')

  try {
    // 测试各种进度条效果
    await testSingleProgressBar()
    await delay(1000)

    await testSpinners()
    await delay(1000)

    await testMessages()
    await delay(1000)

    await testMultiStageProgress()
    await delay(1000)

    await simulateSvnCommit()

    console.log('\n🎊 所有测试完成! 🎊\n')
  } catch (error) {
    showTechError(`测试过程中发生错误: ${error.message}`)
    process.exit(1)
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testSingleProgressBar,
  testMultiStageProgress,
  testSpinners,
  testMessages,
  simulateSvnCommit
}
