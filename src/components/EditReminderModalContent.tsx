import { Reminder } from "@/hooks/useCachedReminders";
import { useElementSize } from "@/hooks/useElementSize";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "./Checkbox";
import { TimeUnitPicker } from "./TimeUnitPicker";

export const EditReminderModalContent: React.FC<{
  reminder: Reminder;
  onChange: (change: Partial<Reminder>) => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ reminder, onChange, onConfirm, onCancel }) => {
  const [hours, setHours] = useState(reminder.timestamp.getHours());
  const [minutes, setMinutes] = useState(reminder.timestamp.getMinutes());

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
      <div
        className="transition-[height] duration-200 overflow-hidden"
        style={{
          height: `${isExpanded ? expandedMenuSize.height : 0}px`,
        }}
      >
        <div ref={expandedMenuRef}>
          <div className="h-8" />
          <label className="flex cursor-pointer">
            <Checkbox
              onChange={(checked) => {
                onChange({
                  enabled: checked,
                });
              }}
              checked={reminder.enabled}
            />
            <div className="ml-2">Enabled</div>
          </label>
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
