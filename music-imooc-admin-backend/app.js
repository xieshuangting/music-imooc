const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const ENV = 'music-87mae'

// 跨域
app.use(cors({
    origin: ['http://localhost:9528'],
    credentials: true
}))

// 接受post参数解析
app.use(koaBody({
    multipart:true
}))

// 全局中间件
app.use(async (ctx, next) => {
    ctx.state.env = ENV //定义整个项目的全局变量
    await next()
})

const playlist = require('./controller/playlist.js')
router.use('/playlist', playlist.routes())

const swiper = require('./controller/swiper.js')
router.use('/swiper', swiper.routes())

const blog = require('./controller/blog.js')
router.use('/blog', blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
    console.log('服务开启在3000端口')
})