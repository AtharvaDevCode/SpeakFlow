// pages/index.js
import Head from 'next/head';
import VideoUpload from '../components/VideoUpload';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>AI Video Dubber</title>
        <meta name="description" content="Dub videos into multiple languages using AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>AI Video Dubber</h1>
        <VideoUpload />
      </main>

      <footer>
        <p>Powered by AI</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}