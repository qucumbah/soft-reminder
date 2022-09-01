import { Html, Head, NextScript, Main } from "next/document";

const Document = () => {
  return (
    <Html className="overscroll-none h-full w-full inset-0 overflow-y-scroll">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icon-32x32.png"
        />
      </Head>
      <body className="fixed overscroll-none h-full w-screen inset-0 overflow-y-scroll">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
