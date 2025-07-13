"use client";

import config from "@joy-one-client/config";
import { type DependencyList, useEffect } from "react";

export const appChannel = new BroadcastChannel(config.APP_URL + config.ENV);

export const postAppChannelMessage = (type: string, data?: Record<string, any>) => {
  appChannel.postMessage({
    type,
    data,
  });
};

export const onAppChannelMessage = (
  type: string,
  callback: (event: MessageEvent) => void,
  deps?: DependencyList
) => {
  useEffect(() => {
    const action = (event: MessageEvent) => {
      if (typeof event.data === "object" && event.data.type === type) {
        callback(event.data.data);
      }
    };

    appChannel.addEventListener("message", action);

    return () => {
      appChannel.removeEventListener("message", callback);
    };
  }, [type, callback, ...(deps || [])]);
};
