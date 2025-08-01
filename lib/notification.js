/**
 * 系统通知模块
 * 提供系统通知和交互式确认功能
 */

const notifier = require('node-notifier')
const readline = require('readline')
const { getAutoConfig } = require('./utils')

/**
 * 使用系统通知进行确认对话框（支持自动模式）
 * @param {string} message - 提示消息
 * @param {boolean} defaultValue - 自动模式下的默认值
 * @returns {Promise<boolean>} 用户确认结果
 */
async function confirmAction (message, defaultValue = false) {
  const AUTO_CONFIG = getAutoConfig()

  // 自动模式下直接返回默认值
  if (AUTO_CONFIG.isAutoMode) {
    console.log(
      `🤖 自动模式: ${message} -> ${
        defaultValue ? '✅ 自动确认' : '❌ 自动取消'
      }`
    )
    return defaultValue
  }

  // 不使用通知时，直接使用命令行确认
  if (!AUTO_CONFIG.useNotification) {
    console.log(`💬 命令行模式: ${message}`)
    return await fallbackConfirmAction(message)
  }

  return new Promise(resolve => {
    console.log(`📢 ${message}`)

    // 在支持的平台上使用交互式通知
    notifier.notify(
      {
        title: '确认操作',
        message: message,
        sound: true,
        wait: true,
        timeout: 30, // 30秒超时
        actions: ['确认', '取消'], // 动作按钮
        closeLabel: '取消',
        reply: false
      },
      (err, response, metadata) => {
        if (err) {
          console.error('通知错误:', err.message)
          // 出错时回退到命令行确认
          return fallbackConfirmAction(message).then(resolve)
        }

        console.log(`用户响应: ${response}`)

        // 根据不同的响应处理结果
        if (response === 'activate' || response === 'clicked') {
          // 用户点击了通知主体，默认为确认
          resolve(true)
        } else if (response === 'timeout') {
          // 超时，默认为取消
          console.log('⏰ 操作超时，默认取消')
          resolve(false)
        } else if (response === 'dismissed') {
          // 用户主动关闭通知
          console.log('❌ 用户取消操作')
          resolve(false)
        } else {
          // 其他情况，默认为取消
          resolve(false)
        }
      }
    )

    // 监听点击事件
    notifier.on('click', (notifierObject, options, event) => {
      console.log('✅ 用户点击确认')
      resolve(true)
    })

    // 监听超时事件
    notifier.on('timeout', (notifierObject, options) => {
      console.log('⏰ 确认超时，默认取消')
      resolve(false)
    })
  })
}

/**
 * 回退的命令行确认函数
 * @param {string} message - 提示消息
 * @returns {Promise<boolean>} 用户确认结果
 */
async function fallbackConfirmAction (message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * 显示系统通知（增强版）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {Object} options - 额外选项
 * @returns {Promise} 通知发送结果
 */
function notify (title, message, options = {}) {
  console.log(`${title}: ${message}`)

  const notifyOptions = {
    title: title,
    message: message,
    sound: options.sound || false,
    wait: options.wait || false,
    timeout: options.timeout || 5, // 5秒自动消失
    icon: options.icon || undefined,
    ...options
  }

  return new Promise((resolve, reject) => {
    notifier.notify(notifyOptions, (err, response, metadata) => {
      if (err) {
        console.error('通知发送失败:', err.message)
        reject(err)
      } else {
        if (response) {
          console.log(`通知响应: ${response}`)
        }
        resolve({ response, metadata })
      }
    })
  })
}

module.exports = {
  confirmAction,
  fallbackConfirmAction,
  notify
}
