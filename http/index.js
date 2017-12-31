import net from 'net';
import { fs } from 'mz';
import path from 'path';
import EventEmmiter from 'events';
import { StringDecoder } from 'string_decoder';

const REQUEST = 'request';

let count = '0';


const convertHeadersToObject = (string, header = {}) => string.split('\r\n')
.reduce((accumulator, current, i) => {
  if (!current) return accumulator;
  if (i === 0) {
    const firstLine = current.split(' ');
    return {
      ...accumulator,
      method: firstLine[0],
      url: firstLine[1],
    };
  }
  const newArr = current.split(": ");
  return {
    ...accumulator,
    [newArr[0]]: newArr[1],
  };
}, header);

const writeStream = fs.createWriteStream('./testimg.js');


class HttpServer extends EventEmmiter {
  constructor (args) {
    super(args);
    this.server = net.createServer();
    // this.req = new HttpRequest();
    // this.res = new HttpResponse();
    // this.emit('test');
    this.server.on('connection', socket => {
      const decoder = new StringDecoder('utf8');
      let header = "";
      let thatsAll = false;
      socket.on('readable', () => {
        let chunk;
        while (null !== (chunk = socket.read())) {
          const str = decoder.write(chunk);
          if (!thatsAll) {
            if (str.match(/\r\n\r\n/)) {
              // found the header boundary
              const split = str.split(/\r\n\r\n/);
              header += split.shift();
              header = convertHeadersToObject(header);
              // now the body of the message can be read from the stream.
              // console.log(header);
              // console.log(socket);
              thatsAll = true;

              const remaining = split.join('\r\n\r\n');
              const buf = Buffer.from(remaining, 'utf8');
              if (buf.length) {
                socket.unshift(buf);
              }
            } else {
              // still reading the header.
              header += str;
            }
          }
          else {
            const code = header['Content-Type'].split('boundary=').pop();
            if (str.match(code)) {
              console.log('finish');
              socket.write(`HTTP/1.1 OK 200\r\nContent-Type: text/html; charset=utf-8\r\n\r\n`);
              socket.end('fsdsdwqdasfwa\r\n\r\n');
            }
          }
          socket.pipe(writeStream);
        }
        // console.log(data.toString());

        // const incomeData = data.toString('utf-8');
        // const splitingData = incomeData.split('\r\n\r\n');
        // const headers = splitingData[0]
          


        // socket.pipe(this.req);
        // this.emit(REQUEST, this.req, this.res);

        // let pathName = incomeData.split(' ')[1];
        // if (pathName === '/') pathName = '/index.html';
        // const fileExtension = pathName.split('.')[1];
        // const filePath = path.resolve(__dirname, '../static', `.${pathName}`);
        // fs.readFile(`${filePath}`, (err, file) => {
        //   if (err) {
        //     console.log(err);
        //     let errorMsg = '';
        //     switch (err.code) {
        //       case 'EACCES': errorMsg = '403 Forbidden'; break;
        //       case 'ENOENT': errorMsg = '404 Not Found'; break;
        //       default: errorMsg = '400 Bad Request';
        //     }
        //     socket.end(`HTTP/1.1 ${errorMsg}\r\n\r\n<h1>${errorMsg}</h1>\r\n\r\n`);
        //   }
        //   else {
        //     let contentType = '';
        //     if (fileExtension === 'png' || fileExtension === 'jpg') {
        //       contentType = `Content-Type: image/${fileExtension}`;
        //     } else if (fileExtension === 'css') {
        //       contentType = `Content-Type: text/${fileExtension}`;
        //     } else if (fileExtension === 'html') {
        //       contentType = `Content-Type: text/${fileExtension}; charset=utf-8`;
        //     }
        //     socket.write(`HTTP/1.1 OK 200\r\n${contentType}\r\n\r\n`);
        //     socket.write(file);
        //     socket.end();
        //   }
        // });
      });
      // writeStream.on('end', () => {
      //   let contentType = '';
      //   // if (fileExtension === 'png' || fileExtension === 'jpg') {
      //   //   contentType = `Content-Type: image/${fileExtension}`;
      //   // } else if (fileExtension === 'css') {
      //   //   contentType = `Content-Type: text/${fileExtension}`;
      //   // } else if (fileExtension === 'html') {
      //     contentType = `Content-Type: text/html; charset=utf-8`;
      //   // }
      //   socket.write(`HTTP/1.1 OK 200\r\n${contentType}\r\n\r\n`);
      //   socket.write('oooook))')
      //   // socket.write(file);
      // })
    });
  }
  listen (port) {
    this.server.listen(port);
  }
};

export default {
  createServer() {
    return new HttpServer();
  }
}
