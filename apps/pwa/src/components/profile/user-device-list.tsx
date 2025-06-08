"use client";

import { Button } from "@/components/buttons/button";
import { Empty } from "@/components/empty";
import { Errored } from "@/components/errored";
import { Renderer } from "@/components/renderer";
import { SessionTitle } from "@/components/session-title";
import { useUserEventsListner } from "@/modules/events/event-service";
import { t } from "@/modules/lang/lang-service";
import { getUserDevices } from "@/modules/devices/devices-service";
import { signOutOtherDevices } from "@/modules/users/users-service";
import { onError } from "@/utils/exceptions.utils";
import { useList } from "@/utils/use-list.util";
import { em, SimpleGrid, Skeleton } from "@mantine/core";
import { IconDevices, IconLogout } from "@tabler/icons-react";
import { UserDeviceCard } from "@/components/profile/user-device-card";

export const UserDeviceList = () => {
  const devices = useList({
    fetch: () => getUserDevices(),
  });

  useUserEventsListner((e) => {
    if (["SIGN_OUT", "SIGN_IN"].includes(e.eventName)) {
      devices.fetch(true, { isSilient: true });
    }
  });

  return (
    <>
      <SessionTitle name={t("devices")} icon={IconDevices}>
        <Renderer visible={devices.count > 1}>
          <Button
            size="xs"
            fz={em(14)}
            variant="light"
            color="gray"
            fw={400}
            leftSection={<IconLogout size={16} style={{ marginRight: -5 }} />}
            onClick={() => signOutOtherDevices().catch(onError)}
          >
            {t("sign_out_another_device")}
          </Button>
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
    </>
  );
};
