import { SessionStatus } from "@/hooks/useCachedSession";
import { Session } from "next-auth";
import Image from "next/image";

const SyncIndicator: React.FC<{
  syncStatus: SyncStatus;
}> = (props) => {
  const syncStatus = (() => {
    if (!props.syncStatus.sessionStatus.isFinished) {
      return "loadingSession";
    }

    if (!props.syncStatus.isOnline) {
      return "offline";
    }

    if (!props.syncStatus.sessionStatus.session) {
      return "notLoggedIn";
    }

    return props.syncStatus.isSyncing ? "syncInProgress" : "synchronized";
  })();

  return (
    <div className="relative w-full h-full">
      <Image
        src="/sync.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "animate-spin [animation-direction: reverse] transition-opacity",
          syncStatus === "loadingSession" || syncStatus === "syncInProgress"
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_ok.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "transition-opacity scale-75",
          syncStatus === "synchronized" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_warning.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "transition-opacity",
          syncStatus === "offline" || syncStatus === "notLoggedIn"
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
};

export default SyncIndicator;

export interface SyncStatus {
  sessionStatus: SessionStatus;
  isOnline: boolean;
  isSyncing: boolean;
}
