"use client";

import { type FC, useEffect } from "react";

import { Container } from "@/components/container";
import { UpdatePassword } from "@/components/profile/update-password";
import { UserDeviceList } from "@/components/profile/user-device-list";
import { SessionTitle } from "@/components/session-title";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { Stack } from "@mantine/core";
import { IconLockFilled } from "@tabler/icons-react";

export const UserProfileSecure: FC = () => {
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t("secure"),
    });
  }, []);

  return (
    <Container p={16}>
      <Stack gap={30}>
        <Stack>
          <SessionTitle name={t("update_password")} icon={IconLockFilled} />
          <UpdatePassword />
        </Stack>

        <Stack>
          <UserDeviceList />
        </Stack>
      </Stack>
    </Container>
  );
};
