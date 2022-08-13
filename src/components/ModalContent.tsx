import cuid from "cuid";
import * as React from "react";
import { useRef } from "react";
import { Reminder } from './index';
import { TimeUnitPicker } from "./TimeUnitPicker";

export const ModalContent: React.FC<{
  onConfirm: (newReminder: Reminder) => void;
  onCancel: () => void;
}> = (props) => {
  const hours = useRef(0);
  const minutes = useRef(0);

  const createReminder = () => {
    const timestamp = new Date();

    timestamp.setHours(hours.current);
    timestamp.setMinutes(minutes.current);
    timestamp.setSeconds(0);

    props.onConfirm({
      enabled: true,
      id: cuid(),
      timestamp,
    });
  };

  return (
    <>
      <div className="relative flex w-full items-stretch">
        <TimeUnitPicker unitsCount={24} currentUnitRef={hours} />
        <div className="absolute h-full w-px bg-gray-400 inset-0 m-auto"></div>
        <TimeUnitPicker unitsCount={60} currentUnitRef={minutes} />
      </div>
      <div className="h-8"></div>
      <div className="flex w-full gap-8">
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={createReminder}
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
