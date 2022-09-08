import { useEffect, useState } from "react";

const useOnline = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => setIsOnline(navigator.onLine), []);

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  });

  return {
    isOnline: isOnline === null ? false : isOnline,
    isLoading: isOnline === null,
  };
};

export default useOnline;
