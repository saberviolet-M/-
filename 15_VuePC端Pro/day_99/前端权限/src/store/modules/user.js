import { reqGetInfo, reqLogin, reqGetUserDetailById } from '@/api/user'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { resetRouter } from '@/router'
const state = {
  token: getToken() || null,
  userInfo: {}
}

const mutations = {
  setToken(state, newToken) {
    state.token = newToken
    setToken(newToken)
  },
  setUserInfo(state, newUserInfo) {
    state.userInfo = newUserInfo
  },
  removeUserInfo(state) {
    state.userInfo = {}
  },
  removeToken(state) {
    state.token = null
    removeToken()
  }
}

const actions = {
  login(context, data) {
    return new Promise((resolve, reject) => {
      reqLogin(data).then(value => {
        const newToken = value.data
        context.commit('setToken', newToken)
        resolve(value)
      }).catch(error => {
        reject(error)
      })
    })
  },
  async getUserInfo(context) {
    const { data: res } = await reqGetInfo()
    const { data: res2 } = await reqGetUserDetailById(res.userId)
    const baseResult = {
      ...res,
      ...res2
    }
    console.log(baseResult)
    context.commit('setUserInfo', baseResult)
    return baseResult
  },
  logout(context) {
    context.commit('removeUserInfo')
    context.commit('removeToken')
    resetRouter()
    context.commit('permission/setRoutes', [], { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
