//  采用MVC开发
var express = require('express')
var mongoose = require('mongoose')
var path = require('path')
var session = require('express-session')
var bodyParser = require('body-parser')
var route = require('./routes/route')  // 引入route路由
var app = express()

//  连接mongoDB数据库
mongoose.connect('mongodb://localhost:27017/mydatabase',{ useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, '连接数据库失败'))
db.once('open', function () {
  console.log('连接mongoDB数据库成功')
})

//  ----设置ejs模板引擎-
app.set('views', path.join(__dirname, 'views'))  // 设置ejs
app.engine('.html', require('ejs').__express)  //  将.html扩展名作为ejs 的扩展名
app.set('view engine', 'html') //  将模板的识别扩展名替换为html
//  --------------配置中间件-------------
app.use(session({
  secret: 'Optional course registration system',
  cookie: {maxAge: 60 * 300000},
  resave: false, // 每次请求都强行设置session-- false表示不设置
  saveUninitialized: true  // 每次请求无论有没有session cookie 都设置新的session  true表示设置
})) //  配置session解析中间件
app.use(bodyParser.urlencoded({extended: false})) //  解析post数据挂载到req.body中
app.use(route)
app.use(express.static('./public'))    //  静态化
app.use(function (req, res) {  // 配置404中间件 这是一个万能中间件,如果所有路由都没匹配到 那么就会执行这个
  // console.log('错误404')
  res.send('没有找到这个页面错误404')
})
app.listen(3000, function () {
  console.log('服务器已启动通过3000端口访问')
})



