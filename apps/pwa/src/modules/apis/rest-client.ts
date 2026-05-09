import { ApiInstance } from "@joy-one/apis";
import environment from "@joy-one/config";
import { io } from "socket.io-client";
import { getClientLocale } from "../lang/lang-service";

export const restClient = new ApiInstance({
  getLocale: () => getClientLocale(),
});

export const socket = io(environment.API_CLIENT_SIDE_URL.replace("http", "ws"));
