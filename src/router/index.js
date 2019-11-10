import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
//@代表src目录
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/rights/Rights.vue'
import Roles from '@/components/rights/Roles.vue'
import Cats from '@/components/goods/Cats.vue'
import Params from "@/components/goods/Params.vue"
import Good from "@/components/goods/good.vue"
import GoodsAdd from "@/components/goods/GoodsAdd.vue"
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home,redirect:'/welcome',
  children:[
    {path:'/welcome',component:Welcome},
    {path:'/users',component:Users},
    {path:'/rights',component:Rights},
    {path:'/roles',component:Roles},
    {path:'/categories',component:Cats},
    {path:'/params',component:Params},
    {path:'/goods',component:Good},
    {path:'/goods/add',component:GoodsAdd}
  ]
}
]

const router = new VueRouter({
  routes
})
//本质就是改写了element内部的push方法
//对错误进行了捕获
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
//a路由向b路由跳转之前会执行,导航守卫控制访问权限
//to 代表将要访问的路径，
//from代表从哪个路径跳转而来
//next是一个函数，表示放行
//next()放行， next('/login)强制跳转
//导航守卫
router.beforeEach(function (to, from, next) {
  if (to.path == '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
