const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');

module.exports.checkout = async function checkout(ctx, next) {
    const {product:productId, phone, address} = ctx.request.body;
    const {user} = ctx;
    let order;
    let product;

    try {
        order = await Order.create({product:productId, phone, address, user});
        order = await order.populate('product').execPopulate();
        product = order.product;
    } catch (err) {
        if (err.name !== 'ValidationError') {
            // console.log(err);
            throw err;
        }

        const errors = {};

        for (const field of Object.keys(err.errors)) {
            errors[field] = err.errors[field].message;
        }

        // console.log(errors);

        ctx.status = 400;
        ctx.body = {errors};
        return;
    }

    const {_id:orderId} = order; 

    await sendMail({
        template: 'order-confirmation',
        to: user.email,
        subject: 'Вы оформили заказ на learn.javascript.ru',
        locals: {
            id: orderId,
            product
        }
    });

    return ctx.body = {order: orderId};

};

module.exports.getOrdersList = async function ordersList(ctx, next) {
    const {user} = ctx;
    const orders = await Order.find({user});
    ctx.body = {orders};
    return;
};
