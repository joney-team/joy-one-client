"use client";

import { ProfileForm } from "./profile-form";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { Card, Center } from "@mantine/core";
import { FC, useEffect } from "react";

export const UserProfileInformation: FC = () => {
  const layout = useLayout();

  useEffect(() => {
    layout.setComponents({
      head: t("update_information"),
    });
  }, []);

  return (
    <Center p={16}>
      <Card shadow="xs" w={700} maw="100%">
        <ProfileForm />
      </Card>
    </Center>
  );
};
