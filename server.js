import { fs } from 'mz';
import myHttp from './http';

const server = myHttp.createServer();

server.on('request', (req, res) => {
  // console.log(req.headers, req.method, req.url);
  
  // res.setHeader('Content-Type', 'application/json');
  // res.writeHead(200); // Вызов writeHead опционален
  // fs.createReadStream('somefile.txt').then(s => s.pipe(res));
});

server.listen(3000);