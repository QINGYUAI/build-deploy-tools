/**
 * SVN操作模块
 * 提供SVN更新、提交、删除等功能
 */

const { execSync } = require('child_process')
const { retryOperation, RETRY_CONFIG, createProgressBar } = require('./utils')

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
  try {
    console.log('📁 SVN添加文件...')
    await executeSvn('svn add . --force', targetDir, 'SVN添加失败')
    console.log('✅ SVN添加成功')
    return true
  } catch (error) {
    console.error(`❌ SVN添加失败: ${error.message}`)
    throw error
  }
}

/**
 * SVN提交，支持自动重试
 * @param {string} targetDir - 目标目录
 * @param {string} parentDir - 父目录（用于提交）
 * @param {string} commitMessage - 提交信息
 * @returns {Promise<boolean>} 提交结果
 */
async function commitToSvnWithRetry (
  targetDir,
  parentDir,
  commitMessage = '更新构建文件'
) {
  return await retryOperation(
    async () => {
      console.log('📤 提交到SVN...')

      await executeSvnAdd(targetDir)
      await executeSvn(
        `svn commit -m "${commitMessage}"`,
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
