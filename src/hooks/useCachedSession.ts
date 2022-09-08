import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

export const useCachedSession = (inputs: {
  isOnline: boolean;
  isLoadingOnlineStatus: boolean;
}) => {
  const { isOnline, isLoadingOnlineStatus } = inputs;

  const [session, setSession] = useState<Session | null>(null);
  const [sessionStatus, setSessionStatus] = useState<
    "uninitialized" | "from-cache" | "from-network"
  >("uninitialized");
  /**
   * Whether we're finished loading can't be inferred from session status.
   *
   * In case where the user is offline, we stop loading as soon as the cache
   * value is read.
   *
   * If the user is online, we return the value from cache first, but the
   * loading still continues since we're fetching the session value from the
   * network in the background.
   */
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isLoadingOnlineStatus) {
      return;
    }

    if (sessionStatus === "uninitialized") {
      setSession(getCachedSession());
      setSessionStatus("from-cache");

      if (!isOnline) {
        setIsFinished(true);
      }
    }

    if (!isOnline || sessionStatus === "from-network") {
      return;
    }

    setIsFinished(false);

    let ignore = false;

    getSession().then((onlineSession) => {
      if (ignore) {
        return;
      }
      setSession(onlineSession);
      saveSessionToCache(onlineSession);
      setSessionStatus("from-network");
      setIsFinished(true);
    });

    return () => {
      ignore = true;
    };
  }, [isOnline, isLoadingOnlineStatus, sessionStatus]);

  return {
    session,
    isReady: sessionStatus !== "uninitialized",
    isFinished,
  };
};

const getCachedSession = () => {
  const cachedSessionString = localStorage.getItem("sessionInfo");

  if (cachedSessionString === null) {
    return null;
  }

  return JSON.parse(cachedSessionString) as Session;
};

const saveSessionToCache = (session: Session | null) => {
  localStorage.setItem("sessionInfo", JSON.stringify(session));
};
