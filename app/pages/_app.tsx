import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script defer src="/js/peerjs.min.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
