# gongchenghua
前端工程化
1.如何知道iframe下载完成
定时器轮询监听readyState的状态，如果是 complete 或者 interactive 说明文件加载完成。
let iframe = document.createElement('iframe');
iframe.src = path;
iframe.style.display = 'none';
document.body.appendChild(iframe);
const timer = setInterval(() => {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (iframeDoc.readyState == 'complete' || iframeDoc.readyState == 'interactive') {
        document.body.removeAttribute(iframe);
        clearInterval(timer);
        resolve('success');
    }
}, 1000);

2.常用的全屏居中 JS 函数
//获取元素
function getElement(ele) {
  return document.getElementById(ele);
}
//自动居中函数
function autoCenter(el) {
  var bodyX = document.documentElement.offsetWidth || document.body.offsetWidth;
  var bodyY =
    document.documentElement.offsetHeight || document.body.offsetHeight;

  var elementX = el.offsetWidth;
  var elementY = el.offsetHeight;

  el.style.left = (bodyX - elementX) / 2 + "px";
  el.style.top = (bodyY - elementY) / 2 + "px";
}

3.JS实现deepCopy
function getType(obj) {
    // 为啥不用typeof? typeof无法区分数组和对象
    if(Object.prototype.toString.call(obj) == '[object Object]') {
        return 'Object';
    }

    if(Object.prototype.toString.call(obj) == '[object Array]') {
        return 'Array';
    }
    return 'nomal';
};

function deepCopy(obj) {
    if (getType(obj) == 'nomal') {
        return obj;
    } else {
        var newObj = getType(obj) == 'Object' ? {} : [];
        for(var key in obj) {
            // 为啥要用hasOwnProperty？不需要从对象的原型链上进行复制
            if(obj.hasOwnProperty(key)) {
                newObj[key] = deepCopy(obj[key]);
            }
        }
    }
    return newObj;
}


var object = [
  {
    title: 'test',
    checked: false
  }
];

deepCopy(object);

4.生成星级评分
const StartScore = rate => "★★★★★☆☆☆☆☆".slice(5 - rate, 10 - rate);
const start = StartScore(3);
// start => "★★★"

5.JS数组扁平化之简单方法实现

toString
const arr = [1, 2, 3, [4, 5, [6, 7]]];

const flatten = arr.toString().split(',');

console.log(flatten);
优点：简单，方便，对原数据没有影响 缺点：最好数组元素全是数字或字符，不会跳过空位

join
const arr = [1, 2, 3, [4, 5, [6, 7]]];

const flatten = arr.join(',').split(',');

console.log(flatten);
优点和缺点同toString

flat
const arr = [1, 2, 3, [4, 5, [6, 7]]];
const flatten = arr.flat(Infinity);

console.log(flatten);
优点：会跳过空位，返回新数组，不会修改原数组
扩展运算符(...)
const arr = [1, 2, 3, [4, 5]];
console.log([].concat(...arr));
优点：简单，方便 缺点：只能扁平化一层

5.使用 :not() 来精简css代码
// 不使用:not()
.nav li {
  border-right: 1px solid #666;
}
.nav li:last-child {
  border-right: none;
}

// 使用:not()
.nav li:not(:last-child) {
  border-right: 1px solid #666;
}

// 或者使用兄弟选择符~
.nav li:first-child ~ li {
  border-left: 1px solid #666;
}

6.文本溢出处理
移动设备相对来说页面较小，很多时候显示的一些信息都需要省略部分。最常见的是单行标题溢出省略，多行详情介绍溢出省略。现在都用框架开发了，这种建议需求建议形成一个基础组件，方便快捷
//单行
.single {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
//多行
.more {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  work-break: break-all;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; //指定行数
}

7.Git Flow工作流程

master主分支
伴随整个项目周期的分支

功能分支（feature branch）
从master切，顾名思义，开发每一个功能的分支，开发完的功能合并到release分支。

补丁分支（hotfix branch）
从master切，修复BUG分支，测试完直接合并到master。

预发分支（release branch）
从master切，需要测试的功能都合并到该分支上进行测试。
一旦开发完成，就会把release分支合并到master分支，并删除原分支。

8.JS实现列表操作
经常使用列表，比如待办事项列表、购物车等，如果数据不太多的话，列表就显得尤为有用
function list() {
    this.dataStore = []; //初始化数组
    this.clear = clear; //清除列表
    this.remove = remove; //移除列表中的元素
    this.find = find; //寻找列表中的元素
    this.length = length; //返回列表的长度
}

function find(element) {
    for (var i = 0, len = this.dataStore.length; i < len; i++) {
        if (this.dataStore[i] === element) {
            return i;
        }
    }
    return -1;
}

function remove(element) {
    for (var i = 0, len = this.dataStore.length; i < len; i++) {
        if (this.dataStore[i] === element) {
            this.dataStore.splice(i, 1);
        }
    }
    return this.dataStore;
}

function length() {
    return this.dataStore.length;
}

function clear() {
    this.dataStore = [];
}
