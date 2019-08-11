const expressLike = require("./like-express")

const app = expressLike()

app.use((req, res, next) => {
  console.log('请求开始', req.method, req.url)
  next()
})

app.use((req, res, next) => {
  console.log('处理cookie')
  req.cookie = {
    userid: '464849816165'
  }
  next()
})

app.use('/api', (req, res, next) => {
  console.log('处理api路由')
  next()
})

function loginCheck (req, res, next) {
  setTimeout(() => {
    console.log('模拟登陆成功')
    next()
  })
}

app.get('/api/get-cookie', loginCheck, (req, res, next) => {
  console.log('访问/api/get-cookie接口')
  res.json({
    errno: 0,
    data: req.cookie
  })
})

app.listen(8000, () => {
  console.log('服务在8000端口启动')
})
