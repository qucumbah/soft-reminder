import { useState, useEffect, useReducer } from "react";
import { trpc } from "@/utils/trpc";
import superjson from "superjson";
import { useRemindersSyncQueue } from "./useRemindersSyncQueue";

export const useCachedReminders = (inputs: {
  isOnline: boolean;
  isSignedIn: boolean;
}) => {
  const { isOnline, isSignedIn } = inputs;
  const { client: trpcClient } = trpc.useContext();

  const { enqueueSyncAction, isSyncing } = useRemindersSyncQueue(inputs);

  type ResetRemindersAction = {
    type: "reset";
    payload: Reminder[];
  };

  const [reminders, dispatch] = useReducer(
    (
      prevReminders: Reminder[],
      action: ReminderAction | ResetRemindersAction
    ) => {
      if (action.type === "reset") {
        return action.payload;
      }

      enqueueSyncAction(action);

      const { payload: actionReminder } = action;

      switch (action.type) {
        case "add":
          return [...prevReminders, actionReminder];
        case "change":
          return prevReminders.map((reminder) => {
            return reminder.id === actionReminder.id
              ? actionReminder
              : reminder;
          });
        case "delete":
          return prevReminders.filter(
            (reminder) => reminder.id !== actionReminder.id
          );
      }
    },
    []
  );

  const [remindersStatus, setRemindersStatus] = useState<
    "uninitialized" | "from-cache" | "from-network"
  >("uninitialized");

  useEffect(() => {
    const saveReminders = () => saveRemindersToCache(reminders);
    window.addEventListener("beforeunload", saveReminders);
    return () => window.removeEventListener("beforeunload", saveReminders);
  }, [reminders]);

  useEffect(() => {
    if (remindersStatus === "uninitialized") {
      dispatch({ type: "reset", payload: getCachedReminders() });
      setRemindersStatus("from-cache");
    }

    if (!isOnline || !isSignedIn || remindersStatus === "from-network") {
      return;
    }

    let ignore = false;

    trpcClient.query("reminder.list").then((onlineReminders) => {
      if (ignore) {
        return;
      }
      dispatch({ type: "reset", payload: onlineReminders });
      saveRemindersToCache(onlineReminders);
      setRemindersStatus("from-network");
    });

    return () => {
      ignore = true;
    };
  }, [isOnline, isSignedIn, remindersStatus, trpcClient]);

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

const saveRemindersToCache = (reminders: Reminder[] | null) => {
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
