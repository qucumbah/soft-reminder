import { useEffect, useReducer, useState } from "react";
import { Reminder, ReminderAction, ResetRemindersAction } from ".";
import { localStorageUtil } from "@/utils/localStorageUtil";

export const useClientReminders = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [reminders, dispatch] = useReducer(
    (
      prevReminders: Reminder[],
      action: ReminderAction | ResetRemindersAction
    ) => {
      if (action.type === "reset") {
        return [...action.payload];
      }

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

  /**
   * Load client reminders from localStorage initially
   */
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    dispatch({
      type: "reset",
      payload: loadClientReminders(),
    });
    setIsLoading(false);
  }, [isLoading]);

  /**
   * Save client reminders to localStorage on exit
   */
  useEffect(() => {
    const save = () => {
      saveClientReminders(reminders);
    };
    window.addEventListener("beforeunload", save);
    return () => window.removeEventListener("beforeunload", save);
  }, [reminders]);

  return {
    reminders,
    dispatch,
    isLoading,
  };
};

const loadClientReminders = () => {
  return localStorageUtil.read<Reminder[]>("reminders") ?? ([] as Reminder[]);
};

const saveClientReminders = (reminders: Reminder[]) => {
  localStorageUtil.write("reminders", reminders);
};
