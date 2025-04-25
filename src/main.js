import Vue from 'vue'
// import '@/utils/initialize'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import { Skeleton } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/permission' // permission control

// 注册 Element UI
Vue.use(ElementUI)
// 确保 Skeleton 组件被正确注册
Vue.use(Skeleton)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
