#  MockJS

在开发环境中，由于后端与前端并行开发、或者前端需要等待后台接口开发。接口直接严重依赖，生成数据的业务逻辑复杂等，严重影响了开发效率。

因此学会使用最适合自己的 Mock 数据的方法就非常重要。

下面介绍了几种常用的mock方案，通过了解自动化mock的方式，减少重复工作，减少真实联调问题，我们可以根据开发场景，选择并配置最合适自己的方案。

------

# **六类常用的MOCK方案说明**

## 方案①：代码侵入 (实际开发中最常用，但不推荐)

> 特点：直接在代码中写死 Mock 数据，或者请求本地的 JSON 文件
> 优点：无
> 缺点：
>
> 1. 和其他方案比 Mock 效果不好
> 2. 与真实 Server 环境的切换非常麻烦，一切需要侵入代码切换环境的行为都是不好的

------

## 方案②：接口管理工具

> #### 代表：
>
> ##### rap[2]（阿里，已停止维护，使用rap2）
>
> ##### swagger[3]
>
> ##### moco[4]（参考[5], 和前端处理mock类似，json假数据+服务）
>
> ##### yapi[6](去哪儿网开发yapi 官网[7])
>
> ![图片](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQSlcTmicR1R4aFKsnOy6Jn73mg2XysEWXiaH9icuQLw4A5SrFeZB7h1lA8Zh6gMulBxibIs48MU5rWxLg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
>
> #### 优缺点(接口管理工具)
>
> 优点：
>
> 1. 配置功能强大，接口管理与 Mock 一体，后端修改接口 Mock 也跟着更改，可靠
> 2. 有统一的接口管理后台，查找使用方便。
>
> 缺点：
>
> 1. 配置复杂，依赖后端，可能会出现后端不愿意出手，或者等配置完了，接口也开发出来了的情况。mock数据都由后台控制，有什么异常情况 前端同学基本上使不上力。有背前后台分离的原则。
> 2. 一般会作为大团队的基础建设而存在， 没有这个条件的话需慎重考虑
> 3. 增加后台负担，与其让后台处理mock数据相关问题，倒不如加快提供真实接口数据。

------

## 方案③：本地 node 服务器

> 代表：**json-server**[8]
> 原理：使用**lowdb**[9]，操作本地小型的数据库(遵循 REST API)。特点：
>
> - 可以独立使用，也可以作为node服务的中间件 `server.use(db)`
> - db可以是json文件(更直观)，也可以使js文件(灵活性更高)
> - 可以设置跨域、开启gzip、设置延时、日志、指定路由等。`json-server [options] <source>`
> - 可命令行启动或 `json-server.json` 配置后直接启动
> - 可以自定义路由映射(key为真实路由、value为mock路由)
>
> #### 轻而易举的实现后台功能
>
> ```
> 过滤：GET /list?name.age=18；
> 分页: /users?_page=3&_limit=5
> 排序：/users?_sort=id&_order=desc
> 分隔：/users?_start=2&_end=5
> 运算：使用 _gte 或 _lte 选取一个范围、使用 _ne 排除一个值、使用 _like 进行模糊查找 (支持正则表达式)
> ......
> 复制代码
> ```

### 服务管理

增删改查参考postman示例。（注意body-raw要选择json模式）

优点：

1. 配置简单，json-server 甚至可以 0 代码 30 秒启动一个 REST API Server
2. 自定义程度高，一切尽在掌控中
3. 增删改查真实模拟

缺点：

1. 与接口管理工具相比，无法随着后端 API 的修改而自动修改

------

## 方案④：请求拦截[MOCKJS]

代表：**Mock.js**[10]

特点：

- 通过拦截特定的AJAX请求，并生成给定的数据类型的随机数，以此来模拟后端同学提供的接口。
- 使用数据模板定义，随机生成定义数据的自由度大。使用MockJS的Random工具类的方法定义，这种方式自由度小，只能随机出MockJS提供的数据类型。
- 一般配合其它库使用或单独在项目中使用或者通过反向代理来实现。

使用格式说明:

Mock.mock( rurl?, rtype?, template|function( options ) )

- rurl：可选，拦截的url地址，可以是**字符串或正则**(常用)
- rtype: 可选，拦截的请求类型，字符串（对大小写敏感，必须小写）。
- template|function( options )：必须，拦截后返回的数据。template一般为json对象类型；function在return时需要返回template，其中option包含请求的`url`、`type` 和 `body属性`
- `只传template，则执行Mock.mock后返回的是``template的实际结果``。`

### 简单示例展示：

#### 随机生成颜色

```
Mock.mock('@color') 
"#f279ba"
复制代码
```

#### 随机生成邮箱

```
Mock.mock('@email')
"k.fxnx@newvwi.gf"
复制代码
```

#### 随机生成ip

```
Mock.mock('@ip')
"44.122.28.106"
复制代码
```

#### 随机生成区域地址

```
Mock.mock('@region')
"东北"
复制代码
```

#### 还能随机生成图片（并可传参配置图片大小、颜色等）

```
Random.image() 
复制代码
```

#### 随机生成日期时间

```
Random.date()
// => "2020-10-23"
Random.date('yyyy-MM-dd')
// => "1998-01-29"
Random.time()
// => "22:44:56"
Mock.mock('@time')
// => "01:48:17"
复制代码
```

#### 按规则生成字符串

```
// 指定范围的数量
Mock.mock({ "string|1-10": "★" }) // 执行后
{ "string": "★★" } // 随机生成数量为1-10个'*'字符串

// 固定数量
Mock.mock({ "string|3": "*" })  // 执行后
{ "string": "***" } // 生成指定数量的'*'（示例是3个）字符串
复制代码
```

#### 生成指定范围内的数字

```
// 整数
Mock.mock({ "number|1-100": 100 }) // 执行后
{ "number": 84 } // 生成1-100范围内的数字

// 小数
Mock.mock({ "number|1-100.1-10": 1 }) // 执行后
{ "number": 72.15917 } // 生成1-100的数字，随机保留1-10位小数
复制代码
```

#### 生成随机的对象数量

```
Mock.mock({ "object|2-4": { 
"110000": "北京市", 
"120000": "天津市", 
"130000": "河北省",
"140000": "山西省" 
}}) 
// 执行后，随机获取对象中的2-4项
{ "object": { 
"120000": "天津市", 
"130000": "河北省" 
} }
复制代码
```

#### 生成指定数量的数组

```
Mock.mock({ "array|1": [ "AMD", "CMD", "UMD" ] })
{ "array": "CMD" } // 随机获取对象中的一项
复制代码
```

#### 生成对象数组

```
// list指定了数组当中的对象数量，最少一项，最多10项。
Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-10': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1
    }]
})
// 随机的结果
{
    "list": [
        {
            "id": 1
        },
        {
            "id": 2
        }
    ]
}
复制代码
```

#### ......

**更多示例可查看官方链接**[11]

### 语法规范

#### > 数据模板定义

定义规则：'key|rules': value

属性值的数据类型可以是Number、Boolean、String、Object、Array、Function、Null，不可以是Undefined

```
'name|min-max': value
'name|count': value
'name|min-max.dmin-dmax': value
'name|min-max.dcount': value
'name|count.dmin-dmax': value
'name|count.dcount': value
'name|+step': value
'regexp': /\d{5,10}/,
复制代码
```

拦截接口返回示例：

```
步骤：
1. 创建mock.js文件
// 正则匹配 /notification\/count/ 的接口
Mock.mock(/notification\/count/, {
  "code": 200,
  "msg": "success",
  "data": {
      "count": 3
  }
})
2. 在入口中引入mock即可

其它优化：
在npm script中增加命令并添加mock环境变量，开发环境中用该命令启动。
在入口文件中使用mock环境变量判断是否加载mock.js，使mock数据和业务代码彻底分离。
复制代码
```

#### > 查看和使用random

1. ```
   **全局使用**
   ```

```
npm install mockjs -g
random -h 查看可使用的模板
复制代码
```

1. **局部使用**

随机生成数据

Mock.mock( { email: '@email' } )占位符 等同于 调用了Mock.Random.email(), 随机生成email。

还可随机生成图片、颜色、地址、网址、自增数等。

1. ```
   **扩展模板（自定义MOCK数据的模板）**
   ```

```
Random.extend({
    constellation: function(date) {
        var constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
        return this.pick(constellations)
    }
})
复制代码
```

#### > Mock.valid(template, data) 校验数据

```
var tempObj = {
  "user|1-3" : [{'name':'@name', 'id|28-338': 88}]
 };
 var realData = { "user":[{'name': '张三','id':90 }]};
 // 校验通过返回空数据，不通过则返回原因。（可以有多条原因，因此返回的是数组对象结构）
 console.log(Mock.valid(tempObj,realData)); 
复制代码
```

#### > Mock.toJSONSchema( template )

把 Mock.js 风格的数据模板 `template` 转换成 **JSON Schema**[12]。

#### > Mock.setup( settings )

配置拦截 Ajax 请求时的行为。支持的配置项有：`timeout`。

```
Mock.setup({
    timeout: 400
})
Mock.setup({
    timeout: '200-600'
})
复制代码
```

### 优缺点(MOCKJS)

> 优点：
>
> 1. 与前端代码分离
> 2. 可生成随机数据
>
> 缺点：
>
> 1. 数据都是动态生成的假数据，无法真实模拟增删改查的情况
> 2. 只支持 ajax，不支持 fetch

------

## 方案⑤：抓包工具

> 利用 `Charles` 、`Fiddler`等代理工具，
> 常见的处理方式有
>
> - 将 URL 映射到本地文件；(调试APP混合开发等)
> - debugger某个url，修改响应数据。
> - 拦截后返回本地的数据，如`Charles，`直接采用Map locale 或者 Map Remote的方式。
>
> > 1. 右击url, copy response
> > 2. 在本地新建mock json数据，然后将response粘贴修改
> > 3. 再次访问url，观察api的变化。
>
> ##### 优缺点：
>
> 优点：mock便于混合开发的问题排查、线上问题排查等。
> 缺点：调试相对繁琐。

------

## 方案⑥：组合模式

> 代表：**easy-mock**[13]（提供在线服务和接口代理，支持mockjs、**Swagger**[14]、restapi风格）
> node框架生成器 + **json-server**[15] + mockjs。

## REST API

URI 代表 资源/对象，METHOD 代表行为 **www.ruanyifeng.com/blog/2014/0…**[16]

```
GET /tickets // 列表
GET /tickets/12 // 详情
POST /tickets  // 增加
PUT /tickets/12 // 替换
PATCH /tickets/12 // 修改
DELETE /tickets/12 // 删除
资源负数名称表示对应表的资源集合，方法动词。
复制代码
```

- 点 **我**[17] 了解 `patch vs put`

------

# 其它方案参考

- **`apifox`**

**API 文档、调试、Mock、自动化测试一体化协助平台**[18]
看评论推荐的人还真不少😆，感兴趣的小伙伴可以尝试一下。支持 HTTP、TCP、RPC,(`2020-12-28首版发布`)

> 常用解决方案：
>
> 1. 使用 Swagger 管理 API 文档
> 2. 使用 Postman 调试 API
> 3. 使用 RAP 等工具 Mock API 数据
> 4. 使用 JMeter 做 API 自动化测试

- **`jsonplaceholder`**

很方便，直接fetch远程的数据即可，高效易用



