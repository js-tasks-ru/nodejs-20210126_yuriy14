const Message = require('../models/Message');

module.exports.messageList = async function messages(ctx, next) {
  const {_id: userId} = ctx.user;
  
  const rawMessages = await Message.find({chat: userId}).sort('-date').limit(20);
  const messages = getMessages(rawMessages);

  ctx.body = {messages};
  return;
};

function getMessages (rawMessages) {
  return rawMessages.map(msg => {
    const {_id: id, date, text, user} = msg;
    return {id, date, text, user};
  });
}