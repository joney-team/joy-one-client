import { useColor } from "@/modules/theme/use-color";
import { translateNotification } from "@/modules/lang/lang-service";
import {
  onReaded,
  renderNotificationColor,
  renderNotificationIcon,
} from "@/modules/notifications/notification-service";
import { NotificationEntity, NotificationStatus } from "@/modules/notifications/notification-types";
import { ActionIcon, Anchor, Card, Group, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";
import { FC, useState } from "react";

export const NotificationCard: FC<{
  notification: NotificationEntity;
}> = (props) => {
  const { notification } = props;
  const color = useColor();
  const [readed, setReaded] = useState(notification.status === NotificationStatus.READED);

  const Icon = renderNotificationIcon(notification);
  const _color = renderNotificationColor(notification);

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
        style={{
          cursor: "pointer",
          borderColor: readed ? "var(--mantine-color-default-hover)" : color(`${_color}.2`),
        }}
        bg={readed ? "var(--mantine-color-default-hover)" : undefined}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group flex={1} align="start" wrap="nowrap" gap={10}>
            <ThemeIcon color={color(_color)} size="md" variant="light">
              <Icon size={22} strokeWidth={1.5} />
            </ThemeIcon>
            <Stack gap={10}>
              <Text fw={500} fz={em(15)}>
                {translateNotification(notification.title, notification.titleParams)}
              </Text>
              {notification.body && (
                <Text fz={em(12)}>{translateNotification(notification.body, notification.bodyParams)}</Text>
              )}

              <Text fz={em(10)} c="gray">
                {dayjs(notification.createdAt * 1000).fromNow()}
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
