/**
 * IM 连接管理 Store
 * 原 MobX 类：ConnStore
 * 
 * 重构优化：
 * 1. 简化连接实例管理
 * 2. 提供类型安全的连接访问
 */

import { defineStore } from 'pinia'
import type { Chat } from '../types/index'
import { chatSDK } from '../sdk'
import { logger } from '../log'

interface ConnState {
  /** IM SDK 连接实例 */
  conn: Chat.Connection | null
}

export const useConnStore = defineStore('conn', {
  state: (): ConnState => ({
    conn: null
  }),

  getters: {
    /**
     * 获取 IM 连接实例
     */
    getChatConn: (state): Chat.Connection => {
      if (!state.conn) {
        throw new Error('[ConnStore] Chat connection not initialized')
      }
      return state.conn
    },

    /**
     * 检查是否已初始化
     */
    isInitialized: (state) => !!state.conn
  },

  actions: {
    /**
     * 设置 IM 连接实例
     */
    setChatConn(conn: Chat.Connection) {
      logger.info('[ConnStore] Setting chat connection')
      this.conn = conn
    },

    /**
     * 初始化连接（如果未初始化）
     */
    initChatConn(options: Chat.ConnectionParameters) {
      if (this.conn) {
        logger.warn('[ConnStore] Connection already initialized')
        return this.conn
      }
      
      logger.info('[ConnStore] Initializing chat connection')
      this.conn = new chatSDK.connection(options)
      return this.conn
    },

    /**
     * 关闭连接
     */
    closeConnection() {
      if (this.conn) {
        logger.info('[ConnStore] Closing connection')
        this.conn.close()
        this.conn = null
      }
    },

    /**
     * 清空状态
     */
    clear() {
      this.conn = null
    }
  }
})
