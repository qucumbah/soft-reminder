import type { SyncStatus } from "@/pages/index";
import GitHubSignInButton from "./GitHubSignInButton";
import SyncIndicator from "./SyncIndicator";

export const LoginModalContent: React.FC<{
  syncStatus: SyncStatus;
  onClose: () => void;
}> = (props) => {
  const getSyncStatusMessage = () => {
    if (!props.syncStatus.isOnline) {
      return "offline";
    }

    if (!props.syncStatus.session) {
      return "not logged in";
    }

    return props.syncStatus.isSyncing ? "in progress" : "synchronized";
  };

  const getSessionStatus = () => {
    if (!props.syncStatus.session) {
      return <GitHubSignInButton disabled={!props.syncStatus.isOnline} />;
    }

    return <div>Logged in as ${props.syncStatus.session.user?.name}</div>;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex w-full items-center">
        <div className="w-8 aspect-square">
          <SyncIndicator syncStatus={props.syncStatus} />
        </div>
        <div>Sync status: {getSyncStatusMessage()}</div>
      </div>
      <div className="h-8"></div>
      {getSessionStatus()}
      <div className="h-8"></div>
      <div className="flex w-full justify-center gap-8">
        <button
          className="rounded-md border border-sky-500 p-2"
          onClick={props.onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
