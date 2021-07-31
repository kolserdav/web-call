import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import duplexify from 'duplexify';
import express from 'express';

const DATA_PATH = path.resolve(__dirname, '../data');
const streamFile = `${DATA_PATH}/file.ogg`;

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  const fileStream = fs.createWriteStream(streamFile, { flags: 'r+' });
  const dup = duplexify();
  const readStream = fs.createReadStream(streamFile);
  dup.setReadable(readStream);
  dup.on('data', function (data) {
    ws.send(data);
  });
  dup.setWritable(fileStream);

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

const app = express();

app.get('/get', function (req, res) {
  const stat = fs.statSync(streamFile);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(streamFile, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/off',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/ogg',
    };
    res.writeHead(200, head);
    fs.createReadStream(streamFile).pipe(res);
  }
});

app.listen(3001);
