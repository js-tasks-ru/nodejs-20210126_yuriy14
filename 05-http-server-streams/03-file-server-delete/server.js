const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

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

  switch (req.method) {
    case 'DELETE':
      fs.unlink(filepath, (error) => {
        if (error) {
          setStatusCode(error);
        } else {
          res.statusCode = 200;
          res.end('ok');
        }
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }

  function setStatusCode (error) {
    if (error.code === 'ENOENT') {
      res.statusCode = 404;
      res.end('file not found');
    } else {
      res.statusCode = 500;
      res.end('unknown error');
    }
  }
});

module.exports = server;
