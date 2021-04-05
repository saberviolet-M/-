import defaultSettings from '@/settings'
import Cookies from 'js-cookie'
const { showSettings, fixedHeader, sidebarLogo } = defaultSettings
const themeKey = 'theme_token'
const themeDefaultColor = '#5485fd'

const state = {
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  theme: Cookies.get(themeKey) || themeDefaultColor
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
    if (key === 'theme') {
      Cookies.set(themeKey, value)
    }
  },
  resetTheme(state) {
    // 重置成默认颜色
    state.theme = themeDefaultColor
    // cookies中也要移出
    Cookies.remove(themeKey)
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

