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

  /**
   * Replaces a reminder from the reminders list by a new one.
   * Replacement's id has to be the same as of the one being replaced.
   * @param newReminder reminder to be put in place of the old one.
   */
  const replaceReminder = (newReminder: Reminder) => {
    setReminders((reminders) => {
      return reminders.map((reminder) => {
        return reminder.id === newReminder.id ? newReminder : reminder;
      });
    });
  };

  const addReminder = () => {
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

    return newReminder;
  };

  const deleteReminder = (reminderToDelete: Reminder) => {
    setReminders((reminders) =>
      reminders.filter((reminder) => reminder.id !== reminderToDelete.id)
    );
  };

  const {
    currentlyEditedReminder,
    startEditingReminder,
    changeCurrentlyEditedReminder,
    confirmEdit,
    cancelEdit,
  } = useCurrentlyEditedReminder({ deleteReminder, replaceReminder });

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
              // When we're currently editing this reminder, show the preview instead of the actual reminder.
              reminder={
                reminder.id === currentlyEditedReminder?.id
                  ? currentlyEditedReminder
                  : reminder
              }
              openReminderEditDialogue={() =>
                startEditingReminder({ reminder })
              }
              changeReminder={replaceReminder}
              key={reminder.id}
            />
          ))}
        </div>
        <div className="fixed bottom-0 h-24 w-screen bg-gradient-to-t from-white via-[#fffe]">
          <button
            onClick={() => {
              const newReminder = addReminder();
              startEditingReminder({ reminder: newReminder, isNew: true });
            }}
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
        onClose={() => {
          /**
           * When the user confirms or cancels the edit from within modal content, the close event fires,
           * but the confirmation or cancellation have already been handled.
           * We only need to cancel editing from here if the closing hasn't already been handled.
           */
          if (!currentlyEditedReminder) {
            return;
          }
          cancelEdit();
        }}
      >
        {currentlyEditedReminder && (
          <EditReminderModalContent
            reminder={currentlyEditedReminder}
            onChange={changeCurrentlyEditedReminder}
            onConfirm={confirmEdit}
            onCancel={cancelEdit}
          />
        )}
      </Modal>
    </>
  );
};

/**
 * We want to show the preview of the currently edited reminder in the reminders list.
 * To do this, we create a copy of the edited reminder.
 * When the user commits the change, the original reminder is replaced with this copy.
 * @param mutators replate and delete functions for edit confirmation and cancellation.
 */
const useCurrentlyEditedReminder = (mutators: {
  replaceReminder: (newReminder: Reminder) => void;
  deleteReminder: (reminderToDelete: Reminder) => void;
}) => {
  /**
   * Adding a new reminder is basically creating a default reminder and immediately putting it up for edit.
   * The way we handle editing of new and existing reminder is similar, but cancellation is different.
   * The new reminder should be deleted on cancel.
   */
  const [isCurrentlyEditedReminderNew, setIsCurrentlyEditedReminderNew] =
    useState(false);
  /**
   * This is a clone of the reminder to edit.
   */
  const [currentlyEditedReminder, setCurrentlyEditedReminder] =
    useState<Reminder | null>(null);

  const startEditingReminder = (options: {
    reminder: Reminder;
    isNew?: boolean;
  }) => {
    setCurrentlyEditedReminder({ ...options.reminder });
    setIsCurrentlyEditedReminderNew(options.isNew ?? false);
  };

  const changeCurrentlyEditedReminder = (newReminder: Reminder) => {
    setCurrentlyEditedReminder(newReminder);
  };

  const confirmEdit = () => {
    mutators.replaceReminder(currentlyEditedReminder!);

    setCurrentlyEditedReminder(null);
  };

  const cancelEdit = () => {
    if (isCurrentlyEditedReminderNew) {
      mutators.deleteReminder(currentlyEditedReminder!);
    }

    setCurrentlyEditedReminder(null);
  };

  return {
    currentlyEditedReminder,
    startEditingReminder,
    changeCurrentlyEditedReminder,
    confirmEdit,
    cancelEdit,
  };
};

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export default Home;
