"use client";

import { getFirebaseMessaging } from "@/configs/firebase.config";
import { EventType } from "@/graphql/enums.graphql";
import { useRouter } from "@/hooks/use-router";
import { useMantineTheme } from "@mantine/core";
import { onMessage } from "firebase/messaging";
import { useEffect, type FC } from "react";
import { useAuth } from "../auth/auth-context";
import { addEventsListener, removeEventsListner } from "../events/event-service";
import { EventFragment } from "../events/graphql/fragmentEvent.graphql";
import { useLang } from "../lang/lang-context";
import { showInAppNotification } from "./notification-service";
import { NotificationEntity } from "./notification-types";

export const InAppNotification: FC = () => {
  const router = useRouter();
  const lang = useLang();
  const { device } = useAuth();
  const { user } = useAuth();
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
    if (user?._id) {
      if (!!device?.notificationToken && "Notification" in window) {
        listenNotification();
      } else {
        const onNewNotification = (ev: EventFragment) => {
          showInAppNotification(ev.data, router, theme);
        };

        addEventsListener(EventType.NotificationNew, onNewNotification);

        return () => {
          removeEventsListner(EventType.NotificationNew, onNewNotification);
        };
      }
    }
  }, [device?.notificationToken, device?.locale, lang.locale, user?._id]);

  return null;
};
