import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { prisma } from "../utils/prisma";
import { Context } from "../utils/context";

const remindersRouter = trpc
  .router<Context>()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  })
  .query("list", {
    async resolve({ ctx }) {
      return prisma.reminder.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
    },
  })
  .mutation("add", {
    input: z.object({
      id: z.string(),
      timestamp: z.date(),
      enabled: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      return prisma.reminder.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return prisma.reminder.delete({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
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
    async resolve({ input, ctx }) {
      return prisma.reminder.update({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        },
        data: input,
      });
    },
  })
  .mutation("reset", {
    input: z.array(
      z.object({
        id: z.string(),
        timestamp: z.date(),
        enabled: z.boolean(),
      })
    ),
    async resolve({ input, ctx }) {
      return;
    },
  });

export const appRouter = trpc
  .router<Context>()
  .transformer(superjson)
  .merge("reminder.", remindersRouter);

export type AppRouter = typeof appRouter;
