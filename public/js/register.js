//  验证用户名的逻辑
//  获取元素
var $username = $('#username')
var $submit = $('#submit')
//  监听blur离开输入框事件
$username.blur(function () {
  //  获取val
  var username = $(this).val()
  console.log(username)
  //  发送ajax从服务器数据拉取数据验证用户名是否存在
  $.ajax({
    type: 'get',
    url: 'checkUsername',
    dataType: 'json',
    data: {
      username: username
    }
  }).done(function (data) {
    console.log(data)
    //  获取到服务器响应的数据
    if (data.err) {
      $('#check').html(data.msg).css({'backgroundColor': 'red'})
    } else {
      $('#check').html(data.msg).css({'backgroundColor': 'green'})
    }
  }).fail(function () {
    console.log('请求失败')
  })
})

//  绑定submit提交注册点击事件
$submit.on('click', function () {
  //  获得序列化表单数据,input控件必须有name属性
  // 但是因为有input[type=file]的存在 所以$(form).serialize不可用了
  // 于是我们使用AJAX2.0中的技术 FormData
  var formdata = new FormData(document.forms[0])
  //  发送ajax
  $.ajax({
    url: '/register',
    type: 'post',
    data: formdata,
    contentType: false,
    processData: false
  }).done(function (data) {
    //  发送请求完成后改变 window.herf跳转页面到 登录界面路由，后端对sesion进行判断
    console.log(data)
    if (!data.err) {
      window.location.href = './login.html'
    }
    console.log(data)
  }).fail(function () {
    console.log('请求失败')
  })
})
