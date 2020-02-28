// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  const result = await cloud.openapi.subscribeMessage.send({
    touser: OPENID, //要推送给那个用户
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`, //要跳转到那个小程序页面
    data: { //推送的内容
      phrase1: {
        value: '评价完成'
      },
      thing2: {
        value: event.content
      }
    },
    templateId: '0n7TnraFfEtJVLnZfsOttZHdTefGaJowe2K5VHthX44' //模板id
  })
  return result
}