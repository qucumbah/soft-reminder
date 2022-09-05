import { useState, useEffect } from "react";
import cuid from "cuid";
import { trpc } from "@/utils/trpc";
import superjson from "superjson";

export const useCachedReminders = (inputs: {
  isOnline: boolean;
  isSignedIn: boolean;
}) => {
  const { isOnline, isSignedIn } = inputs;
  const { client: trpcClient } = trpc.useContext();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  /**
   * Changes a reminder by replacing it with a new one.
   * Replacement's id has to be the same as of the one being replaced.
   * @param changedReminder reminder to be put in place of the old one.
   */
  const changeReminder = (changedReminder: Reminder) => {
    trpcClient.mutation("reminder.change", changedReminder);
    setReminders((reminders) => {
      return reminders.map((reminder) => {
        return reminder.id === changedReminder.id ? changedReminder : reminder;
      });
    });
  };

  const addReminder = () => {
    const timestamp = new Date();

    timestamp.setHours(0);
    timestamp.setMinutes(0);
    timestamp.setSeconds(0);

    const newReminder = {
      enabled: true,
      id: cuid(),
      timestamp,
    };

    trpcClient.mutation("reminder.add", newReminder);
    setReminders((reminders) => [...reminders, newReminder]);

    return newReminder;
  };

  const deleteReminder = (reminderToDelete: Reminder) => {
    trpcClient.mutation("reminder.delete", reminderToDelete);
    setReminders((reminders) =>
      reminders.filter((reminder) => reminder.id !== reminderToDelete.id)
    );
  };

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
      setReminders(getCachedReminders());
      setRemindersStatus("from-cache");
    }

    if (!isOnline || remindersStatus === "from-network") {
      return;
    }

    let ignore = false;

    trpcClient.query("reminder.list").then((onlineReminders) => {
      if (ignore) {
        return;
      }
      setReminders(onlineReminders);
      saveRemindersToCache(onlineReminders);
      setRemindersStatus("from-network");
    });

    return () => {
      ignore = true;
    };
  }, [isOnline, remindersStatus]);

  return {
    reminders,
    addReminder,
    changeReminder,
    deleteReminder,
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
