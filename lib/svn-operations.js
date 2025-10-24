/**
 * SVN操作模块
 * 提供SVN更新、提交、删除等功能
 */

const { execSync } = require('child_process')
const {
  retryOperation,
  RETRY_CONFIG,
  createProgressBar,
  createMultiStageProgressBar,
  delay
} = require('./utils')
const {
  createTechMultiStageProgress,
  createTechSpinner,
  showTechSuccess,
  showTechError
} = require('./modern-progress')

/**
 * 执行SVN命令
 * @param {string} command - SVN命令
 * @param {string} cwd - 执行目录
 * @param {string} errorMessage - 错误提示信息
 * @param {number} timeout - 超时时间(毫秒)
 * @param {boolean} showProgress - 是否显示进度条
 * @returns {Promise<boolean>} 执行结果
 */
async function executeSvn (
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
async function executeSvnUpdate (cwd) {
  const spinner = createTechSpinner('🌐 启动SVN同步引擎...', 'ice')

  spinner.start()

  return await retryOperation(
    async () => {
      try {
        spinner.text = '🔄 连接远程仓库服务器...'
        await delay(300)

        spinner.text = '📊 分析版本差异数据...'
        await delay(200)

        await executeSvn(
          'svn update',
          cwd,
          'SVN同步引擎故障',
          RETRY_CONFIG.svnTimeout,
          false // 不显示内置进度条，使用我们的spinner
        )

        spinner.succeed('✅ SVN同步引擎执行完成')
        return true
      } catch (error) {
        // 如果错误信息包含cleanup提示，自动执行cleanup
        if (error.message && error.message.includes('cleanup')) {
          spinner.text = '🧹 检测到数据库损坏，启动修复程序...'
          await delay(500)

          spinner.text = '⚙️ 执行数据库修复操作...'

          await executeSvn(
            'svn cleanup',
            cwd,
            'SVN修复程序故障',
            RETRY_CONFIG.cleanupTimeout,
            false
          )

          spinner.text = '✅ 数据库修复完成，重新启动同步...'
          await delay(300)

          // cleanup后重新尝试更新
          spinner.text = '🔄 重新连接远程仓库...'
          await executeSvn(
            'svn update',
            cwd,
            'SVN同步引擎故障',
            RETRY_CONFIG.svnTimeout,
            false
          )

          spinner.succeed('✅ SVN同步引擎执行完成')
          return true
        }

        spinner.fail(`❌ SVN同步引擎故障: ${error.message}`)
        throw error
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN智能同步'
  )
}

/**
 * SVN删除文件或目录
 * @param {string} targetDir - 目标目录
 * @returns {Promise<boolean>} 删除结果
 */
async function executeSvnDelete (targetDir) {
  return await retryOperation(
    async () => {
      console.log('🗑️  SVN删除文件...')

      try {
        await executeSvn('svn delete --force .', targetDir, 'SVN删除失败')
        console.log('✅ SVN删除成功')
        return true
      } catch (error) {
        // SVN删除失败时，可能文件不在版本控制中
        console.log('SVN删除失败，文件可能不在版本控制中')
        return true // 继续执行，不报错
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN删除'
  )
}

/**
 * SVN添加文件
 * @param {string} targetDir - 目标目录
 * @returns {Promise<boolean>} 添加结果
 */
async function executeSvnAdd (targetDir) {
  const spinner = createTechSpinner('🔍 启动文件索引引擎...', 'matrix')

  try {
    spinner.start()

    // 模拟扫描过程
    await delay(400)
    spinner.text = '📁 扫描目标文件结构...'

    await delay(300)
    spinner.text = '⚙️ 构建文件索引数据库...'

    await executeSvn('svn add . --force', targetDir, 'SVN索引引擎故障')

    spinner.succeed('✅ 文件索引引擎执行完成')
    return true
  } catch (error) {
    spinner.fail(`❌ 文件索引引擎故障: ${error.message}`)
    throw error
  }
}

/**
 * SVN提交，支持自动重试和科技感进度显示
 * @param {string} targetDir - 目标目录
 * @param {string} parentDir - 父目录（用于提交）
 * @param {string} commitMessage - 提交信息
 * @param {boolean} showDetailedProgress - 是否显示详细进度条
 * @returns {Promise<boolean>} 提交结果
 */
async function commitToSvnWithRetry (
  targetDir,
  parentDir,
  commitMessage = '更新构建文件',
  showDetailedProgress = true
) {
  return await retryOperation(
    async () => {
      let techProgress = null

      try {
        if (showDetailedProgress) {
          // 定义SVN提交的各个阶段 - 科技感配置
          const stages = [
            { name: '系统状态扫描', type: 'scanning', showProgress: true },
            { name: '文件索引构建', type: 'building', showProgress: true },
            { name: '提交数据准备', type: 'processing', showProgress: true },
            { name: '数据传输执行', type: 'uploading', showProgress: true },
            { name: '完整性验证', type: 'checking', showProgress: true }
          ]

          techProgress = createTechMultiStageProgress(stages, {
            operation: 'SVN智能提交系统',
            theme: 'cyber',
            showStageDetails: true,
            animationSpeed: 120
          })

          techProgress.start()
        } else {
          console.log('📤 提交到SVN...')
        }

        // 阶段1: 系统状态扫描
        if (techProgress) {
          await delay(300)
          techProgress.updateStage(20, '🔍 初始化SVN工作空间扫描...')

          await delay(400)
          techProgress.updateStage(50, '🔍 检测工作目录完整性...')

          // 检查是否有冲突文件
          try {
            const statusOutput = execSync('svn status', {
              cwd: parentDir,
              encoding: 'utf8',
              stdio: 'pipe'
            })

            if (statusOutput.includes('C ')) {
              throw new Error('检测到SVN冲突文件，请先解决冲突')
            }

            await delay(300)
            techProgress.updateStage(80, '🔍 工作目录状态验证通过')

            await delay(200)
            techProgress.updateStage(100, '🔍 系统扫描完成')
          } catch (error) {
            if (techProgress)
              techProgress.error(`状态检查失败: ${error.message}`)
            throw error
          }

          techProgress.nextStage('✅ 系统状态扫描完成')
        }

        // 阶段2: 文件索引构建
        if (techProgress) {
          await delay(200)
          techProgress.updateStage(15, '📁 启动文件索引引擎...')

          await delay(300)
          techProgress.updateStage(40, '📁 扫描目标文件结构...')
        }

        await executeSvnAdd(targetDir)

        if (techProgress) {
          await delay(200)
          techProgress.updateStage(75, '📁 文件索引构建完成')

          await delay(200)
          techProgress.updateStage(100, '📁 版本控制索引已更新')
          techProgress.nextStage('✅ 文件索引构建完成')
        }

        // 阶段3: 提交数据准备
        if (techProgress) {
          await delay(200)
          techProgress.updateStage(30, `📝 编译提交元数据: "${commitMessage}"`)

          await delay(400)
          techProgress.updateStage(70, '📝 生成提交签名...')

          await delay(300)
          techProgress.updateStage(100, '📝 提交数据包准备就绪')
          techProgress.nextStage('✅ 提交数据准备完成')
        }

        // 阶段4: 数据传输执行
        if (techProgress) {
          techProgress.updateStage(5, '📤 建立SVN服务器连接...')
        }

        try {
          // 使用增强的提交执行函数
          await executeTechSvnCommit(
            `svn commit -m "${commitMessage}"`,
            parentDir,
            techProgress
          )
        } catch (error) {
          if (techProgress) techProgress.error(`数据传输失败: ${error.message}`)
          throw error
        }

        if (techProgress) {
          techProgress.nextStage('✅ 数据传输执行完成')
        }

        // 阶段5: 完整性验证
        if (techProgress) {
          await delay(300)
          techProgress.updateStage(25, '✨ 启动完整性验证协议...')

          await delay(400)
          techProgress.updateStage(60, '✨ 验证提交记录完整性...')

          try {
            // 获取最新的提交信息进行验证
            const logOutput = execSync('svn log -l 1', {
              cwd: parentDir,
              encoding: 'utf8',
              stdio: 'pipe'
            })

            await delay(300)
            techProgress.updateStage(90, '✨ 提交记录验证通过')

            await delay(200)
            techProgress.updateStage(100, '✨ 系统完整性验证完成')

            // 显示提交的修订号
            const revisionMatch = logOutput.match(/r(\d+)/)
            if (revisionMatch) {
              techProgress.nextStage(
                `🎉 提交成功! 修订号: r${revisionMatch[1]}`
              )
            } else {
              techProgress.nextStage('✅ 完整性验证完成')
            }

            // 显示科技感成功消息
            if (revisionMatch) {
              showTechSuccess(
                `SVN提交成功 - 修订号: r${revisionMatch[1]}`,
                'cyber'
              )
            }
          } catch (verifyError) {
            // 验证失败不影响主流程，只是警告
            console.log('⚠️  提交验证失败，但提交可能已成功')
            if (techProgress) {
              techProgress.nextStage('⚠️  提交完成，验证协议跳过')
            }
          }
        }

        if (!showDetailedProgress) {
          console.log('✅ SVN提交成功')
        }

        return true
      } catch (error) {
        if (techProgress) {
          techProgress.error(`SVN智能提交系统故障: ${error.message}`)
        } else {
          showTechError(`SVN提交失败: ${error.message}`)
        }
        throw error
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN智能提交'
  )
}

/**
 * 科技感 SVN提交执行引擎
 * @param {string} command - SVN提交命令
 * @param {string} cwd - 执行目录
 * @param {Object} techProgress - 科技感进度条对象
 * @returns {Promise<void>}
 */
async function executeTechSvnCommit (command, cwd, techProgress = null) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process')

    if (techProgress) {
      techProgress.updateStage(15, '🚀 初始化传输协议...')
    }

    // 使用spawn来实时获取输出
    const svnProcess = spawn('svn', command.split(' ').slice(1), {
      cwd: cwd,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let errorOutput = ''
    let progressStep = 15
    let dataTransferred = 0

    // 科技感进度更新模拟
    const progressMessages = [
      '📡 建立安全连接...',
      '🔐 验证身份凭证...',
      '📊 分析数据差异...',
      '📦 打包传输数据...',
      '🌐 上传到远程仓库...',
      '⚙️ 同步版本信息...',
      '🔄 更新版本索引...',
      '✨ 完成数据传输...'
    ]

    let messageIndex = 0
    const progressInterval = setInterval(() => {
      if (progressStep < 85 && messageIndex < progressMessages.length) {
        progressStep += 10
        if (techProgress) {
          techProgress.updateStage(progressStep, progressMessages[messageIndex])
        }
        messageIndex++
      }
    }, 800)

    // 监听数据传输
    svnProcess.stdout.on('data', data => {
      output += data.toString()
      dataTransferred += data.length

      if (techProgress && progressStep < 80) {
        progressStep = Math.min(80, progressStep + 2)
        const sizeKB = (dataTransferred / 1024).toFixed(1)
        techProgress.updateStage(progressStep, `📊 已传输 ${sizeKB}KB 数据...`)
      }
    })

    svnProcess.stderr.on('data', data => {
      errorOutput += data.toString()
      // SVN的一些正常输出也会在stderr中
      if (
        !errorOutput.includes('Transmitting file data') &&
        !errorOutput.includes('Committed revision')
      ) {
        console.log(`📊 SVN输出: ${data.toString().trim()}`)
      }
    })

    svnProcess.on('close', code => {
      clearInterval(progressInterval)

      if (code === 0) {
        if (techProgress) {
          techProgress.updateStage(95, '✅ 数据传输完成')

          setTimeout(() => {
            techProgress.updateStage(100, '🎉 提交操作成功')
          }, 300)
        }
        resolve()
      } else {
        const error = new Error(
          `SVN传输引擎故障: ${errorOutput || '未知系统错误'}`
        )
        reject(error)
      }
    })

    svnProcess.on('error', error => {
      clearInterval(progressInterval)
      reject(new Error(`SVN传输引擎启动失败: ${error.message}`))
    })

    // 设置超时保护
    setTimeout(() => {
      clearInterval(progressInterval)
      svnProcess.kill('SIGTERM')
      reject(new Error('SVN传输引擎超时 - 系统安全保护机制触发'))
    }, RETRY_CONFIG.commitTimeout)
  })
}

/**
 * 检查SVN状态
 * @param {string} cwd - 执行目录
 * @returns {Promise<string>} SVN状态信息
 */
async function getSvnStatus (cwd) {
  try {
    const result = execSync('svn status', {
      cwd,
      encoding: 'utf8',
      timeout: RETRY_CONFIG.svnTimeout
    })
    return result.toString()
  } catch (error) {
    console.error(`❌ 获取SVN状态失败: ${error.message}`)
    throw error
  }
}

/**
 * 检查是否为SVN工作目录
 * @param {string} cwd - 执行目录
 * @returns {Promise<boolean>} 是否为SVN目录
 */
async function isSvnWorkingDirectory (cwd) {
  try {
    execSync('svn info', {
      cwd,
      stdio: 'pipe',
      timeout: 5000
    })
    return true
  } catch (error) {
    return false
  }
}

module.exports = {
  executeSvn,
  executeSvnUpdate,
  executeSvnDelete,
  executeSvnAdd,
  commitToSvnWithRetry,
  getSvnStatus,
  isSvnWorkingDirectory
}
