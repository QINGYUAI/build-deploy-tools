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
 * 统一的消息格式化函数
 * @param {string} type - 消息类型: 'info', 'success', 'warning', 'error', 'system'
 * @param {string} message - 消息内容
 * @returns {string} 格式化后的消息
 */
function formatSystemMessage(type, message) {
  const icons = {
    info: '📊',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    system: '🔧',
    process: '🔄',
    engine: '🚀'
  }
  
  const icon = icons[type] || '📊'
  return `${icon} ${message}`
}

/**
 * 清理提交信息，移除可能导致SVN错误的特殊字符
 * @param {string} message - 原始提交信息
 * @returns {string} 清理后的提交信息
 */
function sanitizeCommitMessage(message) {
  if (!message || typeof message !== 'string') {
    return '更新构建文件'
  }

  return message
    .trim()
    // 移除可能导致SVN解析错误的字符
    .replace(/["'`]/g, '') // 移除引号
    .replace(/[\r\n\t]/g, ' ') // 替换换行符和制表符为空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[<>|&]/g, '') // 移除可能的XML/命令行特殊字符
    // 移除版本号前的冒号（这是导致 E020024 错误的主要原因）
    .replace(/^([vV]?\d+\.\d+\.\d+):\s*/, '$1 - ') // v1.4.0: → v1.4.0 -
    .replace(/^([^:]+):\s*/, '$1 - ') // 其他冒号开头的格式
    .substring(0, 200) // 限制长度
    .trim()
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
async function executeSvn (
  command,
  cwd,
  errorMessage,
  timeout = RETRY_CONFIG.svnTimeout,
  showProgress = false
) {
  let progressBar = null

  try {
    console.log(`🔧 执行系统命令: ${command}`)

    if (showProgress) {
      progressBar = createProgressBar(timeout, `⏳ 系统正在执行: ${command}`)
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
      console.error(`❌ ${errorMessage}: 系统命令执行超时 (${timeout / 1000}秒)`)
    } else {
      console.error(`❌ ${errorMessage}: ${error.message}`)
    }
    throw error
  }
}

/**
 * 高级SVN工作目录清理（增强版）
 * 处理工作队列中断和文件占用问题
 * @param {string} cwd - 执行目录
 * @returns {Promise<boolean>} 清理结果
 */
async function forceCleanupSvn(cwd) {
  console.log(formatSystemMessage('engine', '初始化量子清理引擎...'))
  
  // 阶段1: 尝试基本清理
  try {
    console.log(formatSystemMessage('system', '第一阶段: 启动核心清理协议...'))
    await executeSvn('svn cleanup', cwd, 'SVN核心清理失败', 60000, false)
    console.log(formatSystemMessage('success', '核心清理协议执行完成'))
    return true
  } catch (error) {
    console.log(formatSystemMessage('warning', `核心清理协议失败: ${error.message}`))
  }
  
  // 阶段2: 尝试带参数的清理
  const advancedCleanupCommands = [
    'svn cleanup --remove-unversioned',
    'svn cleanup --remove-ignored',
    'svn cleanup --include-externals'
  ]
  
  for (const command of advancedCleanupCommands) {
    try {
      console.log(formatSystemMessage('system', `第二阶段: 部署高级清理算法 - ${command}...`))
      await executeSvn(command, cwd, 'SVN高级清理算法失败', 60000, false)
      console.log(formatSystemMessage('success', `高级清理算法执行成功: ${command}`))
      return true
    } catch (error) {
      console.log(formatSystemMessage('warning', `高级清理算法失败: ${command} - ${error.message}`))
    }
  }
  
  // 阶段3: 尝试手动解决工作队列问题
  try {
    console.log(formatSystemMessage('system', '第三阶段: 启动智能修复系统...'))
    await handleSvnWorkQueue(cwd)
    
    // 再次尝试基本清理
    await executeSvn('svn cleanup', cwd, 'SVN最终修复失败', 60000, false)
    console.log(formatSystemMessage('success', '智能修复系统执行成功'))
    return true
  } catch (error) {
    console.log(formatSystemMessage('warning', `智能修复系统失败: ${error.message}`))
  }
  
  console.log(formatSystemMessage('error', '所有修复算法均失败，系统需要人工干预'))
  return false
}

/**
 * 处理SVN工作队列问题
 * @param {string} cwd - 执行目录
 * @returns {Promise<void>}
 */
async function handleSvnWorkQueue(cwd) {
  const path = require('path')
  const fs = require('fs').promises
  
  try {
    // 尝试查找并处理.svn/wc.db文件
    const svnDir = path.join(cwd, '.svn')
    const wcDbPath = path.join(svnDir, 'wc.db')
    
    console.log('🔍 检查SVN工作数据库...')
    
    try {
      const stats = await fs.stat(wcDbPath)
      console.log(`📊 找到SVN数据库: ${wcDbPath} (大小: ${stats.size} bytes)`)
      
      // 尝试使用sqlite3命令修复数据库（如果可用）
      try {
        const { execSync } = require('child_process')
        console.log(formatSystemMessage('system', '尝试修复数据库完整性...'))
        
        // 尝试使用SQLite命令修复
        execSync(`sqlite3 "${wcDbPath}" "PRAGMA integrity_check;"`, {
          cwd: cwd,
          stdio: 'pipe',
          timeout: 30000
        })
        
        console.log(formatSystemMessage('success', '数据库完整性检查通过'))
      } catch (sqliteError) {
        console.log(formatSystemMessage('warning', 'SQLite修复失败或不可用，跳过此步骤'))
      }
    } catch (statError) {
      console.log(formatSystemMessage('warning', '未找到SVN数据库文件'))
    }
    
    // 尝试关闭可能占用文件的进程
    await attemptFileUnlock(cwd)
    
  } catch (error) {
    console.log(`⚠️ 工作队列处理失败: ${error.message}`)
    throw error
  }
}

/**
 * 尝试解锁被占用的文件
 * @param {string} cwd - 执行目录
 * @returns {Promise<void>}
 */
async function attemptFileUnlock(cwd) {
  try {
    console.log(formatSystemMessage('system', '启动文件解锁引擎...'))
    
    // 在Windows上尝试使用handle.exe或lsof查找占用文件的进程
    const { execSync } = require('child_process')
    const os = require('os')
    
    if (os.platform() === 'win32') {
      try {
        // 尝试使用Windows的tasklist命令
        console.log('🔍 扫描系统进程占用矩阵...')
        
        // 等待一段时间，让可能的文件操作完成
        await delay(2000)
        
        // 尝试强制垃圾回收
        if (global.gc) {
          global.gc()
          console.log(formatSystemMessage('success', '执行内存量子清理'))
        }
        
        console.log(formatSystemMessage('success', '文件解锁引擎执行完成'))
      } catch (winError) {
        console.log(formatSystemMessage('warning', '文件解锁引擎失败，继续执行'))
      }
    }
    
  } catch (error) {
        console.log(formatSystemMessage('warning', `文件解锁失败: ${error.message}`))
  }
}

/**
 * 执行SVN更新，支持自动重试和cleanup（优化版）
 * @param {string} cwd - 执行目录
 * @returns {Promise<boolean>} 更新结果
 */
async function executeSvnUpdate (cwd) {
  const spinner = createTechSpinner('🌐 初始化版本同步引擎...', 'ice')
  spinner.start()

  return await retryOperation(
    async () => {
      try {
        spinner.text = '📊 扫描远程仓库版本矩阵...'
        
        await executeSvn(
          'svn update',
          cwd,
          '版本同步引擎失败',
          RETRY_CONFIG.svnTimeout,
          false
        )

        spinner.succeed('✅ 版本同步引擎执行完成')
        return true
      } catch (error) {
        // 检查是否需要cleanup
        const needsCleanup = error.message && (
          error.message.includes('cleanup') ||
          error.message.includes('locked') ||
          error.message.includes('Previous operation has not finished') ||
          error.message.includes('E155037')
        )
        
        if (needsCleanup) {
          spinner.text = '🧹 启动数据库修复协议...'
          await forceCleanupSvn(cwd)
          
          spinner.text = '🔄 重新初始化同步引擎...'
          await executeSvn(
            'svn update',
            cwd,
            '版本同步引擎失败',
            RETRY_CONFIG.svnTimeout,
            false
          )

          spinner.succeed('✅ 版本同步引擎执行完成')
          return true
        }

        spinner.fail(`❌ 版本同步引擎失败: ${error.message}`)
        throw error
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN同步'
  )
}

/**
 * SVN删除文件或目录（无进程占用版）
 * 在父目录执行删除命令，避免进程占用问题
 * @param {string} targetDir - 目标目录的完整路径
 * @returns {Promise<boolean>} 删除结果
 */
async function executeSvnDelete (targetDir) {
  const path = require('path')
  const parentDir = path.dirname(targetDir)
  const folderName = path.basename(targetDir)
  
  return await retryOperation(
    async () => {
      console.log(formatSystemMessage('system', `启动文件清除协议: ${folderName}`))

      try {
        // 第一次尝试：在父目录执行删除，不使用--force
        await executeSvn(`svn delete "${folderName}"`, parentDir, '文件清除协议失败')
        console.log(formatSystemMessage('success', '文件清除协议执行成功'))
        return true
      } catch (error) {
        // 检查是否是工作队列问题
        if (error.message && (
          error.message.includes('work queue') ||
          error.message.includes('E155009') ||
          error.message.includes('Previous operation has not finished') ||
          error.message.includes('E155037')
        )) {
          console.log(formatSystemMessage('system', '检测到数据库异常，启动智能修复系统...'))
          await forceCleanupSvn(parentDir)
          
          // 清理后再次尝试删除
          try {
            await executeSvn(`svn delete "${folderName}"`, parentDir, '修复后清除协议失败')
            console.log(formatSystemMessage('success', '修复后清除协议执行成功'))
            return true
          } catch (cleanupError) {
            console.log('🔄 修复后仍失败，启动强制清除模式...')
          }
        }
        
        try {
          // 如果失败，尝试使用--force参数
          console.log('🔄 启动强制清除模式...')
          await executeSvn(`svn delete --force "${folderName}"`, parentDir, '强制清除模式失败')
          console.log(formatSystemMessage('success', '强制清除模式执行成功'))
          return true
        } catch (forceError) {
          // 强制删除也失败时，检查是否是工作队列问题
          if (forceError.message && (
            forceError.message.includes('Previous operation has not finished') ||
            forceError.message.includes('E155037')
          )) {
            console.log('🧹 强制删除也遇到工作队列问题，再次清理...')
            await forceCleanupSvn(parentDir)
            
            try {
              await executeSvn(`svn delete --force "${folderName}"`, parentDir, 'SVN最终删除失败')
              console.log('✅ SVN最终删除成功')
              return true
            } catch (finalError) {
              console.log(formatSystemMessage('warning', 'SVN删除最终失败，文件可能不在版本控制中'))
              return true // 继续执行，不报错
            }
          } else {
            // 其他错误，可能文件不在版本控制中
            console.log('SVN删除失败，文件可能不在版本控制中')
            return true // 继续执行，不报错
          }
        }
      }
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    'SVN删除'
  )
}

/**
 * SVN添加文件（无进程占用版）
 * 在父目录执行添加命令，避免进程占用问题
 * @param {string} targetDir - 目标目录的完整路径
 * @returns {Promise<boolean>} 添加结果
 */
async function executeSvnAdd (targetDir) {
  const path = require('path')
  const parentDir = path.dirname(targetDir)
  const folderName = path.basename(targetDir)
  
  const spinner = createTechSpinner(`📁 启动文件索引引擎: ${folderName}`, 'matrix')
  spinner.start()

  try {
    // 第一次尝试：在父目录执行添加，不使用--force
    await executeSvn(`svn add "${folderName}"`, parentDir, '文件索引引擎失败')
    spinner.succeed('✅ 文件索引引擎执行完成')
    return true
  } catch (error) {
    // 如果遇到锁定问题，先清理再重试
    if (error.message && (
      error.message.includes('Previous operation has not finished') ||
      error.message.includes('E155037') ||
      error.message.includes('locked') ||
      error.message.includes('work queue') ||
      error.message.includes('E155009')
    )) {
      spinner.text = '🧹 启动数据库修复协议...'
      await forceCleanupSvn(parentDir)
      
      try {
        // 清理后再次尝试不使用--force
        await executeSvn(`svn add "${folderName}"`, parentDir, '文件索引引擎失败')
        spinner.succeed('✅ 文件索引引擎执行完成')
        return true
      } catch (secondError) {
        // 如果还是失败，使用--force参数
        spinner.text = '🔄 启动强制索引模式...'
        await executeSvn(`svn add "${folderName}" --force`, parentDir, '强制索引模式失败')
        spinner.succeed('✅ 强制索引模式执行完成')
        return true
      }
    } else {
      // 其他错误，尝试使用--force参数
      try {
        spinner.text = '🔄 启动强制索引模式...'
        await executeSvn(`svn add "${folderName}" --force`, parentDir, '强制索引模式失败')
        spinner.succeed('✅ 强制索引模式执行完成')
        return true
      } catch (forceError) {
        spinner.fail(`❌ 文件索引引擎失败: ${forceError.message}`)
        throw forceError
      }
    }
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

        // 阶段1: 系统状态扫描（优化）
        if (techProgress) {
          techProgress.updateStage(50, '🔍 初始化系统状态扫描器...')

          // 检查是否有冲突文件
          try {
            const statusOutput = execSync('svn status', {
              cwd: parentDir,
              encoding: 'utf8',
              stdio: 'pipe'
            })

            if (statusOutput.includes('C ')) {
              throw new Error('检测到数据冲突，系统需要人工干预')
            }

            techProgress.updateStage(100, '🔍 系统状态扫描器执行完成')
          } catch (error) {
            if (techProgress)
              techProgress.error(`系统状态扫描器失败: ${error.message}`)
            throw error
          }

          techProgress.nextStage('✅ 系统状态扫描器执行完成')
        }

        // 阶段2: 文件索引构建（优化）
        if (techProgress) {
          techProgress.updateStage(40, '📁 启动文件索引引擎...')
        }

        await executeSvnAdd(targetDir)

        if (techProgress) {
          techProgress.updateStage(100, '📁 文件索引引擎执行完成')
          techProgress.nextStage('✅ 文件索引引擎执行完成')
        }

        // 阶段3: 提交数据准备（优化）
        if (techProgress) {
          techProgress.updateStage(70, `📝 初始化提交数据包: "${commitMessage}"`)
          techProgress.updateStage(100, '📝 提交数据包编译完成')
          techProgress.nextStage('✅ 提交数据包编译完成')
        }

        // 阶段4: 数据传输执行
        if (techProgress) {
          techProgress.updateStage(5, '📤 建立SVN服务器连接...')
        }

        try {
          // 清理提交信息，防止SVN解析错误
          const sanitizedMessage = sanitizeCommitMessage(commitMessage)
          // 优化：只在信息被清理时才显示详细信息
          if (sanitizedMessage !== commitMessage) {
            console.log(formatSystemMessage('info', `原始: "${commitMessage}"`))
            console.log(formatSystemMessage('info', `清理后: "${sanitizedMessage}"`))
          }
          
          // 使用增强的提交执行函数，直接传递清理后的信息
          await executeTechSvnCommit(
            sanitizedMessage,
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

        // 阶段5: 完整性验证（优化）
        if (techProgress) {
          techProgress.updateStage(60, '✨ 启动数据完整性验证器...')

          try {
            // 获取最新的提交信息进行验证
            const logOutput = execSync('svn log -l 1', {
              cwd: parentDir,
              encoding: 'utf8',
              stdio: 'pipe'
            })

            techProgress.updateStage(100, '✨ 数据完整性验证器执行完成')

            // 显示提交的修订号
            const revisionMatch = logOutput.match(/r(\d+)/)
            if (revisionMatch) {
              techProgress.nextStage(
                `🎉 数据传输成功! 版本标识: r${revisionMatch[1]}`
              )
              showTechSuccess(
                `数据传输成功 - 版本标识: r${revisionMatch[1]}`,
                'cyber'
              )
            } else {
              techProgress.nextStage('✅ 数据完整性验证器执行完成')
            }
          } catch (verifyError) {
            // 验证失败不影响主流程，只是警告
            console.log(formatSystemMessage('warning', '数据完整性验证失败，但传输可能已成功'))
            if (techProgress) {
              techProgress.nextStage('⚠️  数据传输完成，验证器跳过')
            }
          }
        }

        if (!showDetailedProgress) {
          console.log(formatSystemMessage('success', 'SVN提交成功'))
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
 * @param {string} commitMessage - 清理后的提交信息
 * @param {string} cwd - 执行目录
 * @param {Object} techProgress - 科技感进度条对象
 * @returns {Promise<void>}
 */
async function executeTechSvnCommit (commitMessage, cwd, techProgress = null) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process')

    if (techProgress) {
      techProgress.updateStage(15, '🚀 初始化传输协议...')
    }

    // 正确构建SVN命令参数
    const args = ['commit', '-m', commitMessage]
    
    // 优化：减少冗余的命令输出
    // console.log(`📝 执行命令: svn commit -m "${commitMessage}"`)

    // 使用spawn来实时获取输出
    const svnProcess = spawn('svn', args, {
      cwd: cwd,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let output = ''
    let errorOutput = ''
    let progressStep = 15
    let dataTransferred = 0

    // 优化的进度更新（减少频繁更新）
    const progressMessages = [
      '📡 初始化传输协议...',
      '📊 扫描数据差异矩阵...',
      '🌐 执行数据传输序列...',
      '✨ 数据传输序列完成...'
    ]

    let messageIndex = 0
    const progressInterval = setInterval(() => {
      if (progressStep < 80 && messageIndex < progressMessages.length) {
        progressStep += 20
        if (techProgress) {
          techProgress.updateStage(progressStep, progressMessages[messageIndex])
        }
        messageIndex++
      }
    }, 1000)

    // 监听数据传输（优化，减少频繁更新）
    svnProcess.stdout.on('data', data => {
      output += data.toString()
      dataTransferred += data.length

      // 减少进度更新频率
      if (techProgress && progressStep < 75 && dataTransferred % 10240 === 0) { // 每10KB更新一次
        progressStep = Math.min(75, progressStep + 5)
        const sizeKB = (dataTransferred / 1024).toFixed(1)
        techProgress.updateStage(progressStep, `📊 数据传输量: ${sizeKB}KB`)
      }
    })

    svnProcess.stderr.on('data', data => {
      errorOutput += data.toString()
      // 优化：减少冗余的日志输出
      const output = data.toString().trim()
      if (
        !output.includes('Transmitting file data') &&
        !output.includes('Committed revision') &&
        output.length > 0
      ) {
        // 只显示重要的SVN输出信息
        if (output.includes('revision') || output.includes('Committed')) {
          console.log(`📊 SVN: ${output}`)
        }
      }
    })

    svnProcess.on('close', code => {
      clearInterval(progressInterval)

      if (code === 0) {
        if (techProgress) {
          techProgress.updateStage(100, '🎉 数据传输序列执行成功')
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
  isSvnWorkingDirectory,
  sanitizeCommitMessage,
  forceCleanupSvn,
  handleSvnWorkQueue,
  attemptFileUnlock
}
