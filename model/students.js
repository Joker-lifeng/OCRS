var mongoose = require('mongoose')

//  定义学生集合的 Schema
var studentsSchema = new mongoose.Schema({
  sid: String, // 学号
  name: String,
  grade: String,  // 年级
  password: String, //  密码
  myCourses: [String],  //  学生报名的课程的数组 记录了报名的课程的编号
  passwordIsChanged: {type: Boolean, default: false},  // 往学生数据中存储一个表示初始是否被更改的状态 默认false表示未更改
})
//  集合的静态方法
studentsSchema.statics.importStudent = function (xlsxData) {
  //  传入的参数中拿到数据结构： xlsxData是一个数组，数组中没一项都是一个对象，这个对象的data数组中的数据就是我们要保存到数据库中的数据
  //  循环子表格
  //  先清空集合中的文件
  this.deleteMany({}, function (err) {
    if (err) {
      console.log('清空Students集合失败')
    } else {
      console.log('清空Students集合成功')
      //  定义年级数组
      var gardeArr = ['初一', '初二', '初三', '高一', '高二', '高三']
      //  第一层循环表格的子表格 一共6个
      for (var i = 0; i < xlsxData.length; i++) {
        // 第二层循环当前子表格中的表格行data数组(数组一行就是一个下标值),从1开始循环，因为一个下标是表头
        for (var j = 1; j < xlsxData[i].data.length; j++) {
          //  生成学生初始密码6位随机字符串
          var str = 'ABCDEF%GHIJKLMNOprs$tuPQRSTUV]WXYZabcd&^efghijklmno:.-vwxyz~=1789#435[*@'
          var password = '' //  定义一个空字符串用来拼接密码
          for (let i = 0; i < 6; i++) {
            //  定义一个随机数最大值是字符串的长度， 用charAt方法从字符串中挑选一个字符作为拼接的密码
            var random = parseInt(Math.random() * str.length)
            password += str.charAt(random)
          }
          //  创建实例中的文档对象---学生实例
          var student = new StudentsModel({
            sid: xlsxData[i].data[j][0],
            name: xlsxData[i].data[j][1],
            grade: gardeArr[i], // 年级就是外层循环的子表格 年级数组中下标 0 1 2 3 4 5 代表不同年级
            password: password,  // 使用随机拼接的字符串密码作为明码供老师使用
          })
          student.save(function (err) {
            if (err) {
              console.log('保存数据库失败')
            } else {
              // console.log('保存成功')
            }
          })
        }
      }
    }
  })
}

//  定义集合（model）
var StudentsModel = mongoose.model('students', studentsSchema)

module.exports = StudentsModel