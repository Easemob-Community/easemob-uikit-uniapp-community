/**
 * 群组管理 Store
 * 原 MobX 类：GroupStore
 * 
 * 重构优化：
 * 1. 群组信息使用对象存储，便于快速查找
 * 2. 群组列表和详细信息分离管理
 */

import { defineStore } from 'pinia'
import type { GroupNotice, GroupNoticeInfo, Chat } from '../types/index'
import { useConnStore } from './conn'
import { useAppUserStore } from './appUser'
import { logger } from '../log'

interface GroupState {
  /** 加入的群组列表 */
  groupList: Chat.GroupItem[]
  /** 群组详细信息映射 */
  groupInfoMap: Record<string, Chat.GroupDetailInfo>
  /** 群组申请通知 */
  groupNoticeInfo: GroupNoticeInfo
  /** 分页参数 */
  pageParams: { pageNum: number; pageSize: number; cursor: string }
}

export const useGroupStore = defineStore('group', {
  state: (): GroupState => ({
    groupList: [],
    groupInfoMap: {},
    groupNoticeInfo: {
      list: [],
      unReadCount: 0
    },
    pageParams: { pageNum: 1, pageSize: 20, cursor: '' }
  }),

  getters: {
    /**
     * 获取群组列表
     */
    getGroupList: (state) => state.groupList,

    /**
     * 加入的群组列表（兼容旧接口）
     */
    joinedGroupList: (state) => state.groupList,

    /**
     * 检查是否有群组头像
     */
    isHasGroupAvatar: (state) => (groupId: string): boolean => {
      return !!state.groupInfoMap[groupId]?.avatarUrl
    },

    /**
     * 获取群组数量
     */
    getGroupCount: (state) => state.groupList.length,

    /**
     * 根据ID获取群组信息
     */
    getGroupInfoFromStore: (state) => (groupId: string): Chat.GroupDetailInfo | undefined => {
      return state.groupInfoMap[groupId]
    },

    /**
     * 获取群组头像
     */
    getGroupAvatar: (state) => (groupId: string): string => {
      // 优先从 groupInfoMap 获取，支持驼峰和下划线字段
      const groupInfo = state.groupInfoMap[groupId]
      if (groupInfo) {
        return groupInfo.avatarUrl || (groupInfo as any).avatarurl || ''
      }
      // 从 groupList 中查找（兼容小写字段名）
 const groupFromList = state.groupList.find(g => g.groupId === groupId || (g as any).groupid === groupId)
      return (groupFromList as any)?.avatar || (groupFromList as any)?.avatarurl || ''
    },

    /**
     * 获取群组名称
     */
    getGroupName: (state) => (groupId: string): string => {
      // 优先从 groupInfoMap 获取
      const groupInfo = state.groupInfoMap[groupId]
      if (groupInfo?.groupName) {
        return groupInfo.groupName
      }
      // 从 groupList 中查找（兼容小写字段名 groupname）
      const groupFromList = state.groupList.find(g => g.groupId === groupId || (g as any).groupid === groupId)
      const name = (groupFromList as any)?.groupName || (groupFromList as any)?.groupname
      return name || groupId
    }
  },

  actions: {
    /**
     * 获取加入的群组列表
     */
    async getJoinedGroupList(pageNum?: number) {
      logger.info('[GroupStore] Getting joined group list')
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.getJoinedGroups({
          pageNum: pageNum || this.pageParams.pageNum,
          pageSize: this.pageParams.pageSize
        })

        if (res.data) {
          if (pageNum && pageNum > 1) {
            // 加载更多
            this.groupList.push(...res.data)
          } else {
            this.groupList = res.data
          }
          
          // 异步获取群组详情（过滤无效 groupId，兼容小写字段名）
          const validGroupIds = res.data.map(g => g.groupId || (g as any).groupid).filter(id => id)
          this.fetchGroupDetails(validGroupIds)
          
          logger.info('[GroupStore] Successfully got groups:', res.data.length)
        }
        return res
      } catch (error) {
        logger.error('[GroupStore] Failed to get groups:', error)
        throw error
      }
    },

    /**
     * 获取群组详情
     */
    async fetchGroupDetails(groupIds: string[]) {
      if (groupIds.length === 0) return
      
      // 过滤已缓存的和无效的
      const needFetch = groupIds.filter(id => id && !this.groupInfoMap[id])
      if (needFetch.length === 0) return

      logger.info('[GroupStore] Fetching group details:', needFetch)

      try {
        const connStore = useConnStore()
        // 分批获取，每批 20 个
        const batchSize = 20
        for (let i = 0; i < needFetch.length; i += batchSize) {
          const batch = needFetch.slice(i, i + batchSize)
          const promises = batch.map(groupId => 
            connStore.getChatConn.getGroupInfo({ groupId })
              .then(res => {
                if (res.data) {
                  this.groupInfoMap[groupId] = res.data[0]
                }
              })
              .catch(err => {
                logger.warn('[GroupStore] Failed to get group info:', groupId, err)
              })
          )
          await Promise.all(promises)
        }
      } catch (error) {
        logger.error('[GroupStore] Failed to fetch group details:', error)
      }
    },

    /**
     * 创建群组
     */
    async createGroup(params: Chat.CreateGroupParams) {
      logger.info('[GroupStore] Creating group:', params.groupname)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.createGroup(params)
        logger.info('[GroupStore] Successfully created group:', res)
        return res
      } catch (error) {
        logger.error('[GroupStore] Failed to create group:', error)
        throw error
      }
    },

    /**
     * 解散群组
     */
    async destroyGroup(groupId: string) {
      logger.info('[GroupStore] Destroying group:', groupId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.destroyGroup({ groupId })
        this.removeGroupFromList(groupId)
        delete this.groupInfoMap[groupId]
        logger.info('[GroupStore] Successfully destroyed group:', groupId)
        return res
      } catch (error) {
        logger.error('[GroupStore] Failed to destroy group:', error)
        throw error
      }
    },

    /**
     * 退出群组
     */
    async leaveGroup(groupId: string) {
      logger.info('[GroupStore] Leaving group:', groupId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.leaveGroup({ groupId })
        this.removeGroupFromList(groupId)
        delete this.groupInfoMap[groupId]
        logger.info('[GroupStore] Successfully left group:', groupId)
        return res
      } catch (error) {
        logger.error('[GroupStore] Failed to leave group:', error)
        throw error
      }
    },

    /**
     * 从列表中移除群组
     */
    removeGroupFromList(groupId: string) {
      const index = this.groupList.findIndex(g => g.groupId === groupId || (g as any).groupid === groupId)
      if (index > -1) {
        this.groupList.splice(index, 1)
      }
    },

    /**
     * 添加新群组到列表并获取详情
     */
    async addNewGroup(group: { groupid?: string; groupId?: string; groupname?: string; groupName?: string }) {
      const groupId = group.groupId || group.groupid
      const groupName = group.groupName || group.groupname
      
      if (!groupId) return
      
      logger.info('[GroupStore] Adding new group to list:', groupId)
      
      // 检查是否已存在
      const exists = this.groupList.some(g => 
        g.groupId === groupId || (g as any).groupid === groupId
      )
      
      if (!exists) {
        // 添加到列表（兼容两种字段名格式）
        this.groupList.push({
          groupId,
          groupid: groupId,
          groupName: groupName || groupId,
          groupname: groupName || groupId
        } as any)
      }
      
      // 获取群组详情
      try {
        await this.fetchGroupDetails([groupId])
      } catch (error) {
        logger.error('[GroupStore] Failed to fetch new group details:', error)
      }
    },

    /**
     * 申请加入群组
     */
    async joinGroup(groupId: string, message?: string) {
      logger.info('[GroupStore] Joining group:', groupId)
      
      try {
        const connStore = useConnStore()
        const res = await connStore.getChatConn.joinGroup({
          groupId,
          message: message || '申请加入群组'
        })
        logger.info('[GroupStore] Successfully joined group:', groupId)
        return res
      } catch (error) {
        logger.error('[GroupStore] Failed to join group:', error)
        throw error
      }
    },

    /**
     * 添加群组申请通知
     */
    addGroupNotice(notice: GroupNotice) {
      this.groupNoticeInfo.list.unshift(notice)
      this.groupNoticeInfo.unReadCount++
    },

    /**
     * 设置群组头像
     */
    setGroupAvatar(groupId: string, avatarUrl: string) {
      if (!this.groupInfoMap[groupId]) {
        this.groupInfoMap[groupId] = { groupId } as Chat.GroupDetailInfo
      }
      this.groupInfoMap[groupId].avatarUrl = avatarUrl
    },

    /**
     * 清空数据
     */
    clear() {
      this.groupList = []
      this.groupInfoMap = {}
      this.groupNoticeInfo = { list: [], unReadCount: 0 }
      this.pageParams = { pageNum: 1, pageSize: 20, cursor: '' }
    }
  }
})
