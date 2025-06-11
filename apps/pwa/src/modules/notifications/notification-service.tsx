import { AppRouter } from "@/hooks/use-router";
import { MantineTheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Icon,
  IconInbox,
  IconInfoSquareRounded,
  IconMessage,
  IconMoodCry,
  IconSquareRoundedCheck,
} from "@tabler/icons-react";
import { api } from "../apis";
import { translateNotification } from "../lang/lang-service";
import { getColor } from "../theme/use-color";
import { NotificationEntity, NotificationIcon, NotificationType } from "./notification-types";

export async function getNotifications(q?: any) {
  return api.get("/notifications", { params: q });
}

export async function onReaded(notificationId: string) {
  return api.post(`/notifications/${notificationId}/readed`);
}

export async function getNotificationStat() {
  return api.get("/notifications/stat");
}

export async function onListViewed() {
  return api.post("/notifications/list-viewed");
}

export async function cleanNotifications() {
  return api.delete("/notifications/clean");
}

export const notificationIcons: { [key in NotificationIcon]: Icon } = {
  MESSAGE: IconMessage,
};

export function renderNotificationIcon(noti: NotificationEntity) {
  if (noti.icon && notificationIcons[noti.icon]) {
    return notificationIcons[noti.icon];
  }

  const iconTypes = {
    [NotificationType.INFO]: IconInbox,
    [NotificationType.WARNING]: IconInfoSquareRounded,
    [NotificationType.ERROR]: IconMoodCry,
    [NotificationType.SUCCESS]: IconSquareRoundedCheck,
  };

  return iconTypes[noti.type] || IconInbox;
}

export const notificationTypeColors = {
  [NotificationType.INFO]: "primary",
  [NotificationType.WARNING]: "orange",
  [NotificationType.ERROR]: "red",
  [NotificationType.SUCCESS]: "green",
};

export function renderNotificationColor(noti: NotificationEntity, theme?: MantineTheme) {
  if (!theme) return notificationTypeColors[noti.type] || "primary";
  return getColor(theme, notificationTypeColors[noti.type]);
}

export function showInAppNotification(
  notification: NotificationEntity,
  router: AppRouter,
  theme?: MantineTheme
) {
  const Icon = renderNotificationIcon(notification);
  const color = renderNotificationColor(notification, theme);

  notifications.show({
    id: notification._id,
    title: translateNotification(notification?.title, notification.titleParams),
    message: translateNotification(notification?.body, notification.bodyParams),
    color,
    withCloseButton: true,
    icon: <Icon strokeWidth={1.5} size={18} />,
    style: { cursor: "pointer" },
    onClick: () => {
      onReaded(notification._id).catch(console.error);
      notifications.hide(notification._id);

      if (notification.route) {
        router.push(notification.route);
      }
    },
  });
}
