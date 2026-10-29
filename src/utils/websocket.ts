/**
 * WebSocket 客户端管理类
 *
 * 【作用】封装浏览器原生 WebSocket，让前端能"实时"收到后端推送：
 *   1. 连接时把登录 token 拼到地址后面（?pdmtoken=xxx），后端握手时校验登录态
 *   2. 每 30 秒发一次心跳 'ping'，保持连接活跃
 *   3. 断线后自动重连（指数退避），不用刷新页面重连
 *   4. 收到消息后通过回调交给页面处理（比如弹出通知）
 *
 * 用法（在布局页 Index.vue 里）：
 *   wsManager.setOnMessage((data) => { ... })
 *   wsManager.connect()
 */
import { getLocalStorage } from '@/utils/utils'
import Constants from '@/utils/constants'

class WSManager {
  private ws: WebSocket | null = null
  private timer: number | null = null // 心跳定时器
  private reconnectTimer: number | null = null // 重连定时器
  private retry = 0 // 已重连次数
  private readonly maxRetry = 10
  private onMessageCallback: ((data: any) => void) | null = null

  /** 设置"收到消息时"的回调（由页面传入） */
  setOnMessage(cb: (data: any) => void) {
    this.onMessageCallback = cb
  }

  /** 建立连接 */
  connect() {
    const token = getLocalStorage(Constants.USER_TOKEN)
    if (!token) {
      return // 没登录就不连
    }
    const url = `${import.meta.env.VITE_APP_WS_URL}?pdmtoken=${token}`
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.retry = 0
      // 每 30 秒发一次心跳
      this.timer = window.setInterval(() => {
        this.send('ping')
      }, 30000)
    }

    this.ws.onmessage = (evt: MessageEvent) => {
      try {
        const data = JSON.parse(evt.data)
        this.onMessageCallback?.(data)
      } catch (e) {
        // 非 JSON（如心跳回包 pong）直接忽略
      }
    }

    this.ws.onclose = () => {
      this.clearTimer()
      this.reconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  /** 发送消息 */
  send(msg: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg)
    }
  }

  /** 关闭连接（退出登录 / 页面卸载时） */
  close() {
    this.clearTimer()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  /** 断线重连（指数退避，最多 10 次） */
  private reconnect() {
    if (this.retry >= this.maxRetry) return
    this.retry++
    const delay = Math.min(1000 * 2 ** this.retry, 10000)
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, delay)
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}

// 全局单例：整个前端共用一条 WebSocket 连接
const wsManager = new WSManager()
export default wsManager
