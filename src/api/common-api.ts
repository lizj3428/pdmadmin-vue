import { get, post } from '@/utils/request'

/**
 * 通用API接口对象
 * 包含系统中通用的公共接口方法
 */
export const commonApi = {
    
    /**
     * 获取验证码
     * @returns {Promise} 返回验证码数据的Promise对象
     * @description 调用后端接口获取图形验证码或短信验证码
     * @request GET /common/captcha
     */
    getCaptcha: () => {
        // 发送GET请求获取验证码
        return get('/common/getCaptcha',{})
    },
}
