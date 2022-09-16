import { localStorageUtil } from "@/utils/localStorageUtil";
import { trpc } from "@/utils/trpc";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReminderAction } from ".";

export const useSyncQueue = ({
  disable,
  dispatchServerReminderAction,
  onSyncConflict,
  onSync,
}: {
  disable: boolean;
  dispatchServerReminderAction: (
    action: ReminderAction
  ) => Promise<{ lastSync: Date }>;
  onSyncConflict: () => Promise<void>;
  onSync: (syncTime: Date) => void;
}) => {
  const [isSyncQueueLoading, setIsSyncQueueLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState<ReminderAction[]>([]);

  /**
   * Load client sync queue from localStorage initially
   */
  useEffect(() => {
    setSyncQueue((prevSyncQueue) => [
      ...loadClientSyncQueue(),
      ...prevSyncQueue,
    ]);
    setIsSyncQueueLoading(false);
  }, []);

  /**
   * Save client sync queue to localStorage on exit
   */
  useEffect(() => {
    const save = () => {
      saveClientSyncQueue(syncQueue);
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
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

  /**
   * If there are any actions in the queue and we can sync, handle them sequentially
   */
  useEffect(() => {
    if (disable) {
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

    dispatchServerReminderAction(action)
      .then(({ lastSync }) => {
        onSync(lastSync);
        setSyncQueue((prevSyncQueue) => prevSyncQueue.slice(1));
      })
      .catch((error) => {
        console.error("Action failed:", action);
        console.error(error);
        onSyncConflict();
      })
      .finally(() => {
        isSyncingRef.current = false;
        setIsSyncingIndicator(false);
      });
  }, [
    disable,
    dispatchServerReminderAction,
    onSync,
    onSyncConflict,
    syncQueue,
  ]);

  const enqueueSyncAction = useCallback((newAction: ReminderAction) => {
    setSyncQueue((prevSyncQueue) => [...prevSyncQueue, newAction]);
  }, []);

  return {
    syncQueue,
    enqueueSyncAction,
    isSyncQueueLoading,
    isSyncing: isSyncingIndicator,
  };
};

const loadClientSyncQueue = () => {
  return (
    localStorageUtil.read<ReminderAction[]>("syncQueue") ??
    ([] as ReminderAction[])
  );
};

const saveClientSyncQueue = (syncQueue: ReminderAction[]) => {
  localStorageUtil.write("syncQueue", syncQueue);
};
