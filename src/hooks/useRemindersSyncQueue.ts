import { trpc } from "@/utils/trpc";
import { useState, useEffect, useRef } from "react";
import type { ReminderAction } from "./useCachedReminders";
import superjson from "superjson";

export const useRemindersSyncQueue = (inputs: { canSync: boolean }) => {
  const { client: trpcClient } = trpc.useContext();
  const [syncQueue, setSyncQueue] = useState<ReminderAction[]>([]);

  useEffect(() => {
    setSyncQueue((prevSyncQueue) => [
      ...loadCachedSyncQueue(),
      ...prevSyncQueue,
    ]);
  }, []);

  useEffect(() => {
    const saveQueue = () => saveSyncQueueToCache(syncQueue);
    window.addEventListener("beforeunload", saveQueue);
    return () => window.removeEventListener("beforeunload", saveQueue);
  }, [syncQueue]);

  /**
   * The value of whether the sync is in process has to be updated immediately.
   * Since react state updates are not immediate, using `useState` for this
   * causes nasty race conditions.
   * To make it immediate, `useRef` is used instead.
   *
   * But we still need to notify updates using sync state that a change has
   * occurred. Thus, we use a separate `useState` for indicator.
   */
  const isSyncingRef = useRef(false);
  const [isSyncingIndicator, setIsSyncingIndicator] = useState(false);

  const { canSync } = inputs;

  useEffect(() => {
    if (!canSync) {
      return;
    }

    if (isSyncingRef.current) {
      return;
    }

    if (syncQueue.length === 0) {
      return;
    }

    isSyncingRef.current = true;
    setIsSyncingIndicator(true);

    const action = syncQueue[0];

    trpcClient.mutation(`reminder.${action.type}`, action.payload).then(() => {
      setSyncQueue((prevSyncQueue) => {
        return prevSyncQueue.slice(1);
      });
    }).finally(() => {
      isSyncingRef.current = false;
      setIsSyncingIndicator(false);
    });
  }, [canSync, syncQueue, trpcClient]);

  return {
    enqueueSyncAction: (newAction: ReminderAction) => {
      setSyncQueue((prevSyncQueue) => {
        return [...prevSyncQueue, newAction];
      });
    },
    isSyncing: isSyncingIndicator,
  };
};

const loadCachedSyncQueue = () => {
  const cachedSyncQueueString = localStorage.getItem("syncQueueInfo");

  if (cachedSyncQueueString === null) {
    return [];
  }

  return superjson.parse<ReminderAction[]>(cachedSyncQueueString);
};

const saveSyncQueueToCache = (syncQueue: ReminderAction[]) => {
  localStorage.setItem("syncQueueInfo", superjson.stringify(syncQueue));
}
