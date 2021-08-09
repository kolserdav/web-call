import { useEffect } from 'react';

export default function Module() {
  useEffect(() => {
    // ......................................................
    // .......................UI Code........................
    // ......................................................
    document.getElementById('open-room').onclick = () => {
      disableInputButtons();
      connection.open(document.getElementById('room-id').value, () => {
        showRoomURL(connection.sessionid);
      });
    };

    document.getElementById('join-room').onclick = () => {
      disableInputButtons();
      connection.join(document.getElementById('room-id').value);
    };

    document.getElementById('open-or-join-room').onclick = () => {
      disableInputButtons();
      connection.openOrJoin(
        document.getElementById('room-id').value,
        function (isRoomExist, roomid) {
          if (!isRoomExist) {
            showRoomURL(roomid);
          }
        }
      );
    };

    // ......................................................
    // ..................RTCMultiConnection Code.............
    // ......................................................
    // @ts-ignore
    const connection = new RTCMultiConnection();

    // by default, socket.io server is assumed to be deployed on your own URL
    connection.socketURL = 'http://localhost:9001/';

    // comment-out below line if you do not have your own socket.io server
    // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.socketMessageEvent = 'audio-conference-demo';

    connection.session = {
      audio: true,
      video: false,
    };

    connection.mediaConstraints = {
      audio: true,
      video: false,
    };

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: false,
    };

    // https://www.rtcmulticonnection.org/docs/iceServers/
    // use your own TURN-server here!
    connection.iceServers = [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun.l.google.com:19302?transport=udp',
        ],
      },
    ];

    connection.audiosContainer = document.getElementById('audios-container');
    connection.onstream = function (event) {
      const width = connection.audiosContainer.clientWidth / 2 - 20;
      // @ts-ignore
      const mediaElement = getHTMLMediaElement(event.mediaElement, {
        title: event.userid,
        buttons: ['full-screen'],
        width,
        showOnMouseEnter: false,
      });

      connection.audiosContainer.appendChild(mediaElement);

      setTimeout(() => {
        mediaElement.media.play();
      }, 5000);

      mediaElement.id = event.streamid;
    };

    connection.onstreamended = function (event) {
      const mediaElement = document.getElementById(event.streamid);
      if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
      }
    };

    function disableInputButtons() {
      document.getElementById('open-or-join-room').disabled = true;
      document.getElementById('open-room').disabled = true;
      document.getElementById('join-room').disabled = true;
      document.getElementById('room-id').disabled = true;
    }

    // ......................................................
    // ......................Handling Room-ID................
    // ......................................................

    function showRoomURL(roomid) {
      const roomHashURL = `#${roomid}`;
      const roomQueryStringURL = `?roomid=${roomid}`;

      let html = '<h2>Unique URL for your room:</h2><br>';

      // eslint-disable-next-line prefer-template
      html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
      html += '<br>';
      html += `QueryString URL: <a href="${roomQueryStringURL}" target="_blank">${roomQueryStringURL}</a>`;

      const roomURLsDiv = document.getElementById('room-urls');
      roomURLsDiv.innerHTML = html;

      roomURLsDiv.style.display = 'block';
    }

    (() => {
      const params = {},
        r = /([^&=]+)=?([^&]*)/g;

      function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
      }
      let match;
      const { search } = window.location;
      while ((match = r.exec(search.substring(1)))) params[d(match[1])] = d(match[2]);
      window.params = params;
    })();

    var roomid = '';
    if (localStorage.getItem(connection.socketMessageEvent)) {
      roomid = localStorage.getItem(connection.socketMessageEvent);
    } else {
      roomid = connection.token();
    }
    document.getElementById('room-id').value = roomid;
    document.getElementById('room-id').onkeyup = () => {
      localStorage.setItem(connection.socketMessageEvent, document.getElementById('room-id').value);
    };

    const hashString = location.hash.replace('#', '');
    if (hashString.length && hashString.indexOf('comment-') === 0) {
      hashString = '';
    }

    var { roomid } = params;
    if (!roomid && hashString.length) {
      roomid = hashString;
    }

    if (roomid && roomid.length) {
      document.getElementById('room-id').value = roomid;
      localStorage.setItem(connection.socketMessageEvent, roomid);

      // auto-join-room
      (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function (isRoomExist) {
          if (isRoomExist) {
            connection.join(roomid);
            return;
          }

          setTimeout(reCheckRoomPresence, 5000);
        });
      })();

      disableInputButtons();
    }
  }, []);
  return (
    <>
      <h1>
        Аудио конференция
        <p className="no-mobile">Позволяет выполнять мультипользовательский созвон</p>
      </h1>

      <section className="make-center">
        <input type="text" id="room-id" value="abcdef" />
        <button type="button" id="open-room">
          Октрыть комнату
        </button>
        <button type="button" id="join-room">
          Присоединиться к комнате
        </button>
        <button type="button" id="open-or-join-room">
          Автоматически открыть или присоединиться к открытой
        </button>

        <div id="room-urls" />

        <div id="audios-container" />
      </section>
      <script defer src="http://localhost:9001/dist/module.min.js" />
      <script defer src="http://localhost:9001/node_modules/webrtc-adapter/out/adapter.js" />
      <script defer src="http://localhost:9001/socket.io/socket.io.js" />
      <script defer src="http://localhost:9001/dev/getHTMLMediaElement.js" />
      <script defer src="https://www.webrtc-experiment.com/common.js" />
    </>
  );
}
