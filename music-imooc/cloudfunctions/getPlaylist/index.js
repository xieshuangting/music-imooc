// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const rp = require('request-promise')
const URL = 'http://musicapi.xiecheng.live/personalized'
const db = cloud.database()//初始化数据库
const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 数据库的数据
  // 通过get的方式取到playlist数据库中的所有数据
  // 只能获取100条数据
  // const list = await playlistCollection.get();
  const countResult = await playlistCollection.count()// 获取数据库中的数据总数,返回的是一个对象
  const total = countResult.total
  const batchTimes = Math.ceil(total/MAX_LIMIT)
  const tasks = []
  for(let i = 0; i<batchTimes;i++){
    let promise = playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list={
    data:[]
  }
  if(tasks.length>0){
    list =(await Promise.all(tasks)).reduce((acc,cur)=>{
      return {
        data:acc.data.concat(cur.data)
      }
    })
  }

  // 服务端的数据
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
  // 去重处理
  const newData = [];
  for(let i =0,len1 = playlist.length;i<len1;i++){
    let flag = true;
    for(let j = 0,len2 = list.data.length;j<len2;j++){
      if(playlist[i].id == list.data[j].id){
        flag =false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }
  //云数据库只能插入单条数据，所以需要循环
  for(let i = 0,len = newData.length;i<len ;i++){
    await playlistCollection.add({
      data:{
        ...newData[i],
        createTime:db.serverDate(),//获取服务器上的时间
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch((err)=>{
      console.log('插入失败')
    })
  }
  return newData.length
}