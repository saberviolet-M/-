import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import http from './utils/http'
import 'amfe-flexible'
import '@/utils/vant-ui.js'
import '@/styles/index.scss'
import { getRelativeTime } from '@/utils/date-time'

Vue.filter('relative', getRelativeTime)
const bus = new Vue()
Vue.prototype.$bus = bus
Vue.prototype.$http = http

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
