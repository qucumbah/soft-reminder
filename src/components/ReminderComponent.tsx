import * as React from "react";
import { Reminder } from "@/pages/index";

export const ReminderComponent: React.FC<{
  reminder: Reminder;
  openReminderEditDialogue: () => void;
  changeReminder: (newReminder: Reminder) => void;
}> = (props) => {
  const padTime = (time: number) => time.toString().padStart(2, "0");
  return (
    <button
      key={props.reminder.id}
      onClick={props.openReminderEditDialogue}
      className="h-[5rem] flex justify-between items-center"
    >
      <span
        className={[
          "text-3xl transition-colors duration-150 ease",
          props.reminder.enabled ? "text-black" : "text-gray-400",
        ].join(" ")}
      >{`${padTime(props.reminder.timestamp.getHours())}:${padTime(props.reminder.timestamp.getMinutes())}`}</span>
      <label className="relative w-6 h-6">
        <input
          type="checkbox"
          onChange={(event) =>
            props.changeReminder({
              ...props.reminder,
              enabled: event.target.checked,
            })
          }
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
      </label>
    </button>
  );
};
