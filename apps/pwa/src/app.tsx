"use client";

import LangProvider from "@/modules/lang/lang-provider";
import { wait } from "@/utils/common.utils";
import config from "@joy-one-client/config";
import * as Sentry from "@sentry/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type FC, type PropsWithChildren } from "react";
import packageJson from "../package.json";
import { AppContext, type UseApp } from "./app.context";
import { StorageKey } from "./constants/storage-key";
import { getLocalStorage } from "./hooks/use-local-storage";
import { usePageTitle } from "./hooks/use-page-title";
import { socket } from "./modules/apis/rest-client";
import { eventsEmitter } from "./modules/events/event-service";
import { LocationsProvider } from "./modules/locations/locations-provider";
import { getAppConfig } from "./service";

import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";
import "@xyflow/react/dist/style.css";

import "./styles/app.style.css";
import "./styles/react-big-calendar.css";

import { AppConfigFragment } from "./configs/fragmentAppConfig.graphql";
import { serverGetAccessToken } from "./modules/auth/auth-server";
import { EventFragment } from "./modules/events/graphql/fragmentEvent.graphql";

import { nonLoading } from "./utils/non-loading";

if (config.SENTRY_DSN) {
  Sentry.init({ dsn: config.SENTRY_DSN, release: packageJson.version });
}

const AppLoading = dynamic(
  () => import("@/components/app-loading/app-loading").then((mod) => mod.AppLoading),
  { ssr: false, loading: nonLoading },
);

const LayoutProvider = dynamic(() => import("@/layout/layout-provider"));

const AppModuleProviders = dynamic(() => import("@/app.module-providers"));

const AuthProvider = dynamic(() => import("@/modules/auth/auth-provider"));

const WorkspaceProvider = dynamic(() => import("@/modules/workspaces/workspace-provider"));

const EscapeHandler = dynamic(() => import("@/hooks/use-escape").then((mod) => mod.EscapeHandler), {
  ssr: false,
  loading: nonLoading,
});

const EventsHandler = dynamic(
  () => import("./modules/events/events-handler").then((mod) => mod.EventsHandler),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const GeneralAnalytics = dynamic(
  () => import("./components/analytics/general-analytics").then((mod) => mod.GeneralAnalytics),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const NavigationProgress = dynamic(
  () => import("@mantine/nprogress").then((mod) => mod.NavigationProgress),
  { ssr: false, loading: nonLoading },
);

export const App: FC<PropsWithChildren<Pick<UseApp, "metadata">>> = (props) => {
  usePageTitle();

  const [isInitialized, setIsInitialized] = useState(false);
  const config = useRef<AppConfigFragment | null>(null);

  const fetchAppConfig = async () => {
    await new Promise<AppConfigFragment>((resolve) => {
      const process = async () => {
        try {
          const configResult = await getAppConfig();
          config.current = configResult;
          resolve(config.current);
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
    const { result: token } = await serverGetAccessToken();
    if (!token) return;

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
    const { result: token } = await serverGetAccessToken();
    if (!token) return;
    const deviceId = getLocalStorage(StorageKey.DEVICE_ID);
    socket.io.once("reconnect", joinSocket);
    socket.emit("AUTH", { token: token, deviceId });
  };

  useEffect(() => {
    const onEventNew = (event: EventFragment) => {
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
  }, []);

  const context = useMemo(
    () => ({
      config: config.current!,
      isInitialized,
      metadata: props.metadata,
      joinWorkspaceRoom,
      joinSocket,
    }),
    [config, isInitialized, props.metadata],
  );

  return (
    <AppContext.Provider value={context}>
      <LangProvider>
        <LocationsProvider>
          <LayoutProvider>
            <AuthProvider>
              <WorkspaceProvider>
                <AppModuleProviders>
                  {props.children}

                  <NavigationProgress />
                  <EscapeHandler />
                  <EventsHandler />
                  <AppLoading />
                  <GeneralAnalytics />
                </AppModuleProviders>
              </WorkspaceProvider>
            </AuthProvider>
          </LayoutProvider>
        </LocationsProvider>
      </LangProvider>
    </AppContext.Provider>
  );
};
