const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  clipboard = '';
  separator = os.EOL;

  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, callback) {
    this.clipboard += chunk;
    const separator = this.separator;

    if (this.clipboard.includes(separator)) {
      const pieces = this.clipboard.split(separator);
      this.clipboard = pieces.pop();

      pieces.forEach(data => this.push(data));
    }
    
    callback();
  }
  
  _flush(callback) {
    if (this.clipboard) {
      this.push(this.clipboard);
    }
    
    callback();
  }
}

module.exports = LineSplitStream;
