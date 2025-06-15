"use client";

import { useColor } from "@/modules/theme/use-color";
import { Button } from "@/components/buttons/button";
import { useAuth } from "@/modules/auth/auth-context";
import { DeviceEntity } from "@/modules/devices/devices-types";
import { renderDate, t } from "@/modules/lang/lang-service";
import { signOutOtherDevices } from "@/modules/users/users-service";
import { Badge, Card, em, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceUnknown,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { FC, Fragment } from "react";

interface UserDeviceCardProps {
  device: DeviceEntity;
}

const renderIcon = (device: DeviceEntity) => {
  if (device.ua.device.type === "tablet") return IconDeviceTablet;
  if (device.ua.device.type === "mobile") return IconDeviceMobile;
  if (device.ua.browser.name === "Chrome") return IconDeviceDesktop;
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
              {ua.device.model || t("unknow_device")}
              {ua.device.vendor ? ` - ${ua.device.vendor}` : ""}
            </Text>
            {auth.device._id === device._id && (
              <Badge size="xs" color={color("primary")}>
                {t("this_device")}
              </Badge>
            )}
          </Group>

          {!!ua.os.name && !!ua.os.version && (
            <Text fz={em(12)} c="gray">
              {ua.os.name} ({ua.os.version})
            </Text>
          )}
          {!!ua.browser.name && (
            <Text fz={em(12)} c="gray">
              {ua.browser.name}{" "}
              {!!ua.browser.version && <Fragment>({ua.browser.version})</Fragment>}
            </Text>
          )}

          <Text fz={em(12)} c="gray">
            {t("active_at")} {dayjs(device.lastActiveAt * 1000).fromNow()} (
            {renderDate(device.lastActiveAt * 1000)})
          </Text>

          <Group mt={10}>
            <Button
              size="compact-xs"
              variant="light"
              color="gray"
              fz={em(13)}
              onClick={() => signOutOtherDevices()}
            >
              {t("sign_out")}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
