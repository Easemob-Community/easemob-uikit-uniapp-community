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
    
    // 获取群组名称
    getGroupName: state => id => {
      const group = state.groupMap[id]
      return group ? group.groupName : id
    },
    
    // 获取群组头像
    getGroupAvatar: state => id => {
      const group = state.groupMap[id]
      return group ? group.avatar : ''
    }
  },

  mutations: {
    SET_GROUP_LIST(state, list) {
      state.groupList = list
      // 同时更新 groupMap
      list.forEach(group => {
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
    async getJoinedGroupList({ commit, rootState }) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) return

      try {
        const res = await chatConn.getJoinedGroups()
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
    async createGroup({ rootState }, params) {
      const chatConn = rootState.conn.chatConn
      if (!chatConn) throw new Error('未连接')

      try {
        const res = await chatConn.createGroup(params)
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
