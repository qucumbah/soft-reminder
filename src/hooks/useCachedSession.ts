import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";

export const useCachedSession = (isOnline: boolean) => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionStatus, setSessionStatus] = useState<
    "uninitialized" | "from-cache" | "from-network"
  >("uninitialized");

  useEffect(() => {
    if (sessionStatus === "uninitialized") {
      setSession(getCachedSession());
      setSessionStatus("from-cache");
    }

    if (!isOnline || sessionStatus === "from-network") {
      return;
    }

    let ignore = false;

    getSession().then((onlineSession) => {
      if (ignore) {
        return;
      }
      setSession(onlineSession);
      saveSessionToCache(onlineSession);
      setSessionStatus("from-network");
    });

    return () => {
      ignore = true;
    };
  }, [isOnline, sessionStatus]);

  return session;
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
