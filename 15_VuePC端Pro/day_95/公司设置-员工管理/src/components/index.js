// 该文件负责所有的公共组件的全局注册
// vue插件机制: Vue.use
import PageTools from './PageTools'

export default {
  install(Vue) {
    Vue.component('PageTools', PageTools)
  }
}
