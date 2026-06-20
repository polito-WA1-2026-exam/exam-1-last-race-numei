import { request } from "./utils/request.js";
export const SessionApi = {
  getCurrentUser: () => request("/sessions/current"),
  login: (credentials) =>
    request("/sessions", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    request("/sessions/current", {
      method: "DELETE",
    }),
};
