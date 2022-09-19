import { Reminder } from "@/hooks/useCachedReminders";
import { useElementSize } from "@/hooks/useElementSize";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "./Checkbox";
import { TimeUnitPicker } from "./TimeUnitPicker";

export const EditReminderModalContent: React.FC<{
  reminder: Reminder;
  onChange: (change: Partial<Reminder>) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}> = ({ reminder, onChange, onConfirm, onCancel, onDelete }) => {
  const [initialHours] = useState(reminder.timestamp.getHours());
  const [initialMinutes] = useState(reminder.timestamp.getMinutes());

  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);

  useEffect(() => {
    const timestamp = new Date();

    timestamp.setHours(hours);
    timestamp.setMinutes(minutes);
    timestamp.setSeconds(0);

    onChange({
      timestamp,
    });
  }, [hours, minutes, onChange]);

  const [isExpanded, setIsExpanded] = useState(false);
  const { ref: expandedMenuRef, size: expandedMenuSize } =
    useElementSize<HTMLDivElement>();

  const hourPicker = useMemo(
    () => (
      <TimeUnitPicker
        unitsCount={24}
        initialUnit={initialHours}
        setCurrentUnit={setHours}
      />
    ),
    [initialHours]
  );
  const minutePicker = useMemo(
    () => (
      <TimeUnitPicker
        unitsCount={60}
        initialUnit={initialMinutes}
        setCurrentUnit={setMinutes}
      />
    ),
    [initialMinutes]
  );

  return (
    <>
      <div className="relative flex w-full items-stretch">
        {hourPicker}
        <div className="absolute h-full w-px bg-gray-400 inset-0 m-auto" />
        {minutePicker}
      </div>
      <div
        className="transition-[height] duration-200 overflow-hidden"
        style={{
          height: `${isExpanded ? expandedMenuSize.height : 0}px`,
        }}
      >
        <div ref={expandedMenuRef} className="flex flex-col gap-4 pt-8">
          <label className="flex items-center cursor-pointer">
            <div className="w-8 h-8 relative flex justify-center items-center">
              <Checkbox
                onChange={(checked) => {
                  onChange({
                    enabled: checked,
                  });
                }}
                checked={reminder.enabled}
              />
            </div>
            <span className="ml-2">Enable</span>
          </label>
          <button
            className="flex items-center cursor-pointer"
            onClick={onDelete}
          >
            <div className="h-8 w-8 relative">
              <Image priority src="/delete.svg" layout="fill" />
            </div>
            <span className="ml-2">Delete</span>
          </button>
        </div>
      </div>
      <div className="h-8" />
      <button
        className="w-full h-8 relative flex justify-center items-center"
        onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}
      >
        <div
          className={[
            "h-full w-12 relative opacity-50",
            "transition-transform duration-200",
            isExpanded ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          <Image priority src="/expand.svg" layout="fill" />
        </div>
      </button>
      <div className="h-8" />
      <div className="flex w-full gap-8">
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </>
  );
};
