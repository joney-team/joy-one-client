"use client";

import { useEffect, useRef, type FC } from "react";
import { useApp } from "@/app.context";
import OverlayLoading from "@/components/overlay-loading";
import { eventsEmitter } from "@/modules/events/event-service";
import { useForceUpdate } from "@mantine/hooks";
import { usePathname } from "next/navigation";

export const endAppLoading = (type: string) => {
  eventsEmitter.emit("end-loading", type);
};

export const startAppLoading = (type: string) => {
  eventsEmitter.emit("start-loading", type);
};

const initialLoading = ["lang", "auth"];

const PUBLIC_PATHS = ["/dev", "/docs", "/customer-forms/new"];

export const AppLoading: FC = () => {
  const forceUpdate = useForceUpdate();
  const pathname = usePathname();
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
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (app.isInitialized && isPublic) {
      loading.current = [];
      forceUpdate();
    }
  }, [pathname, app.isInitialized]);

  if (loading.current.length === 0) return null;

  return <OverlayLoading enabled />;
};
