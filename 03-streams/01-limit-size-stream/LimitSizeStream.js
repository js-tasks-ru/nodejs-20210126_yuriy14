const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  bytes = 0;

  constructor(options) {
    super(options);
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    this.bytes += Buffer.byteLength(chunk, encoding);
    
    if (this.bytes > this.limit) {
      return callback(new LimitExceededError());
    }

    callback(null, chunk);

  }
}

module.exports = LimitSizeStream;
