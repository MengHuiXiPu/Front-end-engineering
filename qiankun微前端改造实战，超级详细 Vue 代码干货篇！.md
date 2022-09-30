# qiankun微前端改造实战，超级详细 Vue 代码干货篇！

# 一、代码整体思路说明

对于需要搭建微前端的小伙伴来说，qiankun应该是非常熟悉了。这里不再对qiankun做过多篇幅的基础概念介绍，只针对用qiankun里的loadmicroapp、setGlobalState等等一些特性做细致的代码讲解，如果对qiankun还是零基础可以去**官网**[4]或者去掘金搜索相关介绍文档。

上一篇我们提到，想要完成微前端改造，需要新建一个后台管理**总**系统。接下来我们把总系统称为workspace(工作总台),也在微前端里面的主应用的概念。我们要先搭建一个主应用，然后在主应用内部去加载各个子应用（也就是电话、手机等等具体的业务系统），最终结合起来形成我们一套完整的微前端体系。具体的代码思路为：

**1、主应用workspace内统一login登陆页面，所有以前的子应用剥离login登陆逻辑和登陆页签，统一从workspace入口进入系统，子应用系统通过qiankun的globalState机制，以authToken形式下发token令牌，达到一个令牌登陆所有系统的目的。**

**2、所有的子应用通过全量url形式直接提供给workspace，提供了url即可嵌入到workspace的视图页面中，做到开箱即用。**

**3、子应用和主应用的一些交互（比如由子应用发起的在主应用内的路由跳转、由子应用发起的登陆信息过期在主应用内做退出登录等）通过一套标准的通信规范文档来实现。**

# 一、搭建主应用篇

## 1、workspace底层搭建

无论是否是微应用系统，通用的后台管理类系统，绕不开的底层2大模块---路由模块(router)、数据模块(vuex)。接下来我们讲这两大模块和qiankun结合起来，从main.js开始一个个模块代码详细讲解！干货来了！

### 1、main.js改造。

由于可能会有子应用url地址动态加入，所以workspace的路由表将会变成动态路由，才能适应未来任意扩展新的子应用路由进入。此外，由于数据层面需要和子应用做交互，我们需要依赖setGlobalState做一套标准完善的数据通信机制。有了这两点考虑，我们就开始可以改造main.js了。如下

```
//main.js

// import Vue from 'vue'
// import App from './App.vue'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// import '@/styles/index.scss' // global css

// import router from './router'
// import store from './store'

// import './icons' // 自动渲染svg
import './permission' // permission control
// 初始化的时候简历通信机制 详细见下文
import { initState } from '@/initQiankunState/index.js'
// 初始化的时候将本地路由和动态路由全部合并，生成全量路由表 详细见下文
import { makeAllRouter } from '@/makeAllComponentRouter/index.js'
// workspace正式启动
console.log('workspace-start')
// 初始化qiankun
initState()
makeAllRouter()

// Vue.use(ElementUI)

// Vue.config.productionTip = false

// window.App = new Vue({
//   router,
//   store,
//   render: h => h(App)
// }).$mount('#app')

复制代码
```

第一步：全局状态globalState改造。（注意此处的全局不再是workspace全局，而是指workspace系统加上全部手机系统、电话系统等等整个系统的合集）

```
//@/initQiankunState/index.js

import { initGlobalState } from 'qiankun'
// goToRouter见下文
import { goToRouter } from './navigator.js'
// 退出登录 见下文
import { clearLogin } from '@/utils/tokenExpired.js'

export const initState = function() {
  console.log('开始初始化state')
  // allInfoJSON是从做完登陆动作从登陆login接口获取一些基本的鉴权和用户信息和菜单数据数据给到子应用
  /***
  eg: {
          'name': 'steven',
          'username': 'steven',
          'authToken': '400e4386-38f1-4d56-ab63-a9b0a2694344dc',
          'menus': [
            {
              'name': '手机业务来自子应用url',
              'id': 'sub_app',
              'url': 'http://121.5.172.29:8081/#/suborigin/suborigin'
            },
            {
              'name': '电话业务来自子应用url',
              'id': 'sub_app2',
              'url': 'http://121.5.172.29:8081/#/subattr/subattr'
            }
          ]
    }
   **/
  const allInfoJSON = window.localStorage.getItem('allUserInfo') || '{}'
  // window.actionsQiankun用来只初始化一次，防止重复初始化
  if (!window.actionsQiankun) {
    const allInfo = JSON.parse(allInfoJSON)
    // 第一次初始化globalState
    window.actionsQiankun = initGlobalState({
      authToken: allInfo.authToken, //token
      appName: '',  //子应用名称，方便应用通信知道来源
      eventType: '', //事件类型，方便区分通信是用来做什么的
      routeParams: {}, //子应用发起跳转路由请求时候需要的路由参数
      subAppOptions: {} //额外的子应用需要的自定义的一些传输参数
    })
    // 主应用监听change
    window.actionsQiankun.onGlobalStateChange((state, prev) => {
      console.log('子应用收到的全量state', state)
      // 处理路由跳转
      if (state.eventType === 'NAVIGATETO' && state.routeParams) {
        console.log('开始路由跳转', state.routeParams)
        //根据参数做响应跳转动作
        goToRouter(state)
      }
      // 处理过期
      if (state.eventType === 'TOKEN_EXPIRED') {
        console.log('登录过期')
        clearLogin()
      }
    })
  } else {
    console.log('已经初始化过state')
  }
}

复制代码
// navigator.js

import { Message } from 'element-ui'
// 子应用手动跳转路由时候需要根据子应用提供的url，动态添加到路由表
// autoFillComponent和 addAllRoutes 方法可以自动讲url转换成路由格式，具体见下文
import { autoFillComponent, addAllRoutes } from '@/makeAllComponentRouter/makeComponents.js'
import router from '@/router/index.js'
export const goToRouter = (state) => {
  if (!state.routeParams?.name) {
    Message({
      message: '缺少路由name，请联系管理员',
      type: 'error',
      duration: 3 * 1000
    })
    return
  }
  if (!state.routeParams?.url) {
    Message({
      message: '缺少路由url，请联系管理员',
      type: 'error',
      duration: 3 * 1000
    })
    return
  }
  // autoFillComponent方法可以自动讲url转换成路由格式，具体见下文
  const fullRouter = autoFillComponent(state.routeParams, true)
  const firstChild = fullRouter.children[0] || {}
  // 如果子应用提供的url有查询参数还需要，获取取query
  const queryStr = firstChild.meta?.query || ''
  const urlSearchParams = new URLSearchParams(queryStr)
  const query = Object.fromEntries(urlSearchParams.entries())
  console.log('urlquery', query)
  // 生成动态路由
  addAllRoutes([fullRouter])
  // 除了正常加入全量动态路由外，考虑到subApp给的临时路由会存在刷新页面的情况，所以需要收集上传的路由到本地，
  // 然后刷新页面初始化路由的时候再把本地临时路由加回去
  const tempRouteJson = window.localStorage.getItem('tempRouteJson')
  const tempRoute = tempRouteJson ? JSON.parse(tempRouteJson) : []
  let routeHasExist = false
  for (let index = 0; index < tempRoute.length; index++) {
    const element = tempRoute[index] || {}
    if (element.url === state.routeParams.url) {
      routeHasExist = true
      break
    }
  }
  if (!routeHasExist) {
    tempRoute.push(state.routeParams || {})
  }
  window.localStorage.setItem('tempRouteJson', JSON.stringify(tempRoute))

  router.push({
    path: firstChild.path,
    query
  })
}

复制代码
// clearLogin

import router from '@/router/index.js'
import { removeToken } from '@/utils/auth'
let disable = false
export const clearLogin = () => {
  if (!disable) {
    disable = true
    console.log('开始执行removeToken-tokenExpired')
    removeToken()
    router.push('/login')
  }
  setTimeout(() => {
    disable = false
  }, 1500)
}
复制代码
// utils/auth.js

import Cookies from 'js-cookie'

const TokenKey = 'workspace-token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  window.localStorage.removeItem('allUserInfo')
  window.localStorage.removeItem('tempRouteJson')
  console.log('localStorage has been cleared by remove token')
  return Cookies.remove(TokenKey)
}
复制代码
```

第二步：动态路由改造

```
//makeAllComponentRouter/index.js

import { autoFillComponent } from '@/makeAllComponentRouter/makeComponents.js'
import { addAllRoutes } from '@/makeAllComponentRouter/makeComponents.js'
import { resetRouter } from '@/router/index.js'
//拆分path和origin详情见下文
import { splitUrl } from '@/utils/qiankunMethods.js'
import Vuex from '@/store/index'
// 预加载提高性能
import { prefetchApps } from 'qiankun'

// 抽出所有的tree结构的最后一层动态路由，做flat处理，然后拼装成qinakun模式。
function makePathArr(menus = []) {
  const pathArrTemp = []
  // 第一层
  for (let firstIndex = 0; firstIndex < menus.length; firstIndex++) {
    const firstElement = menus[firstIndex]
    // 这里的menus是后端通过权限返回的信息，需要有全量url、唯一id和名称。
    /***
    eg: {
          'name': '电话业务来自子应用url',
          'id': 'sub_app2',
          'url': 'http://121.5.172.29:8081/#/subattr/subattr'
        }
    **/
    if (firstElement.url && firstElement.id && firstElement.name) {
      pathArrTemp.push(firstElement)
    }
  }
  return pathArrTemp
}

export const makeAllRouter = function() {
  const fullRouter = []
  const userInfo = JSON.parse(window.localStorage.getItem('allUserInfo') || '{}')
  // allInfoJSON是从做完登陆动作从登陆login接口获取一些基本的鉴权和用户信息和菜单数据数据给到子应用
  /***
  eg: {
          'name': 'steven',
          'username': 'steven',
          'authToken': '400e4386-38f1-4d56-ab63-a9b0a2694344dc',
          'menus': [
            {
              'name': '手机业务来自子应用url',
              'id': 'sub_app',
              'url': 'http://121.5.172.29:8081/#/suborigin/suborigin'
            },
            {
              'name': '电话业务来自子应用url',
              'id': 'sub_app2',
              'url': 'http://121.5.172.29:8081/#/subattr/subattr'
            }
          ]
    }
   **/
  const preLoadArr = []
  if (userInfo.menus) {
    const pathArr = makePathArr(userInfo.menus)
    console.log('pathArr:', pathArr)
    for (let index = 0; index < pathArr.length; index++) {
      // 拼接成qianku专属路由
      const element = pathArr[index]
      const fullSingleRouter = autoFillComponent(element)
      fullRouter.push(fullSingleRouter)
      //拆分path和origin详情见下文
      const pathSplit = splitUrl(element.url)
      const host = pathSplit[0]
      preLoadArr.push(host)
    }
  } else {
    console.log('未登录或者已经初始化过router')
  }
  // 除了从后端取得登录接口里的路由以外，还有存的临时路由要处理
  const tempRouteJson = window.localStorage.getItem('tempRouteJson')
  const tempRoute = tempRouteJson ? JSON.parse(tempRouteJson) : []
  if (tempRoute.length > 0) {
    for (let index = 0; index < tempRoute.length; index++) {
      const element = tempRoute[index] || {}
      const fullSingleRouter = autoFillComponent(element, true)
      fullRouter.push(fullSingleRouter)
    }
  }
  if (fullRouter.length > 0) {
    // 制造路由之前先初始化路由
    resetRouter()
    console.log('制造好的全量qiankun路由为:', fullRouter)
    // 添加到路由表
    addAllRoutes(fullRouter)
  } else {
    // console.log('开始执行removeToken-makeAllRouter')
    // removeToken()
    console.log('没有菜单')
  }

  // 开始预加载
  const preLoadArrSet = [...new Set(preLoadArr)]
  console.log(preLoadArrSet, 'preLoadArr')
  // 暂存到vuex
  Vuex.commit('permission/CHANGE_PRELOAD', preLoadArrSet)
  const qiankunConfigArr = preLoadArrSet.map((preLoad, index) => {
    return {
      name: `qiankunPreloadSubapp${index}`,
      entry: preLoad
    }
  })
  // window.hasPreloadSubApp防止重复预加载
  if (!window.hasPreloadSubApp) {
    prefetchApps(qiankunConfigArr)
    window.hasPreloadSubApp = true
  }
}
复制代码
//splitUrl

import { Message } from 'element-ui'
export const splitUrl = (url = '') => {
  try {
    const urlObj = new URL(url)
    const origin = urlObj.origin
    // 如果是hash模式
    if (urlObj.hash) {
      const hashPath = urlObj.hash.slice(1)
      // 有查询参数拆分
      if (hashPath.includes('?')) {
        // 拆分查询参数和path
        const pathAnQueryArr = hashPath.split('?')
        const hasPathOnly = pathAnQueryArr[0]
        const query = `?${pathAnQueryArr[1]}`
        return [origin, hasPathOnly, query]
      } else {
        return [origin, hashPath]
      }
    }
    if (urlObj.pathname) {
      if (urlObj.search) {
        return [origin, urlObj.pathname, urlObj.search]
      } else {
        return [origin, urlObj.pathname]
      }
    }
  } catch (error) {
    Message.error(`解析菜单url失败,非法的url为：${url}`)
    console.error(error)
    return [window.location.origin, `/unknown${Math.random() * 100}`]
  }
}
复制代码
```

接下里是最重要的部分，自动生成qiankun路由

```
// makekeAllComponentRouter/makeComponents.js

import { loadMicroApp } from 'qiankun'
import Layout from '@/components/layout'
import store from '@/store/index.js'
import router from '@/router/index.js'
import { splitUrl } from '@/utils/qiankunMethods.js'
import { getToken } from '@/utils/auth.js'
const md5 = require('md5')

export const autoFillComponent = (element = {}, isFromSubApp = false) => {
  const pathSplit = splitUrl(element.url)
  const host = pathSplit[0]
  const allPath = pathSplit[1]
  const query = pathSplit[2]
  const queryForSearch = {}
  if (query) {
    const queryOnly = query.slice(1)
    console.log(queryOnly, 'queryOnly')
    const tmpFirstArr = queryOnly.split('&')
    for (let index = 0; index < tmpFirstArr.length; index++) {
      const element = tmpFirstArr[index]
      const tmpSecondArr = element.split('=')
      const key = tmpSecondArr[0] || 'errorKey'
      const value = tmpSecondArr[1] || 'errorValue'
      queryForSearch[key] = value
    }
  }
  const splitPath = allPath.split('/')
  const firstPath = splitPath[1]
  // isFromSubApp标识从subApp传来的跳转路由方式，因为qiankun的name必须唯一，
  // 所以防止打开多个基础路由相同详情页的情况下报错(因为name相同), 需要标记id+path 作为唯一的标识。
  // md5防止出现特殊字符
  const identity = isFromSubApp ? `sub${md5(allPath)}` : element.id
  return {
    path: `/${firstPath}${identity}`,
    meta: {
      title: element.name
    },
    component: Layout,
    children: [
      {
        path: allPath,
        name: identity,
        component: {
          render: function(h) {
            return h(
              'div',
              {
                attrs: {
                  id: identity,
                  class: `full-height-and-width`
                }
              },
              [h('div', {
                attrs: {
                  class: 'full-height-and-width-spin'
                }
              }, '加载中')]
            )
          },
          name: identity,
          data() {
            return {
              loading: false,
              microApp: null,
              routePath: '',
              name: '',
              username: ''
            }
          },
          activated() {
            console.log('activated subapp')
            if (this.microApp.update) {
              this.microApp.update({
                routePath: this.routePath,
                lifeCycle: 'onactive'
              })
            }
          },
          mounted() {
            console.log(this.$el, 'curent subapp mounted')
            this.initQiankunMicroApp()
          },
          methods: {
            initQiankunMicroApp() {
              this.loading = true
              store.commit('permission/CHANGE_MOUNTED_STATUS', this.loading)
              console.log('当前qiankun容器的this.$route路由为:', this.$route)
              const entry = this.$route.meta.qiankunConfig.entry
              //   如果qiankunconfig有path就从qankun获取 如果没有去 默认的path
              this.routePath = this.$route.meta.qiankunConfig.routePath || this.$route.path
              this.microApp = loadMicroApp({
                name: identity,
                entry,
                container: `#${identity}`,
                props: {
                  routePath: this.routePath,
                  query: queryForSearch,
                  workspaceWindow: window,
                  loginInfo: {
                    platform: 'WORKSPACE',
                    type: '2',
                    authToken: getToken()
                  }
                }
              }, {
                excludeAssetFilter: url => (url.includes('baidu') || url.includes('bdimg'))
              })
              this.microApp.mountPromise.then(() => {
                this.loading = false
              }).catch((err) => {
                console.log(err, 'mount sub app fail')
              }).finally(() => {
                this.loading = false
                console.log('子应用 finally')
                store.commit('permission/CHANGE_MOUNTED_STATUS', this.loading)
              })
            }
          },
          beforeDestroy() {
            console.log('beforeDestroy')
            store.commit('permission/CHANGE_MOUNTED_STATUS', false)
            if (this.microApp) {
              this.microApp.unmount()
            }
          }
        },
        meta: {
          qiankunConfig: {
            entry: host
          },
          query,
          title: element.name,
          icon: 'form',
          activeMenu: element.activeMenu
        }
      }
    ]
  }
}
// 生成动态路由
export const addAllRoutes = (fullRouter = []) => {
  store.commit('permission/ADD_DYNAMIC_ROUTES', fullRouter)
  router.addRoutes(fullRouter)
}
复制代码
```

第三步：生层路由鉴权文件

```
// permisson.js

import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import Vuex from '@/store/index'
import { match } from 'path-to-regexp'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const rawAppendChild = HTMLHeadElement.prototype.appendChild
const rawAddEventListener = window.addEventListener
let rawAppendChildSubCopy = null
let rawAddEventListenerSubCopy = null
const whiteList = ['/login'] // no redirect whitelist
// 用来处理qiankun 从子应用跳转到主应用 无法渲染主应用css和js的bug 结束

router.beforeEach((to, from, next) => {
  // start progress bar
  NProgress.start()

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    console.log('有token')
    if (to.path === '/login') {
      console.log('path是login')
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      console.log('开始鉴权qiankun路由')
      // 获取全量动态路由
      const allRouterPathArr = Vuex.state.permission.addPaths || []
      const isChildRoute = path => allRouterPathArr.some(item => {
        const fn = match(item, { decode: decodeURIComponent })
        return !!fn(path)
      })
      console.log('开始鉴权qiankun路由结束')
      if (isChildRoute(from.path) && !isChildRoute(to.path)) {
        console.log('从子应用路由跳转到主应用路由')
        rawAppendChildSubCopy = HTMLHeadElement.prototype.appendChild
        rawAddEventListenerSubCopy = window.addEventListener
        HTMLHeadElement.prototype.appendChild = rawAppendChild
        window.addEventListener = rawAddEventListener
        console.log('qiankun整体结束')
      } else if (!isChildRoute(from.path) && isChildRoute(to.path)) {
        if (rawAppendChildSubCopy && rawAddEventListenerSubCopy) {
          HTMLHeadElement.prototype.appendChild = rawAppendChildSubCopy
          window.addEventListener = rawAddEventListenerSubCopy
        }
        console.log('qiankun整体结束')
      }
      // 用来处理qiankun 从子应用跳转到主应用 无法渲染主应用css和js的bug 结束
      next()
    }
  } else {
    /* has no token*/
    console.log('没有token')
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('在白名单')
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      console.log('不在白名单', to)
      next(`/login`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

复制代码
```

至此，我们数据模块和路由模块改造完成，接下来改造视图层面的sidebar菜单模块

### 2、视图层面的sidebar改造

```
// sidebar.vue

<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in allMenusfull" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Scrollbar } from 'element-ui'
import SidebarItem from './SidebarItem'
import { splitUrl } from '@/utils/qiankunMethods.js'
import { constantRoutes } from '@/router/index'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, elScrollbar: Scrollbar },
  data() {
    return {
      allMenusfull: []
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    activeMenu() {
      const route = this.$route
      const { path } = route
      return path
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  created() {
    // 生成动态+固定的全量菜单
    this.makeAllDynamicMenus()
    this.makeStaticRouter()
  },
  methods: {
    fullMenuInfo(element) {
      element.path = element.id
      element.meta = {
        icon: element.icon || element.privilegeIcon,
        title: element.name
      }
    },
    fullRouternfo(element) {
      // 按标准格式填充路由
      const pathSplit = splitUrl(element.url)
      const allPath = pathSplit[1]
      element.path = allPath
      element.meta = {
        title: element.name
      }
    },
    fullFisrtNoChildren(element) {
      // 按标准格式填充路由
      const pathSplit = splitUrl(element.url)
      const allPath = pathSplit[1]
      const splitPath = allPath.split('/')
      const firstPath = splitPath[1]
      element.path = `/${firstPath}${element.id}`
      element.meta = {
        title: element.name
      }
      element.children = [
        {
          path: allPath,
          name: element.id,
          meta: { title: element.name, icon: 'form' }
        }
      ]
    },
    makeAllDynamicMenus() {
      const allInfoJson = window.localStorage.getItem('allUserInfo') || '{}'
      const allUserInfo = JSON.parse(allInfoJson)
      // allInfoJSON是从做完登陆动作从登陆login接口获取一些基本的鉴权和用户信息和菜单数据数据给到子应用
      /***
          eg: {
                  'name': 'steven',
                  'username': 'steven',
                  'authToken': '400e4386-38f1-4d56-ab63-a9b0a2694344dc',
                  'menus': [
                    {
                      'name': '手机业务来自子应用url',
                      'id': 'sub_app',
                      'url': 'http://121.5.172.29:8081/#/suborigin/suborigin'
                    },
                    {
                      'name': '电话业务来自子应用url',
                      'id': 'sub_app2',
                      'url': 'http://121.5.172.29:8081/#/subattr/subattr'
                    }
                  ]
            }
       **/
      const menus = allUserInfo.menus || []
      for (let firstIndex = 0; firstIndex < menus.length; firstIndex++) {
        const firstElement = menus[firstIndex] || {}
        this.fullFisrtNoChildren(firstElement)
      }
      this.allMenusfull = menus
    },
    makeStaticRouter() {
      // copy一下 不能破坏路由原始文件
      const constantRoutesCopy = JSON.parse(JSON.stringify(constantRoutes))
      const menusNoHidden = constantRoutesCopy.filter(item => !item.hidden)
      this.allMenusfull = [...menusNoHidden, ...this.allMenusfull]
      console.log('左侧全量的菜单数据为:', this.allMenusfull)
    }
  }
}
</script>
复制代码
```

到此为止我们的主应用基本上qiankun改造完成了，接下来我们只需要在登录的时候模拟下后端返回的菜单数据即可将菜单动态渲染出来。

### 3、login登录页面对接

```
// 登录按钮点完之后
this.$refs.loginForm.validate(valid => {
    if (valid) {
      this.loading = true
      setTimeout(() => {
        const res = {
          'name': 'steven',
          'username': 'steven',
          'authToken': '400e4386-38f1-4d56-ab63-a9b0a2694344dc',
          'menus': [
            {
              'name': '手机业务来自子应用url',
              'id': 'sub_app',
              'url': 'http://121.5.172.29:8081/#/suborigin/suborigin'
            },
            {
              'name': '电话业务来自子应用url',
              'id': 'sub_app2',
              'url': 'http://121.5.172.29:8081/#/subattr/subattr'
            }
          ]
        }
        const result = res
        window.localStorage.setItem('allUserInfo', JSON.stringify(result))
        // 初始化乾坤状态
        initState()
        // initState之后 window.actionsQiankun一定是存在的 可以放心变更token
        window.actionsQiankun.setGlobalState({
          authToken: result.authToken,
          appName: 'WORKSPACE',
          eventType: 'SET_TOKEN'
        })
        // 初始化路由 用于退出之后生成新的路由
        makeAllRouter()
        setToken(result.authToken)
        this.$router.push({
          name: 'Dashboard'
        })
        this.loading = false
      }, 1000)
    } else {
      console.log('error submit!!')
      return false
    }
})
复制代码
```

到此为止我们的主应用基本改造完毕，可以看到上面代码中ttp://121.5.172.29:8081/#/subattr/subattr链接已经可以在视图层直接打开了，和后端微服务openapi方式颇为类似。可以直接对接url了！

接下来我们开始改造121.5.172.29:8081上的子应用，子应用改造完成之后，我们就正式大功告成！

# 二、搭建子应用篇

子应用搭建相对比较简单，只需要按照qiankun和主应用要求的格式，改造main和基本的打包配置vue.config.js即可。接下来开始还是一步步实战

### step.1

在webpack入口文件(main.js)中的第一行加入动态publiPath。（推荐使用public-path文件引入）

```
//public-path.js

if (window.__POWERED_BY_QIANKUN__) {
 //window.__POWERED_BY_QIANKUN__ 是qiankun注入的动态publicPath路径
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
复制代码
//main.js

import './public-path.js'
import Vue from 'vue'
//...其他初始化代码 注意public-path 一定是在第一行
复制代码
```

### step.2

a.更改vue-cli脚手架的config，合并css，可解决qiankun切换模块css样式造成的闪烁，并且可以提高子应用加载性能。（非vue-cli项目需独立配置webpack）

b.提供output,将生命周期钩子函数导出供qiankun调用

```
//vue.config.js

const { name } = require('./package')
function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer)
  } else if (m.name) {
    return m.name
  } else {
    return false
  }
}

module.exports = {
 configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`
    }
  },
 chainWebpack: config => {
    // 合并css
    const splitOptions = config.optimization.get('splitChunks')
    // 这里的 appStyles 中的 app 是入口文件的配置名称(从 vue inspect 中可以得到)
    splitOptions.cacheGroups.appStyles = {
      name: 'styles',
      test: (m, c, entry = 'app') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
      chunks: 'all',
      minChunks: 1,
      enforce: true
    }
    config.optimization.splitChunks(splitOptions)

    // 子应用需要取消预加载
    config.plugins.delete('prefetch-index')
    config.plugins.delete('preload-index')
  }
}
复制代码
```

### step.3

a. 注册全局通信模块globalState

b. main.js入口文件做qiankun注入对接处理

```
//actions.js

function emptyAction() {
  // 提示当前使用的是空 Action
  console.warn('Current execute action is empty!')
}

class Actions {
    // 默认值为空 Action
    actions = {
      onGlobalStateChange: emptyAction,
      setGlobalState: emptyAction
    };

    /**
     * 设置 actions
     */
    setActions(actions) {
      this.actions = actions
    }

    /**
     * 映射
     */
    onGlobalStateChange(...args) {
      return this.actions.onGlobalStateChange(...args)
    }

    /**
     * 映射
     */
    setGlobalState(...args) {
      return this.actions.setGlobalState(...args)
    }
}

const actions = new Actions()
export default actions
复制代码
import './public-path.js'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
import '@/styles/index.scss' // global css
import store from './store'
import './icons' // 自动渲染svg
Vue.config.productionTip = false

import routes from './router'
import actions from './actions.js'

let appInstance = null
let router = null

function render(props = {}) {
  const { container, routePath, query } = props
  // routePath用于qiankun手动加载用的vue-router的abstract模式
  if (routePath) {
    window.routePathFromQianKun = routePath
  }
  if (query) {
    window.queryFromQianKun = query
  }
  // 如果有routePath从qiankun注入，说明当前是需要手动加载，路由模式为abstract
  const mode = window.__POWERED_BY_QIANKUN__ ? (routePath ? 'abstract' : 'history') : 'hash'
  router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    mode,
    routes: routes
  })
  // 如果有container从qiankun注入，要把dom绑定到qiankun提供的dom内。因为qiankun体系中dom是隔离状态
  appInstance = new Vue({
    el: container ? container.querySelector('#sub-app') : '#sub-app',
    router,
    store,
    render: (h) => h(App)
  })
}

// window.__POWERED_BY_QIANKUN__可用于判断当前项目是否由qiankun驱动
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped')
}

export async function mount(props) {
  // 子应用加载完成后注册通信模块获取workspace下发的数据
  actions.setActions(props)
  console.log('[vue] props from main framework', props)
  render(props)
}

export async function unmount() {
  appInstance.$notify && appInstance.$notify.closeAll()
  console.log('[vue] unmount')
}

export async function update(props) {
  console.log('sub app updated')
}
复制代码
```

### step.4

a. 新增qiankun状态管理

```
//store/modules/qiankun.js

const state = {
  authToken: '',
}

const mutations = {
  CHANGE_AUTH_TOKEN: (state, authToken) => {
    console.log(authToken, 'auth token')
    state.authToken = authToken
  }
}

const actions = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
复制代码
```

b. 改造App.vue。 对qiankun的注入逻辑做mixin处理。(注意: 除setToken等基础通用逻辑外，所有业务层面的onGlobalStateChange都必须加上eventType和appName判断过滤事件，否则可能会导致业务事件重复触发)

```
<script>
import actions from '@/actions.js'
export default {
  name: 'App',
  data() {
    return {
    }
  },
  created() {
    this.initQiankunGlobalState()
  },
  mounted() {
    // 如果是从qiankun loadMicroApp进来的 需要用abstract路由跳转
    if (window.routePathFromQianKun) {
      this.$router.push({
        path: window.routePathFromQianKun,
        query: window.queryFromQianKun || {}
      })
    }
  },
  methods: {
    initQiankunGlobalState() {
      const immediately = true //true表示立刻触发
      actions.onGlobalStateChange((state, pre) => {
        // 建议token存到vuex中，可以保持自身子应用token独立无冲突
        this.$store.commit('qiankun/CHANGE_AUTH_TOKEN', state.authToken)
        // 其他需要从qiankn里面获取state的都在这里初始化获取
        console.log(state)
      }, immediately)
    }
  }
}
</script>
复制代码
```

c. 改造request.js，从主应用获取axios的baseUrl;header头添加统一的authToken权限。authToken从globalState获取

```
// request.js

import axios from 'axios'
import Vuex from '@/store/index'
//动态获取origin
const origin = window.__POWERED_BY_QIANKUN__ ? window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ : window.location.origin
const servies = axios.create({
  baseURL: origin,
  withCredentials: true // 允许携带cookie
})
servies.interceptors.request.use(
  config => {
   //全局补上authToken
    config.headers['AUTH-TOKEN'] = Vuex.state.qiankun.authToken
    return config
  },
  () => {
    return Promise.reject()
  }
)
// 登录失效上报到workspace做退出登录处理
servies.interceptors.response.use(
  response => {
    if (response.data.code === 401) {
      actions.setGlobalState({
        appName: 'RAM', //记得更改成自己的子应用名称，名称见通信文档
        eventType: 'TOKEN_EXPIRED'
      })
    }
  },
  error => {
    return Promise.reject(error)
  }
)
复制代码
```

### step.6

需要进行应用通信时，引入acitons进行setGlobal处理，在各个应用监听onGlobalChange事件即可。以路由跳转为例，需要跳转路由时，上抛文档格式要求的参数字段到qiankun，上层workspace即可做跳转处理。

```
const state = {
  authToken: '',
  routeParams: {
    name: '', //菜单名称，用户tab页签显示
    url: '', //菜单全量url地址
    id: '', //菜单id 需要保证唯一
    activeMenu: ''  // 用于菜单高亮的字段
  },
  ramOptions: {

  }
}

const mutations = {
  CHANGE_AUTH_TOKEN: (state, authToken) => {
    console.log(authToken, 'auth token')
    state.authToken = authToken
  },
  CHANGE_ROUTE_PARAMS: (state, routeParams) => {
    console.log(routeParams, 'routeParams')
    state.routeParams = routeParams
  }
}

const actions = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
复制代码
//window.__POWERED_BY_QIANKUN__可用于判断当前项目是否由qiankun驱动
if (window.__POWERED_BY_QIANKUN__) {
    this.$store.commit('qiankun/CHANGE_ROUTE_PARAMS', {
        name: name,
        url: `${process.env.VUE_APP_BASE_HOST}/#/suborigin/suborigin`,
    })
    actions.setGlobalState({
        appName: 'subapp',
        eventType: 'NAVIGATETO',
        routeParams: this.$store.state.qiankun.routeParams
    })
} else {
    this.$router.push({
        name: routeName,
        params: routeParams
    })
}
```

到此为止，我们的前端层面主子应用的改造终于完毕，按照正确url格式和内容接入即可实现一套基础的微前端！

当然，我们距离微前端完整运行，还需要一些后端、运维、以及规范方面的工作。比如：

1. 后端所有的接口和资源都需要支持跨域，需要后端放开处理。
2. workspace的项目需要支持history模式用来兼容子应用加载。
3. 子应用不应具有登录、权限体系，所有统一的鉴权体系应服从主应用管理。
4. vue-router要加上subapp名称或者严格的业务路由名称作为标识的基准路由，以防止路由冲突。
5. 禁止污染全局样式或者UI组件库样式，严格遵守样式开发规范(修改局部样式加上自定义的类名)，原则上所有组件样式均加上scoped作用域，以防止污染workspace样式。
6. 禁用window.localStorage.clear()。对自身的本地数据单独remove。
7. 子应用实例化时，如果选择以id形式初始化$el元素，id的值要加上具体的subapp名称(如id="weiteng-app")，不能直接写id="app",防止多个subapp实例化冲突。

此外，在后续的实际对接中，我们还会遇到很多很多规范和对接问题。比如百度地图问题、富文本编辑器的问题、代码库样式冲突问题等等。这些未来的问题都是可以解决的，只要我们严格的遵守统一的ui规范、命名规范、日常开发规范等等，这些问题都会迎刃而解。相反的，随着子应用越来越多，如果大家都随意开发，规范忽略，我们最终会出现的问题也是会越来越严重，越来越臃肿。

