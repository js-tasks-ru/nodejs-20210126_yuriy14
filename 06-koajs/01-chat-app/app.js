const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.body = 'something error!';
    }
});

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = {};

router.get('/subscribe', async (ctx, next) => {
    const subscribe = new Promise(resolve => {
        const id = Math.random();
        subscribers[id] = {ctx, resolve};
        
        ctx.req.on('aborted', () => {
            delete subscribers[id];
            resolve();
        });
    });

    await subscribe;
});

router.post('/publish', async (ctx, next) => {
    const {message} = ctx.request.body;

    if (message) {
        for (let id in subscribers) {
            subscribers[id].ctx.body = message;
            subscribers[id].resolve();
        }

        subscribers = {};
    }

    ctx.body = 'ok';
});

app.use(router.routes());

module.exports = app;
