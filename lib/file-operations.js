/**
 * 文件操作模块
 * 提供文件复制、删除等功能
 */

const fs = require('fs-extra')
const path = require('path')
const { retryOperation, RETRY_CONFIG } = require('./utils')

/**
 * 复制文件夹，支持自动重试
 * @param {string} sourceDir - 源目录
 * @param {string} targetDir - 目标目录
 * @returns {Promise<boolean>} 复制结果
 */
async function copyDirectoryWithRetry (sourceDir, targetDir) {
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
async function deleteDirectoryWithRetry (targetDir) {
  return await retryOperation(
    async () => {
      console.log('🗑️  删除旧文件夹...')

      // 直接删除目录
      fs.removeSync(targetDir)

      // 验证删除是否成功
      if (fs.existsSync(targetDir)) {
        throw new Error('删除后目录仍存在')
      }

      console.log('✅ 删除完成')
      return true
    },
    RETRY_CONFIG.maxRetries,
    RETRY_CONFIG.retryDelay,
    '删除旧文件'
  )
}

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 * @returns {Promise<boolean>} 操作结果
 */
async function ensureDirectory (dirPath) {
  try {
    await fs.ensureDir(dirPath)
    console.log(`✅ 目录已准备: ${dirPath}`)
    return true
  } catch (error) {
    console.error(`❌ 创建目录失败: ${error.message}`)
    throw error
  }
}

/**
 * 检查文件或目录是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否存在
 */
function exists (filePath) {
  return fs.existsSync(filePath)
}

/**
 * 获取文件统计信息
 * @param {string} filePath - 文件路径
 * @returns {Object} 文件统计信息
 */
function getStats (filePath) {
  try {
    return fs.statSync(filePath)
  } catch (error) {
    console.error(`❌ 获取文件信息失败: ${error.message}`)
    return null
  }
}

/**
 * 列出目录内容
 * @param {string} dirPath - 目录路径
 * @returns {Array} 目录内容列表
 */
function listDirectory (dirPath) {
  try {
    return fs.readdirSync(dirPath)
  } catch (error) {
    console.error(`❌ 读取目录失败: ${error.message}`)
    return []
  }
}

/**
 * 复制单个文件
 * @param {string} sourcePath - 源文件路径
 * @param {string} targetPath - 目标文件路径
 * @returns {Promise<boolean>} 复制结果
 */
async function copyFile (sourcePath, targetPath) {
  try {
    await fs.copy(sourcePath, targetPath, { overwrite: true })
    console.log(`✅ 文件复制成功: ${path.basename(sourcePath)}`)
    return true
  } catch (error) {
    console.error(`❌ 文件复制失败: ${error.message}`)
    throw error
  }
}

module.exports = {
  copyDirectoryWithRetry,
  deleteDirectoryWithRetry,
  ensureDirectory,
  exists,
  getStats,
  listDirectory,
  copyFile
}
