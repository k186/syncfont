/**
 * Created by k186 on 2021/6/2.
 * Name:
 * GitHub:
 * Email: k1868548@gmail.com
 */
const {generateFont} = require('./generateFont.js')

const Koa = require('koa');
const cors = require('koa-cors');
const Router = require('koa-router')
const app = new Koa();
const router = new Router;
app.use(cors({
  origin: '*',
}))
router.get('/pdcube/ifont', generateFont);
app.use(router.routes());
app.listen(8000);