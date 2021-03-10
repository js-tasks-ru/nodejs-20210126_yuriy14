const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, done) {
    const {token} = socket.handshake.query;
    
    if (!token) {
      return done(new Error('anonymous sessions are not allowed'));
    }

    let session;
    
    try {
      session = await Session.findOne({token}).populate('user');
    } catch (err) {
      return done(new Error('service error'));
    }

    if (!session) {
      return done(new Error('anonymous sessions are not allowed'));
    }

    socket.user = session.user;

    done();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      if (!msg) {
        return;
      }

      const {displayName, _id:userId} = socket.user;
      
      try {
        await Message.create({
          user: displayName,
          chat: userId,
          text: msg,
          date: new Date()
        });
      } catch (err) {
        console.log(err.message);
      }
      
    });
  });

  return io;
}

module.exports = socket;
