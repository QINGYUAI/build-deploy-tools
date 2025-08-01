/**
 * 测试通知确认功能
 * 用于验证新的 notifier 确认系统是否正常工作
 * 包含自动模式测试
 */

const notifier = require('node-notifier');
const readline = require('readline');

// 模拟自动化配置
const AUTO_CONFIG = {
    isAutoMode: process.argv.includes('--auto'),
    autoCommit: process.argv.includes('--commit'),
    useNotification: !process.argv.includes('--no-notification')
};

/**
 * 使用系统通知进行确认对话框（支持自动模式）
 * @param {string} message - 提示消息
 * @param {boolean} defaultValue - 自动模式下的默认值
 * @returns {Promise<boolean>} 用户确认结果
 */
async function confirmAction(message, defaultValue = false) {
    // 自动模式下直接返回默认值
    if (AUTO_CONFIG.isAutoMode) {
        console.log(`🤖 自动模式: ${message} -> ${defaultValue ? '✅ 自动确认' : '❌ 自动取消'}`);
        return defaultValue;
    }

    // 不使用通知时，直接使用命令行确认
    if (!AUTO_CONFIG.useNotification) {
        console.log(`💬 命令行模式: ${message}`);
        return await fallbackConfirmAction(message);
    }

    return new Promise((resolve) => {
        console.log(`📢 ${message}`);

        // 在支持的平台上使用交互式通知
        notifier.notify({
            title: '确认操作',
            message: message,
            sound: true,
            wait: true,
            timeout: 30, // 30秒超时
            actions: ['确认', '取消'], // 动作按钮
            closeLabel: '取消',
            reply: false
        }, (err, response, metadata) => {
            if (err) {
                console.error('通知错误:', err.message);
                // 出错时回退到命令行确认
                return fallbackConfirmAction(message).then(resolve);
            }

            console.log(`用户响应: ${response}`);
            console.log(`响应元数据:`, metadata);

            // 根据不同的响应处理结果
            if (response === 'activate' || response === 'clicked') {
                // 用户点击了通知主体，默认为确认
                resolve(true);
            } else if (response === 'timeout') {
                // 超时，默认为取消
                console.log('⏰ 操作超时，默认取消');
                resolve(false);
            } else if (response === 'dismissed') {
                // 用户主动关闭通知
                console.log('❌ 用户取消操作');
                resolve(false);
            } else {
                // 其他情况，默认为取消
                resolve(false);
            }
        });

        // 监听点击事件
        notifier.on('click', (notifierObject, options, event) => {
            console.log('✅ 用户点击确认');
            resolve(true);
        });

        // 监听超时事件
        notifier.on('timeout', (notifierObject, options) => {
            console.log('⏰ 确认超时，默认取消');
            resolve(false);
        });
    });
}

/**
 * 回退的命令行确认函数
 * @param {string} message - 提示消息
 * @returns {Promise<boolean>} 用户确认结果
 */
async function fallbackConfirmAction(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(`${message} (y/N): `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

/**
 * 显示测试通知
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {Object} options - 额外选项
 */
function notify(title, message, options = {}) {
    console.log(`${title}: ${message}`);

    const notifyOptions = {
        title: title,
        message: message,
        sound: options.sound || false,
        wait: options.wait || false,
        timeout: options.timeout || 5,
        icon: options.icon || undefined,
        ...options
    };

    notifier.notify(notifyOptions, (err, response, metadata) => {
        if (err) {
            console.error('通知发送失败:', err.message);
        } else if (response) {
            console.log(`通知响应: ${response}`);
        }
    });
}

/**
 * 主测试函数
 */
async function main() {
    console.log('🚀 开始测试通知确认功能...\n');

    // 显示当前配置
    console.log(`📋 测试配置:`);
    console.log(`   - 自动模式: ${AUTO_CONFIG.isAutoMode ? '✅ 启用' : '❌ 禁用'}`);
    console.log(`   - 自动提交: ${AUTO_CONFIG.autoCommit ? '✅ 启用' : '❌ 禁用'}`);
    console.log(`   - 使用通知: ${AUTO_CONFIG.useNotification ? '✅ 启用' : '❌ 禁用'}\n`);

    // 测试1：基本通知
    console.log('测试1: 基本通知');
    notify('测试', '这是一个测试通知', { sound: true, timeout: 3 });

    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试2：确认对话框（默认值为false）
    console.log('\n测试2: 确认对话框（默认取消）');
    try {
        const result = await confirmAction('是否继续执行测试？', false);
        console.log(`确认结果: ${result ? '✅ 确认' : '❌ 取消'}`);

        if (result || AUTO_CONFIG.isAutoMode) {
            // 测试3：另一个确认对话框（默认值为true）
            console.log('\n测试3: 确认对话框（默认确认）');
            const result2 = await confirmAction('是否要显示完成通知？', true);
            console.log(`确认结果: ${result2 ? '✅ 确认' : '❌ 取消'}`);

            if (result2) {
                notify('完成', '测试已完成！', { sound: true, timeout: 8 });
            }
        } else {
            console.log('\n⏭️  跳过后续测试');
        }
    } catch (error) {
        console.error('测试失败:', error.message);
    }

    console.log('\n🎉 测试完成！');
    console.log('\n使用说明：');
    console.log('  node scripts/test-notification.js          # 交互模式');
    console.log('  node scripts/test-notification.js --auto   # 自动模式');
    console.log('  node scripts/test-notification.js --auto --commit  # 自动模式+自动提交');
    console.log('  node scripts/test-notification.js --no-notification  # 禁用通知');
}

// 运行测试
main().catch(error => {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
});
