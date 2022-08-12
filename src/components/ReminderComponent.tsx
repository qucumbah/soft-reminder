import * as React from "react";
import { Reminder } from './index';

export const ReminderComponent: React.FC<{
  reminder: Reminder;
  changeReminder: (newReminder: Reminder) => void;
}> = (props) => {
  return (
    <button
      key={props.reminder.id}
      className="h-[5rem] flex justify-between items-center"
    >
      <span
        className={[
          "text-3xl transition-colors duration-150 ease",
          props.reminder.enabled ? "text-black" : "text-gray-400",
        ].join(" ")}
      >{`${props.reminder.timestamp.getHours()}:${props.reminder.timestamp.getMinutes()}`}</span>
      <input
        type="checkbox"
        onChange={(event) => props.changeReminder({
          ...props.reminder,
          enabled: event.target.checked,
        })}
        checked={props.reminder.enabled}
        className="appearance-none w-6 aspect-square rounded border border-gray-400 checked:border-sky-500 checked:bg-sky-500 transition-colors duration-150 ease" />
    </button>
  );
};
