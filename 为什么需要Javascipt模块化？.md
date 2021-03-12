## 为什么需要Javascipt模块化？

前端的发展日新月异，前端工程的复杂度也不可同日而语。原始的开发方式，随着项目复杂度提高，代码量越来越多，所需加载的文件也越来越多，这个时候就需要考虑如下几个问题:

1. 命名问题：所有文件的方法都挂载到`window/global`上，会污染全局环境，并且需要考虑命名冲突问题
2. 依赖问题：`script`是顺序加载的，如果各个文件文件有依赖，就得考虑`js`文件的加载顺序
3. 网络问题：如果`js`文件过多，所需请求次数就会增多，增加加载时间

`Javascript`模块化编程，已经成为一个迫切的需求。理想情况下，开发者只需要实现核心的业务逻辑，其他都可以加载别人已经写好的模块。

本文主要介绍`Javascript`模块化的4种规范: `CommonJS`、`AMD`、`UMD`、`ESM`。

## CommonJS

`CommonJS`是一个更偏向于服务器端的规范。`NodeJS`采用了这个规范。`CommonJS`的一个模块就是一个脚本文件。`require`命令**第一次加载该脚本时就会执行整个脚本，然后在内存中生成一个对象**。



```
{
  id: '...',
  exports: { ... },
  loaded: true,
  ...
}
```

`id`是模块名，`exports`是该模块导出的接口，loaded表示模块是否加载完毕。

以后需要用到这个模块时，就会到`exports`属性上取值。**即使再次执行`require`命令，也不会再次执行该模块，而是到缓存中取值**。

```
// utile.js
const util = {
  name:'names'
  sayHello:function () {
      return 'Hello ';
  }
}
// exports 是指向module.exports的一个快捷方式
module.exports = util
// 或者
exports.name = util.name;
exports.sayHello = util.sayHello;

const selfUtil = require('./util');
selfUtil.name;            
selfUtil.sayHello(); 
```

- `CommonJS`是同步导入模块
- `CommonJS`导入时，它会给你一个导入对象的副本
- `CommonJS`模块不能直接在浏览器中运行，需要进行转换、打包

由于`CommonJS`是同步加载模块，这对于服务器端不是一个问题，因为所有的模块都放在本地硬盘。等待模块时间就是硬盘读取文件时间，很小。但是，对于浏览器而言，它需要从服务器加载模块，涉及到网速，代理等原因，一旦等待时间过长，浏览器处于”假死”状态。

所以在浏览器端，不适合于`CommonJS`规范。所以在浏览器端又出现了一个规范—-`AMD`。

## AMD

`AMD`(`Asynchronous Module Definition` - 异步加载模块定义)规范，一个单独的文件就是一个模块。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。

**这里异步指的是不堵塞浏览器其他任务（`dom`构建，`css`渲染等），而加载内部是同步的（加载完模块后立即执行回调）**。

`AMD`也采用`require`命令加载模块，但是不同于`CommonJS`，它要求两个参数：

```
require([module], callback);
```

第一个参数[module]，是一个数组，里面的成员是要加载的模块，`callback`是加载完成后的回调函数，回调函数中参数对应数组中的成员（模块）。

`AMD`的标准中，引入模块需要用到方法`require`，由于`window`对象上没定义`require`方法， 这里就不得不提到一个库，那就是[RequireJS](https://requirejs.org/)。

官网介绍`RequireJS`是一个`js`文件和模块的加载器，提供了加载和定义模块的`api`，当在页面中引入了`RequireJS`之后，我们便能够在全局调用`define`和`require`。

```
define(id?, dependencies?, factory);
```

- id：模块的名字，如果没有提供该参数，模块的名字应该默认为模块加载器请求的指定脚本的名字
- dependencies：模块的依赖，已被模块定义的模块标识的数组字面量。依赖参数是可选的，如果忽略此参数，它应该默认为 `["require", "exports", "module"]`。然而，如果工厂方法的长度属性小于3，加载器会选择以函数的长度属性指定的参数个数调用工厂方法。
- factory：模块的工厂函数，模块初始化要执行的函数或对象。如果为函数，它应该只被执行一次。如果是对象，此对象应该为模块的输出值。



```
// 定义一个moduleA.js
define(function(){
  const name = "module A";
  return {
    getName(){
      return name
    }
  }
});

// 定义一个moduleB.js
define(["moduleA"], function(moduleA){
  return {
    showFirstModuleName(){
      console.log(moduleA.getName());
    }
  }
});

// 实现main.js
require(["moduleB"], function(moduleB){
  moduleB.showFirstModuleName();
});
```

```
<html>
<!-- 此处省略head -->
<body>
    <!--引入requirejs并且在这里指定入口文件的地址-->
    <script data-main="js/main.js" src="js/require.js"></script>
</body>
</html>
```

要通过`script`引入`requirejs`，然后需要为标签加一个属性`data-main`来指定入口文件。

前面介绍用`define`来定义一个模块的时候，直接传“模块名”似乎就能找到对应的文件，这一块是在哪实现的呢？其实在使用`RequireJS`之前还需要为它做一个配置：



```
// main.js
require.config({
  paths: {
    // key为模块名称， value为模块的路径
    "moduleA": "./moduleA",
    "moduleB": "./moduleB"
  }
});

require(["moduleB"], function(moduleB){
    moduleB.showFirstModuleName();
});
```

这个配置中的属性`paths`只写模块名就能找到对应路径，不过这里有一项要注意的是，路径后面不能跟`.js`文件后缀名，更多的配置项请参考[RequireJS](https://requirejs.org/)官网。



## UMD

`UMD` 代表通用模块定义（`Universal Module Definition`）。所谓的通用，就是兼容了`CmmonJS`和`AMD`规范，这意味着无论是在`CmmonJS`规范的项目中，还是`AMD`规范的项目中，都可以直接引用`UMD`规范的模块使用。

原理其实就是在模块中去判断全局是否存在`exports`和`define`，如果存在`exports`，那么以`CommonJS`的方式暴露模块，如果存在`define`那么以`AMD`的方式暴露模块:

```
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["jquery", "underscore"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("jquery"), require("underscore"));
  } else {
    root.Requester = factory(root.$, root._);
  }
}(this, function ($, _) {
  // this is where I defined my module implementation
  const Requester = { // ... };
  return Requester;
}));
```

这种模式，通常会在`webpack`打包的时候用到。`output.libraryTarget`将模块以哪种规范的文件输出。



## ESM

在ECMAScript 2015版本出来之后，确定了一种新的模块加载方式，我们称之为`ES6 Module`。它和前几种方式有区别和相同点:

- 它因为是标准，所以未来很多浏览器会支持，可以很方便的在浏览器中使用
- 它同时兼容在`node`环境下运行
- 模块的导入导出，通过`import`和`export`来确定
- 可以和`CommonJS`模块混合使用
- `CommonJS`输出的是一个**值的拷贝**。ES6模块输出的是**值的引用**,加载的时候会做静态优化
- `CommonJS`模块是**运行时加载**确定输出接口，ES6模块是**编译时**确定输出接口

ES6模块功能主要由两个命令构成：`import`和`export`。`import`命令用于输入其他模块提供的功能。`export`命令用于规范模块的对外接口。

`export`的几种用法



```
// 输出变量
export const name = 'Clearlove';
export const year = '2021';

// 输出一个对象（推荐）
const name = 'Clearlove';
const year = '2021';
export { name, year}


// 输出函数或类
export function add(a, b) {
  return a + b;
}

// export default 命令
export default function() {
  console.log('foo')
}
```

`import`导入模块:

```
// 正常命令
import { name, year } from './module.js';

// 如果遇到export default命令导出的模块
import ed from './export-default.js';
```

模块编辑好之后，它有两种形式加载

### 浏览器加载

浏览器加载ES6模块，使用`<script>`标签，但是要加入`type="module"`属性。

- 外链js文件：

```
<script type="module" src="index.js"></script>
```

- 内嵌在网页中

```
<script type="module">
  import utils from './utils.js';
  // other code
</script>
```

对于加载外部模块，需要注意：

- 代码是在模块作用域之中运行，而不是在全局作用域运行。**模块内部的顶层变量，外部不可见**
- 模块脚本自动采用严格模式，不管有没有声明`use strict`
- 模块之中，可以使用`import`命令加载其他模块（.js后缀不可省略，需要提供绝对 URL 或相对 URL），也可以使用`export`命令输出对外接口
- **模块之中，顶层的`this`关键字返回`undefined`，而不是指向`window`**。也就是说，在模块顶层使用`this`关键字，是无意义的
- **同一个模块如果加载多次，将只执行一次**



### Node加载

Node要求 ES6 模块采用`.mjs`后缀文件名。也就是说，只要脚本文件里面使用`import`或者`export`命令，就必须采用`.mjs`后缀名。Node.js 遇到`.mjs`文件，就认为它是 ES6 模块，默认启用严格模式，不必在每个模块文件顶部指定`use strict`。

如果不希望将后缀名改成`.mjs`，可以在项目的`package.json`文件中，指定`type`字段为

```
{
  "type": "module"
}
```

一旦设置了以后，该目录里面的 JS 脚本，就被解释用 ES6 模块。

```
# 解释成 ES6 模块 
$ node my-app.js
```

如果这时还要使用 `CommonJS` 模块，那么需要将 `CommonJS` 脚本的后缀名都改成`.cjs`。如果没有`type`字段，或者`type`字段为`commonjs`，则`.js`脚本会被解释成 `CommonJS` 模块。

总结为一句话：`.mjs`文件总是以 `ES6` 模块加载，`.cjs`文件总是以 `CommonJS` 模块加载，`.js`文件的加载取决于`package.json`里面`type`字段的设置。

注意，`ES6` 模块与 `CommonJS` 模块尽量不要混用。`require`命令不能加载`.mjs`文件，会报错，只有`import`命令才可以加载`.mjs`文件。反过来，`.mjs`文件里面也不能使用`require`命令，必须使用`import`。

`Node`的`import`命令只支持异步加载本地模块(`file:`协议)，不支持加载远程模块。

## 总结

- 由于 `ESM` 具有简单的语法，异步特性和可摇树性，因此它是最好的模块化方案
- `UMD` 随处可见，通常在 `ESM` 不起作用的情况下用作备用
- `CommonJS` 是同步的，适合后端
- `AMD` 是异步的，适合前端