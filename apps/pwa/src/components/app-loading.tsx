import { useEffect, useRef, type FC } from "react";
import { useApp } from "@/app.context";
import OverlayLoading from "@/components/overlay-loading";
import { useRouteRule } from "@/hooks/use-router";
import { eventsEmitter } from "@/modules/events/event-service";
import { useForceUpdate } from "@mantine/hooks";

export const closeAppLoading = () => {
  eventsEmitter.emit("app-loading", false);
};

export const openAppLoading = (type: string | boolean) => {
  eventsEmitter.emit("app-loading", type);
};

export const AppLoading: FC = () => {
  const forceUpdate = useForceUpdate();
  const routeRule = useRouteRule();
  const app = useApp();
  const loading = useRef<string | false>("initialize");

  useEffect(() => {
    eventsEmitter.on("app-loading", (value) => {
      if (value !== loading.current) {
        loading.current = value;
        forceUpdate();
      }
    });
  }, []);

  useEffect(() => {
    if (app.isInitialized && routeRule.auth === "public") {
      console.log("closeAppLoading");
      closeAppLoading();
    }
  }, [routeRule.auth, app.isInitialized]);

  return <OverlayLoading enabled={!!loading.current} />;
};

export const useCloseAppLoading = (condition = true) => {
  useEffect(() => {
    if (condition) closeAppLoading();
  }, [condition]);
};
