var $list = $('#list')
var $tips = $('#demo-manual-trigger')  // tips 修改学生的结果提示框
var $keywordFind = $('.mohuchaxun')
var $delBtn = $('#delbtn')
var $downLoadBtn = $('#downLoadBtn')  //  下载xlsx表格的按钮

//初始化表格的函数init封装
function init () {
  $list.jqGrid({
    //使用的数据是本地数据，实际上也是Ajax请求回来的
    datatype: 'json',
    url: '/student',  //   从 /sudent路由请求数据
    //列明
    colNames: ['学号', '姓名', '年级', '初始密码'],
    //列的模型
    colModel: [
      {name: 'sid', index: 'sid', width: 50, key: true, editable: true},
      //editable表示可以被编辑
      {name: 'name', index: 'name', width: 50, editable: true},
      //年级的那个列，编辑的时候显示下拉列表框
      {
        name: 'grade',
        index: 'grade',
        width: 50,
        editable: true,
        edittype: 'select',
        editoptions: {
          value: '初一:初一;初二:初二;初三:初三;高一:高一;高二:高二;高三:高三',
        },
      },
      {name: 'password', index: 'password', width: 50, editable: true},
    ],
    rowNum: 12,
    rowList: [12, 30, 400], // 表格下拉数量
    sortname: 'sid',
    viewrecords: true,
    autowidth: true,
    pager: '#listnav',
    cellEdit: true,
    cellsubmit: 'clientArray',
    height: 280,  //   表格的高
    multiselect: true, // 表格行多选是否显示
    afterSaveCell: function (rowid, cellname, value, iRow, iCol) {
      //对应数据库的数据：   rowid(因为在colModel中 配置了key：true ，所以rowid中的值就是主键) : 学号  cellname：表格项的key  value：表格项的值
      console.log(rowid, cellname, value)
      //   在修改表格中的值之后发送ajax
      $.ajax({
        type: 'POST',
        url: '/student/' + rowid, // 接口加上 rowid（表格中的学号）作为后端识别接口 识别要修改数据库中的哪个文档
        dataType: 'json',
        data: {
          //   携带数据
          cellname: cellname,  // 表格项的key
          value: value,    //   表格项的值
        },
      }).done(function (data) {
        console.log(data)
        //  对data.err进行验收
        if (data.err == 1) {
          console.log(data.msg)
        } else if (data.err == -1) {
          console.log(data.msg)
        } else {
          //  如果错误代码为0代表修改成功
          // console.log(data.msg)
          //  显示tips
          $tips.poshytip({
            className: 'tip-yellowsimple',
            content: data.msg,
            showOn: 'none',
            alignTo: 'target',
            alignX: 'inner-left',
            offsetX: 540,
            offsetY: 70,
            showTimeout: 100,
            followCursor: true,
            slide: false,
          })
          $tips.poshytip('show').poshytip('hideDelayed', 2000) // 显示tips
        }
      }).fail(function () {
        console.log('请求失败')
      })
      
    },
  })
}

//  模糊查询 使用jqGrid的 API
$keywordFind.on('input', function () {
  var keyword = $(this).val() //  获得input中的val作为模糊查询的条件
  //  命令jqGrid重新刷新表格
  $list.jqGrid('setGridParam', {
    //  url还是原来的 url
    dataType: 'json',
    postData: {keyword: keyword},  // 模糊关键字
    page: 1,
  }).trigger('reloadGrid')  //  jquery的事件绑定 触发 表达刷新
})
//  载入页面就执行init初始化jqGrid表格
init()

//  删除学生的ajax请求 事件
$delBtn.on('click', function () {
  //  获得jqGird表格 中选中的要删除的学生学号数组
  var arr = $list.jqGrid('getGridParam', 'selarrrow')
  console.log(arr)
  //  发送delete类型的ajax请求
  $.ajax({
    type: 'delete',
    url: '/student',
    traditional: true,// dara对象中传递的数据是数组那么必须加上设置为true
    data: {arr: arr},
    dataType: 'json',
  }).done(function (data) {
    if (data.err) {
      alert(data.msg)
    } else {
      //  删除成功进行的操作 刷新列表 弹出成功提示msg
      $list.trigger('reloadGrid')
      alert(data.msg)
    }
  }).fail(function () {
    alert('请求服务器失败')
  })
  
})

//  给$downLoadBtn按钮绑定click事件监听下载xlsc表格
$downLoadBtn.on('click', function () {
  //  发送ajax
  $.ajax({
    type: 'get',
    url: '/admin/student/downLoad', //  后台admin中的下载所有学生表格接口
    // dataType: 'json',
  }).done(function (data) {
    console.log(data)
    if (data.err) {
      alert(data.msg)
    }
  }).fail(function () {
    // alert('请求失败')
  })
  
})
