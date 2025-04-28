import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
import axios from 'axios'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    menuList: [],
    userId: '',
    role: '',
    healthData: null,     // 用户健康数据
    healthModel: null,    // AI生成的健康模型
    healthSuggestions: {} // 针对不同页面的健康建议
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_MENU_LIST:(state, menuList) => {
    state.menuList = menuList
  },
  SET_USER_ID:(state, userId) => {
    state.userId = userId
  },
  SET_ROLE: (state, role) => {
    state.role = role
  },
  SET_HEALTH_DATA:(state, healthData) => {
    state.healthData = healthData
  },
  SET_HEALTH_MODEL:(state, healthModel) => {
    state.healthModel = healthModel
  },
  SET_HEALTH_SUGGESTION:(state, { page, suggestion }) => {
    state.healthSuggestions[page] = suggestion
  }
}

const actions = {
  // user login
  login({ commit, dispatch }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        
        // 登录后获取健康数据并生成模型
        dispatch('fetchHealthDataAndGenerateModel')
        
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { name, avatar, menuList, userId, role } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_MENU_LIST', menuList)
        commit('SET_USER_ID', userId)
        commit('SET_ROLE', role)

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户健康数据并生成健康模型
  fetchHealthDataAndGenerateModel({ commit, state, dispatch }) {
    if (!state.userId) return Promise.reject('用户ID不存在')
    
    return new Promise((resolve, reject) => {
      // 获取用户健康数据
      axios.get(`/api/healthData/${state.userId}`).then(response => {
        const healthData = response.data
        commit('SET_HEALTH_DATA', healthData)
        
        // 生成AI健康模型
        return dispatch('generateHealthModel', healthData)
      }).then(() => {
        // 预先生成各页面的健康建议
        return dispatch('generatePageSuggestions')
      }).then(() => {
        resolve()
      }).catch(error => {
        console.error('获取健康数据或生成模型失败:', error)
        reject(error)
      })
    })
  },
  
  // 生成AI健康模型
  generateHealthModel({ commit, state }, healthData) {
    return new Promise((resolve, reject) => {
      const data = healthData || state.healthData
      if (!data) {
        return reject('没有健康数据可供分析')
      }
      
      // 调用AI接口生成健康模型
      axios.post('/api/generateHealthModel', {
        userId: state.userId,
        healthData: data
      }).then(response => {
        const healthModel = response.data
        commit('SET_HEALTH_MODEL', healthModel)
        resolve(healthModel)
      }).catch(error => {
        console.error('生成健康模型失败:', error)
        reject(error)
      })
    })
  },
  
  // 为特定页面生成健康建议
  generatePageSuggestion({ commit, state }, page) {
    return new Promise((resolve, reject) => {
      if (!state.healthModel) {
        return reject('没有健康模型可供分析')
      }
      
      // 调用AI接口为特定页面生成建议
      axios.post('/api/generatePageSuggestion', {
        userId: state.userId,
        healthModel: state.healthModel,
        page: page
      }).then(response => {
        const suggestion = response.data
        commit('SET_HEALTH_SUGGESTION', { page, suggestion })
        resolve(suggestion)
      }).catch(error => {
        console.error(`为页面${page}生成建议失败:`, error)
        reject(error)
      })
    })
  },
  
  // 为所有重要页面预先生成健康建议
  generatePageSuggestions({ dispatch }) {
    return Promise.all([
      dispatch('generatePageSuggestion', 'healthAssessment'),
      dispatch('generatePageSuggestion', 'diet'),
      dispatch('generatePageSuggestion', 'exercise'),
      dispatch('generatePageSuggestion', 'sleep'),
      dispatch('generatePageSuggestion', 'mentalHealth')
    ])
  },
  
  // 获取特定页面的健康建议
  getPageSuggestion({ state, dispatch }, page) {
    // 如果已有该页面建议，直接返回
    if (state.healthSuggestions[page]) {
      return Promise.resolve(state.healthSuggestions[page])
    }
    
    // 否则生成并返回
    return dispatch('generatePageSuggestion', page)
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

// 已移除过滤AI健康问答菜单的函数

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

