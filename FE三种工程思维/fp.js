// 找出字符串中率先出现的四个非数字字符
// 非FP
var words = [], count = 0;
var text = str.split('');
for (var i = 0; couont < 4, i < text.length; i++) {
    if (!text[i].match(/[0-9]/)) {
        words = words.concat(text[i]);
        count++;
    }
}

// FP
const world = str => str.split('').filter(x => !x.match(/[1-9]+/)).slice(0, 4)

// 分别实现数组元素的相加、相乘、想与

// 非FP

function plus(array) {
    var res = array[0];
    for (let i = 1; i < array.length; i++) {
      res += array[i];   
    }
  }
  
  function mul(array) {
    var res = array[0];
    for (let i = 1; i < array.length; i++) {
      res *= array[i];
    }
  }
  
  function and (array) {
    var res = array[0];
    for (let i = 1; i < array.length; i++) {
      res = res & array[i];
    }
  }
  
  plus(array);
  mul(array);
  and(array);



// FP
var ops = { 
    "plus": (x,y)=>x+y,
    "mul" : (x,y)=>x*y,
    "and" : (x,y)=>x&y
  }
  
  function operation(op, array) {
    return array.slice(1).reduce(ops[op], array[0]);
  } 
  
  operation("plus", array);
  operation("mul",  array);
  operation("and",  array);