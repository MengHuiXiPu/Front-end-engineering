// 遵循单项数据流的方式去改变数据
// 例如
export const obj={
    a:1,
    b:2
}
//使用obj
import {obj} from '.test.js'
obj.a=3
// 当频繁的使用obj对象时，你就无法通过代码去知道它的改变顺序（即在某个时刻它的值时什么）
// 而且这里可能存在不少异步代码，当我们换一种方式，就能知道它的改变顺序了，
// 例如
export const obj2={
    a:1,
    b:2
}

export  function setObj(key,value){
    console.log(key.value)
    obj[key]=value
}