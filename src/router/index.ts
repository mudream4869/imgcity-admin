import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import AppConfig from '../views/AppConfig.vue'
import BlogEdit from '../views/BlogEdit.vue'
import BlogList from '../views/BlogList.vue'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/config/',
    name: 'Config',
    component: AppConfig
  },
  {
    path: '/blog/',
    name: 'BlogList',
    component: BlogList
  },
  {
    path: '/blog/:year/:month/:day/:filename',
    name: 'BlogEdit',
    component: BlogEdit
  }
]

const router = new VueRouter({
  routes
})

export default router
