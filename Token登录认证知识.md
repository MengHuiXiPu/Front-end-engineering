## 基于 Cookie/Session 的认证方案

> Cookie

- Cookie的工作原理

由于`HTTP`是一种无状态的协议，服务器单从网络连接上无从知道客户身份。怎么办呢？就给客户端们颁发一个通行证吧，每人一个，无论谁访问都必须携带自己通行证。这样服务器就能从通行证上确认客户身份了。这就是。`cookie`指的就是在浏览器里面存储的一种数据，仅仅是浏览器实现的一种数据存储功能。`cookie`的保存时间，可以自己在程序中设置。如果没有设置保存时间，应该是一关闭浏览器，`cookie`就自动消失。

`Cookie`实际上是一小段的文本信息。客户端请求服务器，如果服务器需要记录该用户状态，就使用`response`向客户端浏览器颁发一个`Cookie`。客户端浏览器会把`Cookie`保存起来。当浏览器再请求该网站时，浏览器把请求的网址连同该`Cookie`一同提交给服务器。服务器检查该`Cookie`，以此来辨认用户状态。服务器还可以根据需要修改`Cookie`的内容。

**注意**：`Cookie`功能需要浏览器的支持。如果浏览器不支持`Cookie`（如大部分手机中的浏览器）或者把`Cookie`禁用了，`Cookie`功能就会失效。不同的浏览器采用不同的方式保存`Cookie`。`IE`浏览器会以文本文件形式保存，一个文本文件保存一个`Cookie`。

- Cookie的不可跨域名性

`Cookie`具有不可跨域名性。根据`Cookie`规范，浏览器访问`Google`只会携带`Google`的`Cookie`，而不会携带`Baidu`的`Cookie`。浏览器判断一个网站是否能操作另一个网站`Cookie`的依据是域名。

> Session

`Session`是另一种记录客户状态的机制，**不同的是**`Cookie`保存在客户端浏览器中，而`Session`保存在服务器上。客户端浏览器访问服务器的时候，服务器把客户端信息以某种形式记录在服务器上。这就是`Session`。客户端浏览器再次访问时只需要从该`Session`中查找该客户的状态就可以了。

如果说`Cookie`机制是通过检查客户身上的“通行证”来确定客户身份的话，那么`Session`机制就是通过检查服务器上的“客户明细表”来确认客户身份。

`session` 也是类似的道理，服务器要知道当前发请求给自己的是谁。为了做这种区分，**服务器**就要给每个**客户端**分配不同的“身份标识”，然后**客户端**每次向服务器发请求的时候，都带上这个“身份标识”，服务器就知道这个请求来自于谁了。对于浏览器客户端，大家都默认采用 `cookie` 的方式，保存这个“身份标识”。

服务器使用`session`把用户的信息临时保存在了服务器上，用户离开网站后`session`会被销毁。这种用户信息存储方式相对`cookie`来说更安。

可是`session`有一个**缺陷**：如果`web`服务器做了负载均衡，那么下一个操作请求到了另一台服务器的时候`session`会丢失。

**提示**：`Session`的使用比`Cookie`方便，但是过多的`Session`存储在服务器内存中，会对服务器造成压力。

> Cookie与Session的区别和联系

1. `cookie`数据存放在客户的浏览器上，`session`数据放在服务器上；
2. `cookie`不是很安全，别人可以分析存放在本地的`COOKIE`并进行 `COOKIE`欺骗，考虑到安全应当使用`session`；
3. `session`会在一定时间内保存在服务器上。当访问增多，会比较占用你服务器的性能。考虑到减轻服务器性能方面，应当使用`COOKIE`；
4. 单个cookie在客户端的限制是3K，就是说一个站点在客户端存放的COOKIE不能超过3K；

`Cookie`和`Session`的方案虽然分别属于客户端和服务端，但是服务端的`session`的实现对客户端的`cookie`有依赖关系的，上面我讲到服务端执行`session`机制时候会生成`session`的id值，这个`id`值会发送给客户端，客户端每次请求都会把这个`id`值放到`http`请求的头部发送给服务端，而这个`id`值在客户端会保存下来，保存的容器就是`cookie`，因此当我们完全禁掉浏览器的`cookie`的时候，服务端的`session`也会不能正常使用。

## 基于token的认证方式

在大多数使用`Web API`的互联网公司中，`tokens` 是多用户下处理认证的最佳方式。

以下几点特性会让你在程序中使用基于Token的身份验证

1.无状态、可扩展

2.支持移动设备

3.跨程序调用

4.安全

### Token的起源

在介绍基于`Token`的身份验证的原理与优势之前，不妨先看看**之前**的认证都是怎么做的。

- 基于服务器的验证

我们都是知道`HTTP`协议是无状态的，这种无状态意味着程序需要验证每一次请求，从而辨别客户端的身份。

在这之前，程序都是通过在服务端存储的登录信息来辨别请求的。这种方式一般都是通过存储`Session`来完成。

- 基于服务器验证方式暴露的一些问题

1.`Seesion`：每次认证用户发起请求时，服务器需要去创建一个记录来存储信息。当越来越多的用户发请求时，**内存**的开销也会不断增加。

2.可扩展性：在服务端的内存中使用`Seesion`存储登录信息，伴随而来的是可扩展性问题。

3.`CORS`(跨域资源共享)：当我们需要让数据跨多台移动设备上使用时，跨域资源的共享会是一个让人头疼的问题。在使用`Ajax`抓取另一个域的资源，就可以会出现禁止请求的情况。

4.`CSRF`(跨站请求伪造)：用户在访问银行网站时，他们很容易受到跨站请求伪造的攻击，并且能够被利用其访问其他的网站。

在这些问题中，可扩展行是最突出的。因此我们有必要去寻求一种更有行之有效的方法。

### 基于Token的验证原理

基于Token的身份验证是**无状态**的，我们**不将**用户信息存在服务器中。这种概念解决了在服务端存储信息时的许多问题。`NoSession`意味着你的程序可以根据需要去增减机器，而不用去担心用户是否登录。

### 基于Token的身份验证的过程如下:

1. 用户通过用户名和密码发送请求。
2. 服务器端程序验证。

3.服务器端程序返回一个**带签名**的`token` 给客户端。

4.客户端储存`token`,并且每次访问`API`都携带`Token`到服务器端的。

5.服务端验证`token`，校验成功则返回请求数据，校验失败则返回错误码。

![图片](https://mmbiz.qpic.cn/sz_mmbiz/Voibl9R35rqpGHD6SeLs7u5GHzrLCn4g3uGpy7VYY90bPVs86jRRoj4lBD4VX6ae3T3fwrYdeCacPa7JlPlJkyw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### Tokens的优势

- 无状态、可扩展

在客户端存储的`Tokens`是无状态的，并且能够被扩展。基于这种无状态和不存储`Session`信息，负载负载均衡器能够将用户信息从一个服务传到其他服务器上。`tokens`自己`hold`住了用户的验证信息。

- 安全性

请求中发送`token`而不再是发送`cookie`能够防止`CSRF`(跨站请求伪造)。即使在客户端使用`cookie`存储`token`，`cookie`也仅仅是一个存储机制而不是用于认证。不将信息存储在`Session`中，让我们少了对`session`操作。

`token`是有时效的，一段时间之后用户需要重新验证。

- 可扩展性

`Tokens`能够创建与其它程序共享权限的程序。

- 多平台跨域

我们提前先来谈论一下`CORS`(跨域资源共享)，对应用程序和服务进行扩展的时候，需要介入各种各种的设备和应用程序。

### 需要设置有效期吗？

对于这个问题，我们不妨先看两个例子。一个例子是登录密码，一般要求定期改变密码，以防止泄漏，所以密码是有有效期的；另一个例子是安全证书。`SSL` 安全证书都有有效期，目的是为了解决吊销的问题。所以无论是从安全的角度考虑，还是从吊销的角度考虑，`Token` 都需要设有效期。

- 那么有效期多长合适呢？

只能说，根据系统的安全需要，尽可能的短，但也不能短得离谱

- 然后新问题产生了，如果用户在正常操作的过程中，`Token` 过期失效了，要求用户重新登录……用户体验岂不是很糟糕？

一种方案，使用 `Refresh Token`，它可以避免频繁的读写操作。这种方案中，服务端不需要刷新 `Token` 的过期时间，一旦 `Token` 过期，就反馈给前端，前端使用 `Refresh Token` 申请一个全新`Token` 继续使用。这种方案中，服务端只需要在客户端请求更新 `Token` 的时候对 `Refresh Token`的有效性进行一次检查，大大减少了更新有效期的操作，也就避免了频繁读写。当然 `Refresh Token` 也是有有效期的，但是这个有效期就可以长一点了，比如，以天为单位的时间。

- 时序图表示

使用 `Token` 和 `Refresh Token` 的时序图如下：

1）登录

![图片](https://mmbiz.qpic.cn/sz_mmbiz/Voibl9R35rqpGHD6SeLs7u5GHzrLCn4g34Uny6WZNWGDiaMWp4VrRSeorzZxmy2fSX9Zf1ia1CiaFqhrESeicRicySvQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



2）业务请求

![图片](https://mmbiz.qpic.cn/sz_mmbiz/Voibl9R35rqpGHD6SeLs7u5GHzrLCn4g3lUYMhGFibVbLUtibVibp8ic9IlYkkFybvBwUnS7fhmfiaW1tZCKxLuXTXCA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



3）`Token`过期，刷新 `Token`

![图片](https://mmbiz.qpic.cn/sz_mmbiz/Voibl9R35rqpGHD6SeLs7u5GHzrLCn4g3KGVxbKTOHkJmBdmEr0icq0M2bLibWia5Ml0EFcE2JV9elGN9glDeERheQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



上面的时序图中并未提到 `Refresh Token` 过期怎么办。不过很显然，`Refresh Token` 既然已经过期，就该要求用户重新登录了。

### 项目中使用token总结

使用基于 `Token` 的身份验证方法，在服务端**不需要**存储用户的登录记录。大概的流程是这样的：

1.前端使用用户名跟密码请求首次登录

2.后服务端收到请求，去验证用户名与密码是否正确

3.验证成功后，服务端会根据用户`id`、用户名、定义好的秘钥、过期时间生成一个 `Token`，再把这个 `Token` 发送给前端

4.前端收到 返回的`Token` ，把它存储起来，比如放在 `Cookie` 里或者 `Local Storage` 里

```
export interface User {token: string;userInfo: UserInfo | any;companyInfo: CompanyInfo | any;resources?: string[];}
save(key: string, value: any, storageType ?: StorageType) {  return this.storageService.put(    {      pool: key,      key: 'chris-app',      storageType: StorageType.localStorage    },    value  );}this.storageService.save(CACHE_USER_KEY, user);
```

5.前端每次路由跳转，判断 `localStroage` 有无 `token` ，没有则跳转到登录页。有则请求获取用户信息，改变登录状态；6.前端每次向服务端请求资源的时候需要在**请求头**里携带服务端签发的`Token`

```
HttpInterceptor => headers = headers.set('token', this.authService.getToken());
```

7.服务端收到请求，然后去验证前端请求里面带着的 `Token`。没有或者 `token` 过期，返回`401`。如果验证成功，就向前端返回请求的数据。

8.前端得到 `401` 状态码，重定向到登录页面。

```
HttpInterceptor =>   401: '用户登陆状态失效，请重新登陆。'
```

