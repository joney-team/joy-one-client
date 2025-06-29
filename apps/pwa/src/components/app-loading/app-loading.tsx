import { useEffect, useRef, type FC } from "react";
import { useApp } from "@/app.context";
import OverlayLoading from "@/components/overlay-loading";
import { useRouteRule } from "@/hooks/use-router";
import { eventsEmitter } from "@/modules/events/event-service";
import { useForceUpdate } from "@mantine/hooks";

export const endAppLoading = (type: string) => {
  eventsEmitter.emit("end-loading", type);
};

export const startAppLoading = (type: string) => {
  eventsEmitter.emit("start-loading", type);
};

const initialLoading = ["lang"];

export const AppLoading: FC = () => {
  const forceUpdate = useForceUpdate();
  const routeRule = useRouteRule();
  const app = useApp();
  const loading = useRef<string[]>(initialLoading);

  useEffect(() => {
    eventsEmitter.on("start-loading", (value) => {
      if (!loading.current.includes(value)) {
        loading.current.push(value);
        forceUpdate();
      }
    });

    eventsEmitter.on("end-loading", (value) => {
      if (loading.current.includes(value)) {
        loading.current = loading.current.filter((item) => item !== value);
        forceUpdate();
      }
    });
  }, []);

  useEffect(() => {
    if (app.isInitialized && routeRule.auth === "public") {
      loading.current = loading.current.filter((item) => !initialLoading.includes(item));
      forceUpdate();
    }
  }, [routeRule.auth, app.isInitialized]);

  if (loading.current.length === 0) return null;
  return <OverlayLoading enabled />;
};
