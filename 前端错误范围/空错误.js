uncaught TypeError: cannot read property 'c' of undefined
出现错误的根本原因 访问了null的属性 例如 null.[KeyboardEvent]
如何避免
使用可选连或者逻辑且
const obj={}
console.log(obj?.b?.c?.d)

console.log(obj.c&&obj.c)