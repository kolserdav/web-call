/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import * as WebSocket from 'websocket';
import io from 'socket.io-client';
import styles from '../styles/Home.module.css';

const ROOM_ID = 1;

export default function Home() {
  useEffect(() => {
    const peer = new Peer(undefined, {
      path: '/myapp',
      host: 'localhost',
      port: '9000',
    });
    const conn = peer.connect('another-peers-id');
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function () {
      console.log(1);
      conn.send('hi!');
    });
    peer.on('connection', function (connect) {
      console.log('connected');
      connect.on('data', function (data) {
        // Will print 'hi!'
        console.log(data);
      });
    });
    // Call
    const getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia(
      { video: false, audio: true },
      function (stream) {
        console.log(222);
        const call = peer.call('another-peers-id', stream);
        call.on('stream', function (remoteStream) {
          console.log(remoteStream);
        });
      },
      function (err) {
        console.log('Failed to get local stream', err);
      }
    );
    // Answer
    peer.on('call', function (call) {
      console.log(223);
      getUserMedia(
        { video: true, audio: true },
        function (stream) {
          call.answer(stream); // Answer the call with an A/V stream.
          call.on('stream', function (remoteStream) {
            console.log(remoteStream);
            // Show stream in some video/canvas element.
          });
        },
        function (err) {
          console.log('Failed to get local stream', err);
        }
      );
    });
  }, []);
  return <div className="container"></div>;
}

/*export default function Home() {
  useEffect(() => {
    const { asPath } = Router;
    const read = asPath === '/?read=1';
    console.log(read);
    (async () => {
      const wsc: WebSocket.w3cwebsocket = await new Promise((resolve) => {
        const W3CWebSocket = WebSocket.w3cwebsocket;
        const client = new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');
        client.onerror = function () {
          console.error('Connection Error');
          resolve(null);
        };

        client.onopen = function () {
          console.info('Connected');
          resolve(client);
        };
      });

      if (!wsc) {
        return;
      }

      wsc.onclose = function () {
        console.log('echo-protocol Client Closed');
      };

      const ctx = new AudioContext();
      let d = 0;
      let i = 0;
      const chunks = new Blob();
      let gAb;
      async function playChunk() {
        const aB = await chunks[i].arrayBuffer();
        const decoded = await ctx.decodeAudioData(aB);
        await new Promise((resolve) => {
          if (chunks[i]) {
            const playSound = ctx.createBufferSource();
            playSound.buffer = decoded;
            playSound.connect(ctx.destination);
            playSound.start(0);
            playSound.onended = async () => {
              resolve(0);
            };
          }
        });
        i++;
        if (chunks[i]) {
          console.log(i, chunks);
          await playChunk();
        }
      }
      wsc.onmessage = async function (e: any) {
        if (read) {
          /*
          chunks.append(e.data);
          if (d !== 5) d++;
          if (d === 5) {
            d++;
            await playChunk();
          }
          */
/*
          const mS = new MediaStream();
          mS.addTrack(await e.data.arrayBuffer());
          const mediaStreamSource = ctx.createMediaStreamSource(mS);
          mediaStreamSource.connect(ctx.destination);
          
        }
      };

      if (!read) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start(200);
          let start = false;
          mediaRecorder.addEventListener('dataavailable', (event) => {
            if (!start) {
              wsc.send('start');
              start = true;
            }
            wsc.send(event.data);
          });
          mediaRecorder.addEventListener('stop', () => {
            start = false;
            wsc.send('end');
          });
          window.onkeypress = (event) => {
            const { key } = event;
            console.log(key);
            if (key.toLowerCase() === 's') {
              console.info('stoped');
              mediaRecorder.stop();
            }
          };
          setTimeout(() => {
            mediaRecorder.stop();
          }, 10000);
        });
      }
    })();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Web call</title>
      </Head>
      <audio id="videoPlayer" controls autoPlay={true}>
        {' '}
        <source src="http://localhost:3001/get" type="audio/ogg" />
      </audio>
    </div>
  );
}
*/
