import { ApiInstance } from "@joy-one-client/apis";
import { StorageKey } from "@joy-one-client/config/storage";
import { readLocalStorageValue } from "@mantine/hooks";
import { getAccessToken, retrieveAccessToken } from "../auth/auth-service";
import { getGlobal } from "@/global";
import { io } from "socket.io-client";
import config from "@joy-one-client/config";

export const api = new ApiInstance({
  getToken: async () => getAccessToken(),
  retrieveToken: async () => retrieveAccessToken(),
  getWorkspaceId: () => readLocalStorageValue({ key: StorageKey.WORKSPACE_ID }),
  getDeviceId: () => readLocalStorageValue({ key: StorageKey.DEVICE_ID }),
  getSessionId: () => getGlobal()._sessionId,
});

export const socket = io(config.API_CLIENT_SIDE_URL.replace("http", "ws"));