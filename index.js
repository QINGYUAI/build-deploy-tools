/**
 * Build Deploy Tools - 构建部署工具包
 * 主入口文件，导出所有核心功能模块
 *
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

// 导入核心模块
const utils = require('./lib/utils')
const notification = require('./lib/notification')
const fileOperations = require('./lib/file-operations')
const svnOperations = require('./lib/svn-operations')

/**
 * 构建复制工具类
 * 整合文件复制、SVN操作、通知等功能
 */
class BuildDeployTools {
  constructor (options = {}) {
    this.options = {
      // 默认配置
      maxRetries: 3,
      retryDelay: 2000,
      defaultFileName: 'vam3',
      // 用户配置覆盖默认配置
      ...options
    }
  }

  /**
   * 执行完整的构建复制流程
   * @param {Object} config - 配置对象
   * @param {string} config.sourceDir - 源目录
   * @param {string} config.targetParentDir - 目标父目录
   * @param {string} config.fileName - 文件名（可选）
   * @param {boolean} config.autoCommit - 是否自动提交（可选）
   * @returns {Promise<boolean>} 执行结果
   */
  async executeBuildCopy (config) {
    const {
      sourceDir,
      targetParentDir,
      fileName = this.options.defaultFileName,
      autoCommit = null
    } = config

    const path = require('path')

    // 构建完整路径
    const fullSourceDir = path.resolve(sourceDir)
    const targetDirWithFolder = path.join(
      targetParentDir,
      path.basename(fullSourceDir)
    )

    console.log(
      `📦 准备复制: ${path.basename(fullSourceDir)} → ${targetParentDir}`
    )

    // 检查源目录是否存在
    if (!fileOperations.exists(fullSourceDir)) {
      const errorMsg = `源目录不存在: ${fullSourceDir}`
      console.error(`❌ ${errorMsg}`)
      await notification.notify('错误', '请先执行构建命令', {
        sound: true,
        timeout: 10
      })
      throw new Error(errorMsg)
    }

    return await utils.retryOperation(
      async () => {
        // 1. 确保目标父目录存在
        await fileOperations.ensureDirectory(targetParentDir)

        // 2. 检查是否为SVN工作目录
        const isSvnDir = await svnOperations.isSvnWorkingDirectory(
          targetParentDir
        )
        if (isSvnDir) {
          // 3. 更新SVN仓库
          await svnOperations.executeSvnUpdate(targetParentDir)
        }

        // 4. 处理已存在的文件夹
        if (fileOperations.exists(targetDirWithFolder)) {
          if (isSvnDir) {
            await svnOperations.executeSvnDelete(targetDirWithFolder)
          } else {
            await fileOperations.deleteDirectoryWithRetry(targetDirWithFolder)
          }
        }

        // 5. 复制文件夹
        await fileOperations.copyDirectoryWithRetry(
          fullSourceDir,
          targetDirWithFolder
        )

        // 6. SVN操作（如果是SVN目录）
        if (isSvnDir) {
          const autoConfig = utils.getAutoConfig()
          const shouldCommit =
            autoCommit !== null
              ? autoCommit
              : await notification.confirmAction(
                  '是否提交到SVN？',
                  autoConfig.autoCommit
                )

          if (shouldCommit) {
            await svnOperations.commitToSvnWithRetry(
              targetDirWithFolder,
              targetParentDir
            )
            await notification.notify('完成', '文件已成功复制并提交到SVN', {
              sound: true,
              timeout: 8
            })
          } else {
            await notification.notify('完成', '文件已复制，未提交到SVN', {
              sound: true,
              timeout: 8
            })
          }
        } else {
          await notification.notify('完成', '文件已成功复制', {
            sound: true,
            timeout: 8
          })
        }

        console.log(`🎉 操作完成！`)
        return true
      },
      this.options.maxRetries,
      this.options.retryDelay,
      '整个构建复制流程'
    )
  }

  /**
   * 测试通知功能
   * @returns {Promise<boolean>} 测试结果
   */
  async testNotification () {
    console.log('🚀 开始测试通知确认功能...\n')

    const autoConfig = utils.getAutoConfig()

    // 显示当前配置
    console.log(`📋 测试配置:`)
    console.log(
      `   - 自动模式: ${autoConfig.isAutoMode ? '✅ 启用' : '❌ 禁用'}`
    )
    console.log(
      `   - 自动提交: ${autoConfig.autoCommit ? '✅ 启用' : '❌ 禁用'}`
    )
    console.log(
      `   - 使用通知: ${autoConfig.useNotification ? '✅ 启用' : '❌ 禁用'}\n`
    )

    // 测试1：基本通知
    console.log('测试1: 基本通知')
    await notification.notify('测试', '这是一个测试通知', {
      sound: true,
      timeout: 3
    })

    // 等待一段时间
    await utils.delay(1000)

    // 测试2：确认对话框（默认值为false）
    console.log('\n测试2: 确认对话框（默认取消）')
    try {
      const result = await notification.confirmAction(
        '是否继续执行测试？',
        false
      )
      console.log(`确认结果: ${result ? '✅ 确认' : '❌ 取消'}`)

      if (result || autoConfig.isAutoMode) {
        // 测试3：另一个确认对话框（默认值为true）
        console.log('\n测试3: 确认对话框（默认确认）')
        const result2 = await notification.confirmAction(
          '是否要显示完成通知？',
          true
        )
        console.log(`确认结果: ${result2 ? '✅ 确认' : '❌ 取消'}`)

        if (result2) {
          await notification.notify('完成', '测试已完成！', {
            sound: true,
            timeout: 8
          })
        }
      } else {
        console.log('\n⏭️  跳过后续测试')
      }
    } catch (error) {
      console.error('测试失败:', error.message)
      return false
    }

    console.log('\n🎉 测试完成！')
    return true
  }
}

// 导出主类和所有模块
module.exports = {
  BuildDeployTools,
  utils,
  notification,
  fileOperations,
  svnOperations,

  // 便利方法 - 直接创建实例
  create: options => new BuildDeployTools(options),

  // 版本信息
  version: require('./package.json').version
}
