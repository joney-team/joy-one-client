"use client";

import { AppLoading } from "@/components/app-loading/app-loading";
import { wait } from "@/utils/common.utils";
import dynamic from "next/dynamic";
import { type FC, type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { AppContext } from "./app.context";
import { getGlobal } from "./global";
import { socket } from "./modules/apis";
import { QueryProvider } from "./modules/apis/query";
import { getAccessToken } from "./modules/auth/auth-service";
import { getDeviceId } from "./modules/devices/devices-service";
import { eventsEmitter } from "./modules/events/event-service";
import { type EventEntity } from "./modules/events/event-types";
import { getAppConfig } from "./service";
import type { AppConfig, AppMetadata } from "./types";
import { v4 as uuid } from "uuid";

const LangProvider = dynamic(() => import("@/modules/lang/lang-provider"));
const LayoutProvider = dynamic(() => import("@/layout/layout-provider"));
const Providers = dynamic(() => import("@/app.providers"));

export const App: FC<PropsWithChildren<{ metadata: AppMetadata }>> = (props) => {
  const global = getGlobal();
  const [metadata, setMetadata] = useState(props.metadata);
  global._metadata = metadata;

  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<AppConfig>();

  const fetchAppConfig = async () => {
    await new Promise<AppConfig>((resolve) => {
      const process = async () => {
        try {
          const global = getGlobal();
          const config = await getAppConfig();
          global._appConfig = config;
          global._sessionId = uuid();
          setConfig(config);
          resolve(config);
        } catch (error) {
          await wait(3000);
          process();
        }
      };

      process();
    });
    setIsInitialized(true);
  };

  const joinWorkspaceRoom = async (workspaceId: string) => {
    const token = await getAccessToken();

    socket.io.once("reconnect", () => {
      joinWorkspaceRoom(workspaceId);
    });

    socket.emit("JOIN_WORKSPACE", {
      workspaceId,
      token,
      deviceId: getDeviceId(),
    });
  };

  const joinSocket = async () => {
    const token = await getAccessToken();

    socket.once("JOINED", () => {});

    socket.io.once("reconnect", () => {
      joinSocket();
    });

    socket.emit("JOIN", {
      token,
      deviceId: getDeviceId(),
    });
  };

  useEffect(() => {
    const onEventNew = (event: EventEntity) => {
      const global = getGlobal();
      const clientSessionId = global._sessionId as string;
      if (event.sessionId && event.sessionId !== clientSessionId) return;
      eventsEmitter.emit(event.type, event);
    };

    socket.on("EVENT_NEW", onEventNew);

    const onReconnect = () => {
      eventsEmitter.emit("RECONNECTED");
    };

    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("EVENT_NEW", onEventNew);
      socket.io.off("reconnect", onReconnect);
    };
  }, []);

  useEffect(() => {
    fetchAppConfig();

    const onMessage = (ev: MessageEvent<any>) => {
      if (ev.data.type === "change_metadata") {
        setMetadata(ev.data.metadata);
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const context = useMemo(
    () => ({
      config: config!,
      isInitialized,
      metadata: props.metadata,
      joinWorkspaceRoom,
      joinSocket,
    }),
    [config, isInitialized, props.metadata]
  );

  return (
    <QueryProvider>
      <AppContext.Provider value={context}>
        <LayoutProvider>
          <LangProvider>
            <Providers>
              {props.children}
              <AppLoading />
            </Providers>
          </LangProvider>
        </LayoutProvider>
      </AppContext.Provider>
    </QueryProvider>
  );
};
