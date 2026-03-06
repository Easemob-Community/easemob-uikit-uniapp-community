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
      // 优先从 groupMap 获取
      if (state.groupMap[id]) {
        return state.groupMap[id]
      }
      // 从 groupList 中查找（兼容 groupId/groupid）
      return state.groupList.find(g => 
        (g.groupId === id) || (g.groupid === id)
      ) || null
    },
    
    // 获取群组名称
    getGroupName: state => id => {
      // 优先从 groupMap 获取
      const groupFromMap = state.groupMap[id]
      if (groupFromMap) {
        // 兼容 groupName/groupname 两种字段名
        return groupFromMap.groupName || groupFromMap.groupname || id
      }
      // 从 groupList 中查找（兼容 groupId/groupid）
      const groupFromList = state.groupList.find(g => 
        (g.groupId === id) || (g.groupid === id)
      )
      return groupFromList?.groupName || groupFromList?.groupname || id
    },
    
    // 获取群组头像
    getGroupAvatar: state => id => {
      // 优先从 groupMap 获取
      const groupFromMap = state.groupMap[id]
      if (groupFromMap) {
        // 兼容 avatar/icon 两种字段名
        return groupFromMap.avatar || groupFromMap.icon || ''
      }
      // 从 groupList 中查找
      const groupFromList = state.groupList.find(g => 
        (g.groupId === id) || (g.groupid === id)
      )
      return groupFromList?.avatar || groupFromList?.icon || ''
    }
  },

  mutations: {
    SET_GROUP_LIST(state, list) {
      state.groupList = list
      // 同时更新 groupMap（兼容 groupId/groupid 两种字段名）
      list.forEach(group => {
        const groupId = group.groupId || group.groupid
        if (groupId) {
          Vue.set(state.groupMap, groupId, group)
        }
      })
    },
    
    ADD_GROUP(state, group) {
      const groupId = group.groupId || group.groupid
      if (groupId && !state.groupMap[groupId]) {
        state.groupList.push(group)
        Vue.set(state.groupMap, groupId, group)
      }
    },
    
    REMOVE_GROUP(state, groupId) {
      const index = state.groupList.findIndex(g => 
        (g.groupId === groupId) || (g.groupid === groupId)
      )
      if (index > -1) {
        state.groupList.splice(index, 1)
      }
      Vue.delete(state.groupMap, groupId)
    },
    
    UPDATE_GROUP(state, { groupId, updates }) {
      if (state.groupMap[groupId]) {
        Vue.set(state.groupMap, groupId, { ...state.groupMap[groupId], ...updates })
      }
      // 同时更新 groupList 中的对应项
      const index = state.groupList.findIndex(g => 
        (g.groupId === groupId) || (g.groupid === groupId)
      )
      if (index > -1) {
        Vue.set(state.groupList, index, { ...state.groupList[index], ...updates })
      }
    }
  },

  actions: {
    // 获取加入的群组列表
    async getJoinedGroupList({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        const res = await chatConn.getJoinedGroups({
          pageNum: 1,
          pageSize: 500,
          needAffiliations: false,
          needRole: false
        })
        const list = res.data || []
        commit('SET_GROUP_LIST', list)
      } catch (error) {
        console.error('获取群组列表失败:', error)
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
              avatar: groupInfo.icon
            }
          })
        }
      } catch (error) {
        console.error('获取群组信息失败:', error)
      }
    },
    
    // 创建群组
    async createGroup({ rootState }, payload) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) throw new Error('未连接')

      try {
        // 兼容两种调用方式：直接传 params 或传 { data: params }
        const params = payload.data || payload
        const res = await chatConn.createGroup({ data: params })
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
