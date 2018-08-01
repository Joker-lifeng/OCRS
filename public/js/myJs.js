// Vesion 0.1
// my函数封装库
/// / ------------华丽的分割线------------------- /////

// 判断对象的数据类型，是哪个构造器的实例对象。可以判断数组和类数组
function insObj (obj) {
  Object.prototype.toString.call(obj)
}

// 封装一个产生随机数函数.用法:getRandom(min, max)，参数是 min 和 max  ,返回值随机数.
function getRandom (min, max) {
  // min最低值 ，max最高值
  var sum = 0
  // 产生随机数
  sum = Math.floor(Math.random() * (max - min) + min)
  return sum
}

// 封装一个函数可以从父元素找到指定 class的儿子，参数 父元素，class名，标签名
function myGetClss (oParent, oClss, tag) {
  var tags = oParent.document.getElementsByTagName(tag)

  for (var i = 0; i < tags.length; i++) {
    if (tags[i].className == 'lis') {
      tags[i].style.backgroundColor = 'red'
    }
  }
}

// 封装一个函数可以获得dom元素距离页面page的绝对位置
function myGetOffset (dom) {
  // 定义信号量
  var isIE8 = false
  // 定义浏览器信息
  var str = window.navigator.userAgent
  // 检测浏览器
  if (str.indexOf('MSIE 8.0') === -1) {
    isIE8 = false
  } else {
    isIE8 = true
  }

  // 定义对象
  var result = {
    left: dom.offsetLeft,
    top: dom.offsetTop
  }
  // 使用while循环
  while (dom != document.body) {
    // 获取定位父元素
    dom = dom.offsetParent
    // 判定
    if (isIE8) {
      // 说明是IE8 不需要额外加上 外边框
      result.left += dom.offsetLeft
      result.top += dom.offsetTop
    } else {
      // 不是IE8 所以要加上边框的值
      result.left += dom.offsetLeft + dom.clientLeft
      result.top += dom.offsetTop + dom.clientTop
    }
  }
  // 返回对象
  return result
}

// 封装一个函数绑定事件 兼容chorme 和 ie8
function myBindEvent (dom, type, handler) {
  // 通过能力检测来识别当前浏览器支持哪一种能力
  // 能力检测就是利用了， 一个对象获取一个属性的时候，
  // 如能读取到，那就输出， 如果读取不到 也不会报错，而是undefined 这个特点。

  // 判断是否是onmousewheel事件
  if (type.toLowerCase() === 'mousewheel') {
    // 判定浏览器
    var isFF =
         window.navigator.userAgent.indexOf('Firefox') !== -1
    if (isFF) {
      // 说明是火狐浏览器
      dom.addEventListener('DOMMouseScroll', handler, false)
      // 终止执行
      return
    }
  }

  if (dom.addEventListener) {
    // 说明是高级浏览器
    dom.addEventListener(type, handler, false)
  } else if (dom.attachEvent) {
    // 说明是IE中的高级版本
    dom.attachEvent('on' + type, handler)
  } else {
    // 说明是IE的低级版本， 或者其他不知名的浏览器
    dom['on' + type] = handler
  }
}

// 封装 animate函数  //不用加px单位!
function myAnimat (dom, json, time, callback) {
  // 计数器
  var count = 0
  // 总次数 = 总距离 / 步长
  // 总次数 = 总时间 / 间隔时间
  // 定义一个间隔时间
  var interval = 20
  // 定义总次数
  var allCount = time / interval
  // json里面的每一个属性都是一个目标值
  // 我们要知道初始值，就可以计算出总距离
  // json里面有多少目标值 ， 我们就应该多少初始值
  var nowJson = {}
  // 该对象用来 存储初始状态， 要根据json里面的内容决定
  for (var i in json) {
    nowJson[i] = parseInt(getComputedStyle(dom)[i])
  }
  // 循环完毕之后 初始值也就有了
  // 在计算总距离和步长值

  // 定义用于存储步长值的对象
  var stepJson = {}
  for (var i in json) {
    stepJson[i] = (json[i] - nowJson[i]) / allCount
  }
  // 循环完毕后， 步长值就有了
  // 定时器
  var timer = setInterval(function () {
    // 计算器
    count++
    // 改变dom css值
    for (var i in json) {
      // 当前值 = 初始值 + 步长值 * 次数
      dom.style[i] = nowJson[i] + stepJson[i] * count + 'px'
    }
    // 判断是否到达目标位置
    if (count >= allCount) {
      // 强行将dom的css值拉倒终点
      for (var i in json) {
        dom.style[i] = json[i] + 'px'
      }
      // 停表
      clearInterval(timer)
      // 执行回调函数
      callback && callback()
    }
  }, interval)
}

// // 封装一个函数， 函数执行的时候，返回滚轮的方向
function myDirection (e) {
  // 查看 滚轮方向
  // console.log(e.wheelDelta);
  // 利用e.wheelDelta 是否是undefined 来判定浏览器
  if (typeof e.wheelDelta === 'undefined') {
    // 说明是火狐
    // console.log("火狐")
    // 判定滚轮方向
    if (e.detail > 0) {
      // console.log("往下滚动")
      return true
    } else {
      // console.log("往上滚动")
      return false
    }
  } else {
    // console.log("不是火狐");
    // 判定滚轮方向
    if (e.wheelDelta > 0) {
      // console.log("往上滚动")
      return false
    } else {
      // console.log("往下滚动")
      return true
    }
  }
}

// 封装一个产生随机数函数.用法:randomer.getRd()方法，参数是 min 和 max  ,返回值随机数
(function (window) {
  // 传参window 把局部变量暴露给window属性，变成全局变量
  // 定义一个构造函数
  Random = function () {
  }
  // 给Random构造函数添加原型方法, 实例化的对象都能使用这个方法
  Random.prototype.getRd = function (min, max) {
    var sum = 0
    // 产生随机数
    sum = Math.floor(Math.random() * (max - min) + min)
    return sum
  }
  // 给window顶级对象添加random属性，此时random是实例化对象,暴露到全局,再iffe外面都可以调用这个radnom对象
  window.randomer = new Random()
})(window)

// 封装 圣杯模式的继承 利用中间函数构造出的对象作为中间过度原型，产生原型链
// 参数-- origin,需要被继承的原始祖先构造函数，  taget 目标，需要去继承的子级构造函数
var grailMode = (function () {
  // 主要目的是来继承原型 并且互不影响  ,只继承原型的方法
  return function (origin, taget) {
    var TempFun = function () {
    } // 临时构造函数，用来中介
    TempFun.prototype = origin.prototype // 临时构造函数的原型指向taget
    taget.prototype = new TempFun() // origin的原型指向 临时构造函数的实例化对象
    taget.prototype.constructor = taget // 修改原型会导致原型失去自己构造函数的指向  保存原始的构造器
    taget.prototype.ancestor = origin // 超类：记录真正继承祖先的的原型
  }
})()

// 封装一个函数 可以计算开始值到结束值的累加值
function getSum (start, end) {
  // start开始值，  end累加值
  var sum = start // 定义一个sum累加值,就是开始值
  for (let i = start + 1; i <= end - start; i++) {
    sum = sum + i // 从开始值+1的位置开始循环，循环的最大值是end和start之间的差值
  }
  return sum
}

// 定义一个获取当前height最小的li的方法
function shortest (domArr) {
  // 定义一个最小的li的下标
  var idx = 0
  // 假定一个height最小的dom元素
  let min = domArr[0].offsetHeight
  for (let i = 0; i < domArr.length; i++) {
    // console.log(domArr[i].offsetHeight);
    // 如果当前下标的li的高小于了咱们定义的最小min那么....
    if (domArr[i].offsetHeight < min) {
      // 最小下标变成i
      idx = i
      // 最小height变成min,min成为for循环中最小的height，下一轮那min比较下一个dom元素的height
      min = domArr[i].offsetHeight
    }
  }
  // 返回height最小的li的下标
  return idx
}

// 封装截流器
function throttle (fun, options) {
  // 判断当前是打开节流器
  if (typeof fun === 'function') {
    // 参数适配
    var options = options || {context: null, args: [], time: 200}
    // 先把原来的timer延迟器关闭
    clearTimeout(fun.__throttle)
    // 再打开
    fun.__throttle = setTimeout(function () {
      fun.apply(options.context, options.args)
    }, options.time)
  } else if (typeof fun === 'boolean') {
    // 判断当前是关闭节流器
    // 此时fun是布尔值 那么options就是传递进来的函数
    clearTimeout(options.__throttle)
  }
}
