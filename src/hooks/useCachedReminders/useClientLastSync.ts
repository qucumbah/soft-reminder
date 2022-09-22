import { localStorageUtil } from "@/utils/localStorageUtil";
import { useEffect, useState } from "react";

export const useClientLastSync = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date(0));

  /**
   * Load client lastSync from localStorage initially
   */
  useEffect(() => {
    if (!isLoading) {
      return;
    }

    setLastSync(loadClientLastSync());
    setIsLoading(false);
  }, [isLoading]);

  /**
   * Save client last sync to localStorage on change
   */
  useEffect(() => {
    if (isLoading) {
      return;
    }

    saveClientLastSync(lastSync);
  }, [isLoading, lastSync]);

  return {
    lastSync,
    setLastSync,
    isLoading,
  };
};

const loadClientLastSync = () => {
  return localStorageUtil.read<Date>("lastSync") ?? new Date(0);
};

const saveClientLastSync = (lastSync: Date) => {
  localStorageUtil.write("lastSync", lastSync);
};
