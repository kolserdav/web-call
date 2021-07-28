import { useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import * as WebSocket from 'websocket';
import styles from '../styles/Home.module.css';

export default function Home() {
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

      wsc.onmessage = function (e) {
        const audioBlob = new Blob([e.data], { type: 'application/octet-stream' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        if (read) {
          audio.play();
        }
      };

      if (read) {
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
        });
      }
    })();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Web call</title>
      </Head>
      test
    </div>
  );
}
