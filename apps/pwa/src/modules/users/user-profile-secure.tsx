"use client";

import { type FC, useEffect } from "react";

import { Container } from "@/components/container";
import { SectionTitle } from "@/components/session-title";
import { useLayout } from "@/layout/layout-context";
import { t } from "@lingui/core/macro";
import { Stack } from "@mantine/core";
import { IconLockFilled } from "@tabler/icons-react";
import { UpdatePassword } from "./components/update-password";
import { UserDeviceList } from "./components/user-device-list";

export const UserProfileSecure: FC = () => {
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t`Secure`,
    });
  }, []);

  return (
    <Container p="md">
      <Stack gap={30}>
        <Stack>
          <SectionTitle name={t`Update password`} icon={IconLockFilled} />
          <UpdatePassword />
        </Stack>

        <Stack>
          <UserDeviceList />
        </Stack>
      </Stack>
    </Container>
  );
};
