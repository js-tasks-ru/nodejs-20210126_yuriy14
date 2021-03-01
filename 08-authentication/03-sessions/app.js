const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const Session = require('./models/Session');
const { v4: uuid } = require('uuid');
const handleMongooseValidationError = require('./libs/validationErrors');
const mustBeAuthenticated = require('./libs/mustBeAuthenticated');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');

const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

app.use((ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();
    const lastVisit = new Date();
    
    await Session.create({
      token,
      lastVisit,
      user
    });

    return token;
  };

  return next();
});

const router = new Router({prefix: '/api'});

router.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization');
  if (!header) return next();

  const [,token] = header.split(' ');
  if (! token) return next();

  try {
    const session = await Session.findOne({token}).populate('user');
    
    if (! session) {
      ctx.status = 401;
      return ctx.body = {error: 'Неверный аутентификационный токен'};
    }

    const lastVisit = new Date();
    await Session.updateOne({token, lastVisit});

    ctx.user = session.user;
  } catch (err) {
    ctx.status = 500;
    return ctx.body = 'Неизвестная ошибка';
  }

  return next();
});

router.post('/login', login);

router.get('/oauth/:provider', oauth);
router.post('/oauth_callback', handleMongooseValidationError, oauthCallback);

router.get('/me', mustBeAuthenticated, me);

app.use(router.routes());

// this for HTML5 history in browser
const fs = require('fs');
const User = require('./models/User');

const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
app.use(async (ctx) => {
  if (ctx.url.startsWith('/api') || ctx.method !== 'GET') return;

  ctx.set('content-type', 'text/html');
  ctx.body = index;
});

module.exports = app;
