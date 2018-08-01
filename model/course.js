// course课程集合的定义
var mongoose = require('mongoose')
var Schema = mongoose.Schema
//  定义Schema骨架
var courseSchema = new Schema({
  cid: String,    //  课程ID
  name: String,    // 课程名
  dayofweek: String,  //  上课时间
  number: Number,  // 最多允许多少学生报课
  allow: [String],    //  允许什么年纪的报课
  teacher: String,   // 授课老师
  briefintro: String,  //  课程简介
  stu: [String]   // 定义哪些学生报名了此课程的数组
})

//  定义模型映射数据库中的集合
var CourseModel = mongoose.model('course', courseSchema)

//  暴露模块
module.exports = CourseModel