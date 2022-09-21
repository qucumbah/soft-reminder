import type { Reminder } from "@/hooks/useCachedReminders";
import * as React from "react";
import { Checkbox } from "./Checkbox";

export const ReminderComponent: React.FC<{
  reminder: Reminder;
  openReminderEditDialogue: () => void;
  changeReminder: (newReminder: Reminder) => void;
}> = (props) => {
  const padTime = (time: number) => time.toString().padStart(2, "0");
  return (
    <div className="h-[5rem] flex justify-between items-center isolate">
      <button
        key={props.reminder.id}
        onClick={props.openReminderEditDialogue}
        className="h-full flex items-center grow"
      >
        <span
          className={[
            "text-3xl transition-colors duration-150 ease",
            props.reminder.enabled ? "text-black" : "text-gray-500",
          ].join(" ")}
        >{`${padTime(props.reminder.timestamp.getHours())}:${padTime(
          props.reminder.timestamp.getMinutes()
        )}`}</span>
      </button>
      <div className="relative w-8 h-6 pl-2 cursor-pointer">
        <Checkbox
          onChange={(checked) => {
            props.changeReminder({
              ...props.reminder,
              enabled: checked,
            });
          }}
          checked={props.reminder.enabled}
          ariaLabel={"Toggle reminder"}
        />
      </div>
    </div>
  );
};
