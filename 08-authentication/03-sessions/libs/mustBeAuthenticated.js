module.exports = function mustBeAuthenticated(ctx, next) {
  if (! ctx.user) {
    ctx.status = 401;
    return ctx.body = {error: 'Пользователь не залогинен'};
  }

  return next();
};
