import { reqGetChannels, reqGetAllChannels } from '@/api/channels'
const state = {
  channels: [],
  allChannels: []
}
const mutations = {
  setChannels(state, channels) {
    state.channels = channels
  },
  setAllChannels(state, allChannels) {
    state.allChannels = allChannels
  },
  addChannel(state, channel) {
    state.channels.push(channel)
  },
  delChannel(state, channel) {
    state.channels = state.channels.filter(item => item.id !== channel.id)
  }
}
const actions = {
  async getChannelsAsync(context) {
    const {
      data: {
        data: { channels }
      }
    } = await reqGetChannels()
    context.commit('setChannels', channels)
  },
  async getAllChannelsAsync(context) {
    const {
      data: {
        data: { channels }
      }
    } = await reqGetAllChannels()
    context.commit('setAllChannels', channels)
  }
}
const getters = {
  // 可选的频道
  optionalChannels(state) {
    // 对 allChannels 中的元素进行过滤, 只保留那些没有在 channels 中出现的元素
    return state.allChannels.filter(channel => {
      const index = state.channels.findIndex(item => item.id === channel.id)
      // 如果找到了, index不是 -1, 如果找不到才是 -1 (要留下)
      return index === -1
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
