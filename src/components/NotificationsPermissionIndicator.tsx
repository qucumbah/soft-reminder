import Image from "next/image";

const NotificationsPermissionIndicator: React.FC<{
  permission: PermissionState;
}> = ({ permission }) => {
  return (
    <div className="relative w-full h-full">
      <Image
        src="/notifications_paused.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "transition-opacity",
          permission === "prompt" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/notifications_on.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "transition-opacity",
          permission === "granted" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <Image
        src="/notifications_off.svg"
        layout="fill"
        priority
        alt=""
        className={[
          "transition-opacity",
          permission === "denied" ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
};

export default NotificationsPermissionIndicator;
