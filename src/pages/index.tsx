import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import * as React from "react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { EditReminderModalContent } from "@/components/EditReminderModalContent";
import { ReminderComponent } from "@/components/ReminderComponent";
import { useSession } from "next-auth/react";
import SyncIndicator from "@/components/SyncIndicator";
import useOnline from "@/hooks/useOnline";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import cuid from "cuid";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["getReminders"]);
  const session = useSession();

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const isOnline = useOnline();

  const editReminder = (newReminder: Reminder) => {
    setReminders((reminders) => {
      return reminders.map((reminder) => {
        return reminder.id === newReminder.id ? newReminder : reminder;
      });
    });
    setCurrentlyEditedReminder(null);
  };

  const createReminder = () => {
    const timestamp = new Date();

    timestamp.setHours(0);
    timestamp.setMinutes(0);
    timestamp.setSeconds(0);

    const newReminder = {
      enabled: true,
      id: cuid(),
      timestamp,
    };

    setReminders((reminders) => [...reminders, newReminder]);
    setCurrentlyEditedReminder(newReminder);
  };

  const deleteReminder = (reminderToDelete: Reminder) => {
    setReminders((reminders) =>
      reminders.filter((reminder) => reminder.id !== reminderToDelete.id)
    );
    setCurrentlyEditedReminder(null);
  };

  const [currentlyEditedReminder, setCurrentlyEditedReminder] =
    useState<Reminder | null>(null);

  const [remindersContainer] = useAutoAnimate<HTMLDivElement>();

  return (
    <>
      <div className="min-h-full min-w-full">
        <header className="fixed w-full bg-white h-14 flex justify-center items-center">
          <span className="bold text-xl">Current reminders</span>
        </header>
        {/* <SyncIndicator isOnline={isOnline} isSyncing={reminders.length !== 0} /> */}
        <div className="px-6 pt-14 flex flex-col" ref={remindersContainer}>
          {reminders.map((reminder) => (
            <ReminderComponent
              reminder={reminder}
              openReminderEditDialogue={() => setCurrentlyEditedReminder(reminder)}
              changeReminder={editReminder}
              key={reminder.id}
            />
          ))}
        </div>
        <div className="fixed bottom-0 h-24 w-screen bg-gradient-to-t from-white via-[#fffe]">
          <button
            onClick={createReminder}
            className="w-14 aspect-square bg-white border border-slate-200 rounded-full absolute inset-0 m-auto"
          >
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto"></div>
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto rotate-90"></div>
            <div className="absolute w-[85%] aspect-square rounded-full inset-0 m-auto top-3 blur-sm bg-sky-500 opacity-75 -z-50"></div>
          </button>
        </div>
      </div>
      <Modal
        isOpen={currentlyEditedReminder !== null}
        onClose={() =>
          // Close event will be fired when both cancelling and confirming.
          // After we confirm (or if we cancel from inside modal content), currently edited reminder is set to null.
          // Thus, we need to check if we're currently editing anything.
          currentlyEditedReminder && deleteReminder(currentlyEditedReminder)
        }
      >
        {currentlyEditedReminder && (
          <EditReminderModalContent
            reminder={currentlyEditedReminder}
            onConfirm={editReminder}
            onCancel={() => deleteReminder(currentlyEditedReminder)}
          />
        )}
      </Modal>
    </>
  );
};

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export default Home;
