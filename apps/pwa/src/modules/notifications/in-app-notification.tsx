"use client";

import { getFirebaseMessaging } from "@/configs/firebase.config";
import { onMessage } from "firebase/messaging";
import { useEffect, type FC } from "react";
import { NotificationEntity } from "./notification-types";
import { showInAppNotification } from "./notification-service";
import { useRouter } from "@/hooks/use-router";
import { useMantineTheme } from "@mantine/core";
import { useAuth } from "../auth/auth-context";
import { EventEntity, EventType } from "../events/event-types";
import { addEventsListener, removeEventsListner } from "../events/event-service";
import { useLang } from "../lang/lang-context";

export const InAppNotification: FC = () => {
  const router = useRouter();
  const lang = useLang();
  const { device } = useAuth();
  const theme = useMantineTheme();

  const listenNotification = async () => {
    const firebaseMessaging = getFirebaseMessaging();

    onMessage(firebaseMessaging, (payload) => {
      try {
        const notification = JSON.parse(payload.data?.raw!) as NotificationEntity;
        showInAppNotification(notification, router, theme);
      } catch (error) {
        console.warn("Error when handling notification >", error);
      }
    });
  };

  useEffect(() => {
    if (!!device?.notificationToken && "Notification" in window) {
      listenNotification();
    } else {
      const onNewNotification = (ev: EventEntity) => {
        showInAppNotification(ev.data, router, theme);
      };

      addEventsListener(EventType.NOTIFICATION_NEW, onNewNotification);

      return () => {
        removeEventsListner(EventType.NOTIFICATION_NEW, onNewNotification);
      };
    }
  }, [device?.notificationToken, device?.locale, lang.locale]);

  return null;
};
