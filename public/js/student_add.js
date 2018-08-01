//  ---------表单验证的业务逻辑
//  获得元素
var $addStudentForm = $('#addStudentForm')
var $submitBtn = $('#submitBtn')
var $inputCheckeValid = $('#addStudentForm [checkeValid]')  // 获得form表单中所有具有checkeValid 不合法验证属性的控件
var $sidInput = $('#addStudentForm input[name=sid]') // sid输入框
var $nameInput = $('#addStudentForm input[name=name]') // 姓名输入框
var $passwordInput = $('#addStudentForm input[name=password]') // 密码输入框
var $gradeInput = $('#addStudentForm select[name=grade]') // 姓名输入框
var $inputOfText = $addStudentForm.find('input[type=text]')  //   获得所有form下面text类型的控件

//    拓展jquery对象的功能 :增加一些调用显示警告框和删除警告框的方法
$.fn.extend({
  //  警告框生成的函数 txt:内部文本
  'dangerTip': function (txt) {
    this.after($('<div class="alert alert-danger tip" role="alert">' + txt + '</div>'))
  },
  //  提示正确框
  'successTip': function (txt) {
    this.after($('<div class="alert alert-success tip" role="alert">' + txt + '</div>'))
  },
  //  移除input的所有警告框方法
  'clearTip': function () {
    this.nextAll('.alert').remove()
  },
})

//  封装提交验证函数,验证invalid对象的属性是否都为false，如果都是那么提交按钮变为可点击
function subumitChek () {
  for (var key in invalid) {
    //  如果invalid的 key值是true那代表不合法那么直退出循环
    if (invalid[key]) {
      // console.log('invalid不合法')
      $submitBtn.attr('disabled', true) //  不合法那么将提交按钮的disabled属性不可提交属性变为false
      return
    }
  }
  //    for in循环结束都没有 break那代表invalid对象中的属性都是false合法了 那么可以提交
  $submitBtn.attr('disabled', false) //  将提交按钮的disabled不可提交属性变为false
}

// 封装密码强度验证函数
function passwordStrength (password){
  var lv = 0
  if (password.match(/[a-z]/g)) {lv++}
  if (password.match(/[0-9]/g)) {lv++}
  if (password.match(/(.[^a-z0-9])/g)) {lv++}  // 不以小写字符和数字 那么lv加一
  if (password.length < 6) {lv = 0}
  if (lv > 3) {lv = 3}
  return lv
}

//    提交按钮的click事件监听
$submitBtn.click(function () {
  //    获得表单序列化数据（控件value ）
  var form = $addStudentForm.serialize()
  console.log(form)
  //  发送ajax
  $.ajax({
    type: 'post',
    url: '/student', // 增加学生路由
    data: form,
    dataType: 'json',
  }).done(function (data) {
    //  如果错误信号为1 那么表示增加错误
    if (data.err) {
      alert('增加学生失败,请重试或者联系管理员')
    } else {
      // 如果data错误信号为0 清空form中 input【type=txt】的val 可以再次进行添加学生
      $inputOfText.val('') // text控件的val变为空
      alert(data.msg)
    }
  }).fail(function () {
    console.log('连接服务器失败')
  })
  
})

//  定义一个valid不合法对象 对象中的key就是表单input中的name， true代表不合法 ，默认不合法(默认表单有罪)
var invalid = {
  sid: true,
  name: true,
  grade: true,
  password: true,
}

//  sid学号输入框监听事件验证输入的内容
$sidInput.on('blur', function () {
  var txt = $(this).val()
  //  正则验证txt输入内容
  if (/^[\d]{9}$/.test(txt)) {
    //  正则为 true 那么提示正确 那么把invalid对象的sid变为 false
    invalid.sid = false
    console.log('输入正确')
    $(this).successTip('输入正确')
  } else {
    //    正则为false 那么提示框警告错误 并把invalid对象的sid变为 ftrue
    // var html = CreattipHtml(txt, 'danger')
    $(this).dangerTip('输入的学号不合法，必须是9位数字')
    invalid.sid = true
    console.log('输入错误')
  }
  
})
//  name姓名输入框blur事件 进行正则验证
$nameInput.on('blur', function () {
  var txt = $(this).val()
  //  正则验证txt输入内容
  if (/^[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*$/.test(txt)) {
    //  正则为 true 那么提示正确 那么把invalid对象的sid变为 false
    invalid.name = false
    // console.log('输入正确')
    $(this).successTip('输入正确')
  } else {
    //    正则为false 那么提示框警告错误 并把invalid对象的sid变为 ftrue
    // var html = CreattipHtml(txt, 'danger')
    $(this).dangerTip('输入的姓名不合法，请重新输入')
    invalid.name = true
    // console.log('输入错误')
  }
  
})
//  grade年级select选择下拉框绑定jq对象的change事件 进行验证选择
$gradeInput.on('change', function () {
  var txt = $(this).val()
  // console.log(txt)
  //  正则验证txt输入内容
  if (/^[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*$/.test(txt)) {
    //  正则为 true 那么提示正确 那么把invalid对象的sid变为 false
    invalid.grade = false
    subumitChek()  // 调用合法性验证invalid对象上的所有合法性 如果都合法那么提交按钮点亮
  } else {
    invalid.grade = true
    // console.log('输入错误')
  }
})
//    密码验证 输入绑定blur事件监听
$passwordInput.on('blur', function () {
  var password = $(this).val()
  // console.log(txt)
  //  验证密码强度 调用这个函数后有一个密码等级lv返回值
  if (passwordStrength(password) >= 3) {
    //  密码为空
    invalid.password = false
    $(this).successTip('密码格式正确')
    
  } else {
    //    密码验证不正确
    $(this).dangerTip('密码必须有大小写字符数字')
    invalid.password = true
    // console.log('输入错误')
    
  }
})

//  所有拥有CheckeValid 属性的控件blur事件监听，输入完后离开输入框那么验证invalid对象身上的属性是否全部合法
$inputCheckeValid.on('blur', function () {
  //   for in 验证合法性
  subumitChek()
  
})
//  输入框focus事件监听 去掉所有警告框
$inputCheckeValid.on('focus', function () {
  $(this).clearTip()
})

//  jquery : children（selector）方法查找直接子元素 find（selector）方法查找所有子元素 一级一级往下查找直到最后一集
//  jquery属性元素条件查找 ： $('dom[class=ssd]')
