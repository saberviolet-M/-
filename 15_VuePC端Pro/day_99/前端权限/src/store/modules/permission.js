import { constantRoutes, asyncRoutes } from '@/router'

const state = {
  routes: constantRoutes
}
const mutations = {
  setRoutes(state, otherRoutes) {
    state.routes = [
      ...state.routes,
      ...otherRoutes,
      { path: '*', redirect: '/404', hidden: true }
    ]
  }
}
const actions = {
  filterRoutes(context, menus) {
    const otherRoutes = asyncRoutes.filter(item => menus.includes(item.children[0].name))
    context.commit('setRoutes', otherRoutes)
    return otherRoutes
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
