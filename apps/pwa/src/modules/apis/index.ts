import { getGlobal } from "@/global";
import { getLocalStorage } from "@/hooks/use-local-storage";
import { StorageKey } from "@/types";
import { ApiInstance } from "@joy-one-client/apis";
import environment from "@joy-one-client/config";
import { io } from "socket.io-client";
import { getAccessToken, retrieveAccessToken } from "../auth/auth-service";
import { getClientLocale } from "../lang/lang-service";

export const api = new ApiInstance({
  getToken: async () => getAccessToken(),
  retrieveToken: async () => retrieveAccessToken(),
  getWorkspaceId: () => getLocalStorage(StorageKey.WORKSPACE_ID),
  getDeviceId: () => getLocalStorage(StorageKey.DEVICE_ID),
  getSessionId: () => getGlobal()._sessionId,
  getLocale: () => getClientLocale()
});

export const apiFiles = new ApiInstance({
  baseURL: environment.API_FILES_URL,
  getToken: async () => getAccessToken(),
  retrieveToken: async () => retrieveAccessToken(),
  getWorkspaceId: () => getLocalStorage(StorageKey.WORKSPACE_ID),
  getDeviceId: () => getLocalStorage(StorageKey.DEVICE_ID),
  getSessionId: () => getGlobal()._sessionId,
  getLocale: () => getClientLocale()
})

export const socket = io(environment.API_CLIENT_SIDE_URL.replace("http", "ws"));