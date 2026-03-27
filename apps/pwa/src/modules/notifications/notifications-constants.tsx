"use client";

import { NotificationIcon, NotificationType } from "@/graphql/enums.graphql";
import { graphqlClient } from "@/graphql/graphql-client";
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
import { getColor } from "../theme/use-color";
import { NotificationFragment } from "./graphql/fragmentNotification.graphql";
import MUTATION_MARK_NOTIFICATION_AS_READED from "./graphql/mutationMarkNotificationAsReaded.graphql";

export const notificationIcons: Record<NotificationIcon, Icon> = {
  MESSAGE: IconMessage,
};

export const notificationTypes: Record<NotificationType, { color: string; icon: Icon }> = {
  [NotificationType.Info]: { color: "primary", icon: IconInbox },
  [NotificationType.Warning]: { color: "orange", icon: IconInfoSquareRounded },
  [NotificationType.Error]: { color: "red", icon: IconMoodCry },
  [NotificationType.Success]: { color: "green", icon: IconSquareRoundedCheck },
};

export async function showInAppNotification(
  notification: NotificationFragment,
  router: AppRouter,
  theme?: MantineTheme,
) {
  const { color, icon: Icon } =
    notificationTypes[notification.type] || notificationTypes[NotificationType.Info];

  const notificationColor = theme ? getColor(theme, color) : color;

  notifications.show({
    id: notification._id,
    title: notification.title,
    message: notification.body,
    color: notificationColor,
    withCloseButton: true,
    icon: <Icon strokeWidth={1.5} size={18} />,
    style: { cursor: "pointer" },
    onClick: () => {
      graphqlClient
        .mutate({
          mutation: MUTATION_MARK_NOTIFICATION_AS_READED,
          variables: { markNotificationAsReadedId: notification._id },
        })
        .catch(console.error);
      notifications.hide(notification._id);

      if (notification.route) {
        router.push(notification.route);
      }
    },
  });
}
