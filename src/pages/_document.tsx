import { Html, Head, NextScript, Main } from "next/document";

const Document = () => {
  return (
    <Html className="overscroll-none h-full w-screen inset-0 overflow-y-scroll">
      <Head />
      <body className="fixed overscroll-none h-full w-screen inset-0 overflow-y-scroll">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
