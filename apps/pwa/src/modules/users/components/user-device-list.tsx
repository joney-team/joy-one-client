"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { useGraphqlList } from "@/components/list/use-graphql-list";
import { Renderer } from "@/components/renderer";
import { SectionTitle } from "@/components/session-title";
import { useAuth } from "@/modules/auth/auth-context";
import { DeviceFragment } from "@/modules/devices/graphql/fragmentDevice.graphql";
import GetDevicesDocument from "@/modules/devices/graphql/getDevices.graphql";
import { useUserEventsListner } from "@/modules/events/event-service";
import { onError } from "@/utils/exceptions.utils";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Group, SimpleGrid, Skeleton } from "@mantine/core";
import { IconDevices, IconLogout, IconRefresh } from "@tabler/icons-react";
import { Fragment } from "react";
import { UserDeviceCard } from "./user-device-card";

export const UserDeviceList = () => {
  const auth = useAuth();

  const devices = useGraphqlList<DeviceFragment>({
    query: GetDevicesDocument,
    id: "d",
  });

  useUserEventsListner((e) => {
    if (["SIGN_OUT", "SIGN_IN"].includes(e.eventName)) {
      devices.refetch();
    }
  });

  const onSignOutOtherDevices = async () => {
    await auth
      .signOutOtherDevices()
      .then(() => devices.refetch())
      .catch(onError);
  };

  return (
    <Fragment>
      <SectionTitle name={<Trans>Devices</Trans>} icon={IconDevices}>
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
              <Trans>Sign out another device</Trans>
            </Button>

            <ActionIcon
              w={30}
              h={30}
              onClick={() => devices.refetch()}
              color="gray"
              variant="light"
            >
              <IconRefresh size={16} strokeWidth={1.5} />
            </ActionIcon>
          </Group>
        </Renderer>
      </SectionTitle>

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
