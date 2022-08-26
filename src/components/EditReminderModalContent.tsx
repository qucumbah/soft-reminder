import { useEffect, useState } from "react";
import { Reminder } from "@/pages/index";
import { TimeUnitPicker } from "./TimeUnitPicker";

export const EditReminderModalContent: React.FC<{
  reminder: Reminder;
  onChange: (newReminder: Reminder) => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = (props) => {
  const [hours, setHours] = useState(props.reminder.timestamp.getHours());
  const [minutes, setMinutes] = useState(props.reminder.timestamp.getMinutes());

  console.log(props.reminder.timestamp, props.reminder.timestamp.getHours(), hours);

  const changeTime = (hours: number, minutes: number) => {
    console.log('changed');
    const timestamp = new Date();

    timestamp.setHours(hours);
    timestamp.setMinutes(minutes);
    timestamp.setSeconds(0);

    props.onChange({
      ...props.reminder,
      timestamp,
    });
  };

  useEffect(() => changeTime(hours, minutes), [hours, minutes]);

  return (
    <>
      <div className="relative flex w-full items-stretch">
        <TimeUnitPicker
          unitsCount={24}
          currentUnit={hours}
          setCurrentUnit={setHours}
        />
        <div className="absolute h-full w-px bg-gray-400 inset-0 m-auto"></div>
        <TimeUnitPicker
          unitsCount={60}
          currentUnit={minutes}
          setCurrentUnit={setMinutes}
        />
      </div>
      <div className="h-8"></div>
      <div className="flex w-full gap-8">
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={props.onConfirm}
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
