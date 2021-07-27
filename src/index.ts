import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.resolve(__dirname, '../data');

const wss = new WebSocket.Server({ port: 8080 });

let start = false;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const fileStream = fs.createWriteStream(`${DATA_PATH}/file.ogg`);
    if (start === false && message !== 'end') {
      start = true;
      const readStream = fs.createReadStream(`${DATA_PATH}/file.ogg`);
      readStream.on('data', (chunk) => {
        ws.send(chunk);
      });
    } else if (message === 'end') {
      start = false;
      return;
    }
    fileStream.write(message);
  });

  ws.send('something');
});
