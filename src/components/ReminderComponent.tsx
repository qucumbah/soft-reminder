import type { Reminder } from "@/hooks/useCachedReminders";
import * as React from "react";

export const ReminderComponent: React.FC<{
  reminder: Reminder;
  openReminderEditDialogue: () => void;
  changeReminder: (newReminder: Reminder) => void;
}> = (props) => {
  const padTime = (time: number) => time.toString().padStart(2, "0");
  return (
    <div className="h-[5rem] flex justify-between items-center">
      <button
        key={props.reminder.id}
        onClick={props.openReminderEditDialogue}
        className="h-full flex items-center grow"
      >
        <span
          className={[
            "text-3xl transition-colors duration-150 ease",
            props.reminder.enabled ? "text-black" : "text-gray-400",
          ].join(" ")}
        >{`${padTime(props.reminder.timestamp.getHours())}:${padTime(
          props.reminder.timestamp.getMinutes()
        )}`}</span>
      </button>
      <label className="relative w-8 h-6 pl-2">
        <div className="relative w-6 h-6 ml-auto">
          <input
            type="checkbox"
            onChange={(event) => {
              props.changeReminder({
                ...props.reminder,
                enabled: event.target.checked,
              });
              event.stopPropagation();
            }}
            checked={props.reminder.enabled}
            className={[
              "relative appearance-none w-full h-full rounded bg-white border-2 peer",
              "transition after:transition",
              "after:block after:absolute after:inset-0.5 after:rounded",
              "border-gray-400 after:bg-white",
              "checked:border-sky-500 checked:after:bg-sky-500",
            ].join(" ")}
          />
          <div className="absolute w-[85%] aspect-square rounded inset-0 m-auto top-2 blur-sm bg-sky-500 -z-50 transition-opacity opacity-0 peer-checked:opacity-75"></div>
        </div>
      </label>
    </div>
  );
};
