import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "@/utils/prisma";
import { z } from "zod";

const appRouter = trpc.router().query("getReminders", {
  async resolve({ ctx, input }) {
    return prisma.reminder.findMany();
  },
});

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
