"use client";

import { useLayout } from "@/layout/layout-context";
import { useAuth } from "@/modules/auth/auth-context";
import { onActionLoad } from "@/utils/actions";
import { t } from "@lingui/core/macro";
import { Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { type FC, useEffect } from "react";

export const UserProfileNotifications: FC = () => {
  const auth = useAuth();
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t`Notifications`,
    });
  }, []);

  return (
    <Stack p={16}>
      {auth.device.notificationToken ? (
        <Group gap={8} justify="center" align="center" py={30}>
          <ThemeIcon color="green" variant="outline" radius={100}>
            <IconBell strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fz={14}>Đã bật nhận thông báo</Text>
        </Group>
      ) : (
        <Group
          gap={8}
          justify="center"
          align="center"
          py={30}
          onClick={() => {
            onActionLoad({
              name: "Bật thông báo",
              icon: IconBell,
              process: async () => auth.registerNotification(),
            });
          }}
          style={{ cursor: "pointer" }}
        >
          <ThemeIcon color="primary" variant="outline" radius={100}>
            <IconBell strokeWidth={1.5} size={20} />
          </ThemeIcon>

          <Text fz={14}>Bật nhận thông báo</Text>
        </Group>
      )}
    </Stack>
  );
};
