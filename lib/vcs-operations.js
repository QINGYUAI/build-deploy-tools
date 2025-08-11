/**
 * 版本控制系统操作模块
 * 提供Git和SVN的信息提取功能，用于智能提交信息
 */

const { execSync } = require('child_process')
const path = require('path')

/**
 * 检查目录是否为Git仓库
 * @param {string} cwd - 执行目录
 * @returns {boolean} 是否为Git仓库
 */
function isGitRepository (cwd) {
  try {
    execSync('git rev-parse --git-dir', {
      cwd,
      stdio: 'pipe',
      timeout: 5000
    })
    return true
  } catch (error) {
    return false
  }
}

/**
 * 检查目录是否为SVN工作目录
 * @param {string} cwd - 执行目录
 * @returns {boolean} 是否为SVN目录
 */
function isSvnRepository (cwd) {
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

/**
 * 获取Git最近一次提交信息
 * @param {string} cwd - 执行目录
 * @returns {string|null} 提交信息
 */
function getGitLastCommitMessage (cwd) {
  try {
    const result = execSync('git log -1 --pretty=format:"%s"', {
      cwd,
      encoding: 'utf8',
      timeout: 5000
    })
    return result
      .toString()
      .trim()
      .replace(/^"(.*)"$/, '$1') // 移除引号
  } catch (error) {
    console.warn(`⚠️ 获取Git提交信息失败: ${error.message}`)
    return null
  }
}

/**
 * 获取SVN最近一次提交信息
 * @param {string} cwd - 执行目录
 * @returns {string|null} 提交信息
 */
function getSvnLastCommitMessage (cwd) {
  try {
    const result = execSync('svn log -l 1 --xml', {
      cwd,
      encoding: 'utf8',
      timeout: 10000
    })

    // 解析XML获取提交信息
    const msgMatch = result.match(/<msg>(.*?)<\/msg>/s)
    if (msgMatch && msgMatch[1]) {
      return msgMatch[1].trim()
    }
    return null
  } catch (error) {
    console.warn(`⚠️ 获取SVN提交信息失败: ${error.message}`)
    return null
  }
}

/**
 * 智能获取提交信息
 * 优先级：自定义信息 > Git最近提交 > SVN最近提交 > 默认信息
 * @param {Object} options - 配置选项
 * @param {string} options.cwd - 工作目录
 * @param {string} options.customMessage - 自定义提交信息
 * @param {string} options.defaultMessage - 默认提交信息
 * @param {boolean} options.useVcsHistory - 是否使用版本控制历史
 * @returns {string} 最终的提交信息
 */
function getSmartCommitMessage (options = {}) {
  const {
    cwd = process.cwd(),
    customMessage = null,
    defaultMessage = '更新构建文件',
    useVcsHistory = true
  } = options

  // 1. 如果有自定义信息，直接使用
  if (customMessage && customMessage.trim()) {
    console.log(`📝 使用自定义提交信息: "${customMessage}"`)
    return customMessage.trim()
  }

  // 2. 如果不使用版本控制历史，返回默认信息
  if (!useVcsHistory) {
    console.log(`📝 使用默认提交信息: "${defaultMessage}"`)
    return defaultMessage
  }

  // 3. 尝试从版本控制系统获取信息
  let vcsMessage = null
  let vcsType = null

  // 检查Git仓库
  if (isGitRepository(cwd)) {
    vcsMessage = getGitLastCommitMessage(cwd)
    vcsType = 'Git'
  }
  // 如果不是Git，检查SVN
  else if (isSvnRepository(cwd)) {
    vcsMessage = getSvnLastCommitMessage(cwd)
    vcsType = 'SVN'
  }

  // 4. 根据获取结果决定最终信息
  if (vcsMessage && vcsMessage.trim()) {
    console.log(`📝 从${vcsType}获取提交信息: "${vcsMessage}"`)
    return vcsMessage.trim()
  } else {
    console.log(
      `📝 未找到${
        vcsType || '版本控制'
      }历史信息，使用默认提交信息: "${defaultMessage}"`
    )
    return defaultMessage
  }
}

/**
 * 获取版本控制系统信息
 * @param {string} cwd - 工作目录
 * @returns {Object} 版本控制信息
 */
function getVcsInfo (cwd = process.cwd()) {
  const info = {
    isGit: false,
    isSvn: false,
    type: 'none',
    lastCommitMessage: null
  }

  if (isGitRepository(cwd)) {
    info.isGit = true
    info.type = 'git'
    info.lastCommitMessage = getGitLastCommitMessage(cwd)
  } else if (isSvnRepository(cwd)) {
    info.isSvn = true
    info.type = 'svn'
    info.lastCommitMessage = getSvnLastCommitMessage(cwd)
  }

  return info
}

/**
 * 格式化提交信息（添加前缀等）
 * @param {string} message - 原始提交信息
 * @param {Object} options - 格式化选项
 * @param {string} options.prefix - 前缀
 * @param {string} options.suffix - 后缀
 * @param {boolean} options.addTimestamp - 是否添加时间戳
 * @returns {string} 格式化后的提交信息
 */
function formatCommitMessage (message, options = {}) {
  const { prefix = '', suffix = '', addTimestamp = false } = options

  let formattedMessage = message

  // 添加前缀
  if (prefix) {
    formattedMessage = `${prefix} ${formattedMessage}`
  }

  // 添加后缀
  if (suffix) {
    formattedMessage = `${formattedMessage} ${suffix}`
  }

  // 添加时间戳
  if (addTimestamp) {
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
    formattedMessage = `${formattedMessage} [${timestamp}]`
  }

  return formattedMessage
}

module.exports = {
  isGitRepository,
  isSvnRepository,
  getGitLastCommitMessage,
  getSvnLastCommitMessage,
  getSmartCommitMessage,
  getVcsInfo,
  formatCommitMessage
}
