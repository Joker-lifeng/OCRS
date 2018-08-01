// course课程集合的定义
var mongoose = require('mongoose')
var Schema = mongoose.Schema
//  定义Schema骨架
var adminSchema = new Schema({
  username: String,
  password: String,
})

//  定义模型映射数据库中的集合
var AdminModel = mongoose.model('admin', adminSchema)

//  暴露模块
module.exports = AdminModel

