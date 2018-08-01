//  ---------表单验证的业务逻辑
//  获得元素
var $addStudentForm = $('#addStudentForm')
var $submitBtn = $('#submitBtn')
var $inputCheckeValid = $('#addStudentForm [checkeValid]')  // 获得form表单中所有具有checkeValid 不合法验证属性的控件
var $sidInput = $('#addStudentForm input[name=cid]') // cid输入框
var $nameInput = $('#addStudentForm input[name=name]') // 课程名输入框
var $passwordInput = $('#addStudentForm input[name=password]') // 密码输入框
var $gradeInput = $('#addStudentForm select[name=grade]') // 姓名输入框
var $inputOfText = $addStudentForm.find('input[type=text]')  //   获得所有form下面text类型的控件




//    提交按钮的click事件监听
$submitBtn.click(function () {
  //    获得表单序列化数据（控件value ）
  var form = $addStudentForm.serialize()
  console.log(form)
  //  发送ajax
  $.ajax({
    type: 'post',
    url: '/course', // 增加学生路由
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


