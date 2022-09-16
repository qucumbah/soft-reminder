const ResolveConflictModalContent: React.FC<{
  resolve: SyncConflictResolver;
}> = (props) => {
  return (
    <>
      <div className="relative flex w-full items-stretch">
        There is a synchronization conflict. Should we use the data from the
        server or from the client?
      </div>
      <div className="h-8"></div>
      <div className="flex w-full gap-8">
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={() => props.resolve("server")}
        >
          Server
        </button>
        <button
          className="w-full rounded-md border border-sky-500 p-2"
          onClick={() => props.resolve("local")}
        >
          Client
        </button>
      </div>
    </>
  );
};

export type SyncConflictResolution = "local" | "server";
export type SyncConflictResolver = (resolution: SyncConflictResolution) => void;
export default ResolveConflictModalContent;
