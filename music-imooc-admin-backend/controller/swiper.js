const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/cloudStorage.js')

router.get('/list', async (ctx) => {
    // 默认http api获取10条数据
    const query = `db.collection('swiper').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    // 文件下载链接
    let fileList = []
    const data = res.data
    for (let i = 0, len = data.length; i < len; i++) {
        fileList.push({
            fileid: JSON.parse(data[i]).fileid,
            max_age: 7200
        })
    }
    const dlRes = await cloudStorage.download(ctx, fileList)
    let returnData = []
    for (let i = 0, len = dlRes.file_list.length; i < len; i++) {
        returnData.push({
            download_url: dlRes.file_list[i].download_url,
            fileid: dlRes.file_list[i].fileid,
            _id: JSON.parse(data[i])._id
        })
    }
    ctx.body = {
        code: 20000,
        data: returnData
    }
})

router.post('/upload', async (ctx, next) => {
    // 上传文件到云存储
    const fileid = await cloudStorage.upload(ctx)
    // 写数据库
    const query = `
         db.collection('swiper').add({
             data: {
                 fileid: '${fileid}'
             }
         })
     `
    const res = await callCloudDB(ctx, 'databaseadd', query)
    ctx.body = {
        code: 20000,
        id_list: res.id_list
    }
})

router.get('/del', async (ctx, next) => {
    const params = ctx.request.query
    // 删除云数据库中的内容
    const query = `db.collection('swiper').doc('${params._id}').remove()`
    const delDBRes = await callCloudDB(ctx, 'databasedelete', query)

    // 删除云存储中的文件
    const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
    ctx.body = {
        code: 20000,
        data: {
            delDBRes,
            delStorageRes,
        }
    }
})

module.exports = router