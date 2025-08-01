/**
 * Build Deploy Tools 配置示例
 *
 * 这是一个示例配置文件，展示如何在项目中使用 build-deploy-tools
 * 可以复制此文件到你的项目根目录并根据需要修改
 *
 * 重要提醒 (v1.2.1+)：
 * 插件具备智能脚本检测功能，只在特定npm脚本中执行：
 * - 脚本名包含 'build-copy' 或 'deploy'
 * - 建议的scripts配置：
 *   "deploy": "npm run build && build-copy --auto"
 *   "deploy-commit": "npm run build && build-copy --auto --commit"
 */

const { BuildDeployTools } = require('build-deploy-tools')

// 基本配置
const config = {
  // 源目录（构建输出目录）
  sourceDir: './dist',

  // 目标父目录（部署目录）
  targetParentDir: 'D:/Work/Vue3/myproject',

  // 构建文件名（可选，默认为 'vam3'）
  fileName: 'myapp',

  // 工具配置
  toolOptions: {
    maxRetries: 3, // 最大重试次数
    retryDelay: 2000, // 重试延迟(毫秒)
    defaultFileName: 'myapp'
  }
}

// 创建工具实例
const tools = new BuildDeployTools(config.toolOptions)

/**
 * 主部署函数
 */
async function deploy () {
  try {
    console.log('🚀 开始部署...')

    // 执行构建复制
    await tools.executeBuildCopy({
      sourceDir: config.sourceDir,
      targetParentDir: config.targetParentDir,
      fileName: config.fileName,
      autoCommit: false // 手动确认提交
    })

    console.log('✅ 部署完成！')
  } catch (error) {
    console.error('❌ 部署失败:', error.message)
    process.exit(1)
  }
}

/**
 * 自动部署函数（用于 CI/CD）
 */
async function autoDeploy () {
  try {
    console.log('🤖 自动部署模式...')

    // 设置环境变量启用自动模式
    process.env.CI = 'true'

    await tools.executeBuildCopy({
      sourceDir: config.sourceDir,
      targetParentDir: config.targetParentDir,
      fileName: config.fileName,
      autoCommit: true // 自动提交
    })

    console.log('✅ 自动部署完成！')
  } catch (error) {
    console.error('❌ 自动部署失败:', error.message)
    process.exit(1)
  }
}

// 根据命令行参数选择执行模式
const args = process.argv.slice(2)
if (args.includes('--auto')) {
  autoDeploy()
} else {
  deploy()
}

/**
 * 脚本检测函数（v1.2.1+）
 * 只在特定npm脚本中执行部署插件
 */
function shouldExecuteDeployPlugin () {
  const scriptName = process.env.npm_lifecycle_event || ''
  const scriptCommand = process.env.npm_lifecycle_script || ''

  console.log(`🔍 当前npm脚本: ${scriptName}`)
  console.log(`🔍 脚本命令: ${scriptCommand}`)

  // 满足任一条件即执行
  const shouldExecute =
    scriptName.includes('build-copy') ||
    scriptCommand.includes('build-copy') ||
    scriptName.includes('deploy')

  console.log(`🔍 是否执行部署插件: ${shouldExecute}`)
  return shouldExecute
}

/**
 * Vue.js (Webpack) 集成示例
 * 在 vue.config.js 中使用
 */
const vueWebpackConfig = {
  configureWebpack: {
    plugins: [
      // 只在生产环境且特定脚本中执行部署插件
      process.env.NODE_ENV === 'production' && shouldExecuteDeployPlugin()
        ? {
            apply: compiler => {
              compiler.hooks.done.tapAsync(
                'BuildDeployPlugin',
                async (stats, callback) => {
                  try {
                    console.log('📦 Webpack构建完成，开始执行文件复制...')

                    // 检查构建是否成功
                    if (stats.hasErrors()) {
                      console.error('❌ 构建有错误，跳过文件复制')
                      callback()
                      return
                    }

                    // 执行文件复制操作
                    await tools.executeBuildCopy({
                      sourceDir: config.sourceDir,
                      targetParentDir: config.targetParentDir,
                      fileName: config.fileName,
                      autoCommit: process.env.AUTO_COMMIT === 'true'
                    })

                    console.log('✅ 文件复制完成')
                    callback()
                  } catch (error) {
                    console.error('❌ 文件复制失败:', error)
                    callback(error)
                  }
                }
              )
            }
          }
        : null
    ].filter(Boolean) // 过滤掉null值
  }
}

/**
 * Vite 集成示例
 * 在 vite.config.js 中使用
 */
const viteConfig = {
  plugins: [
    // 部署插件 - 只在包含build-copy的脚本中执行
    shouldExecuteDeployPlugin() && {
      name: 'build-deploy-plugin',
      enforce: 'post', // 确保在最后执行

      // Vite 构建完成钩子
      closeBundle: {
        order: 'post',
        handler: async () => {
          if (process.env.NODE_ENV === 'production') {
            console.log('📦 Vite构建完成，开始执行文件复制...')

            try {
              await tools.executeBuildCopy({
                sourceDir: config.sourceDir,
                targetParentDir: config.targetParentDir,
                fileName: config.fileName,
                autoCommit: process.env.AUTO_COMMIT === 'true'
              })

              console.log('✅ Vite项目部署完成')
            } catch (error) {
              console.error('❌ 部署失败:', error.message)

              // 在CI环境中抛出错误
              if (process.env.CI) {
                throw error
              }
            }
          }
        }
      }
    }
  ].filter(Boolean) // 过滤掉false值
}

// 导出配置供其他脚本使用
module.exports = {
  config,
  tools,
  deploy,
  autoDeploy,
  shouldExecuteDeployPlugin,
  vueWebpackConfig,
  viteConfig
}
