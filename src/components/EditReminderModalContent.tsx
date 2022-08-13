import * as React from "react";
import { useRef } from "react";
import { Reminder } from "@/pages/index";
import { TimeUnitPicker } from "./TimeUnitPicker";

export const EditReminderModalContent: React.FC<{
  reminder: Reminder;
  onConfirm: (newReminder: Reminder) => void;
  onCancel: () => void;
}> = (props) => {
  const hours = useRef(0);
  const minutes = useRef(0);

  const confirmChange = () => {
    const timestamp = new Date();

    timestamp.setHours(hours.current);
    timestamp.setMinutes(minutes.current);
    timestamp.setSeconds(0);

    props.onConfirm({
      ...props.reminder,
      timestamp,
    });
  };

  return (
    <>
      <div className="relative flex w-full items-stretch">
        <TimeUnitPicker
          unitsCount={24}
          initialUnit={props.reminder.timestamp.getHours()}
          currentUnitRef={hours}
        />
        <div className="absolute h-full w-px bg-gray-400 inset-0 m-auto"></div>
        <TimeUnitPicker
          unitsCount={60}
          initialUnit={props.reminder.timestamp.getMinutes()}
          currentUnitRef={minutes}
        />
      </div>
      <div className="h-8"></div>
      <div className="flex w-full gap-8">
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={confirmChange}
        >
          Confirm
        </button>
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={props.onCancel}
        >
          Cancel
        </button>
      </div>
    </>
  );
};
