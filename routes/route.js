var express = require('express')
var route = express.Router()  // 创建路由对象
var mainCtrl = require('../controllers/mainController')  //  引入主控制器模块
//--------RESTfull风格的路由配置
//  路由清单--路由到前端的请求后, 把后续的处理权交给 mainCtrl模块（C层控制器）执行 mainCtrl中的对应的处理方法
//  路由到admin首页  执行主控制器的showAdminIndex  渲染老师管理页面




// 配置admin 管理员路由
route.get('/admin/login',mainCtrl.showAdminLogin)  // 渲染管理员登录页面的路由
route.post('/admin/login',mainCtrl.doAdminLoginCheck)  // 管理员登录表单密码提交验证路由

route.get('/admin*',mainCtrl.doAdminCheck)  // 配置admin 拦截路由 必须登录为admin 才能让下面的路由中间件处理
route.get('/admin', mainCtrl.showAdminStudent)  //  渲染管理员面板主页
route.get('/admin/logout',mainCtrl.doAdminLogout)  // 管理员退出登录的路由

route.get('/admin/student', mainCtrl.showAdminStudent)   //  学生清单路由
route.get('/admin/student/import', mainCtrl.showAdminStudentImport)   // 导入学生页面路由
route.post('/admin/student/import', mainCtrl.doAdminStudentImport)   // 导入学生表单提交路由
route.get('/admin/student/export', mainCtrl.showAdminStudentExport)  //  生成学生初始密码路由
route.get('/admin/student/add',mainCtrl.ShowAdminStudentAdd)  //  增加学生的路由
route.get('/admin/student/downLoad',mainCtrl.downLoadXlsx)  //  下载所有学生表格路由
//  配置路由到 admin课程管理
route.get('/admin/course', mainCtrl.showAdminCourse) // 课程管理主页
route.get('/admin/course/import',mainCtrl.showAdminCourseImport)   // 导入课程表单提交页面路由
route.post('/admin/course/import',mainCtrl.doAdminCourseImport)   // 课程表单提交的路由
route.get('/admin/course/add',mainCtrl.showAdminCourseAdd)  //  增加课程页面的路由


//  配置学生student路由
route.get('/student', mainCtrl.getAllStudents)  //  获取所有学生列表的路由
route.post('/student',mainCtrl.addStudent)  // 添加学生的路由
route.delete('/student',mainCtrl.deleteStudent)     //  删除学生路由
route.get('/student/xxxx')   // 查询学生的路由
route.post('/student/:sid', mainCtrl.updataStudent)  //  修改学生路由
route.delete('/student/xxxxx')  // 删除学生的路由
route.propfind('/student/xxxxx')  //  查询学生是否存在路由

//  配置course课程的路由
route.get('/course',mainCtrl.getAllCourse) // 获得所有课程列表的路由
route.post('/course',mainCtrl.addCourse)  // 添加课程的路由
route.post('/course/:cid', mainCtrl.updataCourse)  //  修改课程路由
route.delete('/course',mainCtrl.deleteCourse)  // 删除学生的路由

//  登录以及退出登录密码管理的路由
route.get('/login',mainCtrl.showLogin)     //  登录页面渲染路由
route.post('/login',mainCtrl.doLogin)  //  登录验证路由
route.get('/logout',mainCtrl.doLogout)  //  退出登录的路由
route.get('/',mainCtrl.showTable)   // 渲染报名表格
route.get('/changePassword',mainCtrl.changePasswordPage) //  修改密码页面渲染接口
route.post('/changePassword',mainCtrl.doChangePassword) //  修改密码实现接口
route.get('/check',mainCtrl.doCheck)  //  检查学生是否能报名的接口
route.post('/applyCourse',mainCtrl.appleyCourse)  //  报名课程的路由
route.post('/BackOfCouse',mainCtrl.BackOfCouse)  //  退报课程的路由
route.get('/stuCourse',mainCtrl.showStuCourse)  //  学生系统的'我的报名的课程'页面渲染

module.exports = route  //  暴露route对象接口