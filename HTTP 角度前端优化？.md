# HTTP 角度前端优化？

## 以图片为例：资源体积压缩

就拿图片来举例子，tinypng / tinyjpg，全球知名的图片在线压缩工具。只要是对图片质量要求没那么苛刻的网站，用这种压缩图片工具把体积减小个 50%（甚至更多），普通人的肉眼几乎是看不出区别的。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pn45hyXbxDqVIjsQzkgRV4CicDFY41LKibqNDyZ9wGwI4fswWnwRkWvMuFHibubqqRHSR6icatKkHJm128CmNIO0Xg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

图片压缩前后对比

比如上面这两只国宝，一个是压缩前（**60 kb**），另一个是压缩后（**15 kb**），各位能看出来哪个是哪个吗？

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

## 推翻无脑打包：按需加载

还记得[上篇文章](http://mp.weixin.qq.com/s?__biz=MzIwNTU3NTI4Ng==&mid=2247485343&idx=1&sn=bd6aeb6f8ef420beec6707ed92f5a08b&chksm=972f8286a0580b90a11f36a47bf3cdfaa86be2ba1b85e7f22bc4734222eefb1cd61d1f2934d0&scene=21#wechat_redirect)提到的“减少 HTTP 请求数量”的性能优化方法吗？其中最常用的就是把所有能打包在一起的静态资源都打包成一个文件，比如 JS、CSS 等。

但这样的做法没有问题吗？当然有，不然我也不会 cue 它。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

打包资源这件事，主要有两个问题：

1. 自从进入 HTTP/1.1、HTTP/2 以后，TCP 协议层已经做了很大程度的优化。对于前端来说，请求数量再也不是一个迫在眉睫的问题了
2. 现代前端工程的复杂度今非昔比，复杂的交互逻辑、繁重的第三方依赖，如果再将所有资源文件打包在一起，那打包结果的体积将变得非常大，虽然请求数量得到了减少，但资源的下载速度反而变得很慢，得不偿失

比如下面这个例子，小明只想访问我的博客首页，但服务器把打包之后的 js 文件返回给了他（包含四个页面的 js），于是不仅浪费了网络带宽，还导致浏览器费劲解析了很多没用的 js，很没有必要。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

只访问首页却得到了所有js

最理想的情况，就是下面这张图描绘的场景：当用户访问首页（index）时，只返回首页对应的资源。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

访问首页只得到了首页的资源

拿 Vue 举例，只要在定义路由文件时用 dynamic import 的语法定义页面对应的组件，即可实现基于路由的组件按需加载。

```
// ...
{
 name: 'Home',
 path: '/home',
 component: () => import('@/components/Home.vue'),
}
// ...
```

## Gzip：服务器端资源压缩

前后端一家亲，性能优化这件事情，如果后端的老哥能帮一把，那效果肯定是一加一大于二的。

HTTP 协议本身是支持多种报文压缩算法的，比如 gzip、deflate、br 等，它们有一个共同的名字：**HTTP 压缩**。

我们就拿 gzip 举例子。浏览器向服务器请求资源时，请求头中有一个字段：`Accept-Encoding`，代表了浏览器支持的 HTTP 压缩算法。服务端在接受到这个信息后，会用浏览器支持的压缩算法对报文进行压缩，同时在响应头中附上两个关键字段：`Content-Encoding` 和 `Content-Length`，前者表示当前使用的压缩算法，而后者是当前资源压缩后的大小。一般情况下，gzip 能将文本文件压缩为原来大小的 30%，奇效。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

gzip.png

我们来看下服务器端控制 gzip 压缩的关键字段（nginx）：

```
# ngx_http_gzip_module

# 开启或关闭 gzip 功能
gzip: on | off

# 设置 gzip 压缩文件使用缓存空间的大小
# 默认值：gzip_buffers 32 4k | 16 8k
gzip_buffers: number size

# gzip 压缩力度，取值范围 1~9
# 数值越小，压缩力度越小，压缩得越快；数值越大，压缩力度越大，压缩得越慢
gzip_comp_level: level

# 匹配浏览器的 UserAgent（支持正则表达式）
# 若命中匹配，则会关闭 gzip
gzip_disable regex

# 开启 gzip 时最低的 HTTP 版本
zip_http_version: 1.0 | 1.1

# 该指令用来指定资源的字节数
# 只有当资源的大小大于这个值时，才启用 gzip 压缩
gzip_min_length: length
```

## 如何解决服务**端压缩的性能问题**

目前看起来，服务端 HTTP 压缩是比较完美的优化方案，但，**在技术领域是没有银弹的**。

> 银弹：Silver Bullet，在软件工程领域指一种能解决问题并且没有任何瑕疵的方法。

到底会有什么问题呢？

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

服务器在返回gzip压缩文件之前都做了什么

从图中可以看到服务端在向浏览器传递所需资源时的三个关键步骤。其中有个被虚线框起来的步骤，即“压缩”这一步：服务端在每一次返回资源前，都会都需要压缩资源进行压缩，而每一次压缩都是要消耗服务端的算力的。假设一个极端的情况，你的网站只有一个服务器，而用户却有十万人......慌了吗？

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

这个时候，就该伟大的前端工程师们出手了。如果我们能在前端就把资源都压缩好，再把压缩好的资源放在服务器上等待浏览器享用就行了。思路看起来没什么问题，能实现吗？难不成浏览器有这么大的能耐，还能压缩文件？

小了，格局小了。前端可不止浏览器哦，在前端工程化的世界里，“构建”可是一个很关键的步骤。这下各位思路就开阔了吧：没错，可以在构建的时候整些花里胡哨的，比如我们现在正需要的 gzip 压缩。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

前端构建时gzip.png

这里举两个例子，一个是**老牌王者 webpack**，另一个是**闪亮新秀 vite**。

### 如何在 webpack 中开启 gzip 压缩

webpack 对于 gzip 的配置还是蛮简单的，只需要一个叫做 `compression-webpack-plugin` 的插件就行：

```
const compressWebpackPlugin = require('compression-webpack-plugin');
// ...
configureWebpack: {
 plugins: [
  new compressWebpackPlugin({
   filename: '[path].gz[query]',
   algorithm: 'gzip',
   test: /\.(js|css)$/,
   threshold: 1024,
   minRatio: 0.8,
   deleteOriginalAssets: false,
  }),
 ],
}
// ...
```

### 如何在 vite 中开启 gzip 压缩

如果说在 webpack 开启 gzip 的难度是 `1 + 1`，那在 vite 中开启 gzip 的难度就是 `1` 本身：

```
import viteCompression from 'vite-plugin-compression';
// ...
plugins: [ viteCompression() ],
// ...
```

诶，为什么能这么简单呢，因为 `vite-plugin-compression` 这个插件本身提供的配置是有默认值的，而这些默认值刚好满足我们基本的要求，所以就有了开箱即用的假象（大多数号称“开箱即用”的插件或工具，几乎都是因为默认值比较抗打罢了...）。