import { NotificationShownEvent, RemindersChangeEvent } from "@/utils/worker";
import { useEffect, useState } from "react";
import { Reminder, ReminderAction } from "./useCachedReminders";

export const useNotificationsWorker = ({
  reminders,
  dispatchReminderAction,
}: {
  reminders: Reminder[];
  dispatchReminderAction: (action: ReminderAction) => void;
}) => {
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    setWorker(new Worker(new URL("../utils/worker.ts", import.meta.url)));

    return () => {
      setWorker((oldWorker) => {
        oldWorker?.terminate();
        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (worker === null) {
      return;
    }

    worker.onmessage = (event: MessageEvent<NotificationShownEvent>) => {
      dispatchReminderAction({
        type: "change",
        payload: {
          ...event.data.reminder,
          enabled: false,
        },
      });
    };
  }, [worker, dispatchReminderAction]);

  useEffect(() => {
    if (worker === null) {
      return;
    }

    const message: RemindersChangeEvent = {
      reminders,
    };

    worker.postMessage(message);
  }, [reminders]);
};
