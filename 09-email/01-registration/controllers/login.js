const passport = require('../libs/passport');
const User = require('../models/User');

module.exports.login = async function login(ctx, next) {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      ctx.status = 400;
      ctx.body = {error: info};
      return;
    }

    const {email} = user;
    const u = await User.findOne({email});
    if (u && u.verificationToken) {
      ctx.status = 400;
      ctx.body = {error: 'Подтвердите email'};
      return;
    }

    const token = await ctx.login(user);

    ctx.body = {token};
  })(ctx, next);
};
