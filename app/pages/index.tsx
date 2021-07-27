import { useEffect } from 'react';
import Head from 'next/head';
import * as WebSocket from 'websocket';
import styles from '../styles/Home.module.css';

export default function Home() {
  useEffect(() => {
    (async () => {
      const wsc: WebSocket.w3cwebsocket = await new Promise((resolve) => {
        const W3CWebSocket = WebSocket.w3cwebsocket;
        const client = new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');

        client.onerror = function () {
          console.error('Connection Error');
          resolve(null);
        };

        client.onopen = function () {
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
        const audioContext = new AudioContext();
        const channelCount = 2;
        const bufferDurationS = 5;

        // Create an audio buffer, which will contain the audio data.
        const audioBuffer = audioContext.createBuffer(
          channelCount,
          bufferDurationS * audioContext.sampleRate,
          audioContext.sampleRate
        );

        // Get the audio channels, which are float arrays representing each individual channel for the buffer.
        const channels = [];
        for (let channelIndex = 0; channelIndex < channelCount; ++channelIndex) {
          channels.push(audioBuffer.getChannelData(channelIndex));
        }

        // Populate the audio buffer with audio data.
        for (let sampleIndex = 0; sampleIndex < audioBuffer.length; ++sampleIndex) {
          channels[0][sampleIndex] = e.data;
          channels[1][sampleIndex] = e.data;
        }

        // Creates a lightweight audio buffer source which can be used to play the audio data.
        let audioBufferSource = audioContext.createBufferSource();
        audioBufferSource.buffer = audioBuffer;
        audioBufferSource.connect(audioContext.destination);
        audioBufferSource.start();
      };

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mediaRecorder = new MediaRecorder(stream, { flags: 'a' });
        mediaRecorder.start();

        const audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', (event) => {
          wsc.send(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          wsc.send('end');
        });

        setTimeout(() => {
          mediaRecorder.stop();
          console.log(audioChunks);
        }, 10000);
      });
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
