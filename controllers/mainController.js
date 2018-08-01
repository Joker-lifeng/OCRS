//  主控制器的模块 ,向外暴露exports中的方法， route模块引入文件可以使用exports对象上的定义的方法,传入 req 和res
var formidable = require('formidable')
var path = require('path')
var fs = require('fs')
var dateformat = require('date-format')
var xlsx = require('node-xlsx')  // 引入xlsx模块解析 xlsx
var crypto = require('crypto')  //  数据加密模块

//  引入mongoose 的model(mongoDB中的集合) 在控制器我们就操作这个model 来操作数据库中的学生集合
var StudentsModel = require('../model/students')
var CourseModel = require('../model/course')  //  引入课程的数据库集合model
var AdminModel = require('../model/admin')
//  封装需要用的方法
Array.prototype.indexOf = function (val) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == val) return i
  }
  return -1
}

Array.prototype.remove = function (val) {
  var index = this.indexOf(val)
  if (index > -1) {
    this.splice(index, 1)
  }
}

//  admin接口的中间件拦截！
exports.doAdminCheck = function(req,res,next) {
  //  验证session中的信息是否是admin
  var isLogin  = req.session.login
  var isAdmin = req.session.isAdmin
  if (!isLogin || !isAdmin) {
    //  如果没有登录或者不是admin 那么就得跳转到admin login登录页面
    res.redirect('/admin/login')
  }else {
    //  放行到下一个中间件
    next()
  }
}



exports.showLogin = function (req, res) {
  res.render('login', {})
}   //  渲染login页面

//  ----admin管理员层面的控制器
exports.showAdminLogin = function(req,res) {
  res.render('admin/admin_login')
}

//  管理员admin退出登录控制器
exports.doAdminLogout = function(req,res) {
  //  清除session
  req.session.login = null
  req.session.isAdmin = null  //  记录是否是管理员登录
  //  跳转页面
  res.send({err: 0 ,msg:'退出登录成功'})
}


exports.showAdminStudent = function (req, res) {
  res.render('admin/student', {
    page: 'student',
  })
}  // 渲染学生管理页面
exports.showAdminStudentImport = function (req, res) {
  res.render('admin/student_import', {
    page: 'student',
  })
}
exports.showAdminStudentExport = function (req, res) {
  res.render('admin/student_export', {
    page: 'student',  // 给模板引擎的信号 给哪个标签激活添加颜色
  })
}
exports.ShowAdminStudentAdd = function (req, res) {
  res.render('admin/student_add', {
    page: 'student',
  })
} //  增加学生的页面渲染控制器
//  admin管理功能交互型控制器
//  ----功能控制器
exports.doAdminStudentImport = function (req, res) {
  var form = new formidable()
  form.uploadDir = './upload'
  form.keepExtensions = true
  form.parse(req, function (err, fields, files) {
    // console.log(files.xlsx)
    //  如果表单中没有文件那么---
    if (!files.xlsx.name) {
      res.send('请选择文件')
      return
    }
    if (err) {
      console.log('上传失败')
    } else {
      // console.log('上传成功')
      //  对上传的文件的扩展名进行验证 不是xlsx的提示上传失败 并且从服务器中删除
      //  用path模块对上传的文件名进行解析 ,filse.xlsx.name属性是表单上传的时候文件名，path属性是上传的服务器的路径
      var exName = path.extname(files.xlsx.name)  //  扩展名
      var pathName = './' + files.xlsx.path //  得到上传的文件的路径
      if (exName != '.xlsx') {
        //  如果格式不是.xlsx那么从服务器中删除 使用fs的unlink方法
        
        fs.unlink(pathName, function (err) {
          if (err) {
            console.log('删除文件失败')
          } else {
            res.send('文件类型不符合.xlsx')
          }
        })
      } else {
        //  如果文件扩展名是.xlsx 那么对xlsx的文本格式进行验证 是否符合要求
        var workSheetsFromFile = xlsx.parse(pathName)  //  使用xlsx模块解析
        //  workSheetsFromFile解析结果是一个数组 每一位代表子表格，子表格是一个对象拥有data数组
        // console.log(workSheetsFromFile[0])
        if (workSheetsFromFile.length != 6) {
          res.send('xlsx表格（子表格数量）不符合要求')  //  如果表格的子表格数量小于6（年级数量） 那么不合格
        } else {
          //  对workSheetsFromFile数组中的每一项进行验证
          for (let i = 0; i < workSheetsFromFile; i++) {
            if (
              workSheetsFromFile[i].data[0][0] != '学号' ||
              workSheetsFromFile[i].data[0][1] != '姓名'
            ) {
              res.send('表格中的格式不正确')
              return
            }
          }
          //  循环结束后代表执行到这里表示格式正确 命令mongoose 把上传的xlse存储到数据库中
          StudentsModel.importStudent(workSheetsFromFile) //  添加到数据控中传入xlsx解析的数据
          
          res.send('上传成功')  //  反馈正确信息
        }
      }
    }
  })
}   // 处理上传学生表单xlsx的控制器
exports.doAdminLoginCheck  = function(req,res) {
  //  验证用户名密码
  //  find数据库中的admin 进行比对用户名密码
  AdminModel.findOne(req.body,function (err,result) {
    if (err) {
      res.send({err: 1 , msg: '查询失败'})
    } else {
      if (!result) {
        res.send({err: 1 , msg: '用户名或密码错误'})
      } else {
        //  登录成功后 保存状态到session中
        req.session.login = true
        req.session.isAdmin = true  //  记录是否是管理员登录
        res.send({err: 0 , msg: '登录成功'})
      }
    }
  })
}


//  得到所有学生清单分页的控制器
exports.getAllStudents = function (req, res) {
  //  验证session
  // if (!req.session.login)  {
  //   //  如果为false那么跳转路由到login让用户去登录
  //   res.redirect('/login')
  //   return
  // }
  //  得到参数---
  //  实现分页  获取get请求中query的参数, 用rows 和 page 作为条件find数据库， rows是前端一页要显示的学生数量， page是当前的页数
  var rows = Number(req.query.rows)  // 前端ajax请求中的所需要的行数 抓成Number类型
  var page = req.query.page // 前端ajax请求中的页数page信息
  var sidx = req.query.sidx  // 获得排序方式
  var sord = req.query.sord  // 倒序还是升序
  var keyword = req.query.keyword //  获得前端ajax get请求中keyword要模糊查询的key键
  //  定义sort排序类型 --动态的根据前端ajax请求
  var sortType = sord === 'asc' ? sidx : {_id: -1}  //  如果是asc那么按照sidx排序，如果不是那么以文档对象_id倒序
  //  一接口两用既可以查询所有学生 又可以模糊查询 对keyword进行判断就可以
  if (keyword === undefined || keyword === '') {
    findFilter = {}  // 空对象表示查询所有学生
  } else {
    var reaExp = new RegExp(keyword, 'g')   //  定义正则表达式对象作为mongoose查询key的值， 正则为keyword
    findFilter = { //  定义一个mongoose 的find的参数中的查询对象条件
      //  $or mongoose的或者匹配查询条件语法
      $or: [
        {sid: reaExp},
        {name: reaExp},
        {grade: reaExp},
      ],
    }
  }
  
  //  studentsModel.cont方法 得到数据库中所有学生的数量count作为返回值 然后进行下一步find
  StudentsModel.countDocuments(findFilter, function (err, count) {
    if (err) {
      console.log('查询数据库错误')
      res.send('数据集查询出错')
      return
    } else {
      //  find学生 条件： 限制最多数量:前端请求的rows行数， 跳过:页数 -1 * 行数(也就是只显示前端请求的页数和行数相乘的学生数量) //  跳过 page-1 * rows = 如果请求page是1那么 就不跳过任何 如果是2 那么 跳过1 * rows,skip决定返回给前端数据库中所有学生中的哪些学生
      
      //  模糊查询 全字段查询 使用mongoose的 $or
      StudentsModel.find(findFilter, null, {
        limit: rows,
        skip: (page - 1) * rows,
        sort: sortType,
      }, function (err, result) {
        // console.log(result)
        if (err) {
          console.log('查询数据库 失败')
          res.send('查询数据库出错,请刷新')
        } else {
          //  定义一个total ： 前端页面表格的翻页能翻页多少 = 总学生数count / rows  ,Math.ceil向上取整
          var total = Math.ceil(count / rows)
          // 响应给客服端数据： reconrds：总学生数  rows：一页学生数量   page：当前页数    总页数：total
          res.json({records: count, rows: result, page: page, total: total})
        }
      })
    }
  })
}
exports.updataStudent = function (req, res) {
  //  获得student：sid  路由中的sid params 作为查询数据库的sid条件
  var sid = req.params.sid
  var cellname = req.body.cellname
  var value = req.body.value
  //  查询数据并修改数据
  StudentsModel.findOne({sid: sid}, function (err, data) {
    if (err) {
      res.send({err: 1, msg: '查询数据库出错'})
    } else {
      if (!data) {
        res.send({err: -1, msg: '查无此人'})
      } else {
        // 如果查询到数据库有此学生那么修改信息
        data[cellname] = value
        data.save()
        res.send({err: 0, msg: '修改数据成功~~~~~~~~~'})
      }
    }
  })
} //  导入学生的exls表格控制器
exports.deleteStudent = function (req, res) {
  //  前端的ajax请求是delete类型， 携带文档数据放在了data中 ，那么后端接口需要从req.body中得到
  // console.log(req.body.arr)
  //  调用mongoose的model对象的remove方法删除数据中的条件为-- sid：arr数组中的值的数据
  StudentsModel.remove({sid: req.body.arr}, function (err, result) {
    if (err) {
      res.send({err: 1, msg: '删除学生操作失败'})
    } else {
      // console.log(result)
      res.send({err: 0, msg: '删除成功，删除数量：' + result.n})
    }
  })
} //  删除学生控制器
exports.downLoadXlsx = function (req, res) {
  // console.log('donwload')
  //  下载表格的逻辑 按年级作为条件依次find数据库中学生，然后用xlsx模块的build方法创建buffer二进制，把这个年级数组push表格行 ，把年级数组push到最终表格数组    最后fs模块writeFile（最终的表格数组）
  //  因为表格是由6个子表格年级组成所以build要按照年级顺序build， 要用for循环6次产生6个年级数组，但是for循环是同步 find 和 build是异步语句是push的顺序不一样 要用到迭代器
  var xlsxTable = [] // 最终要写入的文件 结构：每一个下标都是一个年级对象，对象的name是子表格的名，data属性是一个数组,是子表格的行
  var gradTyper = ['初一', '初二', '初三', '高一', '高二', '高三']  // 年级数组
  function iterator (i) {
    // console.log(i)
    if (i >= gradTyper.length) {
      // 如果大于等于了年级数组，那么终止迭代 写入文件
      // console.log(i,'终止迭代')
      var buffer = xlsx.build(xlsxTable)
      try {
        //  使用dateformat模块生成当前时间的文件名
        // var fileName = dateformat.asString('学生清单yyyy年MM月dd日hhmmss.xlsx', new Date()); //just the time
        var fileName = 'public/xlsx/students.xlsx'

        fs.writeFile(fileName, buffer, function (err, result) {
          if (err) {
            res.send({err: 1, msg: '获取下载资源失败，错误代码：2'})
          } else {}
          // console.log('跳转')
          // res.redirect('/xlsx/' + fileName)  // 跳转下载链接
          // res.send({err:0, msg: '成功'})
          res.download(fileName)
        })   //生成excel
      } catch (e) {
        console.log('严重错误')
        res.send({err: 1, msg: '获取下载资源失败,错误代码:1'})
      }
      return
    }
    // 表格的创建要创建6个子表格 6个年级 所以先从数据库中find 以年级为条件的一组学生
    StudentsModel.find({grade: gradTyper[i]}, function (err, result) {
      if (err) {
        res.send({err: 1, msg: '拉取数据失败'})
      } else {
        var tableRowArr = [] // 定义一个表格行数组 结构是二维数组
        //  在resultArr数组中push 表格的行, 行数组中的一个数组代表一行，结构是二维数组
        result.forEach(function (value) {
          tableRowArr.push([
            //  表格单元格的值
            value.sid,
            value.name,
            value.grade,
            value.password,
          ])
        })
        
        xlsxTable.push({
          name: gradTyper[i], //  子表格的名
          data: tableRowArr,  //  data是子表格的数据（表格行） 是一个数组
        })
        //  以i信号量 迭代
        iterator(++i)
      }
    })
  }
  
  //  执行迭代器 开始起迭代年级数组
  iterator(0)
  
}  // 下载所有学生的xlsx表格的控制器

//  ---渲染admin课程管理页面的控制器
exports.showAdminCourse = function (req, res) {
  res.render('admin/course', {
    page: 'course',
  })
} //  课程管理主页控制器
exports.showAdminCourseAdd = function (req, res) {
  res.render('admin/course_add', {
    page: 'course',
  })
}   //  课程添加控制器
exports.showAdminCourseImport = function (req, res) {
  res.render('admin/course_import', {
    page: 'course',
  })
} //  渲染课程导入控制器
//  course功能型控制器
//  admin课程-功能型控制器
exports.doAdminCourseImport = function (req, res) {
  var form = new formidable()
  form.uploadDir = './upload'
  form.keepExtensions = true
  form.parse(req, function (err, fields, files) {
    // console.log(files.courseJson)
    //  如果表单中没有文件那么---
    if (!files.courseJson.name) {
      res.send('请选择文件')
      return
    }
    if (err) {
      console.log('上传失败')
    } else {
      //  fs模块读取上传的文件 再保存到数据库
      fs.readFile(files.courseJson.path, function (err, result) {
        if (err) {
          res.send('操作失败，错误代码：1')
        } else {
          // 清空原来数据中的课程数据
          CourseModel.deleteMany({}, function (err, deleteResult) {
            if (err) {
              res.send('操作失败，错误代码:3')
            } else {
              try {
                //  将数据保存到数据库
                var data = JSON.parse(result.toString())
                // console.log(typeof data)
                CourseModel.insertMany(data.courses, function (err, data) {
                  if (err) {
                    res.send('操作失败，错误代码:2')
                  } else {
                    // 删除服务器中的上传的文件
                    fs.unlink(files.courseJson.path, function (err) {
                      if (err) {
                        res.send('操作失败，错误代码:3')
                      } else {
                        res.send('导入成功')
                      }
                    })
                  }
                })
              } catch (e) {
                res.send('操作失败，错误代码:4')
              }
            }
          })
        }
      })
    }
  })
}   // 处理上传学生表单xlsx的控制器

exports.getAllCourse = function (req, res) {
  //  得到参数---
  //  实现分页  获取get请求中query的参数, 用rows 和 page 作为条件find数据库， rows是前端一页要显示的学生数量， page是当前的页数
  var rows = Number(req.query.rows)  // 前端ajax请求中的所需要的行数 抓成Number类型
  var page = req.query.page // 前端ajax请求中的页数page信息
  var sidx = req.query.sidx  // 获得排序方式
  var sord = req.query.sord  // 倒序还是升序
  var keyword = req.query.keyword //  获得前端ajax get请求中keyword要模糊查询的key键
  
  //  定义sort排序类型 --动态的根据前端ajax请求
  var sortType = sord === 'asc' ? sidx : {_id: -1}  //  如果是asc那么按照sidx排序，如果不是那么以文档对象

  if (keyword === undefined || keyword === '') {
    findFilter = {}  // 空对象表示查询所有学生
  } else {
    var reaExp = new RegExp(keyword, 'g')   //  定义正则表达式对象作为mongoose查询key的值， 正则为keyword
    findFilter = { //  定义一个mongoose 的find的参数中的查询对象条件
      //  $or mongoose的或者匹配查询条件语法
      $or: [
        {cid: reaExp},
        {name: reaExp},
        {dayofweek: reaExp},
        {teacher: reaExp},
      ],
    }
  }
  
  CourseModel.countDocuments(findFilter, function (err, count) {
    if (err) {
      console.log('查询数据库错误---count')
      res.send('数据集查询出错')
      return
    } else {
      //  find学生 条件： 限制最多数量:前端请求的rows行数， 跳过:页数 -1 * 行数(也就是只显示前端请求的页数和行数相乘的学生数量) //  跳过 page-1 * rows = 如果请求page是1那么 就不跳过任何 如果是2 那么 跳过1 * rows,skip决定返回给前端数据库中所有学生中的哪些学生
      
      //  模糊查询 全字段查询 使用mongoose的 $or
      CourseModel.find(findFilter, null, {
        limit: rows,
        skip: (page - 1) * rows,
        sort: sortType,
      }, function (err, result) {
        // console.log(result)
        if (err) {
          console.log('查询数据库 失败')
          res.send('查询数据库出错,请刷新')
        } else {
          //  定义一个total ： 前端页面表格的翻页能翻页多少 = 总学生数count / rows  ,Math.ceil向上取整
          var total = Math.ceil(count / rows)
          // 响应给客服端数据： reconrds：总学生数  rows：一页学生数量   page：当前页数    总页数：total
          res.json({records: count, rows: result, page: page, total: total})
        }
      })
    }
  })
} //  得到所有课程清单分页的控制器

exports.updataCourse = function (req, res) {
  //  获得 sid params 作为查询数据库的sid条件
  var cid = req.params.cid
  var cellname = req.body.cellname
  var value = req.body.value
  //  查询数据并修改数据
  CourseModel.findOne({cid: cid}, function (err, data) {
    if (err) {
      res.send({err: 1, msg: '查询数据库出错'})
    } else {
      if (!data) {
        res.send({err: -1, msg: '查无此人'})
      } else {
        // 如果查询到数据库有此学生那么修改信息
        data[cellname] = value
        data.save()
        res.send({err: 0, msg: '修改数据成功~~~~~~~~~'})
      }
    }
  })
}

exports.deleteCourse = function (req, res) {

  CourseModel.remove({cid: req.body.arr}, function (err, result) {
    if (err) {
      res.send({err: 1, msg: '删除课程操作失败'})
    } else {
      // console.log(result)
      res.send({err: 0, msg: '删除成功，删除数量：' + result.n})
    }
  })
} //  删除课程控制器

exports.addCourse = function (req, res) {
  //  获得post请求 中 req.body中的数据
  //  在数据库学生集合中添加学生
  CourseModel.create(req.body, function (err, reslut) {
    if (err) {
      res.send({err: 1, msg: '添加课程操作失败'})
    } else {
      res.send({err: 0, msg: '添加课程成功'})
    }
  })
}   //  //  增加课程的控制器

//  渲染报表首页的控制器
exports.showAdminStatement = function (req, res) {
  res.render('admin/statement', {
    page: 'statement',
  })
}

//  添加学生的控制器
exports.addStudent = function (req, res) {
  //  获得post请求 中 req.body中的数据
  // console.log(req.body)
  //  在数据库学生集合中添加学生
  StudentsModel.create(req.body, function (err, reslut) {
    if (err) {
      res.send({err: 1, msg: '增加学生操作失败'})
    } else {
      res.send({err: 0, msg: '增加学生成功'})
    }
  })
}

//  student学生层面的控制器
// 学生登录验证控制器
exports.doLogin = function (req, res) {
  //  获得前端表单的用户名和密码
  var sid = req.body.sid
  var password = req.body.password
  
  //  因为学生有初始密码和 修改后的密码 所以要分开验证，首先用通过用户名find数据库中的学生
  StudentsModel.findOne({sid: sid}, function (err, result) {
    if (err) {
      res.send({err: 1, msg: '查询失败，错误代码:1'})  // 1表示查询数据库失败
    } else {
      // console.log(result )
      //  对查询结果进行验证此学生是否存在于数据库
      if (!result) {
        // 如果没有此学号的学生提示:
        res.send({err: 1, msg: '未找到该学号的学生，请核对'})
      } else {
        //  找到学生后 对 学生的passwordIsChanged进行验证
        if (!result.passwordIsChanged) {
          //  如果学生的密码状态度是未被更改(默认未被更改 老师admin也没有权限改这个属性)，那么直接和数据库的明码进行验证
          if (password == result.password) {
            //  密码正确那么设置session登录状态为true,响应正确的信息
            req.session.login = true
            req.session.isAdmin = false
            console.log(req.session.isAdmin)
            req.session.sid = sid  // 保存学号到session中
            req.session.username = result.name // 保存名字到session
            req.session.passwordIsChanged = result.passwordIsChanged  //  保存密码是否被更改过的状态
            res.send({err: 0, msg: '登录成功'})
          } else {
            //  如果密码错误 那么提示错误
            res.send({err: 1, msg: '密码错误'})
          }
        } else {
          //  如果密码被更改了，需要验证sha256加密后的密码
          // console.log('需要验证sha256加密后的密码')
          //  获得用户输入的密码,再经过sha256加密后和数据库的sha256密码进行比对
          var checkPassword = crypto.createHash('sha256').
            update(password).
            digest('hex')
          if (result.password == checkPassword) {
            //  如果sha256加密的密码匹配成功那么登录成功,密码正确那么设置session登录状态为true,响应成功的信息
            req.session.login = true  //  是否登录的状态
            req.session.isAdmin = false
            req.session.sid = sid  // 保存学号到session中
            req.session.username = result.name // 保存名字到session
            req.session.passwordIsChanged = result.passwordIsChanged  //  保存密码是否被更改过的状态
            res.send({err: 0, msg: '登录成功'})
          } else {
            res.send({err: 1, msg: '密码错误'})
          }
        }
      }
    }
  })
}

// 渲染报名表格的控制器
exports.showTable = function (req, res) {
  //  如果是admin 那么不能让admin查看学生的页面

  if (req.session.isAdmin) {
    res.send('Admin账户不能进入学生选课报名界面，谢谢')
    return
  }
  
  //  验证req.session.login  是否为已经登录
  if (!req.session.login) {
    //  如果为false那么跳转路由到login让用户去登录
    res.redirect('/login')
    return
  } else {
    var passwordIsChanged = req.session.passwordIsChanged //  获得密码是否被更改的状态进行跳转更改面
    if (!passwordIsChanged) {
      //  如果密码没有修改 那么跳转到修改密码路由
      res.redirect('/changePassword')
    } else {
      //  如果有session并且密码已经修改过了那么渲染报名表格，模板引擎渲染传入字典用户名
      res.render('index', {
        username: req.session.username,
      })
      
    }
  }
}

//  修改密码页面渲染的控制器
exports.changePasswordPage = function (req, res) {
  //  登录验证.验证是否为已经登录
  if (!req.session.login || req.session.isAdmin) {
    //  如果为false那么跳转路由到login让用户去登录
    res.redirect('/login')
    return
  }
  //  渲染修改密码的页面
  //  如果有session那么渲染报名表格，模板引擎渲染传入字典用户名,传入用户的密码是否被更改状态用来决定是否显示提示框策略
  res.render('changePassword', {
    username: req.session.username,
    showTips: req.session.passwordIsChanged,  // 没更改密码显示提示框
  })
  
}

//  修改密码的实现控制器
exports.doChangePassword = function (req, res) {
  //  获得新密码
  var password = req.body.newPassword
  var sid = req.session.sid//  获得登录状态的session中的用户名，想修改密码必须是登录状态
  // 将密码使用sha256加密
  var newPassword = crypto.createHash('sha256').update(password).digest('hex')
  // (newPassword)
  // (sid
  //  从数据库中find学生
  var query = {sid: sid} // 查询条件
  StudentsModel.update(query,
    {$set: {password: newPassword, passwordIsChanged: true}},
    function (err, reult) {
      if (err) {
        res.send({err: 1, msg: '修改密码失败'})
      } else {
        //  修改成功后清除登录状态那么跳转到登录页面
        res.send({err: 0, msg: '修改密码成功'})
      }
    })
}

//  退出登录的控制器
exports.doLogout = function (req, res) {
  //  清除session中的登录信息
  req.session.login = false
  req.session.sid = null
  req.session.username = null
// 然后 跳转到登录页面
  res.redirect('/login')
}

//  检查学生是否能报名的控制器
exports.doCheck = function (req, res) {
  var sid = req.session.sid  // 从session中得到sid学号
  var resultArr = []     //  定义一个响应的信息的数组，记录学生能报名哪些课 不能报名哪些课
  var occupyWeek = [] // 定义一个表示已被占用的星期几的课程 决定此学生星期几以及报了课不能报其他课程
  // var cidMap = {}  //  课程编号映射星期的对象  表示学生以及报了哪些课
  // 首先通过学号找到此学生
  StudentsModel.findOne({sid: sid}, function (err, stu) {
    if (err) {
      res.send({err: 1, msg: '操作失败，错误代码:1'})
      return
    }
    if (!stu) {
      res.send({err: 1, msg: '服务器中没有此学生！'})
      return
    }
    
    var myCourses = stu.myCourses // 得到find到的学生的已经报名的课程
    
    var grade = stu.grade  //  获得此学生的年级
    // 再找到所有课程
    CourseModel.find({}, function (err, courses) {
      if (err) {
        res.send({err: 1, msg: '操作失败，错误代码:2'})
        return
      }
      // 第一次 遍历课程数组, 拿到此学生星期几报名了什么课的情况 作为一个数组
      courses.forEach(function (value) {
        // console.log(myCourses.indexOf(value.cid != -1))
        //  将当前遍历到的课程的编号和课程星期 映射到cidMap对象中
        if (myCourses.indexOf(value.cid) != -1) {
          // 如果学生的myCourses数组中有 遍历到的当前课程的编号， 那么表示此学生以及报名了此课程:
          // cidMap[value.cid] = value.dayofweek  // 那么将此课程的编号和星期映射到 cidMap映射对象中
          occupyWeek.push(value.dayofweek)  //  在已被占用的课程的星期中push 当前课程的星期
        }
      })
      
      //  第二次循环所有课程就需要判定最终结果学生不能报什么课 生成一个结果数组,从所有课程中拿到能报名哪些课
      courses.forEach(function (value) {
        //  判定不能报名的条件
        if (myCourses.indexOf(value.cid) != -1) {
          // 如果此学生的报名的课程数组中已经有此课程那么 ：不能报名
          resultArr.push({cid: value.cid, err: 2, msg: '此课程已经报过了'})
        } else if (occupyWeek.indexOf(value.dayofweek) != -1) {
          // 如果被占用星期的数组中出现了当前循环到的课程的星期 ,表示此学生在这个星期几已经报了别的课那么不能报名其他课
          resultArr.push({cid: value.cid, err: 1, msg: '当前已经报名其他课程了'})
        } else if (value.number <= 0) {
          // 如果number小于0那么不能报名 那么在结果数组中push此课程 表示此课程不能报名
          resultArr.push({cid: value.cid, err: 1, msg: '此课程报名人数已满'})
        } else if (grade.indexOf(value.allow) != -1) {
          //  如果此学生的年级不存在于当前循环到的课程的允许年级的数组中 那么表示：此学生得年级不允许报名此课程
          resultArr.push({cid: value.cid, err: 1, msg: '您的年级不符合此课程报名要求'})
        } else if (myCourses.length == 2) {
          //  如果此学生的报名的课程数组的数组长度等于2了那么就不能再报名其他课程了
          resultArr.push({cid: value.cid, err: 1, msg: '已达报名课程数上限'})
        } else {
          //  上面条件都不满足那么 此学生可以报名当前循环到的此课程
          resultArr.push({cid: value.cid, err: 0, msg: '可以报名'})
        }
        
      })
      
      // console.log(cidMap)
      //  响应一个结果数组
      res.send({result: resultArr})
      
    })
    
  })
}

//  报名课程的控制器
exports.appleyCourse = function (req, res) {
  //  报名的业务逻辑就是让mongoDB数据库中的 student集合和course集合相互持有sid 和 cid
  var sid = req.session.sid    //  获得session中的学号
  var cid = req.body.cid   // 获得 post请求中的cid数据
  //  通过学号find数据库
  StudentsModel.findOne({sid: sid}, function (err, stu) {
    if (err) {
      res.send({err: 1, msg: '操作失败，错误代码：1'})
    } else {
      //  接着find课程集合
      CourseModel.findOne({cid: cid}, function (err, course) {
        if (err) {
          res.send({err: 1, msg: '操作失败，错误代码：2'})
        } else {
          //  将此 cid课程编号 push  到此学生的 myCourses报名数组中
          stu.myCourses.push(cid)
          stu.save()  //  mongoose数据持久化
          //  将sid 学号push到课程的stu数组中
          course.stu.push(sid)
          course.number--
          course.save()
          //  响应成功的数据
          res.send({err: 0, msg: '报名成功'})
        }
      })
    }
  })
  
}

//  退报课程的控制器
exports.BackOfCouse = function (req, res) {
  //  退报名课程的业务逻辑就是让mongoDB数据库中的 student集合和course集合相互删除sid 和 cid
  var sid = req.session.sid    //  获得session中的学号
  var cid = req.body.cid   // 获得 post请求中的cid数据
  //  通过学号find数据库
  StudentsModel.findOne({sid: sid}, function (err, stu) {
    if (err) {
      res.send({err: 1, msg: '操作失败，错误代码：1'})
    } else {
      stu.myCourses.remove(cid)
      stu.save()  //  mongoose数据持久化
      //  接着find课程集合
      CourseModel.findOne({cid: cid}, function (err, course) {
        if (err) {
          res.send({err: 1, msg: '操作失败，错误代码：2'})
        } else {
          
          course.stu.remove(sid)
          course.number++
          course.save()
          //  响应成功的数据
          res.send({err: 0, msg: '报名成功'})
        }
      })
    }
  })
  
}

//  学生系统的 “我的报名的课程” 的页面渲染的控制器
exports.showStuCourse = function (req, res) {
  //  验证req.session.login  是否为已经登录
  if (!req.session.login) {
    //  如果为false那么跳转路由到login让用户去登录
    res.redirect('/login')
    return
  } else {
    var sid = req.session.sid
    //  find此学生
    StudentsModel.findOne({sid: sid}, function (err, stu) {
      if (err) {
        res.send('请求失败，错误代码：1')
      } else {
        //  渲染我的选课页面 携带数据
        res.render('stuCourse', {
          username: req.session.username,
          myCourses: stu.myCourses // 渲染我的课程页面携带数据库中此学生所报名的课程
        })
      }
    })
    
  }
  
}