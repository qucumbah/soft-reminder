import { useState, useEffect, useReducer } from "react";
import { trpc } from "@/utils/trpc";
import superjson from "superjson";
import { useRemindersSyncQueue } from "./useRemindersSyncQueue";
import { SessionStatus } from "./useCachedSession";

export const useCachedReminders = (inputs: {
  isOnline: boolean;
  sessionStatus: SessionStatus;
}) => {
  const {
    isOnline,
    sessionStatus: {
      isReady: isSessionReady,
      isFinished: isSessionLoadingFinished,
      session,
    },
  } = inputs;
  const { client: trpcClient } = trpc.useContext();

  const { enqueueSyncAction, isSyncing } = useRemindersSyncQueue({
    canSync: isOnline && isSessionLoadingFinished && session !== null,
  });

  type ResetRemindersAction = {
    type: "reset";
    from: "cache" | "network";
    payload: Reminder[];
  };

  enum RemindersStatus {
    Uninitialized,
    FromCache,
    FromNetwork,
  }

  const [{ reminders, status }, dispatch] = useReducer(
    (
      prevRemindersInfo: {
        reminders: Reminder[];
        status: RemindersStatus;
      },
      action: ReminderAction | ResetRemindersAction
    ) => {
      if (action.type === "reset") {
        return {
          status:
            action.from === "cache"
              ? RemindersStatus.FromCache
              : RemindersStatus.FromNetwork,
          reminders: action.payload,
        };
      }

      enqueueSyncAction(action);

      const { payload: actionReminder } = action;

      switch (action.type) {
        case "add":
          return {
            ...prevRemindersInfo,
            reminders: [...prevRemindersInfo.reminders, actionReminder],
          };
        case "change":
          return {
            ...prevRemindersInfo,
            reminders: prevRemindersInfo.reminders.map((reminder) => {
              return reminder.id === actionReminder.id
                ? actionReminder
                : reminder;
            }),
          };
        case "delete":
          return {
            ...prevRemindersInfo,
            reminders: prevRemindersInfo.reminders.filter(
              (reminder) => reminder.id !== actionReminder.id
            ),
          };
      }
    },
    {
      reminders: [],
      status: RemindersStatus.FromCache,
    }
  );

  /**
   * Cache read/write
   */
  useEffect(() => {
    if (status === RemindersStatus.Uninitialized) {
      return dispatch({
        type: "reset",
        from: "cache",
        payload: getCachedReminders(),
      });
    }

    const saveReminders = () => saveRemindersToCache(reminders);
    window.addEventListener("beforeunload", saveReminders);
    return () => window.removeEventListener("beforeunload", saveReminders);
  }, [status, reminders]);

  /**
   * Network fetch
   */
  useEffect(() => {
    if (
      !isOnline ||
      !isSessionLoadingFinished ||
      status !== RemindersStatus.FromCache
    ) {
      return;
    }

    let ignore = false;

    trpcClient.query("reminder.list").then((onlineReminders) => {
      if (ignore) {
        return;
      }
      dispatch({
        type: "reset",
        from: "network",
        payload: onlineReminders,
      });
    });

    return () => {
      ignore = true;
    };
  }, [isOnline, isSessionLoadingFinished, status]);

  return {
    reminders,
    dispatch,
    isSyncing,
  };
};

const getCachedReminders = () => {
  const cachedRemindersString = localStorage.getItem("remindersInfo");

  if (cachedRemindersString === null) {
    return [];
  }

  return superjson.parse<Reminder[]>(cachedRemindersString);
};

const saveRemindersToCache = (reminders: Reminder[]) => {
  localStorage.setItem("remindersInfo", superjson.stringify(reminders));
};

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export type ReminderAction = {
  type: "add" | "change" | "delete";
  payload: Reminder;
};
