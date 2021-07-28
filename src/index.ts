import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import duplexify from 'duplexify';

const DATA_PATH = path.resolve(__dirname, '../data');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  const fileStream = fs.createWriteStream(`${DATA_PATH}/file.ogg`, { flags: 'r+' });
  const dup = duplexify();
  const readStream = fs.createReadStream(`${DATA_PATH}/file.ogg`);
  dup.setReadable(readStream);
  dup.on('data', function (data) {
    ws.send(data);
  });
  dup.setWritable(fileStream);
  readStream.pipe(fileStream);

  dup.on('error', function (err) {
    console.error(err.message);
  });

  dup.on('close', function () {
    console.log('the duplex stream is destroyed');
  });

  ws.on('message', function incoming(message) {
    if (message === 'start') {
      return;
    }
    if (message === 'end') {
      dup.destroy();
      return;
    }
    dup.write(message);
  });
});
