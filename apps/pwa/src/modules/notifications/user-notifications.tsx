"use client";

import { ChillIllustration } from "@/components/illustrations/chill";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { WayPoint } from "@/components/way-point";
import { EventType } from "@/graphql/enums.graphql";
import { useLayout } from "@/layout/layout-context";
import { type ModalConfirmRef } from "@/modals/modal-confirm";
import { useEventsListener } from "@/modules/events/event-service";
import { useColor } from "@/modules/theme/use-color";
import { nonLoading } from "@/utils/non-loading";
import { classNames } from "@/utils/ui.utils";
import { useMutation, useQuery } from "@apollo/client/react";
import { zIndexes } from "@joy-one-client/config/layout";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Drawer, Group, Indicator, Stack, Text, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconBell, IconBrush } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { FC, Fragment, useRef } from "react";
import { Button } from "../../components/buttons/button";
import { Errored } from "../../components/errored";
import { Renderer } from "../../components/renderer";
import { useLang } from "../lang/lang-context";
import CleanNotificationsDocument from "./graphql/cleanNotifications.graphql";
import { NotificationFragment } from "./graphql/fragmentNotification.graphql";
import GetNotificationStatDocument from "./graphql/getNotificationStat.graphql";
import GetNotificationsDocument from "./graphql/getNotifications.graphql";
import { NotificationCard } from "./notification-card";

const ModalConfirm = dynamic(
  () => import("@/modals/modal-confirm").then((mod) => mod.ModalConfirm),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const EmptyNotification: FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  const layout = useLayout();

  return (
    <Stack align="center" justify="center" gap={5} py={30} px={15} mih={layout.height * 0.7}>
      <ChillIllustration width={200} />
      <Text fw={500} ta="center" mt={15} fz={16}>
        <Trans>Inbox Zero</Trans>
      </Text>
      <Text c="gray" ta="center" fz={13}>
        <Trans>Congratulations! You cleared your important notifications 🎉</Trans>
      </Text>
    </Stack>
  );
};

export const UserNotifications: FC = () => {
  const lang = useLang();
  const [opened, { open, close }] = useDisclosure(false);
  const layout = useLayout();
  const color = useColor();
  const modalConfirmRef = useRef<ModalConfirmRef>(null);

  const [cleanNotifications] = useMutation(CleanNotificationsDocument);

  const { data: notificationStatData, refetch } = useQuery(GetNotificationStatDocument);

  const notificationStat = notificationStatData?.notificationStat;

  const onOpen = async () => {
    open();
  };

  const notifications = useGraphqlList<NotificationFragment>({
    id: `user-notifications-${lang.locale}`,
    query: GetNotificationsDocument,
    fetchPolicy: "cache-first",
  });

  const onClean = () => {
    modalConfirmRef.current?.open({
      icon: IconBrush,
      content: (
        <Trans>
          Are you sure you want to clean up the notifications? This action cannot be undone.
        </Trans>
      ),
      onConfirm: () => cleanNotifications().then(close),
      onCancel: () => modals.close("ModalCleanNotification"),
    });
  };

  useEventsListener(
    [
      EventType.NotificationListViewed,
      EventType.NotificationReaded,
      EventType.NotificationNew,
      EventType.NotificationCleaned,
    ],
    () => {
      notifications.refetch();
      refetch();
    },
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
          disabled={!notificationStat || notificationStat.unListViewed === 0}
          offset={layout.view === "mobile" ? 0 : 2}
          color="red"
          size={8}
        >
          <IconBell
            size={21}
            strokeWidth={1.5}
            className={classNames({
              animTada: !!notificationStat && notificationStat.unListViewed > 0,
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
        zIndex={zIndexes.commonModals}
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
                  <Trans>Notifications</Trans>
                </Text>

                {notifications.total > 0 && (
                  <Group ml="xs">
                    <Button
                      size="compact-sm"
                      variant="subtle"
                      leftIcon={IconBrush}
                      component="div"
                      radius={100}
                      color="gray"
                      onClick={onClean}
                    >
                      <Trans>Clean</Trans>
                    </Button>
                  </Group>
                )}
              </Group>
            </Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Stack>
              <Renderer visible={notifications.total > 0}>
                <Stack onClick={close}>
                  {notifications.data.map((noti) => (
                    <NotificationCard notification={noti} key={noti._id} />
                  ))}
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

      <ModalConfirm ref={modalConfirmRef} />
    </Fragment>
  );
};
