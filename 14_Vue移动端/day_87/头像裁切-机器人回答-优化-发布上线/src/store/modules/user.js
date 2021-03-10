import { setToken, getToken, delToken } from '@/utils/storage'
const state = {
  tokenInfo: getToken()
}
const mutations = {
  setTokenInfo(state, tokenObj) {
    state.tokenInfo = tokenObj
    setToken(tokenObj)
  },
  removeTokenInfo() {
    state.tokenInfo = {}
    delToken()
  }
}
const actions = {}
const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
