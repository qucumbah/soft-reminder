import Image from "next/image";

const SyncIndicator: React.FC<{
  isSyncing: boolean;
  isOnline: boolean;
}> = (props) => {
  const currentImage = props.isOnline
    ? props.isSyncing
      ? "syncing"
      : "in-sync"
    : "offline";
  return (
    <div className="w-16 aspect-square relative">
      <Image
        src="/sync.svg"
        layout="fill"
        className={[
          "animate-spin [animation-direction: reverse] transition-opacity",
          currentImage === "syncing" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_ok.svg"
        layout="fill"
        className={[
          "transition-opacity scale-75",
          currentImage === "in-sync" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/sync_warning.svg"
        layout="fill"
        className={[
          "transition-opacity",
          currentImage === "offline" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
};

export default SyncIndicator;
