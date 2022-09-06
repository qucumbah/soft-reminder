import { trpc } from "@/utils/trpc";
import { useState, useEffect } from "react";
import type { ReminderAction } from "./useCachedReminders";

export const useSyncReminders = (inputs: {
  isOnline: boolean;
  isSignedIn: boolean;
}) => {
  const { client: trpcClient } = trpc.useContext();
  const [syncQueue, setSyncQueue] = useState<ReminderAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const canSync = inputs.isOnline && inputs.isSignedIn;

  useEffect(() => {
    if (!canSync) {
      return;
    }

    if (isSyncing) {
      return;
    }

    if (syncQueue.length === 0) {
      return;
    }

    setIsSyncing(true);

    const action = syncQueue[0];

    trpcClient.mutation(`reminder.${action.type}`, action.payload).then(() => {
      setSyncQueue((prevSyncQueue) => prevSyncQueue.slice(1));
      setIsSyncing(false);
    });
  }, [canSync, syncQueue, isSyncing, trpcClient]);

  return (newAction: ReminderAction) => {
    setSyncQueue((prevSyncQueue) => [...prevSyncQueue, newAction]);
  };
};
