import type { NextPage } from "next";
import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { EditReminderModalContent } from "@/components/EditReminderModalContent";
import { ReminderComponent } from "@/components/ReminderComponent";
import SyncIndicator from "@/components/SyncIndicator";
import useOnline from "@/hooks/useOnline";
import { LoginModalContent } from "@/components/LoginModalContent";
import { Session } from "next-auth";
import { useCachedSession } from "@/hooks/useCachedSession";
import { useCachedReminders } from "@/hooks/useCachedReminders";
import cuid from "cuid";
import { useCurrentlyEditedReminder } from "../hooks/useCurrentlyEditedReminder";

const Home: NextPage = () => {
  const isOnline = useOnline();
  const session = useCachedSession(isOnline);
  const { reminders, dispatch, isSyncing } = useCachedReminders({
    isOnline,
    isSignedIn: session !== null,
  });

  const createEmptyReminder = () => {
    const timestamp = new Date();

    timestamp.setHours(0);
    timestamp.setMinutes(0);
    timestamp.setSeconds(0);

    return {
      enabled: true,
      id: cuid(),
      timestamp,
    };
  };

  const {
    currentlyEditedReminder,
    startEditingReminder,
    changeCurrentlyEditedReminder,
    confirmEdit,
    cancelEdit,
  } = useCurrentlyEditedReminder(dispatch);

  /**
   * For better visual effect, we want to keep the reminder editing UI while the modal is closing.
   * To do that, we need to store a copy of the last edited reminder.
   * When the edit has already been cancelled, but the modal is still closing, use this copy.
   */
  const [fadingAwayReminder, setFadingAwayReminder] = useState(
    currentlyEditedReminder
  );
  useEffect(() => {
    if (currentlyEditedReminder === null) {
      return;
    }

    setFadingAwayReminder(currentlyEditedReminder);
  }, [currentlyEditedReminder]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-full min-w-full">
        <header className="gap-2 fixed w-full bg-white h-14 px-6 flex justify-center items-center z-10">
          <button
            className="relative w-10 aspect-square bg-white border border-slate-200 rounded-lg"
            onClick={() => setIsLoginModalOpen(true)}
          >
            <SyncIndicator
              syncStatus={{
                isOnline,
                isSyncing,
                session,
              }}
            />
            <div className="absolute w-[85%] aspect-square rounded-lg inset-0 m-auto top-2 left-1 blur-sm bg-sky-500 opacity-50 -z-50" />
          </button>
        </header>
        <div className="px-6 pt-14 pb-24 flex flex-col max-w-xl mx-auto">
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
              changeReminder={(newReminder) =>
                dispatch({
                  type: "change",
                  payload: newReminder,
                })
              }
              key={reminder.id}
            />
          ))}
        </div>
        <div className="fixed bottom-0 h-24 w-screen bg-gradient-to-t from-white via-[#fffe] pointer-events-none">
          <button
            onClick={() => {
              const newReminder = createEmptyReminder();
              dispatch({
                type: "add",
                payload: newReminder,
              });
              startEditingReminder({ reminder: newReminder, isNew: true });
            }}
            className="w-14 aspect-square bg-white border border-slate-200 rounded-full absolute inset-0 m-auto pointer-events-auto"
          >
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto" />
            <div className="absolute w-5 h-[2px] rounded bg-sky-500 inset-0 m-auto rotate-90" />
            <div className="absolute w-[85%] aspect-square rounded-full inset-0 m-auto top-3 blur-sm bg-sky-500 opacity-75 -z-50" />
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
            isOnline,
            isSyncing,
            session,
          }}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export interface SyncStatus {
  isOnline: boolean;
  session: Session | null;
  isSyncing: boolean;
}

export default Home;
