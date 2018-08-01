//  课程页面的js交互

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
    url: '/course',  //   从 /sudent路由请求数据
    //列明
    colNames: ['编号', '课程', '星期', '允许年级','可报人数','老师','简介'],
    //列的模型
    colModel: [
      {name: 'cid', index: 'cid', width: 10, key: true, editable: true},
      //editable表示可以被编辑
      {name: 'name', index: 'name', width: 25, editable: true},
      //年级的那个列，编辑的时候显示下拉列表框
      {name: 'dayofweek', index: 'dayofweek', width: 10, editable: true},
      {name: 'allow', index: 'number', width: 30, editable: true},
      {name: 'number', index: 'allow', width: 8, editable: true},
      {name: 'teacher', index: 'teacher', width: 12, editable: true},
      {name: 'briefintro', index: 'briefintro', width: 50, editable: true,edittype: 'textarea'},
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
        url: '/course/' + rowid, // 接口加上 rowid（表格中的学号）作为后端识别接口 识别要修改数据库中的哪个文档
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

//  删除课程的ajax请求 事件
$delBtn.on('click', function () {
  //  获得jqGird表格 中选中的要删除的学生学号数组
  var arr = $list.jqGrid('getGridParam', 'selarrrow')
  console.log(arr)
  //  发送delete类型的ajax请求
  $.ajax({
    type: 'delete',
    url: '/course',
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
