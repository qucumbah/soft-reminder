import { useState, useCallback, Dispatch } from "react";
import { Reminder, ReminderAction } from "@/hooks/useCachedReminders";

/**
 * We want to show the preview of the currently edited reminder in the reminders list.
 * To do this, we create a copy of the edited reminder.
 * When the user commits the change, the original reminder is replaced with this copy.
 * @param dispatch dispatch function of reminders state.
 */
export const useCurrentlyEditedReminder = (
  dispatch: Dispatch<ReminderAction>
) => {
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

  const changeCurrentlyEditedReminder = useCallback(
    (changes: Partial<Reminder>) => {
      setCurrentlyEditedReminder((oldReminder) => {
        if (oldReminder === null) {
          throw new Error();
        }

        return {
          ...oldReminder,
          ...changes,
        };
      });
    },
    []
  );

  const confirmEdit = () => {
    dispatch({
      type: "change",
      payload: currentlyEditedReminder!,
    });

    setCurrentlyEditedReminder(null);
  };

  const cancelEdit = () => {
    if (isCurrentlyEditedReminderNew) {
      dispatch({
        type: "delete",
        payload: currentlyEditedReminder!,
      });
    }

    setCurrentlyEditedReminder(null);
  };

  const deleteCurrentlyEditedReminder = () => {
    dispatch({
      type: "delete",
      payload: currentlyEditedReminder!,
    });

    setCurrentlyEditedReminder(null);
  };

  return {
    currentlyEditedReminder,
    startEditingReminder,
    changeCurrentlyEditedReminder,
    deleteCurrentlyEditedReminder,
    confirmEdit,
    cancelEdit,
  };
};
