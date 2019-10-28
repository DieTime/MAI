const proxy = require('http-proxy-middleware')

module.exports = function(app) {
  app.use(proxy('/education/**', {
    target: 'https://mai.ru',
    changeOrigin: true,
    secure: false
  }))
}