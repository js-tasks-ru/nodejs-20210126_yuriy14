const { v4: uuid } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
    const verificationToken = uuid();
    const {email, displayName, password} = ctx.request.body;
    const user = {email, displayName, verificationToken};

    try {
        const userInDb = await User.findOne({email});
        if (userInDb) {
            console.log('Такой email уже существует');
            ctx.status = 400;
            ctx.body =  {errors: {email: 'Такой email уже существует'} } 
            return;
        }
    } catch (error) {
        ctx.status = 400;
        ctx.body = { errors: { unknown: 'Неизвестная ошибка' } }
        console.log(error.message);
        return;
    }

    const options = {
        template: 'confirmation',
        to: email,
        subject: 'Подтверждение регистрации learn.javascript.ru',
        locals: {
            token: verificationToken
        }
    }

    const u = new User(user);

    try {
        await u.setPassword(password);
        await u.save();
    } catch (err) {
        if (err.name === 'ValidationError') {
            const errors = {};

            for (const field of Object.keys(err.errors)) {
                errors[field] = err.errors[field].message;
            }

            console.log(errors);

            ctx.status = 400;
            ctx.body = {errors};
            return;
        }

        console.log(err);
        throw err;
    }

    await sendMail(options);
    console.log(`http://localhost:3000/confirm/${verificationToken}`);

    return ctx.body = {status: 'ok'};
};

module.exports.confirm = async (ctx, next) => {
    const {verificationToken} = ctx.request.body;
    
    const user = await User.findOneAndUpdate(
        {verificationToken}, 
        {$unset: {verificationToken: ''}}
    );
    
    if (! user) {
        ctx.status = 400;
        return ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
    }

    const token = uuid();
    const lastVisit = new Date();
    
    await Session.create({user, token, lastVisit});
    // console.log('ok');
    return ctx.body = {token};
};
