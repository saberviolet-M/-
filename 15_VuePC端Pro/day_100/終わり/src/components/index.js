// 该文件负责所有的公共组件的全局注册
// vue插件机制: Vue.use
import PageTools from './PageTools'
import UploadExcel from './UploadExcel'
import ImageUpload from './ImageUpload'
import ScreenFull from './ScreenFull'
import ThemePicker from './ThemePicker'
import Lang from './Lang'
import TagsView from './TagsView'

const componentsPoll = [
  PageTools,
  UploadExcel,
  ImageUpload,
  ScreenFull,
  ThemePicker,
  Lang,
  TagsView
]

export default {
  install(Vue) {
    componentsPoll.forEach(component => {
      Vue.component(component.name, component)
    })
  }
}
