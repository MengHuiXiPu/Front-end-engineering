# 从 0 搭建 Vite 3 + Vue 3 前端工程化项目



Vue 3 正式版已经发布有一段时间了，随着 Vite 脚手架注定成为下一代前端工具链，许多用户都想基于 Vite 来构建 Vue 项目，如果想基于 Vite 构建 Vue 3 项目，社区模板完全满足您的需求，如果想构建 Vite 3 + Vue 3 + JavaScript 项目，那社区模板不太能满足您的需求，因为社区模板提供 Vue 3 项目几乎是基于 Vite 2 + TypeScript 构建，对于不熟悉 TypeScript 语言的用户不是很友好，因此接下来从 0 开始手把手带大家搭建一套规范的 Vite 3 + Vue 3 + JavaScript 前端工程化项目环境。

本文章篇幅较长，从以下几个方面展开：

- 基础搭建
- 代码规范
- 提交规范
- 自动部署

> 本项目完整代码托管在 **GitHub 仓库**[1]，欢迎点亮小星星 🌟🌟

# 技术栈

- ⚡️ **Vite 3**[2] - 构建工具（就是快！）
- 🖖 **Vue 3**[3] - 渐进式 JavaScript 框架
- 🚦 **Vue Router**[4] - 官方路由管理器
- 📦 **Pinia**[5] - 值得你喜欢的 Vue Store
- 💻 **TDesign**[6] - TDesign 适配桌面端的组件库
- 🎨 **Less**[7] - CSS 预处理器
- 🔗 **Axios**[8] - 一个基于 promise 的网络请求库，可以用于浏览器和 node.js
- 🧰 **Husky**[9] + **Lint-Staged**[10] - Git Hook 工具
- 🛡️ **EditorConfig**[11] + **ESLint**[12] + **Prettier**[13] + **Stylelint**[14] - 代码规范
- 🔨 **Commitizen**[15] + **Commitlint**[16] - 提交规范
- 💡 **GitHub Actions**[17] - 自动部署

# 基础搭建

## 构建项目雏形

确保你安装了最新版本的 **Node.js**[18]，然后在命令行中运行以下命令：

```
# npm 6.x
npm create vite@latest vite-vue-js-template --template vue

# npm 7+, extra double-dash is needed:
npm create vite@latest vite-vue-js-template -- --template vue

# yarn
yarn create vite vite-vue-js-template --template vue

# pnpm
pnpm create vite vite-vue-js-template --template vue
复制代码
```

这一指令将会安装并执行 **create-vite**[19]，它是一个基本模板快速启动项目工具。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBBSqUa6rfAQmOwSkAfrOCXeR8KHgOaVbiaEcLw1kVVBrd4pAb9n8VYYw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)初始化项目

在项目被创建后，通过以下步骤安装依赖并启动开发服务器：

```
# 打开项目
cd <your-project-name>

# 安装依赖
npm install

# 启动项目
npm run dev
复制代码
```

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBnVoibf5iaQYQm090gdAyJ7nZJViaKicpQRd9JhibGbNdnF3pt7BIMuJJJqA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)启动项目

## Vite 基础配置

Vite 配置文件 `vite.config.js` 位于项目根目录下，项目启动时会自动读取。

本项目针对公共基础路径、自定义路径别名、服务器选项、构建选项等做了如下基础配置：

```
import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    base: './',
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src') ,
      },
    },
    server: {
      // 是否开启 https
      https: false,
      // 端口号
      port: 3000,
      // 监听所有地址
      host: '0.0.0.0',
      // 服务启动时是否自动打开浏览器
      open: true,
      // 允许跨域
      cors: true,
      // 自定义代理规则
      proxy: {},
    },
    build: {
      // 设置最终构建的浏览器兼容目标
      target: 'es2015',
      // 构建后是否生成 source map 文件
      sourcemap: false,
      //  chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: false,
    },
});
复制代码
```

关于 Vite 更多配置项及用法，请查看 Vite 官网 **vitejs.dev/config/**[20] 。

## 规范目录结构

```
├── dist/
└── src/
    ├── api/                       // 接口请求目录
    ├── assets/                    // 静态资源目录
    ├── common/                    // 通用类库目录
    ├── components/                // 公共组件目录
    ├── router/                    // 路由配置目录
    ├── store/                     // 状态管理目录
    ├── style/                     // 通用样式目录
    ├── utils/                     // 工具函数目录
    ├── views/                     // 页面组件目录
    ├── App.vue
    ├── main.js
├── tests/                         // 单元测试目录
├── index.html
├── jsconfig.json                  // JavaScript 配置文件
├── vite.config.js                 // Vite 配置文件
└── package.json
复制代码
```

## 集成 Vue Router 路由工具

### 安装依赖

```
npm i vue-router@4
复制代码
```

### 创建路由配置文件

在 `src/router` 目录下新建 `index.js` 文件与 `modules` 文件夹

```
└── src/
    ├── router/
    	├── modules/  // 路由模块
        ├── index.js  // 路由配置文件
复制代码
```

关于路由表，建议根据功能的不同来拆分到 `modules` 文件夹中，好处是：

- 方便后期维护

- - 减少 Git 合并代码冲突可能性

```
export default [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
  },
];
复制代码
import { createRouter, createWebHistory } from 'vue-router';

import baseRouters from './modules/base';

const routes = [...baseRouters];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
复制代码
```

根据路由配置的实际情况，需要在 `src` 下创建 `views` 目录，用来存储页面组件。

### 挂载路由配置

在 `main.js` 文件中挂载路由配置

```
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
复制代码
```

## 集成 Pinia 全局状态管理工具

### 安装依赖

```
npm i pinia
复制代码
```

### 创建仓库配置文件

在 `src/store` 目录下新建 `index.js` 文件与 `modules` 文件夹

```
└── src/
    ├── store/
    	├── modules/  // 仓库模块
        ├── index.js  // 仓库配置文件
复制代码
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 1,
  }),
  actions: {
    accumulate() {
      this.count++;
    },
  },
});
复制代码
import { createPinia } from 'pinia';

const store = createPinia();

export default store;

export * from './modules/counter';
复制代码
```

开发中需要将不同功能所对应的状态，拆分到不同的 `modules`，好处如同路由模块一样。

### 挂载 Pinia 配置

在 `main.js` 文件中挂载 `Vuex` 配置

```
import { createApp } from 'vue';

import App from './App.vue';
import store from './store';
import router from './router';

createApp(App).use(router).use(store).mount('#app');
复制代码
```

## 集成 TDesign Vue Next 组件库

### 安装依赖

```
npm i tdesign-vue-next
复制代码
```

### 基础使用

```
import { createApp } from 'vue';

import TDesign from 'tdesign-vue-next';

// 引入组件库全局样式资源
import 'tdesign-vue-next/es/style/index.css';

const app = createApp(App);
app.use(TDesign);
复制代码
```

### 按需引入

使用 `unplugin-vue-components` 和 `unplugin-auto-import` 来实现自动导入：

```
npm install unplugin-vue-components unplugin-auto-import -D
复制代码
```

在 Vite 对应的配置文件 `vite.config.js` 添加上述插件：

```
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from 'unplugin-vue-components/resolvers';

export default {
  plugins: [
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }),
  ],
};
复制代码
```

## 集成 Axios HTTP 工具

### 安装依赖

```
npm i axios
复制代码
```

### 请求配置

在 `utils` 目录下创建 `request.js` 文件，配置好适合自己业务的请求拦截和响应拦截：

```
└── src/
	├── api  // 接口
    ├── utils/
        ├── request.js  // axios 请求库二次封装
复制代码
import axios from 'axios';

// 创建请求实例
const instance = axios.create({
  baseURL: '/api',
  // 指定请求超时的毫秒数
  timeout: 1000,
  // 表示跨域请求时是否需要使用凭证
  withCredentials: false,
});

// 前置拦截器（发起请求之前的拦截）
instance.interceptors.request.use(
  (config) => {
    /**
     * 在这里一般会携带前台的参数发送给后台，比如下面这段代码：
     * const token = getToken()
     * if (token) {
     *  config.headers.token = token
     * }
     */
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 后置拦截器（获取到响应时的拦截）
instance.interceptors.response.use(
  (response) => {
    /**
     * 根据你的项目实际情况来对 response 和 error 做处理
     * 这里对 response 和 error 不做任何处理，直接返回
     */
    return response;
  },
  (error) => {
    const { response } = error;
    if (response && response.data) {
      return Promise.reject(error);
    }
    const { message } = error;
    console.error(message);
    return Promise.reject(error);
  },
);

// 导出常用函数

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function post(url, data = {}, params = {}) {
  return instance({
    method: 'post',
    url,
    data,
    params,
  });
}

/**
 * @param {string} url
 * @param {object} params
 */
export function get(url, params = {}) {
  return instance({
    method: 'get',
    url,
    params,
  });
}

/**
 * @param {string} url
 * @param {object} data
 * @param {object} params
 */
export function put(url, data = {}, params = {}) {
  return instance({
    method: 'put',
    url,
    params,
    data,
  });
}

/**
 * @param {string} url
 * @param {object} params
 */
export function _delete(url, params = {}) {
  return instance({
    method: 'delete',
    url,
    params,
  });
}

export default instance;
复制代码
```

之后在 `api` 文件夹中以业务模型对接口进行拆分，举个例子，将所有跟用户相关接口封装在 `User` 类中，此类称作用户模型。

在 `User` 类中比如有登录、注册、获取用户信息等方法，如果有业务逻辑变动，只需要修改相关方法即可。

```
import { post } from '@/utils/request';

export default class User {
  /**
   * 登录
   * @param {String} username 用户名
   * @param {String} password 密码
   * @returns
   */
  static async login(username, password) {
    return post('/login', {
      username,
      password,
    });
  }
}
复制代码
```

把每个业务模型独立成一个 js 文件，声明一个类通过其属性和方法来实现这个模型相关的数据获取，这样可以大大提升代码的可读性与可维护性。

### 模拟演示

在需要使用接口的地方，引入对应的业务模型文件，参考如下：

```
<script>
import User from '@/api/user';

export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    async login() {
      const res = await User.login(this.username, this.password);
      console.log(res);
    },
  },
};
</script>
复制代码
```

## 集成 CSS 预处理器 Less

本项目使用 CSS 预处理器 Less，直接安装为开发依赖即可。

Vite 内部已帮我们集成了相关的 `loader`，不需要额外配置。

### 安装依赖

```
npm i less -D
复制代码
```

### 如何使用

在 `<style></style>` 样式标签中引用 `lang="less"` 即可。

```
<style lang="less"></style>
复制代码
```

> CSS 命名规范推荐 BEM 命名规范
>
> 参考链接：**CSS BEM 书写规范**[21]

### 全局样式

在 `src/style` 目录下创建 `variables.less` 全局样式文件：

```
└── src/
    ├── style/
        ├── variables.less  // 全局样式文件
复制代码
```

在 `vite.config.js` 配置文件中新增CSS 预处理器相关配置即可实现 less 全局样式：

```
import { resolve } from 'path';

export default defineConfig({
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${resolve('src/style/variables.less')}";`,
          },
          math: 'strict',
          javascriptEnabled: true,
        },
      },
    },
});
复制代码
```

### 样式穿透

**官方文档**[22]

在 Vue3 中，改变了以往样式穿透的语法，如果继续使用 `::v-deep`、`/deep/`、`>>>` 等语法的话，会出现一个警告，下面是新的语法：

```
/* 深度选择器 */
:deep(selector) {
  /* ... */
}

/* 插槽选择器 */
:slotted(selector) {
  /* ... */
}

/* 全局选择器 */
:global(selector) {
  /* ... */
}
复制代码
```

至此，一个基于 JavaScript + Vite3 + Vue3 + Vue Router + Pinia + Axios + Less 的前端项目开发环境搭建完毕。

项目托管在 **GitHub 仓库**[23]，需要的同学可以去下载下来，参考学习。

接下来增加代码规范约束、提交规范约束、单元测试、自动部署等，让其更完善、更健壮。

# 代码规范

随着前端应用逐渐变得大型化和复杂化，在同一个项目中有多个人员参与时，每个人的前端能力程度不等，他们往往会用不同的编码风格和习惯在项目中写代码，长此下去，势必会让项目的健壮性越来越差。解决这些问题，理论上讲，口头约定和代码审查都可以，但是这种方式无法实时反馈，而且沟通成本过高，不够灵活，更关键的是无法把控。不以规矩，不能成方圆，我们不得不在项目使用一些工具来约束代码规范。

本文讲解如何使用 **EditorConfig + ESLint + Prettier + Stylelint** 组合来实现代码规范化。

这样做带来好处：

- 解决团队之间代码不规范导致的可读性差和可维护性差的问题。
- 解决团队成员不同编辑器导致的编码规范不统一问题。
- 提前发现代码风格问题，给出对应规范提示，及时修复。
- 减少代码审查过程中反反复复的修改过程，节约时间。
- 自动格式化，统一编码风格，从此和脏乱差的代码说再见。

## 集成 EditorConfig 配置

**EditorConfig**[24] 主要用于统一不同 IDE 编辑器的编码风格。

在项目根目录下添加 `.editorconfig` 文件：

```
# 表示是最顶层的 EditorConfig 配置文件
root = true

# 表示所有文件适用
[*]
# 缩进风格（tab | space）
indent_style = space
# 控制换行类型(lf | cr | crlf)
end_of_line = lf
# 设置文件字符集为 utf-8
charset = utf-8
# 去除行首的任意空白字符
trim_trailing_whitespace = true
# 始终在文件末尾插入一个新行
insert_final_newline = true

# 表示仅 md 文件适用以下规则
[*.md]
max_line_length = off
trim_trailing_whitespace = false

# 表示仅 ts、js、vue、css 文件适用以下规则
[*.{ts,js,vue,css}]
indent_size = 2
复制代码
```

> 很多 IDE 中会默认支持此配置，但是也有些不支持，如：VSCode、Atom、Sublime Text 等。
>
> 具体列表可以参考官网，如果在 VSCode 中使用需要安装 `EditorConfig for VS Code` 插件。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBnLVbSEzeG9w9Y8E6xicR9cpg3IWPuOGeHsg8qjaCZbsib1lBT8rgZS2w/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)EditorConfig for VS Code

## 集成 ESLint 配置

**ESLint**[25] 是针对 EScript 的一款代码检测工具，它可以检测项目中编写不规范的代码，如果写出不符合规范的代码会被警告。

由此我们就可以借助于 ESLint 强大的功能来统一团队的编码规范。

### 安装依赖

- **`ESLint`**[26] - ESLint 本体
- **`eslint-define-config`**[27] - 改善 ESLint 规范编写体验
- **`eslint-plugin-vue`**[28] - 适用于 Vue 文件的 ESLint 插件
- **`eslint-config-airbnb-base`**[29] - Airbnb JavaScript 风格指南
- **`eslint-plugin-import`**[30] - 使用 `eslint-config-airbnb-base` 时必须安装的前置插件
- **`vue-eslint-parser`**[31] - 使用 `eslint-plugin-vue` 时必须安装的 ESLint 解析器

```
npm i eslint eslint-define-config eslint-config-airbnb-base eslint-plugin-import eslint-plugin-vue vue-eslint-parser -D
复制代码
```

### 安装插件

Visual Studio Code 编辑器使用 `ESLint` 配置需要下载插件 **ESLint** 。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBt8T85JbibhJtkhyVgGK57PVoZibwuPwDUMV9SUDP9Uer6o07pn6ZdA1g/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)ESLint

JetBrains 系列编辑器（WebStorm、IntelliJ IDEA 等）则不用额外安装插件。

### 创建 ESLint 配置文件

在项目根目录创建 `.eslintrc.js` 文件，并填入以下内容：

```
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  plugins: ['vue'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowImportExportEverywhere: true,
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    // 禁止使用多余的包
    'import/no-extraneous-dependencies': 0,
    // 确保在导入路径内一致使用文件扩展名
    'import/extensions': 0,
    // 确保导入指向可以解析的文件/模块
    'import/no-unresolved': 0,
    // 首选默认导出导入/首选默认导出
    'import/prefer-default-export': 0,
    // 要求使用 let 或 const 而不是 var
    'no-var': 'error',
    // 禁止使用 new 以避免产生副作用
    'no-new': 1,
    // 禁止变量声明与外层作用域的变量同名
    'no-shadow': 0,
    // 禁用 console
    'no-console': 0,
    // 禁止标识符中有悬空下划线
    'no-underscore-dangle': 0,
    // 禁止在可能与比较操作符相混淆的地方使用箭头函数
    'no-confusing-arrow': 0,
    // 禁用一元操作符 ++ 和 --
    'no-plusplus': 0,
    // 禁止对 function 的参数进行重新赋值
    'no-param-reassign': 0,
    // 禁用特定的语法
    'no-restricted-syntax': 0,
    // 禁止在变量定义之前使用它们
    'no-use-before-define': 0,
    // 禁止直接调用 Object.prototypes 的内置属性
    'no-prototype-builtins': 0,
    // 禁止可以在有更简单的可替代的表达式时使用三元操作符
    'no-unneeded-ternary': 'error',
    // 禁止重复模块导入
    'no-duplicate-imports': 'error',
    // 禁止在对象中使用不必要的计算属性
    'no-useless-computed-key': 'error',
    // 强制使用一致的缩进
    indent: ['error', 2],
    // 强制使用骆驼拼写法命名约定
    camelcase: 0,
    // 强制类方法使用 this
    'class-methods-use-this': 0,
    // 要求构造函数首字母大写
    'new-cap': 0,
    // 强制一致地使用 function 声明或表达式
    'func-style': 0,
    // 强制一行的最大长度
    'max-len': 0,
    // 要求 return 语句要么总是指定返回的值，要么不指定
    'consistent-return': 0,
    // 强制switch要有default分支
    'default-case': 2,
    // 强制剩余和扩展运算符及其表达式之间有空格
    'rest-spread-spacing': 'error',
    // 要求使用 const 声明那些声明后不再被修改的变量
    'prefer-const': 'error',
    // 强制箭头函数的箭头前后使用一致的空格
    'arrow-spacing': 'error',
  },
    overrides: [
    {
      files: ['*.vue'],
      rules: {
        // 要求组件名称总是多个单词
        'vue/multi-word-component-names': 0,
      },
    },
  ],
});
复制代码
```

> 关于更多配置项信息，请前往 ESLint 官网查看 **ESLint-Configuring**[32]

### 创建 ESLint 过滤规则

在项目根目录添加一个 `.eslintignore` 文件，内容如下：

```
dist
node_modules
!.prettierrc.js
复制代码
```

## 集成 Prettier 配置

**Prettier**[33] 是一款强大的代码格式化工具，支持 JavaScript、TypeScript、CSS、SCSS、Less、JSX、Angular、Vue、GraphQL、JSON、Markdown 等语言，基本上前端能用到的文件格式它都可以搞定，是当下最流行的代码格式化工具。

### 安装依赖

```
npm i prettier -D
复制代码
```

### 安装插件

Visual Studio Code 编辑器使用 `Prettier` 配置需要下载插件 **Prettier - Code formatter** 。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBCGMzdGTuiaGNvPiaw9GIOK4PWX3phPibyiaDooIdHSfJZ2mtPbe6XTM6YA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)Prettier - Code formatter

JetBrains 系列编辑器（WebStorm、IntelliJ IDEA 等）则不用额外安装插件，可直接使用 `Prettier` 配置。

### 创建 Prettier 配置文件

Prettier 支持多种格式的**配置文件**[34]，比如 `.json`、`.yml`、`.yaml`、`.js`等。

在项目根目录创建 `.prettierrc.js` 文件，并填入以下内容：

```
module.exports = {
  // 一行最多 120 字符
  printWidth: 120,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 行尾需要有分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 末尾需要有逗号
  trailingComma: 'all',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // jsx 标签的反尖括号需要换行
  jsxBracketSameLine: false,
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // vue 文件中的 script 和 style 内不用缩进
  vueIndentScriptAndStyle: false,
  // 换行符使用 lf
  endOfLine: 'lf',
  // 格式化嵌入的内容
  embeddedLanguageFormatting: 'auto',
  // html, vue, jsx 中每个属性占一行
  singleAttributePerLine: false,
};
复制代码
```

> 关于更多配置项信息，请前往 Prettier 官网查看 **Prettier-Options**[35]

### 创建 Prettier 过滤规则

在项目根目录添加一个 `.prettierignore` 文件，内容如下：

```
## OS
.DS_Store
.idea
.editorconfig
pnpm-lock.yaml
.npmrc

# Ignored suffix
*.log
*.md
*.svg
*.png
*.ico
*ignore

## Local
.husky

## Built-files
.cache
dist
复制代码
```

## 解决 Prettier 和 ESLint 冲突

本项目中的 ESLint 配置使用了 Airbnb JavaScript 风格指南校验，其规则之一是_代码结束后面要加分号_，而在 Prettier 配置文件中加了_代码结束后面不加分号_配置项，从而冲突了。

解决两者冲突问题，需要用到 **eslint-plugin-prettier** 和 **eslint-config-prettier**。

- `eslint-plugin-prettier` 将 Prettier 的规则设置到 ESLint 的规则中
- `eslint-config-prettier` 关闭 ESLint 中与 Prettier 中会发生冲突的规则

最后形成优先级：`Prettier 配置规则` > `ESLint 配置规则`

### 安装依赖

```
npm i eslint-plugin-prettier eslint-config-prettier -D
复制代码
```

### 修改 ESLint 配置文件

修改 `.eslintrc.js` 文件，在 `extends` 中添加 `plugin:prettier/recommended` 规则（此规则一定要加在最后）。

```
module.exports = {
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
}
复制代码
```

## 自动格式化代码

Visual Studio Code 在 `settings.json` 设置文件中，增加以下代码：

```
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  }
}
复制代码
```

WebStorm 打开设置窗口，按如下操作，最后点击 `Apply` -> `OK`：

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNB4mvE3QYJibtrRqnhpVflU1Tm6PrD1jy2dv7PCDtotOsA8QnhicuoyZzg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)WebStorm

## 集成 Stylelint 配置

Stylelint 是一个强大、先进的 CSS 代码检查器（linter），可以帮助你规避 CSS 代码中的错误并保持一致的编码风格。

### 安装依赖

- **`Stylelint`**[36] - Stylelint 本体
- **`stylelint-config-prettier`**[37] - 关闭 Stylelint 中与 Prettier 中会发生冲突的规则
- **`stylelint-config-standard`**[38] - Stylelint 官方推荐规则
- **`stylelint-config-recommended-vue`**[39] - 检验 vue 文件中的样式
- **`stylelint-order`**[40] - CSS 属性顺序规则插件

```
npm i stylelint stylelint-config-prettier stylelint-config-standard stylelint-config-recommended-vue stylelint-order -D
复制代码
```

### 安装插件

Visual Studio Code 编辑器使用 `Stylelint` 配置需要下载插件 **Stylelint** 。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBBnibibLViaaLE5U9HoxrpIRE4AZnLsKoRKibPQuhPQvLtLNgB4DrbG0sGA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)Stylelint

JetBrains 系列编辑器（WebStorm、IntelliJ IDEA 等）则不用额外安装插件。

### 创建 Stylelint 配置文件

在项目根目录创建 `.stylelintrc.js` 文件，并填入以下内容：

```
module.exports = {
  root: true,
  defaultSeverity: 'error',
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],
  plugins: ['stylelint-order'],
  rules: {
    // 不允许未知函数
    'function-no-unknown': null,
    // 指定类选择器的模式
    'selector-class-pattern': null,
    // 禁止空源码
    'no-empty-source': null,
    // 指定字符串使用单引号
    'string-quotes': 'single',
    // 禁止未知的@规则
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'each',
          'include',
          'mixin',
        ],
      },
    ],
    // 指定@规则名的大小写
    'at-rule-name-case': 'lower',
    // 指定缩进
    indentation: [
      2,
      {
        severity: 'warning',
      },
    ],
    // 禁止未知的伪类选择器
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
    // 禁止未知的伪元素选择器
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep'],
      },
    ],
    'order/properties-order': [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'z-index',
      'display',
      'justify-content',
      'align-items',
      'float',
      'clear',
      'overflow',
      'overflow-x',
      'overflow-y',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'font-size',
      'font-family',
      'font-weight',
      'border',
      'border-style',
      'border-width',
      'border-color',
      'border-top',
      'border-top-style',
      'border-top-width',
      'border-top-color',
      'border-right',
      'border-right-style',
      'border-right-width',
      'border-right-color',
      'border-bottom',
      'border-bottom-style',
      'border-bottom-width',
      'border-bottom-color',
      'border-left',
      'border-left-style',
      'border-left-width',
      'border-left-color',
      'border-radius',
      'text-align',
      'text-justify',
      'text-indent',
      'text-overflow',
      'text-decoration',
      'white-space',
      'color',
      'background',
      'background-position',
      'background-repeat',
      'background-size',
      'background-color',
      'background-clip',
      'opacity',
      'filter',
      'list-style',
      'outline',
      'visibility',
      'box-shadow',
      'text-shadow',
      'resize',
      'transition',
    ],
  },
}
复制代码
```

### 创建 Stylelint 过滤规则

在项目根目录添加一个 `.stylelintignore` 文件，内容如下：

```
# .stylelintignore
# 旧的不需打包的样式库
*.min.css

# 其他类型文件
*.js
*.jpg
*.woff

# 测试和打包目录
/test/
/dist/*
/public/*
public/*
/node_modules/
复制代码
```

### 启用 Vue 文件支持

`Stylelint` v14 版本默认不支持 vue 文件中的 style 代码自动检测，详情查看**官方迁移指南**[41]

#### 安装依赖

- **`stylelint-config-html`**[42] - 解析 vue 文件
- **`postcss-html`**[43] - 使用 `stylelint-config-html` 依赖的模块
- **`postcss-less`**[44] - 对 less 文件进行解析

```
npm i stylelint-config-html postcss-html postcss-less -D
复制代码
```

#### 修改 Stylelint 配置文件

修改 `.stylelintrc.js` 文件，添加如下配置：

```
module.exports = {
  overrides: [
    {
      files: ['*.vue', '**/*.vue', '*.html', '**/*.html'],
      extends: ['stylelint-config-html'],
      rules: {
        // 指定关键帧名称的模式
        'keyframes-name-pattern': null,
        // 禁止未知的伪类选择器
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['deep', 'global'],
          },
        ],
        // 禁止未知的伪元素选择器
        'selector-pseudo-element-no-unknown': [
          true,
          {
            ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted'],
          },
        ],
      },
    },
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
      extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
    },
  ],
};
复制代码
```

#### 修改 Visual Studio Code 工作区配置

Visual Studio Code 在 `settings.json` 设置文件中，增加以下代码：

```
{
  "stylelint.validate": ["css", "less", "postcss", "scss", "vue", "sass"]
}
复制代码
```

## 集成 husky 和 lint-staged

在项目中已集成 ESLint 和 Prettier，在编码时，这些工具可以对代码进行实时校验，在一定程度上能有效规范所写代码，但有些人可能觉得这些限制很麻烦，从而选择视“提示”而不见，依旧按自己编程风格来写代码，或者干脆禁用掉这些工具，开发完成就直接把代码提交到了仓库，日积月累，ESLint 也就形同虚设。

所以，还需要做一些限制，让没通过 ESLint 检测和修复的代码禁止提交，从而保证仓库代码都是符合规范的。

为了解决这个问题，需要用到 Git Hook，在本地执行 `git commit` 的时候，就对所提交的代码进行 ESLint 检测和修复（即执行 `eslint \--fix`），如果这些代码没通过 ESLint 规则校验，则禁止提交。

实现这一功能，需要借助 **husky**[45] + **lint-staged**[46] 。

### 配置 husky

> 注意：本项目使用 husky 6.x 版本，6.x 版本配置方式跟之前版本有较大差异，当发现配置方法不一致时，一切以 **husky 官网**[47]为准。

使用 `husky-init` 命令快速在项目初始化 `husky` 配置：

```
# 初始化仓库
git init

# 初始化
npx husky-init

# 安装依赖
npm install
复制代码
```

husky 包含很多 `hook`（钩子），常用有：`pre-commit`、`commit-msg`。

使用 `pre-commit` 来触发 ESLint 命令，修改 `.husky/pre-commit` 文件触发命令：

```
eslint --fix ./src --ext .vue,.js,.ts
复制代码
```

`pre-commit` hook 文件作用是：当执行 `git commit \-m "xxx"` 时，会先对 `src` 目录下所有的 `.vue`、`.js`、`.ts` 文件执行 `eslint \--fix` 命令，如果 ESLint 通过，成功 `commit`，否则终止 `commit`。

但是又存在一个问题：有时候明明只改动了一两个文件，却要对所有的文件执行 `eslint \--fix`。

假如这是一个历史项目，在中途配置了 ESLint 规则，那么在提交代码时，也会对其他未修改的“历史”文件都进行检查，可能会造成大量文件出现 ESLint 错误，显然这不是我们想要的结果。

所以只需要用 ESLint 修复此次写的代码，而不去影响其他的代码，此时需要借助 **lint-staged** 工具。

### 配置 lint-staged

lint-staged 一般结合 husky 来使用，它可以让 husky 的 `hook` 触发的命令只作用于 `git` 暂存区的文件，而不会影响到其他文件。

#### 安装依赖

```
npm i lint-staged -D
复制代码
```

#### 新增配置

在 `package.json` 里增加 `lint-staged` 配置项：

```
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.vue": [
      "prettier --write",
      "eslint --fix",
      "stylelint --fix"
    ],
    "*.{html,vue,vss,sass,less}": [
      "prettier --write",
      "stylelint --fix"
    ],
    "package.json": [
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  },
}
复制代码
```

#### 修改触发命令

修改 `.husky/pre-commit` 文件触发命令为：

```
npx lint-staged
复制代码
```

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBh2WNXj2HhhbkibgXmYZBgSqHvic2CZVDKV5TXFEkA8wTDITvTycEv42g/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)pre-commit

经过以上配置之后，就可以在每次提交之前对所有代码进行格式化，保证线上代码的规范性。

# 提交规范

多人协作项目中，在提交代码环节，也存在一种情况：不能保证每个人对提交信息的准确描述，因此会出现提交信息紊乱、风格不一致的情况。

如果 `git commit` 的描述信息精准，在后期维护和 Bug 处理时会变得有据可查，项目开发周期内还可以根据规范的提交信息快速生成开发日志，从而方便我们追踪项目和把控进度。

社区最流行、最知名、最受认可的 **Angular**[48] 团队提交规范：

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBPZPrZUCmoa3rdKjZRgEIYRHH2sjNOPtqibMptfru7nsmeNZmGXq8Mtw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)Angular 团队提交规范

参考链接： **Angular Style Commit Message Conventions**[49]

## Commit Message 格式规范

`commit message` 由 Header、Body、Footer 组成。

```
<Header>

<Body>

<Footer>
复制代码
```

### Header

Header 部分包括三个字段 type（必需）、scope（可选）和 subject（必需）。

```
<type>(<scope>): <subject>
复制代码
```

**type**

type 用于说明 commit 的提交类型（必须是以下几种之一）。

| 值       | 描述                                                         |
| :------- | :----------------------------------------------------------- |
| feat     | 新增功能                                                     |
| fix      | 修复问题                                                     |
| docs     | 文档变更                                                     |
| style    | 代码格式（不影响功能，例如空格、分号等格式修正）             |
| refactor | 代码重构                                                     |
| perf     | 改善性能                                                     |
| test     | 测试                                                         |
| build    | 变更项目构建或外部依赖（例如 scopes: webpack、gulp、npm 等） |
| ci       | 更改持续集成软件的配置文件和 package 中的 scripts 命令，例如 scopes: Travis, Circle 等 |
| chore    | 变更构建流程或辅助工具                                       |
| revert   | 代码回退                                                     |

**scope**

scope 用于指定本次 commit 影响的范围。

scope 依据项目而定，例如在业务项目中可以依据菜单或者功能模块划分，如果是组件库开发，则可以依据组件划分。

**subject**

subject 是本次 commit 的简洁描述，长度约定在 50 个字符以内，通常遵循以下几个规范：

- 用动词开头，第一人称现在时表述，例如：change 代替 changed 或 changes
- 第一个字母小写
- 结尾不加句号（.）

### Body

body 是对本次 commit 的详细描述，可以分成多行。

跟 subject 类似，用动词开头，body 应该说明修改的原因和更改前后的行为对比。

### Footer

如果本次提交的代码是突破性的变更或关闭缺陷，则 Footer 必需，否则可以省略。

- 突破性的变更

  当前代码与上一个版本有突破性改变，则 Footer 以 BREAKING CHANGE 开头，后面是对变动的描述、以及变动的理由。

- 关闭缺陷

  如果当前提交是针对特定的 issue，那么可以在 Footer 部分填写需要关闭的单个 issue 或一系列 issues。

### 参考例子

- feat

  ```
  feat(browser): onUrlChange event (popstate/hashchange/polling)
  
  Added new event to browser:
  - forward popstate event if available
  - forward hashchange event if popstate not available
  - do polling when neither popstate nor hashchange available
  
  Breaks $browser.onHashChange, which was removed (use onUrlChange instead)
  复制代码
  ```

- fix

  ```
  fix(compile): couple of unit tests for IE9
  
  Older IEs serialize html uppercased, but IE9 does not...
  Would be better to expect case insensitive, unfortunately jasmine does
  not allow to user regexps for throw expectations.
  
  Closes #392
  Breaks foo.bar api, foo.baz should be used instead
  复制代码
  ```

- style

  ```
  style(location): add couple of missing semi colons
  复制代码
  ```

- chore

  ```
  chore(release): v3.4.2
  复制代码
  ```

## 集成 cz-git 实现规范提交

> 一款工程性更强，轻量级，高度自定义，标准输出格式的 **commitizen**[50] 适配器
>
> 官方网站：**cz-git**[51]

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBjaaTBbMHy0zXQSAibw601ovBrgkfNvn3IzcrPjiaicPeibDbBJ2kLw0pcQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)cz-git

### 安装依赖

```
npm install -D cz-git
复制代码
```

### 指定适配器

修改 `package.json` 文件，添加 `config` 指定使用的适配器

```
{
  "scripts": {},
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
复制代码
```

### 自定义配置（可选）

**cz-git 与 commitlint[52] 进行联动给予校验信息**，所以可以编写于 **commitlint**[53] 配置文件之中。

例如：(**⇒ 配置模板**[54])

```
/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {},
  prompt: {
    useEmoji: false,
    emojiAlign: 'center',
    allowCustomIssuePrefixs: false,
    allowEmptyIssuePrefixs: false,
  },
};
复制代码
```

本项目配置文件可参考：**commitlint.config.js**[55]

### 全局使用

> 全局安装的好处在于：在任何项目下都可以利用 `cz` 或 `git cz` 命令启动命令行工具，生成标准化 commit message

#### 安装全局依赖

```
npm install -g cz-git commitizen
复制代码
```

#### 全局配置适配器类型

```
echo '{ "path": "cz-git" }' > ~/.czrc
复制代码
```

#### 自定义配置（可选）

**方式一：** 编辑 `~/.czrc` 文件以 **json** 形式添加配置，例如：

```
{
  "path": "cz-git",
  "useEmoji": true
}
复制代码
```

**方式二：与 commitlint[56] 配合**，在 `$HOME` 路径下创建配置文件 (**↓ 配置模板**[57])

## 集成 commitlint 验证规范提交

在“代码规范”章节中提到，尽管制定了规范，但在多人协作的项目中，总有些人依旧我行我素。

因此提交代码这个环节，也增加一个限制：**只让符合 Angular 规范的 commit message 通过**。

此功能需借助 `@commitlint/config-conventional` 和 `@commitlint/cli` 工具来实现。

### 安装

- **`@commitlint/cli`**[58] - Commitlint 本体
- **`@commitlint/config-conventional`**[59] - 通用提交规范

```
npm i @commitlint/cli @commitlint/config-conventional -D
复制代码
```

### 配置

在项目根目录创建 `commitlint.config.js` 文件，并填入以下内容：

```
module.exports = {
  extends: ['@commitlint/config-conventional']
}
复制代码
```

使用 husky 命令在 `.husky` 目录下创建 `commit-msg` 文件，并在此执行验证命令：

```
npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"
复制代码
```

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBoRnnPEKE6fkib6lPzPspF11rwFNMt1ZQo5YJ7T7SzpC9J35dIwonnqg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)commit-msg

> 本项目完整代码托管在 **GitHub 仓库**[60]，欢迎点亮小星星 🌟🌟

# 自动部署

本章节将介绍如何使用 CI（Continuous Integration 持续集成）服务来完成项目部署工作。

常见的 CI 工具有 GitHub Actions、GitLab CI、Travis CI、Circle CI 等。

本项目使用 `GitHub Actions` 来完成这一操作。

🔗 参考链接：**GitHub Actions 入门教程**[61]

## 创建 GitHub 仓库

因为 GitHub Actions 只对 GitHub 仓库有效，所以**创建 GitHub 仓库**[62]来托管项目代码。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBFcsrwNsevDEDefwNo2icicnoXYhdp6OLwMibQF3LibpkYwiar4t9z2zQopg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)创建 GitHub 仓库

- `master` 分支存储项目源代码
- `gh-pages` 分支存储打包后的静态文件

## 创建 GitHub Token

创建一个有 **repo** 和 **workflow** 权限的 **GitHub Token**[63]

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBNP6vGUMUSXzUgE7ky2EdR8icvKUhNtjbZIZ26NjhglEZKO3bkDBKl5Q/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)创建 GitHub Token

> 注意：新生成的 Token 只会显示一次。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBQuOE3l0TW8LDib8x311JBJKX3mThmNQZLaANWl482hiaODNMuQhhEWWA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)Token

## 添加 Actions secret

将上述创建的 Token 添加到 GitHub 仓库中的 `Secrets` 里，并将这个新增的 `secret` 命名为 `VITE_VUE_DEPLOY` 。

步骤：仓库 -> `Settings` -> `Secrets` -> `Actions` -> `New repository secret`。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNB11cXYnVM4syD6bg7skjaNL8lLKnILz3rU99VlVvRNnUSAibic2ibyejcg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)New secret

> 注意：新创建的 secret `VITE_VUE_DEPLOY` 在 Actions 配置文件中要用到，两个地方需保持一致！

## 修改 package.json

打开 `package.json` 文件，新增 `homepage` 字段，表示该应用发布后的根目录（参见**官方文档**[64]）。

```
"homepage": "https://[username].github.io/github-actions-demo",
复制代码
```

上面代码中，将 `[username]` 替换成你的 GitHub 用户名，参见**范例**[65]。

## 创建 Actions 配置文件

（1）在项目根目录下创建 `.github` 目录。

（2）在 `.github` 目录下创建 `workflows` 目录。

（3）在 `workflows` 目录下创建 `deploy.yml` 文件。

![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQTKJwX2UrGjOSEIicyga1nNBkmwLaNrdtdPzu97SkWI8vnKWiaiclAkia9ibC6OsUyWWibT1wGqbP2BCcUw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1).github/workflows/deploy.yml

```
name: Vite Vue Deploy

on:
  push:
    # master 分支有 push 时触发
    branches: [master]

jobs:
  deploy:
    # 指定虚拟机环境
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x]

    steps:
      - name: Checkout
        # 拉取 GitHub 仓库代码
        uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        # 设定 Node.js 环境
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install
        # 安装依赖
        run: npm install

      - name: Build
        # 打包
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          # 部署打包目录
          folder: dist
          # 密钥名
          token: ${{ secrets.VITE_VUE_DEPLOY }}
          # 分支
          branch: gh-pages
复制代码
```

> 🔗 通过此链接 **ElanYoung.github.io/vite-vue-js…**[66] 即可访问本项目

# 文章总结

本文从技术选项到架构搭建、从代码规范约束到提交信息规范约束，一步一步带领大家如何从一个最简单的前端项目骨架到规范的前端工程化环境，基本涵盖前端项目开发的整个流程，特别适合刚接触前端工程化的同学学习。

 