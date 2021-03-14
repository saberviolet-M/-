import { reqLogin } from '@/api/user'
import { getToken, setToken } from '@/utils/auth'
const state = {
  token: getToken() || null
}

const mutations = {
  setToken(state, newToken) {
    state.token = newToken
    setToken(newToken)
  }
}

const actions = {
  login(context, data) {
    return new Promise((resolve, reject) => {
      reqLogin(data).then(value => {
        const newToken = value.data.data
        context.commit('setToken', newToken)
        resolve(value)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
