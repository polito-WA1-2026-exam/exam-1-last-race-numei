import { useEffect, useMemo, useState } from "react";
import { transformUserDTOtoVO } from "../page/adapters/userAdapter.js";
import { SessionApi } from "../api/sessionApi.js";

export function useAuthSession() {
  const [user, setUser] = useState(undefined);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let ignore = false;

    SessionApi.getCurrentUser()
      .then((currentUser) => {
        if (!ignore) setUser(transformUserDTOtoVO(currentUser));
      })
      .catch(() => {
        if (!ignore) setUser(undefined);
      })
      .finally(() => {
        if (!ignore) setCheckingSession(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return useMemo(
    () => ({
      user,
      checkingSession,
      login: async (credentials) => {
        const loggedUser = await SessionApi.login(credentials);
        const userVO = transformUserDTOtoVO(loggedUser);
        setUser(userVO);
        return userVO;
      },
      logout: async () => {
        await SessionApi.logout();
        setUser(undefined);
      },
    }),
    [checkingSession, user],
  );
}
