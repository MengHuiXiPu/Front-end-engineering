// 前端的接口调用，一般都是比较繁琐的，这时候可以考虑使用单例模式，将所有的axios
// 请求都用一个函数封装一层，统一在这个函数中catch捕获接口调用的时候的未知错误，
function ajax(url,data,method='get'){
    const promise axios[method](url,data)
    return promise.then(res=>{

    }).catch(err=>{
        //统一处理错误
    })
}