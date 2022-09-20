import { SyncConflictResolution } from "@/components/ResolveConflictModalContent";
import { makeDateFuture } from "@/utils/timeUtil";
import { useCallback, useEffect, useState } from "react";
import { SessionStatus } from "../useCachedSession";
import { useClientInfo } from "./useClientInfo";
import { useServerInfo } from "./useServerInfo";
import { useSyncQueue } from "./useSyncQueue";

export const useCachedReminders = ({
  isOnline,
  sessionStatus,
  onSyncConflict,
  onSyncConflictResolved,
}: {
  isOnline: boolean;
  sessionStatus: SessionStatus;
  onSyncConflict: () => Promise<SyncConflictResolution>;
  onSyncConflictResolved: () => void;
}) => {
  const {
    clientReminders,
    dispatchClientReminderAction,
    clientLastSync,
    setClientLastSync,
    resetClientInfo,
    isClientInfoLoading,
  } = useClientInfo();

  const isConnected =
    isOnline && sessionStatus.isFinished && sessionStatus.session !== null;

  const {
    serverReminders,
    dispatchServerReminderAction,
    serverLastSync,
    setServerLastSync,
    resetServerInfo,
    isServerInfoLoading,
  } = useServerInfo({
    isConnected,
  });

  const [isResolvingSyncConflict, setIsResolvingSyncConflict] = useState(false);

  const handleSyncConflict = useCallback(async () => {
    setIsResolvingSyncConflict(true);

    const resolution = await onSyncConflict();

    if (resolution === "server") {
      resetClientInfo(serverReminders);
      setClientLastSync(serverLastSync);
    } else {
      const { lastSync } = await resetServerInfo(clientReminders);
      setServerLastSync(lastSync);
      setClientLastSync(lastSync);
    }

    setIsResolvingSyncConflict(false);
    onSyncConflictResolved();
  }, [
    clientReminders,
    onSyncConflict,
    resetClientInfo,
    resetServerInfo,
    serverLastSync,
    serverReminders,
    setClientLastSync,
    setServerLastSync,
    onSyncConflictResolved,
  ]);

  const { syncQueue, enqueueSyncAction, isSyncQueueLoading, isSyncing } =
    useSyncQueue({
      disable: !isConnected || isResolvingSyncConflict,
      dispatchServerReminderAction,
      onSyncConflict: handleSyncConflict,
      onSync: (syncTime: Date) => {
        setServerLastSync(syncTime);
        setClientLastSync(syncTime);
      },
    });

  const canSync =
    !isClientInfoLoading &&
    !isServerInfoLoading &&
    !isSyncQueueLoading &&
    isOnline &&
    sessionStatus.isFinished &&
    sessionStatus.session !== null;

  useEffect(() => {
    if (!canSync) {
      return;
    }

    if (isResolvingSyncConflict) {
      return;
    }

    // In-sync
    // We may have some queued actions, but we'll handle them as soon as we exit this effect
    if (clientLastSync.getTime() === serverLastSync.getTime()) {
      return;
    }

    // This may never happen unless there is a DB rollback
    if (clientLastSync.getTime() > serverLastSync.getTime()) {
      // Allow the user to decide which data to keep
      handleSyncConflict();
      return;
    }

    // Local data is behind server
    // If there are no local actions saved, we can just reset to the fresh server data
    if (syncQueue.length === 0) {
      resetClientInfo(serverReminders);
      setClientLastSync(serverLastSync);
      return;
    }

    // Otherwise, we have a conflict
    // Let the user decide whether to keep the local or the server data
    handleSyncConflict();
  }, [
    canSync,
    isResolvingSyncConflict,
    clientLastSync,
    handleSyncConflict,
    resetClientInfo,
    serverLastSync,
    serverReminders,
    setClientLastSync,
    syncQueue.length,
  ]);

  const dispatchReminderAction = useCallback(
    (action: ReminderAction) => {
      if (isResolvingSyncConflict) {
        return;
      }

      action.payload.timestamp = makeDateFuture(action.payload.timestamp);

      dispatchClientReminderAction(action);
      enqueueSyncAction(action);
    },
    [isResolvingSyncConflict, dispatchClientReminderAction, enqueueSyncAction]
  );

  return {
    reminders: clientReminders,
    dispatchReminderAction,
    isLoading: isClientInfoLoading || isServerInfoLoading,
    isSyncing: isSyncing || isResolvingSyncConflict,
  };
};

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export interface ReminderAction {
  type: "add" | "change" | "delete";
  payload: Reminder;
}

export interface ResetRemindersAction {
  type: "reset";
  payload: Reminder[];
}
