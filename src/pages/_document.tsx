import { Html, Head, NextScript, Main } from "next/document";

const Document = () => {
  return (
    <Html className="overscroll-none h-full w-full inset-0 overflow-y-scroll" lang="en-US">
      <Head>
        <meta name="description" content="This is an alarm-like app that creates notifications at specified times." />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icon-32x32.png"
        />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      <body className="fixed overscroll-none h-full w-screen inset-0 overflow-y-scroll">
        <Main />
        <NextScript />
      </body>
      <svg>
        <defs>
          <mask id="mask-linear">
            <rect width="100" height="100" fill="url(#linear-gradient)"></rect>
            <linearGradient id="linear-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="black" offset="0%" />
              <stop stopColor="white" offset="100%" />
            </linearGradient>
          </mask>
          <filter id="gaussian-blur-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
      </svg>
    </Html>
  );
};

export default Document;
