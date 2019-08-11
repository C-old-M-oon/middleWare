const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
  constructor() {
    // 存放中间件列表
    this.routes = {
      all: [], // app.use中间件存放
      get: [],
      post: []
    }
  }

  // 方法注册
  register (path) {
    const info = {} // 存放注册信息
    if (typeof path === 'string') {
      // 第一个参数为路由
      info.path = path
      info.stack = slice.call(arguments, 1) // 取出从第二个参数开始的参数并转换为数组存到stack
    } else {
      info.path = '/' // 若没有传入，则默认为根路由
      info.stack = slice.call(arguments, 0) // 若第一个参数就为中间件，则直接从第一个取
    }
    return info
  }

  // 定义函数
  use () {
    const info = this.register.apply(this, arguments) // 把当前函数所有参数传入register中
    this.routes.all.push(info)
  }

  get () {
    const info = this.register.apply(this, arguments)
    this.routes.get.push(info)
  }

  post () {
    const info = this.register.apply(this, arguments)
    this.routes.post.push(info)
  }

  match (method, url) {
    let stack = []
    if (url === '/favicon.ico') {
      return stack
    }
    // 获取routes
    let currentRoutes = []
    currentRoutes = currentRoutes.concat(this.routes.all)
    currentRoutes = currentRoutes.concat(this.routes[method])

    currentRoutes.forEach(routeInfo => {
      if (url.indexOf(routeInfo.path) === 0) {
        stack = stack.concat(routeInfo.stack)
      }
    })
    return stack
  }

  handle (req, res, stack) {
    // 核心next机制
    const next = () => {
      // 拿到第一个匹配的中间件
      const middleware = stack.shift()
      if (middleware) {
        // 执行中间件函数
        middleware(req, res, next)
      }
    }
    next()
  }

  callback () {
    return (req, res) => {
      res.json = (data) => {
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      }
      const { url } = req
      const method = req.method.toLowerCase()
      const resultList = this.match(method, url)
      this.handle(req, res, resultList)
    }
  }

  listen (...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

// 工厂函数
module.exports = () => {
  return new LikeExpress()
}
