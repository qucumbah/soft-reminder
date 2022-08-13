import { useEffect, useState } from "react";

const useOnline = () => {
  const isSsg = typeof window === "undefined";
  const [isOnline, setIsOnline] = useState(isSsg ? true : navigator.onLine);

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

  return isOnline;
};

export default useOnline;
