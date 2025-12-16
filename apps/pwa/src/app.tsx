"use client";

import { AppLoading } from "@/components/app-loading/app-loading";
import LangProvider from "@/modules/lang/lang-provider";
import { wait } from "@/utils/common.utils";
import config from "@joy-one-client/config";
import * as Sentry from "@sentry/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type FC, type PropsWithChildren } from "react";
import { v4 as uuid } from "uuid";
import packageJson from "../package.json";
import { AppContext } from "./app.context";
import { getGlobal } from "./global";
import { getLocalStorage } from "./hooks/use-local-storage";
import { socket } from "./modules/apis";
import { RestQueryProvider } from "./modules/apis/query";
import { getAccessToken } from "./modules/auth/auth-service";
import { eventsEmitter } from "./modules/events/event-service";
import { type EventEntity } from "./modules/events/event-types";
import { LocationsProvider } from "./modules/locations/locations-provider";
import { getAppConfig } from "./service";
import { StorageKey, type AppConfig, type AppMetadata } from "./types";
import { usePageTitle } from "./hooks/use-page-title";

import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/nprogress/styles.css";
import "@xyflow/react/dist/style.css";

import "./styles/app.style.css";
import "./styles/react-big-calendar.css";
import { nonLoading } from "./utils/non-loading";

if (config.SENTRY_DSN) {
  Sentry.init({ dsn: config.SENTRY_DSN, release: packageJson.version });
}

const LayoutProvider = dynamic(() => import("@/layout/layout-provider"));
const ModuleProviders = dynamic(() => import("@/app.module-providers"));

const AuthProvider = dynamic(() => import("@/modules/auth/auth-provider"));
const WorkspaceProvider = dynamic(() => import("@/modules/workspaces/workspace-provider"));

const EscapeHandler = dynamic(() => import("@/hooks/use-escape").then((mod) => mod.EscapeHandler), {
  ssr: false,
  loading: nonLoading,
});

const GeneralAnalytics = dynamic(
  () => import("./components/analytics/general-analytics").then((mod) => mod.GeneralAnalytics),
  {
    ssr: false,
    loading: nonLoading,
  }
);

const NavigationProgress = dynamic(
  () => import("@mantine/nprogress").then((mod) => mod.NavigationProgress),
  { ssr: false, loading: nonLoading }
);

export const App: FC<PropsWithChildren<{ metadata: AppMetadata }>> = (props) => {
  const global = getGlobal();
  const [metadata, setMetadata] = useState(props.metadata);
  global._metadata = metadata;

  usePageTitle();

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
    const deviceId = getLocalStorage(StorageKey.DEVICE_ID);

    socket.io.once("reconnect", () => {
      joinWorkspaceRoom(workspaceId);
    });

    socket.emit("JOIN_WORKSPACE", {
      workspaceId,
      token,
      deviceId,
    });
  };

  const joinSocket = async () => {
    const token = await getAccessToken();
    const deviceId = getLocalStorage(StorageKey.DEVICE_ID);
    socket.io.once("reconnect", joinSocket);
    socket.emit("AUTH", { token, deviceId });
  };

  useEffect(() => {
    const onEventNew = (event: EventEntity) => {
      const global = getGlobal();
      const clientSessionId = global._sessionId as string;
      if (event.sessionId && event.sessionId !== clientSessionId) return;
      eventsEmitter.emit(event.type, event);
    };

    const onReconnect = () => eventsEmitter.emit("RECONNECTED");
    socket.io.on("reconnect", onReconnect);
    socket.on("EVENT_NEW", onEventNew);

    return () => {
      socket.io.off("reconnect", onReconnect);
      socket.off("EVENT_NEW", onEventNew);
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
    <AppContext.Provider value={context}>
      <LangProvider>
        <RestQueryProvider>
          <LocationsProvider>
            <LayoutProvider>
              <AuthProvider>
                <WorkspaceProvider>
                  <ModuleProviders>
                    {props.children}

                    <NavigationProgress />
                    <EscapeHandler />
                    <AppLoading />
                    <GeneralAnalytics />
                  </ModuleProviders>
                </WorkspaceProvider>
              </AuthProvider>
            </LayoutProvider>
          </LocationsProvider>
        </RestQueryProvider>
      </LangProvider>
    </AppContext.Provider>
  );
};
