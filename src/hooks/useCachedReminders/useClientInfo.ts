import { useCallback } from "react";
import { Reminder, ReminderAction } from ".";
import { useClientLastSync } from "./useClientLastSync";
import { useClientReminders } from "./useClientReminders";

export const useClientInfo = () => {
  const {
    reminders: clientReminders,
    dispatch: clientRemindersDispatch,
    isLoading: isClientRemindersLoading,
  } = useClientReminders();

  const {
    lastSync: clientLastSync,
    setLastSync: setClientLastSync,
    isLoading: isClientLastSyncLoading,
  } = useClientLastSync();

  const dispatchClientReminderAction = useCallback((action: ReminderAction) => {
    clientRemindersDispatch(action);
  }, [clientRemindersDispatch]);

  const resetClientInfo = useCallback((reminders: Reminder[]) => {
    clientRemindersDispatch({
      type: "reset",
      payload: reminders,
    });
  }, [clientRemindersDispatch]);

  return {
    clientReminders,
    dispatchClientReminderAction,
    clientLastSync,
    setClientLastSync,
    resetClientInfo,
    isClientInfoLoading: isClientRemindersLoading && isClientLastSyncLoading,
  };
};
