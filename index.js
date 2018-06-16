const Koa = require('koa')
const app = new Koa()
const router = require('koa-router')()
const fs = require('fs-extra')

router.get('/', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile('./dist/index.js', 'utf8')
})

router.get('/register.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile('./dist/register.js', 'utf8')
})

router.get('/register', async ctx => {
  ctx.set('Content-Type', 'text/html')
  ctx.body = await fs.readFile('./static/register.html', 'utf8')
})

router.get('/iframe.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile('./dist/iframe.js', 'utf8')
})

router.get('/stream.js', async ctx => {
  ctx.set('Content-Type', 'text/javascript')
  ctx.body = await fs.readFile('./dist/stream.js', 'utf8')
})

router.get('/iframe', async ctx => {
  ctx.set('Content-Type', 'text/html')
  ctx.body = await fs.readFile('./static/iframe.html', 'utf8')
})

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(8080)
