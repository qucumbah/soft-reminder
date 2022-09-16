import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { prisma } from "../utils/prisma";
import { Context } from "../utils/context";
import { PrismaPromise } from "@prisma/client";

const withLastSyncUpdate = async <T>(
  userId: string,
  mutation: PrismaPromise<T>
) => {
  const syncTime = new Date();

  const updateLastSyncMutation = prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      lastSync: syncTime,
    },
  });

  const mutationResult = await prisma.$transaction([
    mutation,
    updateLastSyncMutation,
  ]);

  return {
    result: mutationResult[0],
    lastSync: mutationResult[1].lastSync,
  };
};

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
    input: z
      .object({
        includeLastSyncTime: z.boolean().optional(),
      })
      .optional(),
    async resolve({ input, ctx }) {
      const remindersListQuery = prisma.reminder.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!input?.includeLastSyncTime) {
        return {
          reminders: await remindersListQuery,
          lastSync: null,
        };
      }

      const userQuery = prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          lastSync: true,
        },
      });

      const [reminders, user] = await prisma.$transaction([
        remindersListQuery,
        userQuery,
      ]);

      if (user === null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        reminders,
        lastSync: user.lastSync,
      };
    },
  })
  .mutation("add", {
    input: z.object({
      id: z.string(),
      timestamp: z.date(),
      enabled: z.boolean(),
    }),
    async resolve({ input: reminder, ctx }) {
      return withLastSyncUpdate(
        ctx.session.user.id,
        prisma.reminder.create({
          data: {
            userId: ctx.session.user.id,
            ...reminder,
          },
        })
      );
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input: reminder, ctx }) {
      return withLastSyncUpdate(
        ctx.session.user.id,
        prisma.reminder.delete({
          where: {
            id_userId: {
              id: reminder.id,
              userId: ctx.session.user.id,
            },
          },
        })
      );
    },
  })
  .mutation("change", {
    input: z.object({
      id: z.string(),
      timestamp: z.date(),
      enabled: z.boolean(),
    }),
    async resolve({ input: reminder, ctx }) {
      return withLastSyncUpdate(
        ctx.session.user.id,
        prisma.reminder.update({
          where: {
            id_userId: {
              id: reminder.id,
              userId: ctx.session.user.id,
            },
          },
          data: reminder,
        })
      );
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
    async resolve({ input: reminders, ctx }) {
      await prisma.reminder.deleteMany({
        where: {
          userId: ctx.session.user.id,
        },
      });

      return withLastSyncUpdate(
        ctx.session.user.id,
        prisma.reminder.createMany({
          data: reminders.map((reminder) => ({
            ...reminder,
            userId: ctx.session.user.id,
          })),
        })
      );
    },
  });

export const appRouter = trpc
  .router<Context>()
  .transformer(superjson)
  .merge("reminder.", remindersRouter);

export type AppRouter = typeof appRouter;
