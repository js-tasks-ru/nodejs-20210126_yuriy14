const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();
const ONE_MB = 1048576;

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (! pathname) {
    res.statusCode = 404;
    return res.end('File name is empty');
  }
  
  if (pathname.split(/\/|\\/).length > 1) {
    res.statusCode = 400;
    return res.end('Sub-folders are not supported');
  }

  const filepath = path.join(__dirname, 'files', pathname);
  let deleteFlag = false;

  switch (req.method) {
    case 'POST':
      const limitSizeStream = new LimitSizeStream({limit: ONE_MB});
      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

      writeStream.on('error', (error) => {
        if (error.code === 'EEXIST') {
          res.statusCode = 409;
          res.end('file is exist');
        } else {
          res.statusCode = 500;
          res.end('unknown error');
        }

        writeStream.destroy();
      });
      
      writeStream.on('finish', () => {
        res.statusCode = 201;
        res.end('ok');
      });
      
      writeStream.on('close', () => {
        if (deleteFlag) {
          fs.unlink(filepath, () => {});
        }
        
        res.destroy();
      });
      
      limitSizeStream.on('error', () => {
        deleteFlag = true;
        res.statusCode = 413;
        res.end('large request body');
        limitSizeStream.destroy();
        writeStream.destroy();
        res.destroy();
      });

      req.pipe(limitSizeStream).pipe(writeStream);

      req.on('aborted', () => {
        deleteFlag = true;
        writeStream.destroy();
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
  
});

module.exports = server;
