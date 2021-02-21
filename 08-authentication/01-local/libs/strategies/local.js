const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      let user;
      
      try {
        user = await User.findOne({email});
      } catch (error) {
        console.error('БД не отвечает:', error.message);
        return done(null, false, 'Неизвестная ошибка, повторите попытку позже.');
      }
      
      if (! user) {
        return done(null, false, 'Нет такого пользователя');
      }

      if (! await user.checkPassword(password)) {
        return done(null, false, 'Неверный пароль');
      }

      done(null, user, 'Успешная авторизация!');
    },
);
