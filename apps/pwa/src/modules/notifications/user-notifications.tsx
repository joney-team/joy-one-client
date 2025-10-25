"use client";

import { ChillIllustration } from "@/components/illustrations/chill";
import { useList } from "@/components/list/use-list";
import { WayPoint } from "@/components/way-point";
import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { useEventsListener } from "@/modules/events/event-service";
import { EventType } from "@/modules/events/event-types";
import { tl } from "@/modules/lang/lang-service";
import {
  cleanNotifications,
  getNotificationStat,
  getNotifications,
  onListViewed,
} from "@/modules/notifications/notification-service";
import {
  NotificationEntity,
  UserNotificationStat,
} from "@/modules/notifications/notification-types";
import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { classNames } from "@/utils/ui.utils";
import { ActionIcon, Drawer, Group, Indicator, Stack, Text, ThemeIcon, em } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconBell, IconBrush } from "@tabler/icons-react";
import { FC, Fragment, useEffect, useState } from "react";
import { Button } from "../../components/buttons/button";
import { Errored } from "../../components/errored";
import { ModalTitle } from "../../components/modal-title";
import { Renderer } from "../../components/renderer";
import { NotificationCard } from "./notification-card";

const EmptyNotification: FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  const layout = useLayout();

  return (
    <Stack align="center" justify="center" gap={5} py={30} px={15} mih={layout.height * 0.7}>
      <ChillIllustration width={200} />
      <Text fw={500} ta="center" mt={15} fz={16}>
        {tl("no_notifications")}
      </Text>
      <Text c="gray" ta="center" fz={13}>
        {tl("no_notifications_desc")}
      </Text>
    </Stack>
  );
};

export const UserNotifications: FC = () => {
  const auth = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [stat, setStat] = useState<UserNotificationStat>();
  const layout = useLayout();
  const color = useColor();

  const fetchStat = async () => {
    getNotificationStat().then(setStat).catch(console.error);
  };

  const onOpen = async () => {
    open();

    if (stat && stat.unListViewed > 0) {
      await onListViewed().catch(console.error);
      await fetchStat().catch(console.error);
    }
  };

  useEffect(() => {
    if (auth.user?._id) fetchStat();
  }, [auth.user?._id]);

  const notifications = useList<NotificationEntity>({
    id: "user-notifications",
    fetch: (q) => getNotifications(q),
  });

  const onClean = () => {
    modals.openConfirmModal({
      modalId: "ModalCleanNotification",
      title: (
        <ModalTitle
          color="primary"
          title={`${tl("clean")} ${tl("notifications")}`}
          icon={IconBrush}
        />
      ),
      children: tl("clean_notification_msg"),
      color: color("primary"),
      onConfirm: async () => cleanNotifications().then(close).catch(onError),
      labels: { confirm: tl("clean"), cancel: tl("cancel") },
      onCancel: () => modals.close("ModalCleanNotification"),
      confirmProps: { color: color("primary") },
    });
  };

  useEventsListener(
    [
      EventType.NOTIFICATION_LIST_VIEWED,
      EventType.NOTIFICATION_READED,
      EventType.NOTIFICATION_NEW,
      EventType.NOTIFICATION_CLEANED,
    ],
    () => {
      notifications.fetch(true, { isSilient: true });
      fetchStat();
    }
  );

  return (
    <Fragment>
      <ActionIcon
        id="user-notifications"
        variant="subtle"
        color="var(--mantine-color-text)"
        size={30}
        onClick={onOpen}
        style={{ overflow: "visible" }}
      >
        <Indicator
          disabled={!stat || stat.unListViewed === 0}
          offset={layout.view === "mobile" ? 0 : 2}
          color="red"
          size={8}
        >
          <IconBell
            size={em(23)}
            strokeWidth={1.5}
            className={classNames({
              animTada: !!stat && stat.unListViewed > 0,
            })}
          />
        </Indicator>
      </ActionIcon>

      <Drawer.Root
        opened={opened}
        onClose={close}
        offset={layout.view === "mobile" ? 0 : 10}
        radius={layout.view === "mobile" ? 0 : "md"}
        position="right"
      >
        <Drawer.Overlay />
        <Drawer.Content id="user-notifications-content">
          <Drawer.Header>
            <Drawer.Title>
              <Group gap={5}>
                <ThemeIcon variant="transparent" color={color("primary")}>
                  <IconBell />
                </ThemeIcon>
                <Text fw={700} c={color("primary")}>
                  {tl("notifications")}
                </Text>

                {notifications.count > 0 && (
                  <Group ml={16}>
                    <Button
                      size="compact-xs"
                      variant="outline"
                      leftSection={<IconBrush size={14} style={{ marginRight: -5 }} />}
                      px={10}
                      radius={100}
                      color="gray"
                      onClick={onClean}
                      style={{ borderWidth: 0.5 }}
                    >
                      <Text fw={500} fz={em(13)}>
                        {tl("clean")}
                      </Text>
                    </Button>
                  </Group>
                )}
              </Group>
            </Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Stack>
              <Renderer visible={notifications.count > 0}>
                <Stack onClick={close}>
                  {notifications.data.map((noti) => {
                    return <NotificationCard notification={noti} key={noti._id} />;
                  })}
                </Stack>
              </Renderer>

              <EmptyNotification visible={notifications.isEmpty} />
              <Errored error={notifications.error} visible={notifications.isHasError} />
            </Stack>

            <WayPoint
              scrollContainerId="user-notifications-content"
              enabled={notifications.isAbleToLoadMore}
              onReached={notifications.loadMore}
            />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </Fragment>
  );
};
