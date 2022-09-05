import { nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";

export const createContext = async ({ req, res }: CreateNextContextOptions) => {
  const session = await unstable_getServerSession(req, res, nextAuthOptions);
  return {
    req,
    res,
    session,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
