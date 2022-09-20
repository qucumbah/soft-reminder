import type { Reminder } from "@/hooks/useCachedReminders";

const timerIds: number[] = [];

const handleRemindersChange = (event: WorkerStateChangeMessage) => {
  timerIds.forEach((timerId) => clearTimeout(timerId));
  timerIds.length = 0;

  if (!event.notificationsAllowed) {
    return;
  }

  for (const reminder of event.reminders) {
    if (!reminder.enabled) {
      continue;
    }

    timerIds.push(scheduleNotification(reminder));
  }
};

const scheduleNotification = (reminder: Reminder) => {
  return self.setTimeout(() => {
    showNotification(reminder);
  }, reminder.timestamp.getTime() - Date.now());
};

const showNotification = (reminder: Reminder) => {
  new Notification(`Reminder: ${reminder.timestamp.toLocaleTimeString()}`);
  const message: NotificationShownMessage = {
    reminder: reminder,
  };
  self.postMessage(message);
};

self.addEventListener(
  "message",
  (event: MessageEvent<WorkerStateChangeMessage>) => {
    handleRemindersChange(event.data);
  }
);

export interface WorkerStateChangeMessage {
  reminders: Reminder[];
  notificationsAllowed: boolean;
}

export interface NotificationShownMessage {
  reminder: Reminder;
}
