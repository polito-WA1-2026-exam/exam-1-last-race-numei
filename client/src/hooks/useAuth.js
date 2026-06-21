import { createContext, useContext } from "react";

export const AuthContext = createContext({
  user: undefined,
  checkingSession: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
