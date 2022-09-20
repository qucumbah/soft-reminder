import type { Reminder } from "@/hooks/useCachedReminders";

const timerIds: number[] = [];

const handleRemindersChange = (event: RemindersChangeEvent) => {
  timerIds.forEach((timerId) => clearTimeout(timerId));

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
  const message: NotificationShownEvent = {
    reminder: reminder,
  };
  self.postMessage(message);
};

self.addEventListener(
  "message",
  (event: MessageEvent<RemindersChangeEvent>) => {
    handleRemindersChange(event.data);
  }
);

export interface RemindersChangeEvent {
  reminders: Reminder[];
}

export interface NotificationShownEvent {
  reminder: Reminder;
}
