import { useEffect } from 'react';
import websocket from 'websocket-stream';

const ws = websocket('ws://localhost:8080/');
export default function Stream() {
  useEffect(() => {
    process.stdin.pipe(ws);
    ws.pipe(process.stdout);
  }, []);
  return <>test</>;
}
