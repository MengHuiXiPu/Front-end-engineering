# 微前端x重构

首先，来讲讲技术栈，老项目主要用了下面的技术：

- 框架

- - Vue
  - vuex
  - vue-router

- 样式

- - scss

- UI

- - ant-design-vue
  - ant-design-pro for vue

- 脚手架

- - vue-cli

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtnQfxIcaBRWnaxdgFXIKRNGtalFMicbfzFscdf8KzAGichXUTuVAMaQGw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

新项目需要用到的技术有：

- 框架

- - React
  - redux + redux-toolkit
  - react-router

- 新式

- - less

- UI

- - react-design-react
  - react-design-pro for react

- 脚手架

- - 团队内部自创脚手架

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtRSnhnKkLtbYhqm5eIL6AV4kdVRTlP7XgibNElvwqdkibia6qagWSpbsCw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到两个项目除了业务之外，几乎没什么交集了。

## 微前端策略

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtqSY936ia1FqOmwgvNvonE8TfMziaWQOuOhK1iaFk9qWjzAPHz0fdJ6Jgw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

老项目作为主应用，通过 qiankun 去加载新项目（子应用）里的页面。

- 当没有需求时，在新项目（子应用）重写页面，重写完了之后，在老项目（主应用）中加载新项目的页面，下掉老项目的页面
- 当有需求时，也是在新项目（子应用）重写面面再做对应需求（向产品要多点时间），重写完了之后，在老项目（主应用）中加载新项目的页面

这样一来就可以避免 *“我要一整个月都做重构”* 的局面，而是可以做到一个页面一个页地慢慢迁移。最终等所有页面都在新项目写好之后，直接把老项目下掉，新项目就可以从幕后站出来了。相当于从重写的第一天开始，老项目就成替身了。

## 升级版架构

上图的架构有一个问题就是，当每次点击侧边栏的 `MenuItem` 时，都会加载一次微应用的子页面，也即：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtuv3yS5LcJiah50CJoUeprHMM5fyclqL2ggsx6f5nIm9ibJllzpAz6zOw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

微应用子页面之间的切换，其实就是在微应用里路由切换嘛，大可不需要通过重新加载一次微应用来做微应用子页面的切换。

所以，我想了一个办法：我在 `<router-view>` 旁边放了一个组件 `Container`。进入主应用后，这个组件先直接把微应用整个都加载了。

```
<a-layout>
  <!--  页面    -->
  <a-layout-content>
    <!--   子应用容器     -->
    <micro-app-container></micro-app-container>
    <!--   主应用路由     -->
    <router-view/>
  </a-layout-content>
</a-layout>
```

当展示老页面时，把这个 `Container` 高度设为 `0`，要展示新页面时，再把 `Container` 高度自动撑开。

```
// micro-app-container

<template>
<div class="container" :style="{ height: visible ? '100%' : 0 }">
  <div id="micro-app-container"></div>
</div>
</template>

<script>
import { registerMicroApps, start } from 'qiankun'

export default {
  name: "Container",
  props: {
    visible: {
      type: Boolean,
      defaultValue: false,
    }
  },
  mounted() {
    registerMicroApps([
      {
        name: 'microReactApp',
        entry: '//localhost:3000',
        container: '#micro-app-container',
        activeRule: '/#/micro-react-app',
      },
    ])
    start()
  },
}
</script>
```

这样一来，当进入老项目时，这个 `Container` 自动被 mounted 后就会地去加载子应用了。当在切换新页面时，本质上是在子应用里做路由切换，而不是从 A 应用切换到 B 应用了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxttaG1d1dL2aiam3RyIMSYlDDMTBynp5pVqPmJyTibCpicnMGrb5qp6Uribw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 子应用的布局

由于新的项目（子应用）里的页面要供给老项目（主应用）来使用的，所以子应用也应该有两套布局：

第一套标准的管理后台布局，有 `Sider`，`Header` 还有 `Content`，另一套侧作为子应用时，只展示 `Content` 部分的布局。

```
// 单独运行时的布局
export const StandaloneLayout: FC = () => {
  return (
    <AntLayout className={styles.layout}>
      <Sider/>
      <AntLayout>
        <Header />
        <Content />
      </AntLayout>
    </AntLayout>
  )
}

// 作为子应用时的布局
export const MicroAppLayout = () => {
  return (
    <Content />
  )
}
```

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtethuiawVFDUpK4d3GbK8iadXkSc2bFpGbxfOg6Elgon49Lia4FG9dQm4Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)单独运行时的布局

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxt570HQtnpnsV3aUWA0SlDtuNdRl0z52OAhCD1lcblwgibo7uEABzwVgg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)作为微应用时的布局

最后通过 `window.__POWERED_BY_QIANKUN__` 就可以切换不同的布局了。

```
import { StandaloneLayout, MicroAppLayout } from "./components/Layout";

const Layout = window.__POWERED_BY_QIANKUN__ ? MicroAppLayout : StandaloneLayout;

function App() {
  return (
    <Layout/>
  );
}
```

## 样式冲突

qiankun 是默认开启 JS 隔离（沙箱），关闭 CSS 样式隔离的。为什么这么做呢？因为 CSS 的隔离是不能无脑做去做的，下面来讲讲这方面的问题。

qiankun 一共提供了两种 CSS 隔离方法（沙箱）：**严格沙箱** 以及 **实验性沙箱**。

### 严格沙箱

开启代码：

```
start({
  sandbox: {
    strictStyleIsolation: true,
  }
})
```

严格沙箱主要通过 `ShadowDOM` 来实现 CSS 样式隔离，效果是当子应用被挂在到 `ShadowDOM` 上，主子应用的样式 **完完全全** 地被隔离，无法互相影响。你说：这不是很好么？No No No。

这种沙箱的优点也成为了它自己的缺点：除了样式的硬隔离，DOM 元素也直接硬隔离了，导致子应用的一些 `Modal`、`Popover`、`Drawer` 组件会因为找不到主应用的 `body` 而丢失，甚至跑到整个屏幕之外。

还记得我刚说主应用和子应用都用了 ant-design 么？ant-design 的 `Modal`、`Popover``Drawer` 的实现方式就是要挂在到 `document.body` 上的，这么一隔离，它们一挂在整个元素起飞了。

### 实验性沙箱

开启代码：

```
start({
  sandbox: {
    experimentalStyleIsolation: true,
  }
})
```

这种沙箱实现方式就是给子应用的样式加后缀标签，有点像 Vue 里的 `scoped`，通过名字来做样式 “软隔离”，比如像这样：

![图片](https://mmbiz.qpic.cn/mmbiz_png/oCmxRMwTTv3ic4VZLoZdibSaHFLp15qXxtTukOeic10AN3aWmoJ3XrCrL70PrNIHcm5DSOCm6BCFBSrqn3VTOOib7A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

其实这种方式已经很好地做了样式隔离，但是主应用里经常有人喜欢写 `!important` 来覆盖 ant-design 的组件原样式：

```
.ant-xxx {
   color: white: !important;
}
```

而 `!importnant` 的优先级是最高的，如果微应用也用了这个 `.ant-xxx` 类，就很容易被主应用的样式影响了。所以在加载微应用时，还需要处理 ant-design 之间的样式冲突问题。

### ant-design 样式冲突

ant-design 提供了一个非常好的类名前缀功能：用 `prefixCls` 来做样式隔离，我自然也用上了：

```
// 自定义前缀
const prefixCls = 'cmsAnt';

// 设置 Modal、Message、Notification rootPrefixCls
ConfigProvider.config({
  prefixCls,
})

// 渲染
function render(props: any) {
  const { container, state, commit, dispatch } = props;

  const value = { state, commit, dispatch };

  const root = (
    <ConfigProvider prefixCls={prefixCls}>
      <HashRouter basename={basename}>
        <MicroAppContext.Provider value={value}>
          <App />
        </MicroAppContext.Provider>
      </HashRouter>
    </ConfigProvider>
  );

  ReactDOM.render(root, container
    ? container.querySelector('#root')
    : document.querySelector('#root'));
}
@ant-prefix: cmsAnt; // 引入来改变全局变量值
```

但是不知道为什么，在 less 文件中改了 `ant-prefix` 变量后，ant-design-pro 的样式还是老样子，有的组件样式改变了，有的没变化。

最后，我是通过 `less-loader` 的 `modifyVars` 在打包时来更新全局的 `ant-prefix` less 变量才搞定的：

```
var webpackConfig = {
  test: /.(less)$/,
  use: [
    ...
    {
      loader: 'less-loader',
      options: {
        lessOptions: {
          modifyVars: {
            'ant-prefix': 'cmsAnt'
          },
          sourceMap: true,
          javascriptEnabled: true,
        }
      }
    }
  ]
}
```

具体 Issue 看 Issue: ant-design 改了 prefixCls 后 ant-design-pro 不生效。

## 主子应用状态管理

老项目（主应用）用到了 vuex 全局状态管理，所以新项目页面（子应用）里有时需要更改主应用里的状态，这里我用了 qiankun 的 globalState 来处理。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

首先在 Container 里创建了 `globalActions`，再监听 vuex 状态变更，每次变更都通知子应用，同时把 vuex 的 `commit` 和 `dispatch` 函数传给子应用：

```
import {initGlobalState, registerMicroApps, start} from 'qiankun'

const globalActions = initGlobalState({
  state: {},
  commit: null,
  dispatch: null,
});

export default {
  name: "Container",
  props: {
    visible: {
      type: Boolean,
      defaultValue: false,
    }
  },
  mounted() {
    const { dispatch, commit, state } = this.$store;
    registerMicroApps([
      {
        name: 'microReactApp',
        entry: '//localhost:3000',
        container: '#micro-app-container',
        activeRule: '/#/micro-react-app',
        // 初始化时就传入主应用的状态和 commit, dispatch
        props: {
          state,
          dispatch,
          commit,
        }
      },
    ])
    
    start()
    
    // vuex 的 store 变更后再次传入主应用的状态和 commit, dispatch
    this.$store.watch((state) => {
      console.log('state', state);
      globalActions.setGlobalState({
        state,
        commit,
        dispatch
      });
    })
  },
}
```

子应用里接收主应用传来的 `state`，`commit` 以及 `dispatch` 函数，同时新起一个 Context，把这些东西都放到 `MicroAppContext` 里。（Redux 因为不支持存放函数这种 nonserializable 的值，所以只能先存到 Context 里）

```
// 渲染
function render(props: any) {
  const { container, state, commit, dispatch } = props;

  const value = { state, commit, dispatch };

  const root = (
    <HashRouter basename={basename}>
      <MicroAppContext.Provider value={value}>
        <App />
      </MicroAppContext.Provider>
    </HashRouter>
  );

  ReactDOM.render(root, container
    ? container.querySelector('#root')
    : document.querySelector('#root'));
}

// mount 时监听 globalState，只要一改再次渲染 App
export async function mount(props: any) {
  console.log('[micro-react-app] mount', props);
  props.onGlobalStateChange((state: any) => {
    console.log('[micro-react-app] vuex 状态更新')
    render(state);
  })
  render(props);
}
```

这样一来，子应用也可以通过 `commit`，和 `dispatch` 来更改主应用的值了。

```
const OrderList: FC = () => {
  const { state, commit } = useContext(MicroAppContext);

  return (
    <div>
      <h1 className="title">【微应用】订单列表</h1>

      <div>
        <p>主应用的 Counter: {state.counter}</p>
        <Button type="primary" onClick={() => commit('increment')}>【微应用】+1</Button>
        <Button danger onClick={() => commit('decrement')}>【微应用】-1</Button>
      </div>
    </div>
  )
}
```

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

当然了，这样的实践也是我自己 “发明” 的，不知道这是不是一个好的实践，我只能说这样能 Work。

## 全局变量报错

另一个问题就是当子应用隐式使用全局变量时，`import-html-entry` 执行 JS 时会直接爆炸。比如微应用有如下 `<script>` 的代码：

```
var x = {}; // 报错，要改成 window.x = {};

x.a = 1 // 报错，要改成 window.x.a = 1;

function a() {} // 要改成 window.a = () => {}

a() // 报错，要改成 window.a()
```

在主应用加载微应用后，上面的 `x` 和 `a` 全都会报 `xxx is undefined`，这是因为 qiankun 在加载微应用时，会执行这部分 JS 代码，而此时 var 声明的变量不再是全局变量，其他的文件无法获取到。

解决方法就是使用 `window.xxx` 来显式定义/使用全局变量。具体可见 Issue: 子应用全局变量 undefined

## 主应用切换路由时不更新子应用路由

只要主子应用都用上了 Hash 路由，那么很大概率会遇到这个问题。

比如你主应用有 `/micro-app/home` 和 `/micro-app/user` 两个路由，`actvieRule` 为 `/#/micro-app`，子应用也有对应的 `/micro-app/home` 和 `/micro-app/user` 两个路由。

那么如果 **在主应用里** 从 `/micro-app/home` 切换到 `/micro-app/user`，会发现子应用的路由并没有改变。但如果你 **在主应用的子应用里** 去切换，那么就能切换成功。

这是因为在主应用切换路由时不是通过 `location.url` 这种可以触发 hash change 事件的方式来变更路由，而 react-router 只监听了 hash change 事件，所以当主应用切换路由时，没有触发 hash change 事件，导致子应用的监听不到路由变化，也就不会做页面切换了。

具体可见：Issue: 加载子应用正常，但主应用切换路由，子应用不跳转，浏览器返回前进可触发子应用跳转。

解决方法很简单，下面三选一：

- 将 vue 主应用中的 Link 超链方式替换成原生的 a 标签，从而触发浏览器的 hash change 事件
- 主应用手动监听路由变更，同时手动触发 hash change 事件
- 主应用跟子应用都改用 browser history 模式

## 加载状态

主应用在加载子应用时还是需要不少时间的，所以最好要展示一个加载中的状态，qiankun 正好提供了一个 `loader` 回调来让我们控制子应用的加载状态：

```
<div class="container" :style="{ height: visible ? '100%' : 0 }">
  <a-spin v-if="loading"></a-spin>
  <div id="micro-app-container"></div>
</div>
registerMicroApps([
  {
    name: 'microReactApp',
    entry: '//localhost:3000',
    container: '#micro-app-container',
    activeRule: '/#/micro-react-app',
    props: {
      state,
      dispatch,
      commit,
    },
    loader: (loading) => {
      this.loading = loading // 控制加载状态
    }
  },
])
start()
```

## 总结

总的来说，微前端在解构巨石应用的帮助真的很大。像我们这种要重构整个应用的情况，部门肯定不会先暂停业务，给开发一整个月来专门重构的，只能在评新需求的时候多给你一两天时间而已。

微前端就可以解决重构的过程中边做新需求边重构的问题，使得新老页面都能共存，不会一下子整个业务都停掉来做重构工作

