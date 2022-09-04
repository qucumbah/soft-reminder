import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { prisma } from "@/utils/prisma";
import { z } from "zod";
import superjson from "superjson";

const remindersRouter = trpc
  .router()
  .query("list", {
    async resolve({ ctx, input }) {
      return prisma.reminder.findMany();
    },
  })
  .mutation("add", {
    input: z.object({
      id: z.string(),
      timestamp: z.date(),
      enabled: z.boolean(),
    }),
    async resolve({ input }) {
      return prisma.reminder.create({
        data: input,
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      return prisma.reminder.delete({
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("change", {
    input: z.object({
      id: z.string(),
      timestamp: z.date(),
      enabled: z.boolean(),
    }),
    async resolve({ input }) {
      return prisma.reminder.update({
        where: {
          id: input.id,
        },
        data: input,
      });
    },
  });

const appRouter = trpc
  .router()
  .transformer(superjson)
  .merge("reminder.", remindersRouter);

export type AppRouter = typeof appRouter;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
