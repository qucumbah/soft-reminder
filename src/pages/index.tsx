import { trpc } from "@/utils/trpc";
import type { NextPage } from "next";
import * as React from "react";
import { useState } from "react";
import { Modal } from "@/components/Modal";
import { ModalContent } from "@/components/ModalContent";
import { ReminderComponent } from "@/components/ReminderComponent";
import { useSession } from 'next-auth/react';

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["getReminders"]);
  const session = useSession();
  console.log(data, session);

  const [reminders, setReminders] = useState<Reminder[]>([]);

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

export interface Reminder {
  id: string;
  timestamp: Date;
  enabled: boolean;
}

export default Home;
