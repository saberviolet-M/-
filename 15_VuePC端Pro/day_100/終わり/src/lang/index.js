import Vue from 'vue' // 引入Vue
import VueI18n from 'vue-i18n' // 引入国际化的插件包
import Cookies from 'js-cookie' // 引入cookie包
import elementEN from 'element-ui/lib/locale/lang/en' // 引入饿了么的英文包
import elementZH from 'element-ui/lib/locale/lang/zh-CN' // 引入饿了么的中文包
import customZH from './zh' // 引入自定义中文包
import customEN from './en' // 引入自定义英文包
Vue.use(VueI18n) // 全局注册国际化包

// 创建国际化插件的实例
export default new VueI18n({
  // 指定语言类型
  locale: Cookies.get('language') || 'en', // 从cookie中获取语言类型 获取不到就是中文

  // 配置的可供切换的语言列表
  messages: {
    // english 英文
    en: {
      ...elementEN, // 将饿了么的英文语言包引入
      ...customEN
    },
    // zhong 中文
    zh: {
      ...elementZH, // 将饿了么的中文语言包引入
      ...customZH
    }
  }
})
