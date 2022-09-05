import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "@/backend/router";
import { createContext } from "@/backend/utils/context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
