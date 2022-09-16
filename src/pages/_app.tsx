import "../styles/globals.css";
import React from "react";
import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import type { AppRouter } from "@/backend/router";
import { SessionProvider } from "next-auth/react";
import superjson from "superjson";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SessionProvider session={pageProps.session} refetchOnWindowFocus={false}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";

    return {
      url,
      headers: {
        cookie: ctx?.req?.headers.cookie,
      },
      transformer: superjson,
    };
  },
})(MyApp);
