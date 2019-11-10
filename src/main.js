//入口文件 entry
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
//导入axios
import axios from 'axios'
//一个文件就是一个模块，模块有自己的作用域
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
//在线后台
// axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/"

//axios请求拦截器,是为了复用代码，把每个ajax都要设置的头信息提取到拦截器中（通过token拿数据）
//导航守卫是为了防止非法登录，如果没有登录就直接访问后台首页是不可以（通过token判断有没有登录，在前端js中使用
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config;
}, function (error) {
  console.log(error)
})
Vue.prototype.$http = axios
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',ZkTable)
Vue.config.productionTip = false
import './filter'

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
