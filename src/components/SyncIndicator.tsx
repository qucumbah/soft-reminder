import { SyncStatus } from "@/pages/index";
import Image from "next/image";

const SyncIndicator: React.FC<{
  syncStatus: SyncStatus;
}> = (props) => {
  const currentImage = (() => {
    if (!props.syncStatus.session) {
      return "not-logged-in";
    }

    if (!props.syncStatus.isOnline) {
      return "offline";
    }

    return props.syncStatus.isSyncing ? "syncing" : "in-sync";
  })();

  return (
    <div className="relative w-full h-full">
      <Image
        src="/sync.svg"
        layout="fill"
        priority
        className={[
          "animate-spin [animation-direction: reverse] transition-opacity",
          currentImage === "syncing" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_ok.svg"
        layout="fill"
        priority
        className={[
          "transition-opacity scale-75",
          currentImage === "in-sync" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_warning.svg"
        layout="fill"
        priority
        className={[
          "transition-opacity",
          currentImage === "offline" || currentImage === "not-logged-in"
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
};

export default SyncIndicator;
