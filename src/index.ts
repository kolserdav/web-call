import express from 'express';
import cors from 'cors';
import server from 'http';
import { v4 as uuidV4 } from 'uuid';

const app = express();
const serve = server.Server(app);
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/join', (req, res) => {
  res.send({ link: uuidV4() });
});

serve
  .listen(port, () => {
    console.log(`Listening on the port ${port}`);
  })
  .on('error', (e) => {
    console.error(e);
  });

import socketIO from 'socket.io';
io.on('connection', (socket) => {
  console.log('socket established');
  socket.on('join-room', (userData) => {
    const { roomID, userID } = userData;
    socket.join(roomID);
    socket.to(roomID).broadcast.emit('new-user-connect', userData);
    socket.on('disconnect', () => {
      socket.to(roomID).broadcast.emit('user-disconnected', userID);
    });
  });
});
