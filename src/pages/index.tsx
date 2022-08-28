import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import { useState, useEffect, useLayoutEffect } from "react";
import { Modal } from "@/components/Modal";
import { EditReminderModalContent } from "@/components/EditReminderModalContent";
import { ReminderComponent } from "@/components/ReminderComponent";
import { useSession } from "next-auth/react";
import SyncIndicator from "@/components/SyncIndicator";
import useOnline from "@/hooks/useOnline";
import cuid from "cuid";
import { LoginModalContent } from "@/components/LoginModalContent";
import { Session } from "next-auth";

const Home: NextPage = () => {
  const tr = trpc.useQuery(["getReminders"], {});
  const { data: session } = useSession();

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

  /**
   * For better visual effect, we want to keep the reminder editing UI while the modal is closing.
   * To do that, we need to store a copy of the last edited reminder.
   * When the edit has already been cancelled, but the modal is still closing, use this copy.
   */
  const [fadingAwayReminder, setFadingAwayReminder] = useState(
    currentlyEditedReminder
  );
  useLayoutEffect(() => {
    if (currentlyEditedReminder === null) {
      return;
    }

    setFadingAwayReminder(currentlyEditedReminder);
  }, [currentlyEditedReminder]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-full min-w-full">
        <header className="fixed w-full bg-white h-14 px-6 flex justify-center items-center">
          <button className="relative w-10 aspect-square ml-auto border-2 rounded-lg border-sky-500" onClick={() => setIsLoginModalOpen(true)}>
            <SyncIndicator
              syncStatus={{
                isOnline: true,
                isSyncing: true,
                session: null,
              }}
            />
          </button>
        </header>
        <div className="px-6 pt-14 flex flex-col">
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
        onCancel={cancelEdit}
        onClosingAnimationEnd={() => setFadingAwayReminder(null)}
      >
        {currentlyEditedReminder ? (
          <EditReminderModalContent
            reminder={currentlyEditedReminder}
            onChange={changeCurrentlyEditedReminder}
            onConfirm={confirmEdit}
            onCancel={cancelEdit}
          />
        ) : (
          fadingAwayReminder && (
            // Visual enhancement: when the currently edited reminder is gone but the modal is still
            // fading away, use last edited reminder's copy.
            <EditReminderModalContent
              reminder={fadingAwayReminder}
              onChange={() => {}}
              onConfirm={() => {}}
              onCancel={() => {}}
            />
          )
        )}
      </Modal>
      <Modal
        isOpen={isLoginModalOpen}
        onCancel={() => setIsLoginModalOpen(false)}
      >
        <LoginModalContent
          syncStatus={{
            isOnline: true,
            isSyncing: false,
            session: null,
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
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

const useReminders = () => {};

export interface SyncStatus {
  isOnline: boolean;
  session: Session | null;
  isSyncing: boolean;
}

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export default Home;
