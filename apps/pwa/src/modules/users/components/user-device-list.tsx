"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { Renderer } from "@/components/renderer";
import { SessionTitle } from "@/components/session-title";
import { useAuth } from "@/modules/auth/auth-context";
import { getUserDevices } from "@/modules/devices/devices-service";
import { useUserEventsListner } from "@/modules/events/event-service";
import { t } from "@/modules/lang/lang-service";
import { onError } from "@/utils/exceptions.utils";
import { useList } from "@/components/list/use-list";
import { ActionIcon, Group, SimpleGrid, Skeleton } from "@mantine/core";
import { IconDevices, IconLogout, IconRefresh } from "@tabler/icons-react";
import { Fragment } from "react";
import { UserDeviceCard } from "./user-device-card";

export const UserDeviceList = () => {
  const auth = useAuth();

  const devices = useList({
    fetch: () =>
      getUserDevices({
        sortLastActiveAt: -1,
      }),
  });

  useUserEventsListner((e) => {
    if (["SIGN_OUT", "SIGN_IN"].includes(e.eventName)) {
      devices.fetch(true, { isSilient: true });
    }
  });

  const onSignOutOtherDevices = async () => {
    await auth
      .signOutOtherDevices()
      .then(() => devices.fetch(true))
      .catch(onError);
  };

  return (
    <Fragment>
      <SessionTitle name={t("devices")} icon={IconDevices}>
        <Renderer visible={devices.count > 1}>
          <Group gap={8}>
            <Button
              size="xs"
              fz={14}
              variant="light"
              color="gray"
              fw={400}
              leftIcon={IconLogout}
              onClick={onSignOutOtherDevices}
            >
              {t("sign_out_another_device")}
            </Button>

            <ActionIcon
              w={30}
              h={30}
              onClick={() => devices.fetch(true, { isSilient: true })}
              color="gray"
              variant="light"
            >
              <IconRefresh size={16} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
        </Renderer>
      </SessionTitle>

      <SimpleGrid cols={1}>
        <Empty visible={devices.isEmpty} />
        <Errored error={devices.error} visible={devices.isHasError} />

        <Renderer visible={devices.isHasData}>
          {devices.data.map((device) => {
            return <UserDeviceCard key={device._id} device={device} />;
          })}
        </Renderer>

        <Renderer visible={devices.isFetching}>
          <Skeleton height={150} />
          <Skeleton height={150} />
        </Renderer>
      </SimpleGrid>
    </Fragment>
  );
};
