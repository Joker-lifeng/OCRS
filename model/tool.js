//  定义一个工具作为中介者，处理students 和 course课程之间操作
//  引入需要用到students model 和course Mdoel
var StudentsModel = require('./students')
var courseModel = require('./course')

//  选课的工具 用法：传入sID 和 cID ，通过cID找到course文档对象，把sID push到course文档对象的studentsArr中
function chooseCourse (sID, cID, callback) {
  courseModel.findBycId(cID, function (course) {
    //  获得find到的文档对象
    if (!course) {
      // 如果result是null那表示没有在课程中找到此文档对象那么不能执行下面代码返回一个错误的信息
      callback('-1 没有此课程') // -1表示没有此课程
      return
    } else {
      if (course.studentsArr.includes(sID)) {
        // 如果集合中的课程对象的学生持有数组中有传入的参数sID，那么提示已经有了 那么也返回错误提示信息，结束函数
        callback('-2 此学生已经报过这个课程')
        return
      } else {
        //  如果数组中没有sID，那么push sID， 代表此学生报了这个课程成功
        course.studentsArr.push(sID)
        // 保存数据库 持久化数据
        course.save(function () {
          //  那么通过sID找到学生把cID push到 他的courseArr中
          StudentsModel.findBysID(sID, function (student) {
            student.courseArr.push(cID)
            student.save(function () {
              callback('1 成功报了课程:' + course.name)
            })  // 保存数据库 持久化数据
          })
        })
      }
    }
    
  })
}

// 暴露函数
module.exports = chooseCourse