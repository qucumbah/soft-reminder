import { useEffect, useState } from "react";

export const useNotificationsPermission = () => {
  const [permission, setPermission] = useState<PermissionState>("prompt");

  useEffect(() => {
    let currentPermissionStatus: PermissionStatus | undefined;

    navigator.permissions
      .query({
        name: "notifications",
      })
      .then((permissionStatus) => {
        currentPermissionStatus = permissionStatus;
        setPermission(permissionStatus.state);
        currentPermissionStatus.onchange = () =>
          setPermission(permissionStatus.state);
      });

    return () => {
      if (currentPermissionStatus === undefined) {
        return;
      }
      currentPermissionStatus.onchange = null;
    };
  }, []);

  return permission;
};
