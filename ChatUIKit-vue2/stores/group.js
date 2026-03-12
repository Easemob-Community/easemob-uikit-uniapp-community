// 群组状态管理
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    // 群组列表
    groupList: [],
    // 群组详情映射
    groupMap: {}
  },

  getters: {
    // 获取群组列表
    getGroupList: state => state.groupList,
    
    // 根据ID获取群组
    getGroupById: state => id => {
      return state.groupMap[id] || null
    },
    
    // 获取群组名称（兼容 groupName 和 groupname）
    getGroupName: state => id => {
      const group = state.groupMap[id]
      return group ? (group.groupName || group.groupname) : id
    },
    
    // 获取群组头像
    getGroupAvatar: state => id => {
      const group = state.groupMap[id]
      return group ? group.avatar : ''
    }
  },

  mutations: {
    SET_GROUP_LIST(state, list) {
      // 统一字段名（SDK返回的是小写，转为驼峰）
      const normalizedList = list.map(group => ({
        ...group,
        groupId: group.groupId || group.groupid || group.id,
        groupName: group.groupName || group.groupname || group.name
      }))
      state.groupList = normalizedList
      // 同时更新 groupMap
      normalizedList.forEach(group => {
        Vue.set(state.groupMap, group.groupId, group)
      })
    },
    
    ADD_GROUP(state, group) {
      if (!state.groupMap[group.groupId]) {
        state.groupList.push(group)
        Vue.set(state.groupMap, group.groupId, group)
      }
    },
    
    REMOVE_GROUP(state, groupId) {
      const index = state.groupList.findIndex(g => g.groupId === groupId)
      if (index > -1) {
        state.groupList.splice(index, 1)
      }
      Vue.delete(state.groupMap, groupId)
    },
    
    UPDATE_GROUP(state, { groupId, updates }) {
      if (state.groupMap[groupId]) {
        Vue.set(state.groupMap, groupId, { ...state.groupMap[groupId], ...updates })
      }
    }
  },

  actions: {
    // 获取加入的群组列表
    async getJoinedGroupList({ commit, dispatch, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        // SDK 需要传入参数对象
        const res = await chatConn.getJoinedGroups({
          pageNum: 1,
          pageSize: 50
        })
        const list = res.data || []
        commit('SET_GROUP_LIST', list)
        
        // 为每个群组获取详细信息（包括头像）
        const groupIds = list.map(g => g.groupid || g.groupId).filter(Boolean)
        if (groupIds.length > 0) {
          console.log('[GroupStore] Fetching detailed info for groups:', groupIds)
          await dispatch('getGroupDetails', { groupIds })
        }
      } catch (error) {
        console.error('获取群组列表失败:', error)
      }
    },
    
    // 批量获取群组详情
    async getGroupDetails({ commit, rootState }, { groupIds }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn || !groupIds || groupIds.length === 0) return

      try {
        // 环信 SDK 支持传入多个 groupId 获取批量详情
        const res = await chatConn.getGroupInfo({ groupId: groupIds.join(',') })
        const groupList = res.data || []
        console.log('[GroupStore] getGroupDetails result:', groupList)
        
        groupList.forEach(groupInfo => {
          if (groupInfo.id) {
            commit('UPDATE_GROUP', {
              groupId: groupInfo.id,
              updates: {
                groupId: groupInfo.id,
                groupName: groupInfo.name,
                avatar: groupInfo.icon || groupInfo.avatar || ''
              }
            })
          }
        })
      } catch (error) {
        console.error('获取群组详情失败:', error)
      }
    },
    
    // 从服务器获取群组详情
    async getGroupInfoFromServer({ commit, rootState }, { groupId }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        const res = await chatConn.getGroupInfo({ groupId })
        const groupInfo = res.data && res.data[0]
        if (groupInfo) {
          commit('UPDATE_GROUP', { 
            groupId, 
            updates: {
              groupId: groupInfo.id,
              groupName: groupInfo.name,
              avatar: groupInfo.avatar
            }
          })
        }
      } catch (error) {
        console.error('获取群组信息失败:', error)
      }
    },
    
    // 创建群组
    async createGroup({ commit, rootState }, params) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) throw new Error('未连接')

      try {
        // 支持两种参数格式：
        // 1. { data: { groupname, members, desc, public, ... } } - 原始实现格式
        // 2. { name, description, type, members, ... } - 新格式
        const groupParams = params.data || {
          data: {
            groupname: params.name,
            desc: params.description || '',
            public: params.type === 'public',
            approval: params.needConfirm !== false,
            inviteNeedConfirm: params.needConfirm !== false,
            members: params.members || []
          }
        }
        
        const res = await chatConn.createGroup(groupParams)
        
        // 添加到本地群组列表
        const groupId = res.data?.groupid || res.data?.groupId
        if (groupId) {
          const groupName = params.data?.groupname || params.name
          const newGroup = {
            groupId: groupId,
            groupName: groupName,
            groupname: groupName,
            description: params.data?.desc || params.description,
            type: params.data?.public ? 'public' : 'private',
            avatar: params.avatar || ''
          }
          commit('ADD_GROUP', newGroup)
        }
        
        return res
      } catch (error) {
        console.error('创建群组失败:', error)
        throw error
      }
    },
    
    // 添加新群组到列表
    async addNewGroup({ commit, dispatch }, group) {
      commit('ADD_GROUP', group)
      // 获取群组详情
      if (group.groupId) {
        await dispatch('getGroupInfoFromServer', { groupId: group.groupId })
      }
    }
  }
}
