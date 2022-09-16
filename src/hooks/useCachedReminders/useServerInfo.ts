import { trpc } from "@/utils/trpc";
import { useCallback, useEffect, useState } from "react";
import { Reminder, ReminderAction } from ".";

export const useServerInfo = ({ isConnected }: { isConnected: boolean }) => {
  const [isServerInfoLoading, setIsServerInfoLoading] = useState(true);
  const [serverReminders, setServerReminders] = useState<Reminder[]>([]);
  const [serverLastSync, setServerLastSync] = useState<Date>(new Date(-1));

  const { client: trpcClient } = trpc.useContext();

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    let ignore = false;

    trpcClient
      .query("reminder.list", { includeLastSyncTime: true })
      .then((result) => {
        if (ignore) {
          return;
        }

        const { reminders, lastSync } = result;

        if (lastSync === null) {
          throw new Error(
            "Internal error: invalid response from reminder.list"
          );
        }

        setServerReminders(reminders);
        setServerLastSync(lastSync);
        setIsServerInfoLoading(false);
      });
      // TODO: handle fetch issue

    return () => {
      ignore = true;
    };
  }, [isConnected, trpcClient]);

  const dispatchServerReminderAction = useCallback(
    (action: ReminderAction) => {
      return trpcClient.mutation(`reminder.${action.type}`, action.payload);
    },
    [trpcClient]
  );

  const resetServerInfo = useCallback(
    async (reminders: Reminder[]) => {
      setIsServerInfoLoading(true);
      const result = await trpcClient.mutation("reminder.reset", reminders);

      setIsServerInfoLoading(false);
      return result;
    },
    [trpcClient]
  );

  return {
    serverReminders,
    dispatchServerReminderAction,
    serverLastSync,
    setServerLastSync,
    resetServerInfo,
    isServerInfoLoading,
  };
};
