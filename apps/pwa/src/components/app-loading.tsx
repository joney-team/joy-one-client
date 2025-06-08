import OverlayLoading from "@/components/overlay-loading";
import { eventsEmitter } from "@/modules/events/event-service";
import { useForceUpdate } from "@mantine/hooks";
import { useEffect, useRef, type FC } from "react";

export const closeAppLoading = () => {
  eventsEmitter.emit("app-loading", false);
};

export const openAppLoading = (type: string | boolean) => {
  eventsEmitter.emit("app-loading", type);
};

export const AppLoading: FC = () => {
  const forceUpdate = useForceUpdate();
  const loading = useRef<string | false>("initialize");

  useEffect(() => {
    eventsEmitter.on("app-loading", (value) => {
      if (value !== loading.current) {
        loading.current = value;
        forceUpdate();
      }
    });
  }, []);

  return <OverlayLoading enabled={!!loading.current} />;
};

export const useCloseAppLoading = (condition = true) => {
  useEffect(() => {
    if (condition) closeAppLoading();
  }, [condition]);
};
