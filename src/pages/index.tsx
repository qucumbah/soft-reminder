import { trpc } from '@/utils/trpc';
import cuid from "cuid";
import type { NextPage } from "next";
import * as React from "react";
import { useState, useEffect, useRef } from "react";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["getReminders"]);
  console.log(data);

  const [reminders, setReminders] = useState<Reminder[]>([
  ]);

  const changeReminder = (newReminder: Reminder) => {
    setReminders((reminders) => {
      return reminders.map((reminder) => {
        return reminder.id === newReminder.id ? newReminder : reminder;
      });
    });
  };

  const addReminder = (newReminder: Reminder) => {
    setReminders((reminders) => [...reminders, newReminder]);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-full min-w-full">
        <header className="fixed w-full bg-white h-14 flex justify-center items-center">
          <span className="bold text-xl">Current reminders</span>
        </header>
        <div className="px-6 pt-14 flex flex-col">
          {reminders.map((reminder) => (
            <ReminderComponent
              reminder={reminder}
              changeReminder={changeReminder}
              key={reminder.id}
            />
          ))}
        </div>
        <div className="fixed bottom-0 h-24 w-screen bg-gradient-to-t from-white via-[#fffe]">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-14 aspect-square bg-white border border-slate-200 rounded-full absolute inset-0 m-auto"
          >
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto"></div>
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto rotate-90"></div>
            <div className="absolute w-[85%] aspect-square rounded-full inset-0 m-auto top-3 blur-sm bg-sky-500 opacity-75 -z-50"></div>
          </button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent
          onConfirm={(newReminder: Reminder) => {
            addReminder(newReminder);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = (props) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (props.isOpen && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
    if (!props.isOpen && dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [props.isOpen]);

  return (
    <div
      className={[
        "fixed w-screen h-full inset-0 bg-slate-900 duration-200 ease transition-opacity",
        props.isOpen
          ? "opacity-50 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <dialog
        ref={dialogRef}
        className={[
          "block p-0 max-w-[none] max-h-[none] bg-transparent",
          "absolute inset-0 m-auto",
          "translate-y-8 open:translate-y-0",
          "duration-200 ease transition-transform",
          "backdrop:bg-transparent", // Backdrop is troublesome to animate
        ].join(" ")}
        onClose={props.onClose}
        onCancel={props.onClose}
        onClick={props.onClose}
      >
        <div
          className="bg-transparent"
          onClick={(event) => event.stopPropagation()}
        >
          {props.children}
        </div>
      </dialog>
    </div>
  );
};

const ReminderComponent: React.FC<{
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
        onChange={(event) =>
          props.changeReminder({
            ...props.reminder,
            enabled: event.target.checked,
          })
        }
        checked={props.reminder.enabled}
        className="appearance-none w-6 aspect-square rounded border border-gray-400 checked:border-sky-500 checked:bg-sky-500 transition-colors duration-150 ease"
      />
    </button>
  );
};

const ModalContent: React.FC<{
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
    <div className="bg-white w-[calc(100vw_-_4rem)] p-8 rounded-xl inset-0 m-auto">
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
    </div>
  );
};

const TimeUnitPicker: React.FC<{
  unitsCount: number;
  currentUnitRef: React.MutableRefObject<number>;
}> = (props) => {
  const scrollLine = useRef<HTMLDivElement | null>(null);

  const isDragging = useRef(false); // Whether the touch is in contact
  const prevTouchY = useRef(0); // Previous touch position
  const touchOriginOffsetY = useRef(0); // Offset from the initial touch position of the line to the current touch
  const scrollY = useRef(0); // Line's current scroll offset (originating at the start of the line)
  const speedY = useRef(0); // Speed at which the line is moving

  const getCellSize = () => {
    return scrollLine.current!.clientHeight / props.unitsCount;
  };

  /**
   * Calculates the index of the closest cell to provided line offset.
   * Since there are three cells shown, the result is the center cell's index.
   * Return value may be outside of the boundaries of the cell count.
   * @param offset line offset to calculate the cell position from.
   */
  const getClosestCell = (offset: number) => {
    const centerPosition = offset + getCellSize();
    return Math.round(centerPosition / getCellSize());
  };

  /**
   * Calculates the offset at which the provided cell will be directly in the middle.
   * @param cellIndex cell to find the position of.
   */
  const getCellPosition = (cellIndex: number) => {
    // To scroll to the middle cell, current scroll has to be on the left cell.
    return (cellIndex - 1) * getCellSize();
  };

  /**
   * Calculates scroll line is going to end up on with provided movement parameters.
   * @param scrollY current line scroll
   * @param speedY current line speed
   * @param deceleration deceleration that is applied to speed
   */
  const getFinalPosition = (
    scrollY: number,
    speedY: number,
    deceleration: number
  ) => {
    const startSpeed = speedY;
    const stepsUntilStop = Math.ceil(startSpeed / deceleration);
    const finalSpeed = startSpeed - deceleration * stepsUntilStop;

    const distanceLeftToTravel =
      (stepsUntilStop * (startSpeed + finalSpeed)) / 2;
    const finalPosition = scrollY + distanceLeftToTravel;

    return finalPosition;
  };

  const animate = () => {
    if (isDragging.current) {
      if (Math.abs(touchOriginOffsetY.current) < 0.1) {
        speedY.current = 0;
      } else {
        speedY.current = -touchOriginOffsetY.current * 0.1;
        touchOriginOffsetY.current += speedY.current;
      }
    } else {
      // There are two speed change handlers: friction handler and push back handler.
      // If the line is too high or too low, the push back handler is used to push it back.
      // When the line is sure to reach the first in-bounds cell, pass control to the friction handler.
      // Friction handler applies constant deceleration on each step and makes a small correction
      // so that the line comes to the full stop directly at the middle of closest projected cell.

      const friction = 0.1;
      const deceleration = Math.sign(speedY.current) * friction;

      // Highest allowed scroll is when the first element is in the middle
      // To acheive this, scroll has to be at negative-first element
      const outOfBoundsHigh = scrollY.current < -getCellSize();

      // Lowest allowed scroll is when the last element is in the middle
      // To acheive this, scroll has to be at the element before the last one
      const outOfBoundsLow =
        scrollY.current > getCellSize() * (props.unitsCount - 2);

      if (outOfBoundsHigh || outOfBoundsLow) {
        // Push back handler.
        // Current expected speed is pointed towards inside of boundaries
        // Calculate expected speed on how far away from boundary the offset is.
        // Accelerate toward the expected speed when slowing down,
        // use the expected speed when speeding back to the first in-bounds cell.

        const firstInBoundsCell = getCellPosition(
          outOfBoundsHigh ? 0 : props.unitsCount - 1
        );
        const vectorToBoundary = firstInBoundsCell - scrollY.current;

        const expectedSpeed = vectorToBoundary * 0.05;
        const currentSpeed = speedY.current;

        // If current speed vector is directed away from boundary
        if (Math.sign(currentSpeed) != Math.sign(vectorToBoundary)) {
          // Slow down
          speedY.current += (expectedSpeed - currentSpeed) * 0.1;
        } else {
          speedY.current = expectedSpeed;
        }
      } else {
        // Friction handler with correction:
        // 1. Apply a constant deceleration at each step.
        // 2. Apply correction so that when the line comes to the full stop some cell is directly in the middle.

        // Stop animation if speed is close enough to zero
        if (Math.abs(speedY.current) < friction) {
          return;
        }

        speedY.current -= deceleration;

        if (Math.abs(speedY.current) > friction) {
          const startSpeed = speedY.current;
          const stepsUntilStop = Math.ceil(startSpeed / deceleration);
          const finalSpeed = startSpeed - deceleration * stepsUntilStop;

          const distanceLeftToTravel =
            (stepsUntilStop * (startSpeed + finalSpeed)) / 2;
          const finalPosition = scrollY.current + distanceLeftToTravel;

          const finalCell = getClosestCell(
            getFinalPosition(scrollY.current, speedY.current, deceleration)
          );
          const finalCellCenterPosition = getCellPosition(finalCell);

          const difference = finalCellCenterPosition - finalPosition;
          speedY.current += difference / stepsUntilStop;
        }
      }
    }

    if (speedY.current === 0 && !isDragging.current) {
      return;
    }

    scrollY.current += speedY.current;

    props.currentUnitRef.current = Math.min(
      Math.max(getClosestCell(scrollY.current), 0),
      props.unitsCount - 1
    );

    scrollLine.current!.style.transform = `translateY(${-scrollY.current}px)`;

    requestAnimationFrame(animate);
  };

  const startDrag: React.TouchEventHandler = (event) => {
    prevTouchY.current = event.changedTouches[0].clientY;
    touchOriginOffsetY.current = 0;
    isDragging.current = true;
    requestAnimationFrame(animate);
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging.current) {
        return;
      }

      touchOriginOffsetY.current +=
        event.changedTouches[0].clientY - prevTouchY.current;
      prevTouchY.current = event.changedTouches[0].clientY;
    };

    window.addEventListener("touchmove", handleTouchMove);
    return () => window.removeEventListener("touchmove", handleTouchMove);
  });

  return (
    <div className="relative w-full h-48 overflow-hidden">
      <div
        className="flex flex-col"
        onTouchStart={startDrag}
        onTouchEnd={stopDrag}
        onTouchCancel={stopDrag}
        ref={scrollLine}
      >
        {new Array(props.unitsCount).fill(null).map((_, index) => {
          return (
            <div
              key={index}
              className="relative w-full h-16 flex justify-center items-center text-5xl select-none"
            >
              {index}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const some = () => {
  return (
    <div className="relative h-full overflow-scroll w-20 flex flex-col items-center hide-scrollbar">
      {new Array(60).fill(null).map((_, index) => {
        return (
          <span key={index} className="text-5xl">
            {index}
          </span>
        );
      })}
    </div>
  );
};

interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export default Home;
