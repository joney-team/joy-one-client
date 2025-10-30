"use client";

import { RelativeTimeFormat } from "@/components/format/date-format";
import {
  onReaded,
  renderNotificationColor,
  renderNotificationIcon,
} from "@/modules/notifications/notification-service";
import { NotificationEntity, NotificationStatus } from "@/modules/notifications/notification-types";
import { useColor } from "@/modules/theme/use-color";
import { ActionIcon, Anchor, Card, Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { FC, useState } from "react";

export const NotificationCard: FC<{
  notification: NotificationEntity;
}> = (props) => {
  const { notification } = props;
  const color = useColor();
  const [readed, setReaded] = useState(notification.status === NotificationStatus.READED);

  const Icon = renderNotificationIcon(notification);
  const notificationColor = renderNotificationColor(notification);

  return (
    <Anchor
      component={Link}
      href={notification.route || "/"}
      onClick={() => {
        setReaded(true);
        onReaded(notification._id).catch(console.error);
      }}
      td="none"
    >
      <Card
        p={8}
        withBorder
        shadow="none"
        style={{
          cursor: "pointer",
          borderColor: readed
            ? "var(--mantine-color-default-hover)"
            : color(`${notificationColor}.2`),
        }}
        bg={readed ? "var(--mantine-color-default-hover)" : undefined}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group flex={1} align="start" wrap="nowrap" gap={10}>
            <ThemeIcon color={color(notificationColor)} size="md" variant="light">
              <Icon size={22} strokeWidth={1.5} />
            </ThemeIcon>
            <Stack gap={10}>
              <Text fw={500} fz={em(15)}>
                {notification.title}
              </Text>

              {notification.body && <Text fz={em(12)}>{notification.body}</Text>}

              <Text fz={em(10)} c="gray">
                <RelativeTimeFormat value={notification.createdAt} />
              </Text>
            </Stack>
          </Group>

          {notification.route && (
            <Group>
              <ActionIcon variant="transparent" color="dark.3">
                <IconChevronRight strokeWidth={1.5} size={18} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Card>
    </Anchor>
  );
};
