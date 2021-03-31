1优化角度：性能加载时优化，运行时优化

new Date().getTime()-performance.timing.navigationStart
加载时优化————让网站加载时间变短 
    性能标志： 白屏时间：输入网址，到页面开始显示内用的时间。</head>之前调用
              首屏时间：输入网址，到首屏页面内容渲染完毕的时间。window.onload中执行
运行时优化：运行时页面的性能表现，可以使用 chrome开发者工具中的perfoamancemia
面板来分析页面的运行时性能

浏览器加载网址：
DNS解析-ip解析-tcp链接-浏览器http请求-服务器接收请求-服务器处理请求并返回http请求-浏览器接收请求并渲染页面
该过程可以的优化点
1.DNS解析优化，浏览器访问dns的时间可以缩短
2.使用http2
3.减少http请求数量
4.减少http请求大小
5.服务器渲染
6.静态资源使用cdn
7.资源缓存，不重复加载相同的资源

细则；浏览器第一次对服务器的请求DNS解析流程
　浏览器缓存－系统缓存－路由器缓存－ISP DNS缓存-递归搜索
在head中使用link标签来强制对NDS预解析
<link ref='dns-prefetch' href="http://xxxxxxxxxx"/>
注意点：dns-prefetch需慎用，多页面重复dns预解析会增加重复NDS查询次数

运行时新能优化
1.减少重绘重排
    页面渲染 dom树-cssom树-render树-遍历rende树-绘制到屏幕
重绘不一定重排，重排一定重绘
出发重排的时机 DOM元素的增减，位置、尺寸、内容的变化  页面浏览器初始化 浏览器窗口大小发生改变

