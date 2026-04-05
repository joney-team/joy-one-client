"use client";

import { Badge } from "@/components/badge";
import { DateFormat, RelativeTimeFormat } from "@/components/format/date-format";
import { useAuth } from "@/modules/auth/auth-context";
import { DeviceFragment } from "@/modules/devices/graphql/fragmentDevice.graphql";
import { useColor } from "@/modules/theme/use-color";
import { String } from "@/utils/string.utils";
import { Trans } from "@lingui/react/macro";
import { Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceUnknown,
} from "@tabler/icons-react";
import { FC, Fragment } from "react";

interface UserDeviceCardProps {
  device: DeviceFragment;
}

const renderIcon = (device: DeviceFragment) => {
  if (device.ua?.device.type === "tablet") return IconDeviceTablet;
  if (device.ua?.device.type === "mobile") return IconDeviceMobile;
  if (device.ua?.browser.name === "Chrome") return IconDeviceDesktop;
  return IconDeviceUnknown;
};

export const UserDeviceCard: FC<UserDeviceCardProps> = (props) => {
  const auth = useAuth();
  const { device } = props;
  const ua = device.ua;
  const Icon = renderIcon(props.device);
  const color = useColor();

  return (
    <Card shadow="xs">
      <Group wrap="nowrap" align="start">
        <ThemeIcon size="lg">
          <Icon />
        </ThemeIcon>

        <Stack gap={5} mt={-3}>
          <Group>
            <Text>
              {ua?.device.model || <Trans>Unknown device</Trans>}
              {ua?.device.vendor ? ` - ${ua.device.vendor}` : ""}
            </Text>

            {auth.device._id === device._id && (
              <Badge size="xs" color={color("primary")}>
                <Trans>This device</Trans>
              </Badge>
            )}
          </Group>

          {device.identifyId && (
            <Text fz={em(12)} c="gray" truncate="end" maw={200}>
              ID: {String.compact(device.identifyId, 5, 5)}
            </Text>
          )}

          {!!ua?.os.name && !!ua.os.version && (
            <Text fz={em(12)} c="gray">
              {ua.os.name} ({ua.os.version})
            </Text>
          )}

          {!!ua?.browser.name && (
            <Text fz={em(12)} c="gray">
              {ua.browser.name}{" "}
              {!!ua.browser.version && <Fragment>({ua.browser.version})</Fragment>}
            </Text>
          )}

          <Text fz={em(12)} c="gray">
            <Trans>Active at</Trans> <RelativeTimeFormat value={device.lastActiveAt} />{" "}
            <DateFormat value={device.lastActiveAt} type="date" />)
          </Text>
        </Stack>
      </Group>
    </Card>
  );
};
