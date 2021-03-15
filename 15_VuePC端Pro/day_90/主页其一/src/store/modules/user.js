import { reqGetInfo, reqLogin } from '@/api/user'
import { getToken, setToken } from '@/utils/auth'
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
    const res = await reqGetInfo()
    context.commit('setUserInfo', res.data)
    return res.data
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
